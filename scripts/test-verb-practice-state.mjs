import assert from 'node:assert/strict';
import {
  initVerbSession, verbPracticeReducer, currentVerbFrame, normalizeVerbAnswer,
  verbOutcome, weakVerbIds, verbSessionSummary, verbPracticeProgressKey,
  readVerbPracticeProgress, recordVerbPracticeCompletion, selectDueVerbReviews,
} from '../src/modules/exercises/challenge30/verbPracticeState.js';

const verbs = [
  { id: 'bo', norwegian: 'å bo', romanian: 'a locui', form: 'bor' },
  { id: 'jobbe', norwegian: 'å jobbe', romanian: 'a lucra', form: 'jobber' },
  { id: 'snakke', norwegian: 'å snakke', romanian: 'a vorbi', form: 'snakker' },
];
const reviewVerbs = [{ id: 'ha', norwegian: 'å ha', romanian: 'a avea', form: 'har' }, { id: 'vare', norwegian: 'å være', romanian: 'a fi', form: 'er' }];
const session = {
  level: 'A1', day: 1, title: 'Despre tine', verbs, reviewVerbs,
  questions: ['meaning', 'context', 'recall'].flatMap((phase) => verbs.map((verb) => ({
    id: `${phase}-${verb.id}`, verbId: verb.id, phase, answer: phase === 'meaning' ? verb.romanian : verb.form,
    ...(phase === 'recall' ? {} : { options: phase === 'meaning' ? verbs.map((item) => item.romanian) : verbs.map((item) => item.form) }),
  }))).concat(reviewVerbs.map((verb) => ({ id: `old-${verb.id}`, verbId: verb.id, phase: 'recall', old: true, answer: verb.form }))),
};
const initialCopy = structuredClone(session);
const apply = (state, type, details = {}) => verbPracticeReducer(state, { type, frameKey: currentVerbFrame(state)?.key, ...details });
const answer = (state, value, helped = false) => {
  let next = apply(state, 'SET_RESPONSE', { value });
  if (helped) next = apply(next, 'USE_HINT');
  return apply(next, 'CHECK');
};
const finish = (state, responses = {}) => {
  let next = state;
  let guard = 0;
  while (next.view !== 'result') {
    assert.ok(++guard < 100, 'session terminates');
    const frame = currentVerbFrame(next);
    if (frame.type === 'question' && !frame.checked) {
      const entry = responses[frame.question.id] || {};
      next = answer(next, entry.value ?? frame.question.answer, entry.helped);
    }
    next = apply(next, 'NEXT');
  }
  return next;
};
const memoryStorage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};

// The actual teaching order is independent of the order of incoming question data.
let state = initVerbSession({ ...session, questions: [...session.questions].reverse() });
assert.deepEqual(state.frames.map((frame) => frame.type === 'intro' ? 'intro' : frame.question.old ? 'old' : frame.question.phase),
  ['intro', 'intro', 'intro', 'meaning', 'meaning', 'meaning', 'context', 'context', 'context', 'recall', 'recall', 'recall', 'old', 'old']);
state = initVerbSession(session);
assert.equal(currentVerbFrame(state).number, 1);
assert.equal(currentVerbFrame(state).total, 3);
assert.equal(apply(state, 'BACK'), state);
const firstIntroKey = currentVerbFrame(state).key;
state = apply(state, 'NEXT');
assert.equal(verbPracticeReducer(state, { type: 'NEXT', frameKey: firstIntroKey }), state, 'stale double NEXT cannot skip another frame');
state = apply(apply(state, 'NEXT'), 'NEXT');
assert.equal(currentVerbFrame(state).number, 1);
assert.equal(currentVerbFrame(state).total, 11);
assert.equal(apply(state, 'NEXT'), state, 'must check before continuing');
assert.equal(apply(state, 'CHECK'), state, 'empty answers cannot be submitted');
state = apply(state, 'SET_RESPONSE', { value: 'a lucra' });
assert.equal(apply(state, 'USE_HINT'), state, 'choice questions do not reveal writing hints');
state = apply(state, 'CHECK');
assert.equal(currentVerbFrame(state).record.correct, false);
assert.equal(apply(state, 'CHECK'), state, 'double check cannot create another result');
assert.equal(apply(state, 'SET_RESPONSE', { value: 'a locui' }), state, 'checked answers cannot be overwritten');
const originalResponse = currentVerbFrame(state).response;
state = apply(state, 'NEXT');
state = apply(state, 'BACK');
assert.equal(currentVerbFrame(state).response, originalResponse);
assert.equal(currentVerbFrame(state).checked, true, 'Back is readonly');
assert.equal(verbPracticeReducer(state, { type: 'CHECK', frameKey: firstIntroKey }), state);

