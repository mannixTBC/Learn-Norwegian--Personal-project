import {check, text, validateScenario} from './contract.mjs';

export function validateCommand(command) {
  check(command && text(command.commandId, 100) && Number.isSafeInteger(command.expectedRevision)
    && command.expectedRevision >= 0, 'INVALID_COMMAND');
  const fields = {turn: ['text', 'source'], help: ['kind'], finish: [],liveStart:[],liveTranscript:['messages']};
  check(Object.hasOwn(fields, command.type), 'INVALID_COMMAND');
  const allowed = ['type', 'commandId', 'expectedRevision', ...fields[command.type]];
  check(Object.keys(command).every(key => allowed.includes(key)), 'INVALID_COMMAND');
  if (command.type === 'turn') check(text(command.text, 1200) && ['text', 'voice'].includes(command.source), 'INVALID_TURN');
  if (command.type === 'help') check(['hint', 'example', 'translation'].includes(command.kind), 'INVALID_HELP');
  if(command.type==='liveTranscript'){
    check(Array.isArray(command.messages)&&command.messages.length>0&&command.messages.length<=6,'INVALID_TRANSCRIPT');
    for(const m of command.messages)check(m&&Object.keys(m).every(k=>['id','role','text','order'].includes(k))&&Number.isInteger(m.order)&&m.order>=0&&m.order<120&&text(m.id,100)&&['user','assistant'].includes(m.role)&&text(m.text,1800),'INVALID_TRANSCRIPT');
    check(new Set(command.messages.map(m=>m.id)).size===command.messages.length,'INVALID_TRANSCRIPT');
  }
}

export function createSession({scenario, sessionId, ownerId, supportLanguage, mode, variantId, now, ttlMs = 3600000}) {
  validateScenario(scenario);
  check(text(sessionId, 100) && text(ownerId, 100), 'INVALID_IDENTITY');
  check(scenario.kind==='free'?['free','live'].includes(mode):['guided', 'scenario'].includes(mode), 'UNSUPPORTED_MODE');
  check(Object.hasOwn(scenario.locales, supportLanguage), 'UNSUPPORTED_LANGUAGE_PAIR');
  check(Number.isSafeInteger(now) && Number.isSafeInteger(ttlMs) && ttlMs > 0 && ttlMs <= 86400000, 'INVALID_CLOCK');
  const variant = scenario.variants.find(v => v.id === variantId);
  check(variant, 'UNKNOWN_VARIANT');
  return {schemaVersion: 2, id: sessionId, ownerId, scenarioId: scenario.id, scenarioVersion: scenario.version,
    learningLanguage: scenario.learningLanguage, supportLanguage, mode, variantId, revision: 0,
    state: scenario.initialState, status: 'active', expiresAt: now + ttlMs, turnCount: 0,
    messages: mode==='live'?[]:[{id: 'opening', role: 'assistant', text: variant.opening}], help: [],
    assessment: scenario.criteria.map(c => ({id: c.id, status: 'missing', evidence: [], context: []})),
    receipts: [], outcome: null};
}

export function authorize(session, ownerId, now) {
  check(session?.schemaVersion === 2 && session.ownerId === ownerId, 'SESSION_NOT_FOUND');
  check(Number.isSafeInteger(now), 'INVALID_CLOCK');
  check(now < session.expiresAt, 'SESSION_EXPIRED');
}

