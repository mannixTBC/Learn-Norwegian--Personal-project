const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('nb-NO').replace(/[^a-zæø0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const containsQuote = (message, quote) => {
  const source = normalize(message);
  const fragment = normalize(quote);
  return fragment.length >= 2 && (` ${source} `).includes(` ${fragment} `);
};
const sensitive = (value) => /\b\d{6,}\b|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b(?:api[_ -]?key|password|passord|parola)\b/iu.test(value);
const cafeItems = ['kaffe', 'smørbrød', 'kake', 'vann', 'te'];
const validOrderedItems = (items) => Array.isArray(items) && items.length <= cafeItems.length
  && items.every((item) => cafeItems.includes(item)) && new Set(items).size === items.length;

// A narrow deterministic guard for explicit cafe orders. Mere mentions,
// negations, alternatives and conditional sentences are not orders.
const orderedItemsFor = (session, context, message) => {
  if (context.lesson.uid !== 'a1-cafe') return [];
  const previous = session.orderedItems || [];
  if (message.includes('?') && !/^kan jeg fa /u.test(normalize(message))) return previous;
  const text = normalize(message).replace(/^(?:jeg vil (?:gjerne )?ha|jeg ønsker|kan jeg fa) /u, '')
    .replace(/ (?:takk|vær sa snill)$/u, '');
  const parts = text.split(' og ');
  const items = parts.map((part) => part.replace(/^(?:en|et|ei|ett|to|tre|[1-9]) /u, ''));
  if (!items.length || !items.every((item) => cafeItems.includes(item))) return previous;
  return [...new Set([...previous, ...items])];
};

const repeatsCafeOrder = (context, orderedItems, question) => {
  if (context.lesson.uid !== 'a1-cafe' || !orderedItems?.length) return false;
  const text = normalize(question);
  if (!/^(?:vil du (?:gjerne )?ha|ønsker du|har du lyst pa) /u.test(text)) return false;
  const words = text.split(' ');
  return orderedItems.some((item) => words.includes(item));
};
const goalsFor = (context) => [
  ...context.lesson.objectives.slice(0, 3).map((label, index) => ({ id: `o${index}`, label, kind: 'objective' })),
  ...(context.lesson.production?.criteria || []).slice(0, 3).map((label, index) => ({ id: `c${index}`, label, kind: 'criterion' })),
];
const situationFor = (context) => context.lesson.uid === 'a1-cafe'
  ? 'Ești client la o cafenea. Nora te servește. Comandă o băutură și acceptă sau refuză politicos o ofertă. Poți inventa detaliile.'
  : `${context.lesson.production?.speakingPrompt || context.lesson.title} Nora este interlocutorul tău. Poți folosi nume și situații fictive.`;

const contextualSupport = (context, question) => {
  const q = normalize(question);
  const pair = (answer, translation) => ({ answer, translation });
  if (/hva heter|navnet ditt/.test(q)) return [pair('Jeg heter Ana.', 'Mă numesc Ana.'), pair('Jeg heter Lars.', 'Mă numesc Lars.')];
  if (/hvordan har du det|hvordan føler du deg/.test(q)) return [pair('Jeg har det bra, takk.', 'Mă simt bine, mulțumesc.'), pair('Jeg er litt trøtt.', 'Sunt puțin obosit.')];
  if (/hvor kommer du fra/.test(q)) return [pair('Jeg kommer fra Romania.', 'Vin din România.'), pair('Jeg kommer fra Norge.', 'Vin din Norvegia.')];
  if (/hvor bor du/.test(q)) return [pair('Jeg bor i Oslo.', 'Locuiesc în Oslo.'), pair('Jeg bor i Tromsø.', 'Locuiesc în Tromsø.')];
  if (/bestille/.test(q) && context.lesson.uid === 'a1-cafe') return [pair('Jeg vil ha en kaffe, takk.', 'Aș dori o cafea, mulțumesc.'), pair('Jeg vil ha et smørbrød, takk.', 'Aș dori un sandviș, mulțumesc.')];
  if (/^vil du ha/.test(q) && / eller /.test(q)) return [];
  if (/^vil du ha\b/.test(q)) return [pair('Ja, takk.', 'Da, mulțumesc.'), pair('Nei, takk.', 'Nu, mulțumesc.')];
  if (/^snakker du norsk/.test(q)) return [pair('Ja, litt.', 'Da, puțin.'), pair('Nei, ikke ennå.', 'Nu, încă nu.')];
  if (/hva sier du.*møter/.test(q)) return [pair('Hei!', 'Salut!'), pair('Hyggelig å møte deg!', 'Încântat de cunoștință!')];
  // An empty hint is safer than an unrelated example from the lesson.
  return [];
};

const applyEvidence = (session, context, result, message) => {
  const known = new Set(goalsFor(context).map((goal) => goal.id));
  const progress = { ...(session.progress || {}) };
  const coveredQuestions = new Set(session.coveredQuestions || []);
  if (result.understood && result.advanceTurn && ['answer', 'refusal'].includes(result.intent)) {
    for (const item of (result.evidence || []).slice(0, 6)) {
      if (!known.has(item?.id) || typeof item.quote !== 'string' || item.quote.length > 180 || sensitive(item.quote) || !containsQuote(message, item.quote)) continue;
      const status = session.assisted ? 'supported' : 'independent';
      if (progress[item.id]?.status === 'independent') continue;
      progress[item.id] = { status, quote: item.quote.trim() };
    }
    for (const item of (result.coveredQuestions || []).slice(0, 3)) {
      if (Number.isInteger(item?.index) && item.index >= 0 && item.index < context.lesson.conversationPrompts.length
        && typeof item.quote === 'string' && item.quote.length <= 180 && containsQuote(message, item.quote)) coveredQuestions.add(item.index);
    }
  }
  return { progress, coveredQuestions: [...coveredQuestions] };
};

const correctionCandidate = (result, message) => {
  if (!result?.understood || !result.advanceTurn || !['answer', 'refusal'].includes(result.intent)
    || result.correctionConfidence !== 'high' || typeof result.correction !== 'string') return null;
  const quoted = [...result.correction.matchAll(/[«„“"]([^»”"]+)[»”"]/gu)].map((match) => match[1].trim());
  if (quoted.length < 2) return null;
  const original = quoted[0];
  const corrected = quoted.at(-1);
  if (!containsQuote(message, original) || normalize(corrected).split(' ').length < 2
    || normalize(original) === normalize(corrected) || original.length > 180 || corrected.length > 180
    || sensitive(original) || sensitive(corrected)) return null;
  return { original, corrected, explanation: result.correction.slice(0, 350) };
};

const learningSummary = (session, context) => {
  const goals = goalsFor(context).map((goal) => ({ ...goal, status: session.progress?.[goal.id]?.status || 'unpractised' }));
  return {
    goals,
    answers: session.turn,
    supportedAnswers: session.supportedAnswers || 0,
    complete: goals.length > 0 && goals.every((goal) => goal.status !== 'unpractised'),
    endReason: session.endReason || null,
    reviewCandidates: session.done ? session.reviewCandidates || [] : [],
  };
};

const feedbackFor = (session, context) => {
  if (!session.turn) return 'Nu avem încă un răspuns de evaluat. Poți relua situația când dorești.';
  const summary = learningSummary(session, context);
  const observed = summary.goals.find((goal) => goal.kind === 'objective' && goal.status !== 'unpractised');
  const missing = summary.goals.find((goal) => goal.status === 'unpractised');
  const correction = summary.reviewCandidates[0];
  const short = (text, count) => String(text || '').split(/\s+/).slice(0, count).join(' ').replace(/[.!?,;:]+$/u, '');
  const success = observed ? `Ai exersat${observed.status === 'supported' ? ' cu ajutor' : ''}: ${short(observed.label, 8)}.` : 'Ai participat la dialog.';
  const suggestion = correction ? `Reține: „${short(correction.corrected, 8)}”.`
    : missing ? `Mai exersează: ${short(missing.label, 8)}.` : 'Repetă situația cu alte detalii.';
  return `${success} ${suggestion}`;
};

module.exports = { normalize, containsQuote, sensitive, goalsFor, situationFor, contextualSupport, applyEvidence, correctionCandidate, learningSummary, feedbackFor, validOrderedItems, orderedItemsFor, repeatsCafeOrder };
