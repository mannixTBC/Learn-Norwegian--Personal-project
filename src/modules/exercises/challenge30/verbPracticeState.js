const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const DAY = 24 * 60 * 60 * 1000;
let runSequence = 0;
const own = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key);
const finiteCount = (value) => Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;
const allVerbs = (session) => [...(session.verbs || []), ...(session.reviewVerbs || [])];
const timeValue = (value) => {
  const time = value instanceof Date ? value.getTime() : typeof value === 'number' ? value : Date.parse(value);
  return Number.isFinite(time) ? time : Date.now();
};

export const normalizeVerbAnswer = (value) => String(value || '').normalize('NFC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('nb-NO').replace(/[.!?]+$/, '').trim();

const newRunId = () => globalThis.crypto?.randomUUID?.() || `verbs-${Date.now()}-${++runSequence}-${Math.random().toString(36).slice(2)}`;
const questionOrder = (question) => (question.old ? 10 : 0) + ({ meaning: 1, context: 2, recall: 3 }[question.phase] || 4);

/** No session data or caller-owned objects are mutated by the reducer. */
export function initVerbSession(session) {
  const questions = [...(session?.questions || [])].sort((left, right) => questionOrder(left) - questionOrder(right));
  const verbs = [...(session?.verbs || [])];
  const ids = new Set(verbs.map((verb) => verb.id));
  const reviewVerbs = [...(session?.reviewVerbs || [])].filter((verb) => !ids.has(verb.id) && ids.add(verb.id));
  for (const question of questions) {
    if (question.old && !ids.has(question.verbId)) {
      reviewVerbs.push({ id: question.verbId, norwegian: question.norwegian || question.infinitive || question.verbId, romanian: question.romanian || '', form: question.answer });
      ids.add(question.verbId);
    }
  }
  const normalizedSession = { ...session, verbs, reviewVerbs, questions };
  return {
    session: normalizedSession,
    runId: newRunId(),
    frames: verbs.map((verb, index) => ({ type: 'intro', verb, id: `intro:${verb.id}`, number: index + 1 }))
      .concat(questions.map((question, index) => ({ type: 'question', question, id: `question:${question.id}`, number: index + 1 }))),
    retryFrames: [], cursor: 0, view: 'session', retry: false, round: 0,
    responses: {}, answers: {}, hints: {}, firstAttempts: {}, latestAttempts: {},
    completedRounds: [], completionHistory: [], completionId: null, completionCount: 0, lastCompletion: null,
  };
}

export function currentVerbFrame(state) {
  const frames = state.retry ? state.retryFrames : state.frames;
  const frame = frames[state.cursor];
  if (!frame) return null;
  const answerKey = `${state.runId}:${state.round}:${frame.id}`;
  const key = state.view === 'result' ? `${answerKey}:result` : answerKey;
  const record = own(state.answers, answerKey) ? state.answers[answerKey] : null;
  return {
    ...frame, key, index: state.cursor,
    verb: frame.verb || allVerbs(state.session).find((verb) => verb.id === frame.question?.verbId),
    number: state.retry ? state.cursor + 1 : frame.number,
    total: frame.type === 'intro' ? state.session.verbs.length : state.retry ? state.retryFrames.length : state.session.questions.length,
    response: record ? record.given : state.responses[answerKey] || '',
    checked: Boolean(record), record, hinted: Boolean(state.hints[answerKey]),
  };
}

/** Status describes today's evidence, never permanent mastery. */
export function verbOutcome(state, verbId) {
  if (own(state.latestAttempts, verbId)) {
    const record = state.latestAttempts[verbId];
    return !record.correct ? 'wrong' : record.helped ? 'helped' : 'repeated';
  }
  const questions = state.session.questions.filter((question) => question.verbId === verbId);
  const records = questions.filter((question) => own(state.firstAttempts, question.id)).map((question) => state.firstAttempts[question.id]);
  if (records.some((record) => !record.correct)) return 'wrong';
  if (records.some((record) => record.helped)) return 'helped';
  return questions.length && records.length === questions.length ? 'retained' : 'unseen';
}

export const weakVerbIds = (state) => allVerbs(state.session).filter((verb) => ['wrong', 'helped'].includes(verbOutcome(state, verb.id))).map((verb) => verb.id);

export function verbSessionSummary(state) {
  const records = Object.values(state.firstAttempts);
  const retryRecords = Object.entries(state.answers).filter(([key]) => key.startsWith(`${state.runId}:${state.round}:`) && state.retry).map(([, record]) => record);
  return {
    correct: records.filter((record) => record.correct).length,
    total: state.session.questions.length,
    answered: records.length,
    helped: records.filter((record) => record.helped).length,
    weakIds: weakVerbIds(state),
    verbs: allVerbs(state.session).map((verb) => ({ verbId: verb.id, status: verbOutcome(state, verb.id), old: !state.session.verbs.some((item) => item.id === verb.id) })),
    completed: records.length === state.session.questions.length && state.completedRounds.includes(0),
    retryCorrect: retryRecords.filter((record) => record.correct && !record.helped).length,
    retryTotal: state.retry ? state.retryFrames.length : 0,
  };
}

function finishRound(state) {
  if (state.completedRounds.includes(state.round)) return { ...state, view: 'result' };
  const completionId = `${state.runId}:${state.round}`;
  const frames = state.retry ? state.retryFrames : state.frames;
  const records = frames.filter((frame) => frame.type === 'question').map((frame) => ({
    questionId: frame.question.id, verbId: frame.question.verbId,
    ...state.answers[`${state.runId}:${state.round}:${frame.id}`],
  }));
  const completion = { id: completionId, round: state.round, retry: state.retry, records };
  return {
    ...state, view: 'result', completionId, completionCount: state.completionCount + 1,
    completedRounds: [...state.completedRounds, state.round],
    completionHistory: [...state.completionHistory, completion], lastCompletion: completion,
  };
}

/** Frame keys make stale double-click/check/continue events harmless. */
export function verbPracticeReducer(state, action) {
  if (action.type === 'RESET') return initVerbSession(action.session || state.session);
  if (action.type === 'START_RETRY') {
    if (state.view !== 'result') return state;
    const weak = new Set(weakVerbIds(state));
    const selected = new Set();
    const retryFrames = state.session.questions.filter((question) => question.phase === 'recall' && weak.has(question.verbId) && !selected.has(question.verbId) && selected.add(question.verbId))
      .map((question, index) => ({ type: 'question', question, id: `question:${question.id}`, number: index + 1 }));
    if (!retryFrames.length) return state;
    return { ...state, retry: true, round: state.round + 1, cursor: 0, view: 'session', retryFrames, responses: {}, answers: {}, hints: {} };
  }
  const frame = currentVerbFrame(state);
  if (!frame || action.frameKey !== frame.key) return state;
  if (action.type === 'BACK') {
    if (state.view === 'result') return { ...state, view: 'session' };
    return state.cursor > 0 ? { ...state, cursor: state.cursor - 1 } : state;
  }
  if (state.view !== 'session') return state;
  if (action.type === 'SET_RESPONSE') {
    return frame.type === 'question' && !frame.checked ? { ...state, responses: { ...state.responses, [frame.key]: String(action.value ?? '') } } : state;
  }
  if (action.type === 'USE_HINT') {
    return frame.type === 'question' && !frame.checked && !frame.question.options && !frame.hinted ? { ...state, hints: { ...state.hints, [frame.key]: true } } : state;
  }
  if (action.type === 'CHECK') {
    if (frame.type !== 'question' || frame.checked || !frame.response.trim()) return state;
    const accepted = [frame.question.answer, ...(frame.question.acceptedAnswers || [])].map(normalizeVerbAnswer);
    const record = { given: frame.response, correct: accepted.includes(normalizeVerbAnswer(frame.response)), helped: frame.hinted, round: state.round };
    return {
      ...state, answers: { ...state.answers, [frame.key]: record },
      firstAttempts: state.retry ? state.firstAttempts : { ...state.firstAttempts, [frame.question.id]: record },
      latestAttempts: state.retry ? { ...state.latestAttempts, [frame.question.verbId]: record } : state.latestAttempts,
    };
  }
  if (action.type === 'NEXT') {
    if (frame.type === 'question' && !frame.checked) return state;
    const frames = state.retry ? state.retryFrames : state.frames;
    return state.cursor < frames.length - 1 ? { ...state, cursor: state.cursor + 1 } : finishRound(state);
  }
  return state;
}

export const verbPracticeProgressKey = ({ userId, level } = {}) => `verb_practice_progress:v1:${encodeURIComponent(String(userId || 'guest'))}:${LEVELS.includes(String(level).toUpperCase()) ? String(level).toLowerCase() : 'a1'}`;
const emptyProgress = () => ({ version: 1, verbs: {}, completions: [] });

function readProgress(storage, scope) {
  if (!storage?.getItem) return { progress: emptyProgress(), readable: false };
  try {
    const value = JSON.parse(storage.getItem(verbPracticeProgressKey(scope)) || 'null');
    return { progress: value?.version === 1 && value.verbs && typeof value.verbs === 'object' && !Array.isArray(value.verbs)
      ? { version: 1, verbs: value.verbs, completions: Array.isArray(value.completions) ? value.completions.filter((id) => typeof id === 'string') : [] }
      : emptyProgress(), readable: true };
  } catch (error) {
    return { progress: emptyProgress(), readable: error instanceof SyntaxError };
  }
}

export const readVerbPracticeProgress = (storage, scope) => readProgress(storage, scope).progress;

/** Each completed round is saved once; incorrect answers still complete a session. */
export function recordVerbPracticeCompletion(storage, scope, state, { now = Date.now() } = {}) {
  const { progress, readable } = readProgress(storage, scope);
  const history = state.completionHistory || (state.lastCompletion ? [state.lastCompletion] : []);
  const completed = history.filter((completion) => state.completedRounds.includes(completion.round));
  if (!completed.length) return { progress, saved: false, duplicate: false };
  const pending = completed.filter((completion) => !progress.completions.includes(completion.id));
  if (!pending.length) return { progress, saved: true, duplicate: true };
  const timestamp = timeValue(now);
  let verbs = { ...progress.verbs };
  for (const completion of pending) {
    for (const verb of allVerbs(state.session)) {
      const records = completion.records.filter((record) => record.verbId === verb.id);
      if (!records.length) continue;
      const previous = own(verbs, verb.id) && verbs[verb.id] && typeof verbs[verb.id] === 'object' ? verbs[verb.id] : {};
      const successful = records.every((record) => record.correct && !record.helped);
      const correctStreak = successful ? finiteCount(previous.correctStreak) + 1 : 0;
      const interval = successful ? [1, 3, 7, 14, 30][Math.min(correctStreak - 1, 4)] : 1;
      verbs = { ...verbs, [verb.id]: {
        id: verb.id, norwegian: verb.norwegian || verb.infinitive || verb.id, romanian: verb.romanian || verb.meaning || '', form: verb.form || '',
        attempts: finiteCount(previous.attempts) + records.length,
        lastPracticed: new Date(timestamp).toISOString(), nextReview: new Date(timestamp + interval * DAY).toISOString(),
        correctStreak, needsReview: !successful,
      } };
    }
  }
  const next = { version: 1, verbs, completions: [...progress.completions, ...pending.map((completion) => completion.id)] };
  if (!readable || !storage?.setItem) return { progress: next, saved: false, duplicate: false };
  try {
    storage.setItem(verbPracticeProgressKey(scope), JSON.stringify(next));
    return { progress: next, saved: true, duplicate: false };
  } catch (_) { return { progress: next, saved: false, duplicate: false }; }
}

export function selectDueVerbReviews(progress, candidates, { now = Date.now(), limit = 2 } = {}) {
  const timestamp = timeValue(now);
  return [...(candidates || [])].filter((verb) => own(progress?.verbs, verb.id))
    .map((verb, index) => ({ verb, index, due: Date.parse(progress.verbs[verb.id]?.nextReview) || 0 }))
    .filter((item) => item.due <= timestamp)
    .sort((left, right) => left.due - right.due || left.index - right.index)
    .slice(0, finiteCount(limit)).map((item) => item.verb);
}