export function validateAssessment(scenario, messages, rows) {
  check(Array.isArray(rows) && rows.length === scenario.criteria.length, 'INVALID_ASSESSMENT');
  check(new Set(rows.map(r => r?.id)).size === rows.length, 'INVALID_ASSESSMENT');
  for (const criterion of scenario.criteria) {
    const row = rows.find(r => r?.id === criterion.id);
    check(row && ['met', 'missing', 'contradicted'].includes(row.status), 'INVALID_ASSESSMENT');
    for (const [key, role] of [['evidence', 'user'], ['context', 'assistant']]) {
      check(Array.isArray(row[key]) && row[key].length <= 3, 'INVALID_EVIDENCE');
      for (const ref of row[key]) {
        const message = messages.find(m => m.id === ref?.messageId);
        check(message?.role === role && text(ref.quote, 600) && ref.quote === ref.quote.trim() && message.text.includes(ref.quote), 'INVALID_EVIDENCE');
      }
    }
    if (row.status !== 'missing') check(row.evidence.length > 0, 'MISSING_EVIDENCE');
    if (row.status !== 'missing') check(row.context.every(ctx => row.evidence.some(ev =>
      messages.findIndex(m => m.id === ctx.messageId) < messages.findIndex(m => m.id === ev.messageId))), 'MISSING_PRIOR_CONTEXT');
    if (criterion.requiresPartnerContext && row.status === 'met') {
      check(row.context.length > 0 && row.context.every(ctx => row.evidence.some(ev =>
        messages.findIndex(m => m.id === ctx.messageId) < messages.findIndex(m => m.id === ev.messageId))), 'MISSING_PRIOR_CONTEXT');
    }
  }
  // Drop any model fields beyond the explicit evidence contract.
  return scenario.criteria.map(c => {
    const row = rows.find(r => r.id === c.id);
    const refs = key => row[key].map(r => ({messageId: r.messageId, quote: r.quote}));
    return {id: c.id, status: row.status, evidence: refs('evidence'), context: refs('context')};
  });
}

export function assessmentDisposition(scenario, session, criteria) {
  const met = new Set(criteria.filter(c => c.status === 'met').map(c => c.id));
  const transition = scenario.transitions.find(t => t.from === session.state && t.requires.every(key => met.has(key)));
  return {transition, done: Boolean(transition?.terminal) || session.turnCount + 1 >= scenario.maxTurns};
}

export function validateLanguageNotes(notes, messages) {
  check(Array.isArray(notes) && notes.length <= 2, 'INVALID_FEEDBACK');
  return notes.map(note => {
    const message = messages.find(m => m.id === note?.messageId);
    check(message?.role === 'user' && text(note.quote,600) && note.quote === note.quote.trim()
      && message.text.includes(note.quote) && text(note.suggestion,600) && text(note.explanation,800)
      && note.suggestion.trim() !== note.quote, 'INVALID_FEEDBACK');
    return {messageId:note.messageId,quote:note.quote,suggestion:note.suggestion.trim(),explanation:note.explanation.trim()};
  });
}

function feedbackFor(scenario, session, notes) {
  const labels = scenario.locales[session.supportLanguage].criteria;
  return {language:session.supportLanguage,
    achieved:session.assessment.filter(c => c.status === 'met').map(c => ({id:c.id,label:labels[c.id]})),
    remaining:session.assessment.filter(c => c.status !== 'met').map(c => ({id:c.id,label:labels[c.id],status:c.status})),
    languageNotes:notes};
}

export function replayReceipt(session, command) {
  validateCommand(command);
  const receipt = session.receipts.find(r => r.commandId === command.commandId);
  if (!receipt) return false;
  check(commandPayload(JSON.parse(receipt.payload)) === commandPayload(command), 'IDEMPOTENCY_CONFLICT');
  return true;
}

export function commandPayload(command) {
  return JSON.stringify(Object.fromEntries(Object.keys(command).sort().map(key => [key, command[key]])));
}

