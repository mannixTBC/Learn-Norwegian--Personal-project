// nordlingo-language-context-v1
const express = require('express');
const {prepareCourseSession,referenceMessage}=require('../courseRuntime.cjs');
const { requireAuth, requireTurnClaims } = require('../middleware/authSupabaseUser');
const { getOpenAI, isOpenAIConfigured } = require('../openai');
const { consumeChatQuota, recordChatUsage } = require('../chatUsage');
const tutor = require('../languageTutors').scenario;
const { runScenarioTurn, addUsage } = require('../scenarioTurn');
const { cartesiaSpeechBuffer } = require('../cartesiaSpeech');
const router = express.Router();
router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
router.use((req, res, next) => { req.scenarioReceivedAt = Date.now(); next(); });
router.post('/turn', requireTurnClaims);
router.use((req,res,next)=>req.checkQuotaSession ? next() : requireAuth(req,res,next));
const fail = (message, status, code) => Object.assign(new Error(message), { status, code });
const wrap = fn => async (req, res) => {
  try { await fn(req, res); } catch (error) {
    console.warn('scenario-request-failed', {route:req.path, status:error.status || 502, code:error.code, name:error.name});
    const status = error.status || 502;
    res.status(status).json({
      error: status < 500 ? error.message : 'Conversația nu este disponibilă momentan. Încearcă din nou.',
      code: error.code || (error.isChatQuotaError ? 'SCENARIO_QUOTA' : status >= 500 ? 'SCENARIO_UNAVAILABLE' : 'SCENARIO_REQUEST_INVALID'),
    });
  }
};
function currentSession(token, userId) {
  const session = tutor.verify(token, userId);
  const { scenario, difficulty } = tutor.context(session.scenarioId, session.level);
  if (scenario.revision && session.scenarioRevision !== scenario.revision) {
    throw fail('Scenariul a fost actualizat. Începe o conversație nouă.', 409, 'SCENARIO_UPDATED');
  }
  if (session.turn > difficulty.turns || session.achieved.some(id => id >= scenario.goals.length)) {
    throw fail('Sesiunea nu mai poate fi folosită. Începe o conversație nouă.', 409, 'SCENARIO_SESSION_INVALID');
  }
  return { session, scenario, difficulty };
}
function response(session, scenario, difficulty) {
  return {
    sessionToken: tutor.sign(session), reply: session.history.at(-1).content,
    feedback: session.feedback || '', achieved: session.achieved,
    turn: session.turn, done: session.done, maxTurns: difficulty.turns,
    expiresAt: session.expires,
    endReason: session.done ? (session.achieved.length === scenario.goals.length ? 'success' : 'turn_limit') : null,
  };
}
router.post('/start', wrap(async (req, res) => {
  const { scenarioId, level } = req.body || {};
  const { scenario, difficulty } = tutor.context(scenarioId, level);
  const session = { userId: req.userId, scenarioId, level, turn: 0, done: false, achieved: [], feedback: '',
    expires: Date.now() + 3600000, history: [{ role: 'assistant', content: scenario.opening }] };
  if (scenario.revision) session.scenarioRevision = scenario.revision;
  res.json(response(await prepareCourseSession(req,session,'scenario'), scenario, difficulty));
}));
router.post('/resume', wrap(async (req, res) => {
  const { session, scenario, difficulty } = currentSession(req.body?.sessionToken, req.userId);
  // Restoring a signed checkpoint neither calls the model nor consumes chat quota.
  res.json({ ...response(session, scenario, difficulty), scenarioId: session.scenarioId, level: session.level,
    messages: session.history.map(entry => ({ role: entry.role, text: entry.content })) });
}));
// Read only the server-signed reply; callers cannot submit arbitrary TTS text.
router.post('/speech', wrap(async (req, res) => {
  const { session } = currentSession(req.body?.sessionToken, req.userId);
  const index = req.body?.messageIndex ?? session.history.length - 1;
  if (!Number.isInteger(index) || index < 0 || session.history[index]?.role !== 'assistant') {
    throw fail('Replica nu este disponibilă.', 400, 'SCENARIO_MESSAGE_INVALID');
  }
  const text = session.history[index].content;
  const prefix = req.body?.spokenPrefix;
  const remaining = typeof prefix === 'string' && text.startsWith(prefix) && /^\s/.test(text.slice(prefix.length)) ? text.slice(prefix.length).trim() : text;
  const audio = await cartesiaSpeechBuffer(remaining, undefined,
    { voiceId: 'e8e5fffb-252c-436d-b842-8879b84445b6', ...(req.body?.slow === true ? { speed: 0.65 } : {}) });
  res.set('Content-Type', 'audio/mpeg');
  res.set('X-Audio-Provider', 'cartesia');
  res.send(audio);
}));
router.post('/turn', wrap(async (req, res) => {
  const { sessionToken, message } = req.body || {};
  if (typeof message !== 'string' || !message.trim() || message.length > 1200) {
    throw fail('Scrie între 1 și 1200 de caractere.', 400, 'SCENARIO_MESSAGE_INVALID');
  }
  const { session, scenario, difficulty } = currentSession(sessionToken, req.userId);
  if (session.done || session.turn >= difficulty.turns) {
    throw fail('Conversația s-a încheiat. Poți începe o sesiune nouă.', 409, 'SCENARIO_ENDED');
  }
  if (!isOpenAIConfigured()) throw fail('Asistentul nu este configurat.', 503, 'SCENARIO_UNAVAILABLE');
  const authenticatedAt = Date.now();
  await consumeChatQuota(req);
  const quotaAt = Date.now();
  let modelAt;
  const progressive=req.get('Accept')==='application/x-ndjson' && process.env.SCENARIO_COMBINED_TURN==='true' && Boolean(scenario.definition);
  const abort=new AbortController();
  if(progressive) res.once('close',()=>abort.abort());
  const fullStream = progressive && req.get('X-Scenario-Stream') === '2';
  const compactPrompt = fullStream && scenario.id === 'family-new-neighbor' && session.level === 'A1' && req.get('X-Nora-Prompt-Test') === 'compact-v1';
  if (compactPrompt) res.set('X-Nora-Prompt-Test','compact-v1');
  let firstAudio;
  let previousText = '';
  let spokenEnd = 0;
  let audioWork = Promise.resolve();
  let audioFailed = false;
  function queueSentence(text) {
    audioWork = audioWork.then(async () => {
      if (audioFailed || abort.signal.aborted) return;
      try {
        const bytes = await cartesiaSpeechBuffer(text, abort.signal, {voiceId:'e8e5fffb-252c-436d-b842-8879b84445b6'});
        send({type:'audio',text,audio:bytes.toString('base64')});
      } catch { audioFailed = true; }
    });
  }
  function progress(text, flush = false) {
    if (!text.startsWith(previousText)) throw new Error('Inconsistent scenario preview');
    if (text !== previousText) send({type:'text',text});
    previousText = text;
    let rest = text.slice(spokenEnd);
    const boundary = /[.!?…]+[”»"’)]*(?=\s)/;
    let match;
    while ((match = boundary.exec(rest))) {
      const end = match.index + match[0].length;
      queueSentence(rest.slice(0,end).trim());
      spokenEnd += end;
      rest = rest.slice(end);
    }
    if (flush && rest.trim()) {
      queueSentence(rest.trim());
      spokenEnd = text.length;
    }
  }
  function send(event) {
    if(res.destroyed || res.writableEnded)return;
    if(!res.headersSent)res.type('application/x-ndjson');
    res.write(JSON.stringify(event)+'\n');
  }
  function onSentence(text) {
    if (fullStream) { progress(text,true); return; }
    const sentenceAt = Date.now();
    firstAudio=cartesiaSpeechBuffer(text,abort.signal,{voiceId:'e8e5fffb-252c-436d-b842-8879b84445b6'})
      .then(audio=>{
        const timing = {auth:authenticatedAt-req.scenarioReceivedAt,quota:quotaAt-authenticatedAt,
          context:modelAt-quotaAt,firstSentence:sentenceAt-modelAt,voice:Date.now()-sentenceAt};
        send({type:'audio',text,audio:audio.toString('base64'),timing});
      }).catch(()=>{});
  }
  let usage = null;
  try {
    let result;
    try {
      const reference = scenario.definition ? await referenceMessage(req,session,message.trim()) : null;
      modelAt = Date.now();
      result = await runScenarioTurn({
        compactPrompt, onText:fullStream ? progress : undefined, onSentence:progressive ? onSentence : undefined, signal:abort.signal, client: getOpenAI(), scenario, difficulty, session, message: message.trim(),
        reference,
        onUsage: value => { usage = addUsage(usage, value); },
      });
    } catch (error) {
      console.warn('scenario-turn-failed', {status:error.status, code:error.code, name:error.name,
        stack:error.stack?.split('\n').slice(1,4).join('\n')});
      // A provider 401/429 is a service error, not a learner authentication/quota error.
      abort.abort();
      if(res.headersSent){send({type:'error'});res.end();return;}
      throw fail('Răspunsul nu a putut fi pregătit.', 502, 'SCENARIO_UNAVAILABLE');
    }
    const body=response(result.session, scenario, difficulty);
    if(progressive){
      if (fullStream) {
        progress(result.reply,true);
        await audioWork;
      } else await firstAudio;
      send({type:'result',body:{...body,languages:require('../languageContext').currentLanguages()}});
      res.end();
    }else res.json(body);
  } finally {
    try { await recordChatUsage(req, usage); } catch {}
  }
}));
module.exports = router;