// A failed meaning, helped recall and failed old verb all remain eligible for a recall-only retry.
state = finish(state, { 'recall-jobbe': { helped: true }, 'old-ha': { value: 'ha' } });
assert.equal(state.view, 'result', 'mistakes do not block completion');
assert.equal(state.completionCount, 1);
assert.deepEqual(weakVerbIds(state), ['bo', 'jobbe', 'ha']);
assert.equal(verbOutcome(state, 'snakke'), 'retained');
const firstScore = structuredClone(state.firstAttempts);
const firstSummary = verbSessionSummary(state);
assert.deepEqual({ correct: firstSummary.correct, total: firstSummary.total, helped: firstSummary.helped, completed: firstSummary.completed }, { correct: 9, total: 11, helped: 1, completed: true });
const completedId = state.completionId;
const resultFrameKey = currentVerbFrame(state).key;
state = apply(state, 'BACK');
assert.equal(state.view, 'session');
assert.equal(currentVerbFrame(state).checked, true);
assert.equal(verbPracticeReducer(state, { type: 'BACK', frameKey: resultFrameKey }), state, 'double Back from result cannot skip the last answer');
state = apply(state, 'NEXT');
assert.equal(state.completionId, completedId);
assert.equal(state.completionCount, 1, 'revisiting the result does not complete twice');

const firstCompleted = state;
state = apply(state, 'START_RETRY');
assert.equal(state.round, 1);
assert.deepEqual(state.retryFrames.map((frame) => frame.question.verbId), ['bo', 'jobbe', 'ha']);
assert.ok(state.retryFrames.every((frame) => frame.question.phase === 'recall'));
assert.equal(currentVerbFrame(state).hinted, false);
assert.equal(currentVerbFrame(state).number, 1);
assert.equal(currentVerbFrame(state).total, 3);
state = finish(state, { 'recall-bo': { value: 'bo' }, 'recall-jobbe': { helped: true } });
assert.equal(state.completionCount, 2);
assert.deepEqual(weakVerbIds(state), ['bo', 'jobbe']);
assert.equal(verbOutcome(state, 'ha'), 'repeated');
assert.deepEqual(state.firstAttempts, firstScore, 'retries retain every first answer');
assert.equal(verbSessionSummary(state).correct, 9);
const failedRetry = state;
state = apply(state, 'START_RETRY');
assert.deepEqual(state.retryFrames.map((frame) => frame.question.verbId), ['bo', 'jobbe'], 'successful old verb leaves the retry queue');
assert.equal(currentVerbFrame(state).hinted, false);
state = finish(state);
assert.equal(state.completionCount, 3);
assert.deepEqual(weakVerbIds(state), []);
assert.equal(verbOutcome(state, 'bo'), 'repeated');
assert.equal(verbOutcome(state, 'jobbe'), 'repeated', 'hint used in a previous round does not contaminate the new attempt');
assert.equal(verbSessionSummary(state).retryCorrect, 2);
assert.equal(verbSessionSummary(state).retryTotal, 2);
assert.deepEqual(state.firstAttempts, firstScore);
assert.equal(apply(state, 'START_RETRY'), state, 'no empty retry round');
const finalState = state;
state = apply(state, 'RESET');
assert.notEqual(state.runId, finalState.runId);
assert.equal(state.completionCount, 0);
assert.deepEqual(state.firstAttempts, {});
assert.deepEqual(session, initialCopy, 'caller-owned session data stays untouched');

// Normalize ordinary learner input while honoring explicitly accepted alternatives.
assert.equal(normalizeVerbAnswer('  JOBBER.!  '), 'jobber');
assert.equal(normalizeVerbAnswer('å være'), 'å være');
assert.equal(normalizeVerbAnswer('  HAR\t behov   for. '), 'har behov for');
const alternateSession = { ...session, verbs: [verbs[0]], reviewVerbs: [], questions: [{ id: 'alt', verbId: 'bo', phase: 'recall', answer: 'bor', acceptedAnswers: ['bur'] }] };
state = apply(initVerbSession(alternateSession), 'NEXT');
state = answer(state, ' BUR. ');
assert.equal(currentVerbFrame(state).record.correct, true);