// Trusted server boundary: assessment comes from a validated evaluator adapter,
// never directly from a client request. Quotes prove provenance, not semantics.
export function applyCommand({scenario, session, ownerId, command, evaluation, now}) {
  authorize(session, ownerId, now);
  check(scenario.id === session.scenarioId && scenario.version === session.scenarioVersion, 'SCENARIO_VERSION_MISMATCH');
  validateCommand(command);
  if (replayReceipt(session, command)) return structuredClone(session);
  check(session.status === 'active', 'SESSION_ENDED');
  check(command.expectedRevision === session.revision, 'REVISION_CONFLICT');
  const next = structuredClone(session);
  if(command.type==='liveStart'){
    check(session.mode==='live'&&!session.liveStarted,'INVALID_LIVE_STATE');next.liveStarted=true;
  } else if(command.type==='liveTranscript'){
    check(session.mode==='live'&&session.liveStarted,'INVALID_LIVE_STATE');
    for(const m of command.messages){
      const existing=next.messages.find(item=>item.id===m.id);
      check(!existing||(existing.text===m.text&&existing.role===m.role&&existing.order===m.order),'IDEMPOTENCY_CONFLICT');
      check(!next.messages.some(item=>item.order===m.order&&item.id!==m.id),'INVALID_TRANSCRIPT');
      if(!existing)next.messages.push({id:m.id,role:m.role,text:m.text,order:m.order});
    }
    check(next.messages.length<=90,'SESSION_COMMAND_LIMIT');
    next.messages.sort((a,b)=>a.order-b.order);
    next.turnCount=next.messages.filter(m=>m.role==='user').length;
    next.transcriptSource='client_realtime_unverified';
  } else if (command.type === 'help') {
    check(session.mode!=='live','UNSUPPORTED_MODE');
    check(['hint', 'example', 'translation'].includes(command.kind), 'INVALID_HELP');
    next.help.push({kind: command.kind, turn: session.turnCount, commandId: command.commandId});
  } else if (command.type === 'finish') {
    next.status = 'completed';
    next.outcome = {task: ['free','live'].includes(session.mode)?'not_applicable':'partial', reason: 'user_finished', autonomy: session.mode==='live'?'not_assessed':next.help.length ? 'supported' : 'independent', language: 'not_assessed'};
    next.feedback = feedbackFor(scenario,next,next.feedback?.languageNotes || []);
  } else {
    check(session.mode!=='live','UNSUPPORTED_MODE');
    check(command.type === 'turn' && text(command.text, 1200) && ['text', 'voice'].includes(command.source), 'INVALID_TURN');
    check(text(evaluation?.reply, 1800), 'INVALID_REPLY');
    next.messages.push({id: `user:${command.commandId}`, role: 'user', text: command.text});
    next.assessment = validateAssessment(scenario, next.messages, evaluation.criteria);
    const notes=validateLanguageNotes(evaluation.languageNotes ?? [],next.messages);
    const retained=(session.feedback?.languageNotes||[]).filter(old=>!notes.some(n=>n.messageId===old.messageId&&n.quote===old.quote));
    next.feedback = feedbackFor(scenario,next,[...retained,...notes].slice(-12));
    if (evaluation.provenance) {
      check(text(evaluation.provenance.model,160) && text(evaluation.provenance.policyVersion,80), 'INVALID_EVALUATOR');
      next.evaluator = {model:evaluation.provenance.model,policyVersion:evaluation.provenance.policyVersion};
    }
    const {transition} = assessmentDisposition(scenario,session,next.assessment);
    if (transition) next.state = transition.to;
    next.turnCount++;
    next.messages.push({id: `assistant:${command.commandId}`, role: 'assistant', text: evaluation.reply});
    if (transition?.terminal || next.turnCount >= scenario.maxTurns) {
      next.status = 'completed';
      next.outcome = {task: session.mode==='free'?'not_applicable':transition?.terminal ? 'achieved' : 'partial',
        reason: transition?.terminal ? 'criteria_met' : 'turn_limit',
        autonomy: next.help.length ? 'supported' : 'independent', language: 'not_assessed'};
    }
  }
  next.revision++;
  next.receipts.push({commandId: command.commandId, payload: commandPayload(command)});
  check(next.receipts.length <= 100, 'SESSION_COMMAND_LIMIT');
  return next;
}

export function sessionView(session) {
  return structuredClone({schemaVersion: 2, id: session.id, scenarioId: session.scenarioId,
    scenarioVersion: session.scenarioVersion, learningLanguage: session.learningLanguage,
    supportLanguage: session.supportLanguage, mode: session.mode, revision: session.revision,
    status: session.status, expiresAt: session.expiresAt, messages: session.messages,
    helpCommandIds:session.help.map(item=>item.commandId),
    ...(session.mode==='live'?{liveStarted:!!session.liveStarted,transcriptSource:session.transcriptSource||'client_realtime_unverified'}:{}),
    criteria: session.assessment.map(c => ({id: c.id, status: c.status})), outcome: session.outcome,
    feedback: session.status === 'completed' || session.mode==='free' ? session.feedback || null : null});
}