// Completed-round journal prevents duplicate writes/rewards; users and levels never share keys.
const storage = memoryStorage();
const scope = { userId: 'learner/one', level: 'A1' };
const today = Date.parse('2026-10-23T12:00:00Z');
let saved = recordVerbPracticeCompletion(storage, scope, firstCompleted, { now: today });
assert.equal(saved.saved, true);
assert.equal(saved.progress.verbs.bo.attempts, 3);
assert.equal(saved.progress.verbs.bo.needsReview, true);
assert.equal(saved.progress.verbs.bo.correctStreak, 0);
assert.equal(saved.progress.verbs.snakke.needsReview, false);
assert.equal(saved.progress.verbs.snakke.correctStreak, 1);
assert.equal(saved.progress.verbs.ha.attempts, 1);
assert.equal(saved.progress.verbs.bo.lastPracticed, '2026-10-23T12:00:00.000Z');
const firstSaved = structuredClone(saved.progress);
saved = recordVerbPracticeCompletion(storage, scope, firstCompleted, { now: today + 1000 });
assert.equal(saved.duplicate, true);
assert.deepEqual(saved.progress, firstSaved);
saved = recordVerbPracticeCompletion(storage, scope, failedRetry, { now: today + 2000 });
assert.equal(saved.progress.verbs.bo.attempts, 4);
assert.equal(saved.progress.verbs.jobbe.needsReview, true);
assert.equal(saved.progress.verbs.ha.attempts, 2);
assert.equal(saved.progress.verbs.ha.correctStreak, 1);
saved = recordVerbPracticeCompletion(storage, scope, finalState, { now: today + 3000 });
assert.equal(saved.progress.verbs.bo.attempts, 5);
assert.equal(saved.progress.verbs.bo.correctStreak, 1);
assert.equal(saved.progress.verbs.bo.needsReview, false);
assert.equal(saved.progress.verbs.snakke.attempts, 3, 'verbs not in the retry round are not counted again');
assert.equal(saved.progress.verbs.ha.attempts, 2);
assert.deepEqual(readVerbPracticeProgress(storage, { ...scope, userId: 'learner/two' }).verbs, {});
assert.deepEqual(readVerbPracticeProgress(storage, { ...scope, level: 'A2' }).verbs, {});
assert.notEqual(verbPracticeProgressKey({ userId: 'a:b', level: 'A1' }), verbPracticeProgressKey({ userId: 'a', level: 'B1' }));
assert.equal(verbPracticeProgressKey({ level: 'unknown' }).endsWith(':a1'), true);
const candidates = [...verbs, ...reviewVerbs];
assert.deepEqual(selectDueVerbReviews(saved.progress, candidates, { now: today, limit: 2 }), []);
assert.equal(selectDueVerbReviews(saved.progress, candidates, { now: today + 2 * 86400000, limit: 2 }).length, 2);
const secondRun = finish(initVerbSession(session));
saved = recordVerbPracticeCompletion(storage, scope, secondRun, { now: today + 86400000 });
assert.equal(saved.progress.verbs.snakke.correctStreak, 2);
assert.equal(Date.parse(saved.progress.verbs.snakke.nextReview) - Date.parse(saved.progress.verbs.snakke.lastPracticed), 3 * 86400000);
assert.equal(Object.values(saved.progress.verbs).some((verb) => ownMastered(verb)), false);
function ownMastered(verb) { return Object.prototype.hasOwnProperty.call(verb, 'mastered'); }

// A later retry save also recovers an initial completion lost to transient storage errors.
const recoveredStorage = memoryStorage();
const recovered = recordVerbPracticeCompletion(recoveredStorage, scope, finalState, { now: today });
assert.equal(recovered.saved, true);
assert.equal(recovered.progress.verbs.bo.attempts, 5);
assert.equal(recovered.progress.verbs.ha.attempts, 2);
assert.equal(recovered.progress.completions.length, 3);
assert.equal(recordVerbPracticeCompletion(recoveredStorage, scope, finalState).duplicate, true);

// Missing, blocked, corrupt or full storage never crashes the flow or overwrites unreadable data.
assert.equal(recordVerbPracticeCompletion(undefined, scope, finalState).saved, false);
let writes = 0;
const blockedRead = { getItem() { throw new Error('blocked'); }, setItem() { writes++; } };
assert.equal(recordVerbPracticeCompletion(blockedRead, scope, finalState).saved, false);
assert.equal(writes, 0);
const blockedWrite = { getItem: () => null, setItem() { throw new Error('quota'); } };
assert.equal(recordVerbPracticeCompletion(blockedWrite, scope, finalState).saved, false);
const corrupt = { getItem: () => '{broken', setItem() {} };
assert.deepEqual(readVerbPracticeProgress(corrupt, scope).verbs, {});
assert.equal(recordVerbPracticeCompletion(corrupt, scope, firstCompleted).saved, true);
assert.equal(recordVerbPracticeCompletion(storage, scope, initVerbSession(session)).saved, false);
console.log('Verb practice: teaching order, readonly Back, explicit checks, immutable first score, recall retries, fresh hints, once-only completion, scoped progress and safe storage passed.');
