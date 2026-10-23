import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter, Route } from 'react-router-dom';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/mobile-exercise-tests');
const entries = {
  hub: 'src/modules/exercises/GamesHub.js', practice: 'src/modules/exercises/PracticeGame.js',
  verbs: 'src/modules/exercises/challenge30/Challenge30.js', matching: 'src/modules/exercises/challenge30/ChallengeDragDrop.js',
  fill: 'src/modules/exercises/challenge30/ChallengeFillIn.js', sentences: 'src/modules/exercises/challenge30/ChallengeSentenceMatch.js',
  pronunciation: 'src/modules/pronunciation/Pronunciation.js', recorder: 'src/modules/pronunciation/PronunciationLab.js',
  review: 'src/modules/lessons/ReviewPage.js', content: 'src/modules/lessons/norwegian-program/lessonContent.js',
  verbData: 'src/modules/exercises/challenge30/verbsForLevel.js', practiceData: 'src/modules/exercises/practiceGameData.js',
  verbSessionData: 'src/modules/exercises/challenge30/verbPracticeData.js',
  vocabularyFlow: 'src/modules/exercises/vocabularyFlow.js',
};
await build({ configFile: resolve(root, 'vite.config.js'), logLevel: 'error', plugins: [{
  name: 'mobile-test-services', enforce: 'pre',
  resolveId(id) {
    if (id.endsWith('/AuthContext')) return 'virtual:mobile-auth';
    if (id.endsWith('/learningActivity')) return 'virtual:mobile-study';
    if (id.endsWith('/norwegianSpeech') || id.endsWith('/azurePronunciationSpeech')) return 'virtual:mobile-speech';
  },
  load(id) {
    if (id === 'virtual:mobile-auth') return 'export const useAuth = () => ({ user: { id: "mobile-test" } });';
    if (id === 'virtual:mobile-study') return 'export const recordStudyActivity = event => globalThis.mobileEvents.push(event); export const getStudySummary = () => ({ streak: 0 });';
    if (id === 'virtual:mobile-speech') return 'export const speakNorwegian = async (text, options) => { globalThis.mobileSpeech.push({ text, options }); return { ok: !globalThis.mobileSpeechFail }; }; export const speakPronunciationModel = speakNorwegian;';
  },
}], build: { ssr: true, outDir, emptyOutDir: false, rollupOptions: {
  input: Object.fromEntries(Object.entries(entries).map(([name, path]) => [name, resolve(root, path)])), output: { entryFileNames: '[name].mjs' },
} } });
const load = (name) => import(pathToFileURL(resolve(outDir, name + '.mjs')));
const components = Object.fromEntries(await Promise.all(Object.keys(entries).filter((name) => !['content', 'verbData', 'practiceData', 'vocabularyFlow', 'verbSessionData'].includes(name)).map(async (name) => [name, (await load(name)).default])));
const { courseCatalog } = await load('content');
const { getVerbSessions } = await load('verbData');
const { createVerbSession, getKnownReviewVerbs } = await load('verbSessionData');
const { createPracticeQuestions, normalizePracticeAnswer, saveGameProgress, readGameProgress } = await load('practiceData');
const { createVocabularySession, vocabularyContext } = await load('vocabularyFlow');
assert.equal(vocabularyContext({ word: 'en bil', example: 'Jeg ser et bilde.' }), null, 'never remove a substring from another word');
assert.equal(vocabularyContext({ word: 'å lese', example: 'Jeg leser.' }), null, 'never fabricate an inflection');
for (const course of Object.values(courseCatalog)) {
  for (let seed = 1; seed <= 5; seed++) {
    let state = seed;
    const random = () => ((state = (state * 1664525 + 1013904223) >>> 0) / 4294967296);
    const session = createVocabularySession(course.lessons, random);
    assert.equal(session.length, 9, course.code + ': three words and nine steps');
    assert.equal(new Set(session.slice(0, 3).map(q => normalizePracticeAnswer(q.word))).size, 3);
    for (const question of session.filter(q => q.stage === 'context')) {
      assert.equal(question.prompt.replace('____', question.answer), question.example);
      assert.ok(question.options.length >= 2);
      assert.equal(new Set(question.options.map(normalizePracticeAnswer)).size, question.options.length);
      assert.ok(question.options.includes(question.answer));
    }
  }
}
const storage = new Map();
globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: (key) => storage.delete(key) };
globalThis.window = Object.assign(new EventTarget(), { localStorage, scrollTo() {}, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }), location: { search: '', hostname: 'localhost' }, setInterval, clearInterval, setTimeout, clearTimeout });
globalThis.document = { activeElement: null, documentElement: { classList: { contains: (name) => name === 'is-installed-app' } }, getElementById: () => null };
globalThis.mobileEvents = [];
globalThis.mobileSpeech = [];
globalThis.mobileSpeechFail = false;
let renderer;
const text = (node) => node.children.map((child) => typeof child === 'string' ? child : text(child)).join('');
const buttons = () => renderer.root.findAllByType('button');
const button = (label) => buttons().find((node) => text(node).includes(label));
const byClass = (value) => renderer.root.findAll((node) => typeof node.type === 'string' && node.props.className?.split(' ').includes(value));
const click = async (node) => { assert.ok(node, 'control exists'); assert.ok(!node.props.disabled, 'control is enabled'); await act(async () => { node.props.onClick(); }); };
const render = async (name, props = {}, level = 'A1') => {
  await act(async () => { renderer = TestRenderer.create(React.createElement(MemoryRouter, { initialEntries: ['/?nivel=' + level + '&appPreview=1'] }, React.createElement(Route, { exact: true, path: '/' }, React.createElement(components[name], props)), React.createElement(Route, { path: '/jocuri' }, React.createElement('p', { id: 'games-return' }, 'Jocuri și exerciții'))), { createNodeMock: () => ({ focus() {}, getBoundingClientRect: () => ({ width: 390, height: 844 }), querySelector: () => ({ focus() {} }) }) }); });
};
const unmount = async () => act(async () => renderer.unmount());

// Every selector uses the actual level, and every live hub exposes all eight activities.
for (const level of Object.keys(courseCatalog)) {
  const course = courseCatalog[level];
  for (const game of ['quiz', 'order']) {
    for (const lesson of course.lessons) {
      const questions = createPracticeQuestions([lesson], game);
      assert.ok(questions.length >= 3, level + '/' + lesson.id + '/' + game);
      assert.ok(questions.every((question) => question.lessonId === lesson.id));
      if (game === 'quiz') assert.ok(questions.every((question) => new Set(question.options).size === question.options.length));
    }
    await render('practice', { game }, level);
    assert.equal(renderer.root.findAllByType('select').length, 0, 'games start without a configuration screen');
    assert.equal(renderer.root.findByProps({ 'aria-label': game === 'quiz' ? 'Cuvinte parcurse' : 'Progresul sesiunii' }).props.max, game === 'quiz' ? 9 : 5);
    assert.ok(game === 'quiz' ? renderer.root.findByProps({ 'aria-label': 'Nivel ' + level }) : text(byClass('ng-question-meta')[0]).includes(level));
    await unmount();
  }
  await render('hub', {}, level);
  const cards = [...byClass('mini-tile'), ...byClass('mini-missions'), ...byClass('mini-review'), ...byClass('mini-daily')];
  assert.equal(new Set(cards.map(card => card.props.href)).size, 8);
  assert.ok(cards.every(card => card.props.href.endsWith('?nivel=' + level)));
  assert.ok(renderer.root.findAllByProps({ 'aria-label': 'Nivel de practică' }).every((select) => select.props.value === level));
  await unmount();
  assert.deepEqual(getVerbSessions(level).map((session) => session.length), Array(10).fill(3));
}
console.log('✓ A1–C2: all 144 lessons supply each quick game; all eight activities stay available.');

// Level changes must replace the content and preserve the app preview query.
await render('hub');
const levelSelect = renderer.root.findAllByProps({ 'aria-label': 'Nivel de practică' })[0];
await act(async () => levelSelect.props.onChange({ target: { value: 'C2' } }));
assert.ok(renderer.root.findAllByProps({ 'aria-label': 'Nivel de practică' }).every((select) => select.props.value === 'C2'));
assert.equal(localStorage.getItem('norwegian_active_level'), 'C2');
assert.ok(byClass('mini-tile').every((card) => card.props.href.endsWith('?nivel=C2')));
await unmount();

// Complete a real quiz, guarding duplicate checks and completion; mistakes reach review.
storage.clear(); mobileEvents.length = 0;
await render('practice', { game: 'quiz' }, 'B2');
for (let index = 0; index < 9; index++) {
  const question = renderer.root.findAll(node => node.props.question && node.props.onVerify)[0].props.question;
  assert.equal(question.stage, index < 3 ? 'recognize' : index < 6 ? 'context' : 'recall');
  const speechBefore = mobileSpeech.length;
  if (question.stage === 'recognize') assert.equal(mobileSpeech.at(-1).text, question.word);
  if (question.stage === 'context') {
    assert.ok(question.prompt.includes('____'));
    assert.ok(question.options.length >= 2);
    assert.equal(question.prompt.replace('____', question.answer), question.example);
  }
  if (question.type === 'choice') {
    const choices = byClass('vn-choices')[0].findAllByType('button');
    const choice = choices.find(node => text(node.findByProps({ className: 'vn-option-text' })) === question.answer);
    assert.ok(choice);
    const selected = index === 0 ? choices.find(node => node !== choice) : choice;
    await act(async () => { selected.props.onClick(); selected.props.onClick(); });
    assert.ok(byClass('vn-choices')[0].findAllByType('button').every(node => node.props.disabled));
  } else {
    await act(async () => renderer.root.findByType('input').props.onChange({ target: { value: question.answer } }));
    assert.equal(mobileSpeech.length, speechBefore, 'typing must not reveal the word through speech');
    await act(async () => { const form = renderer.root.findByType('form'); form.props.onSubmit({ preventDefault() {} }); form.props.onSubmit({ preventDefault() {} }); });
  }
  if (question.stage === 'recognize') assert.equal(mobileSpeech.length, speechBefore, 'checking recognition must not replay automatically');
  else {
    assert.equal(mobileSpeech.length, speechBefore + 1, 'feedback reads the answer exactly once');
    assert.equal(mobileSpeech.at(-1).text, question.stage === 'context' ? question.example : question.word);
  }
  const next = button(index === 8 ? 'Vezi rezultatul' : 'Continuă');
  await act(async () => { next.props.onClick(); next.props.onClick(); });
}
assert.equal(mobileEvents.length, 1);
assert.equal(mobileEvents[0].score, 89);
assert.equal(JSON.parse(localStorage.getItem('norwegian_review_items')).length, 1);
const originalRecord = localStorage.getItem('practice_game_v2_mobile-test_B2_quiz');
await click(button('Repetă greșelile'));
const correctMeaning = JSON.parse(localStorage.getItem('norwegian_review_items'))[0].answer;
await click(byClass('vn-choices')[0].findAllByType('button').find((node) => text(node.findByProps({ className: 'vn-option-text' })) === correctMeaning));
await click(button('Vezi rezultatul'));
assert.equal(localStorage.getItem('practice_game_v2_mobile-test_B2_quiz'), originalRecord, 'a one-question retry cannot inflate the record');
await click(button('Sesiune nouă'));
assert.equal(renderer.root.findByProps({ 'aria-label': 'Cuvinte parcurse' }).props.max, 9);
assert.equal(renderer.root.findByProps({ 'aria-label': 'Cuvinte parcurse' }).props.value, 0);
assert.equal(renderer.root.findAllByType('select').length, 0);
await click(button('Sunet pornit'));
assert.ok(mobileSpeech.at(-1).options.signal.aborted, 'muting cancels the active audio');
const mutedSpeechCount = mobileSpeech.length;
for (let index = 0; index < 6; index++) {
  await click(byClass('vn-choices')[0].findAllByType('button')[0]);
  await click(button('Continuă'));
}
assert.equal(mobileSpeech.length, mutedSpeechCount, 'muted steps never autoplay');
assert.equal(renderer.root.findAllByProps({ className: 'vn-replay' }).length, 0, 'recall hides speech before checking');
const reviewsBeforeReveal = JSON.parse(localStorage.getItem('norwegian_review_items')).length;
await click(button('Nu-mi amintesc'));
assert.ok(renderer.root.findByProps({ role: 'status' }));
assert.ok(JSON.parse(localStorage.getItem('norwegian_review_items')).length >= reviewsBeforeReveal);
assert.equal(localStorage.getItem('practice_game_v2_mobile-test_B2_quiz'), originalRecord, 'an unfinished assisted session cannot award progress');
await click(button('Sunet oprit'));
assert.equal(mobileSpeech.length, mutedSpeechCount + 1, 'unmuting feedback reads the revealed word');
const lastSignal = mobileSpeech.at(-1).options.signal;
await unmount();
assert.ok(lastSignal.aborted, 'leaving cancels playback');
mobileSpeechFail = true;
await render('practice', { game: 'quiz' });
assert.ok(byClass('vn-audio-error').length, 'autoplay failure has an explicit retry');
assert.ok(byClass('vn-choices')[0].findAllByType('button').every(node => !node.props.disabled), 'audio failure never blocks answers');
await unmount();
mobileSpeechFail = false;
if (process.argv.includes('--vocabulary-only')) { console.log('Vocabulary flow passed: nine steps, immediate checks, recall, reveal, audio timing, mute, cancellation, retry and honest progress.'); process.exit(0); }
console.log('✓ Quiz: one score per answer, review of mistakes, completed results and honest retry records.');

// Repeated words remain separate tokens. Verification waits for the whole sentence.
await render('practice', { game: 'order' }, 'C1');
const bank = () => byClass('order-bank')[0].findAllByType('button');
assert.ok(button('Completează propoziția').props.disabled);
const first = bank()[0];
await act(async () => { first.props.onClick(); first.props.onClick(); });
assert.equal(byClass('order-zone')[0].findAllByType('button').length, 1);
await click(byClass('order-zone')[0].findAllByType('button')[0]);
assert.equal(bank()[0].props.disabled, false);
for (let index = 0; index < bank().length; index++) await click(bank()[index]);
assert.equal(button('Verifică').props.disabled, false);
await click(button('Verifică')); assert.ok(renderer.root.findAllByProps({ role: 'status' }).length);
await unmount();

// Leaving a partial sentence must not record a completion.
await render('practice', { game: 'order' }, 'C2');
const eventsBeforeExit = mobileEvents.length;
await click(renderer.root.findByProps({ 'aria-label': 'Închide sesiunea' }));
assert.equal(renderer.root.findAllByProps({ role: 'dialog' }).length, 0);
assert.ok(renderer.root.findByProps({ id: 'games-return' }));
assert.equal(mobileEvents.length, eventsBeforeExit, 'leaving a partial session must not record a completion');
await unmount();
const repeated = createPracticeQuestions([{ uid: 'repeat', id: 1, vocabulary: [], exercises: [{ type: 'order', prompt: 'Repetă', answer: ['jeg', 'tror', 'at', 'jeg', 'kan'] }], dialogue: [] }], 'order')[0];
assert.equal(repeated.words.filter((word) => word === 'jeg').length, 2);
assert.equal(normalizePracticeAnswer('  Å TA   HENSYN TIL! '), 'å ta hensyn til');
saveGameProgress(localStorage, 'word', 'C2', 'other', [{ correct: true }]);
assert.equal(readGameProgress(localStorage, 'word', 'C1', 'other').sessions, 0);
assert.equal(readGameProgress(localStorage, 'word', 'C2', 'mobile-test').sessions, 0);
console.log('✓ Sentences: independent tokens, complete answers, direct exit and isolated progress.');

const verbs = [{ norwegian: 'å ta hensyn til', romanian: 'a ține cont de', example: 'Vi må ta hensyn til barna.', translation: 'Trebuie să ținem cont de copii.' }, { norwegian: 'å sove', romanian: 'a dormi', example: 'Jeg vil sove.', translation: 'Vreau să dorm.' }, { norwegian: 'å spise', romanian: 'a mânca', example: 'Vi skal spise.', translation: 'Vom mânca.' }];
let completions = 0;
await render('matching', { verbs, onComplete: () => completions++ });
for (const verb of verbs) {
  await click(byClass('challenge-drag__token').find((node) => text(node.findAllByType('button')[0]) === verb.norwegian).findAllByType('button')[0]);
  await click(byClass('challenge-drag__target').find((node) => text(node.findByType('strong')) === verb.romanian));
}
const checkPairs = button('Verifică perechile');
await act(async () => { checkPairs.props.onClick(); checkPairs.props.onClick(); });
assert.equal(completions, 1); assert.ok(text(byClass('challenge-drag__result')[0]).includes('3 din 3'));
await unmount();
completions = 0;
await render('fill', { verbs, onComplete: () => completions++ });
for (const verb of verbs) {
  const input = renderer.root.findByProps({ 'aria-label': 'Scrie în norvegiană: ' + verb.romanian });
  await act(async () => input.props.onChange({ target: { value: verb.norwegian + ' ' } }));
  assert.equal(input.props.value, verb.norwegian + ' ');
}
const checkFill = button('Verifică');
await act(async () => { checkFill.props.onClick(); checkFill.props.onClick(); });
assert.equal(completions, 1); assert.ok(text(renderer.root.findByProps({ role: 'status' })).includes('3 / 3'));
await unmount();
await render('sentences', { verbs });
assert.ok(renderer.root.findAllByType('blockquote').some((node) => text(node) === verbs[0].example));
assert.ok(button('Verifică propozițiile').props.disabled); await unmount();

// The final sequential verb session reaches 100% without skipping learning steps.
localStorage.setItem('challenge_verbs_progress_c2', JSON.stringify({ day: 10, completed: [1, 2, 3, 4, 5, 6, 7, 8, 9] }));
await render('verbs', {}, 'C2');
const finalProgress = { day: 10, completed: [1, 2, 3, 4, 5, 6, 7, 8, 9] };
const finalReviews = getKnownReviewVerbs({ level: 'C2', day: 10, progress: finalProgress }).reverse().slice(0, 2);
const finalSession = createVerbSession({ level: 'C2', day: 10, progress: finalProgress, reviewVerbs: finalReviews });
const verbPrimary = () => renderer.root.findByProps({ 'data-action': 'primary' });
for (let index = 0; index < 3; index++) await click(verbPrimary());
for (const question of finalSession.questions) {
  assert.equal(byClass('verb-practice__card')[0].props['data-question-id'], question.id);
  if (question.options) await click(renderer.root.findByProps({ 'data-choice': question.answer }));
  else await act(async () => renderer.root.findByProps({ 'aria-label': 'Verbul lipsă' }).props.onChange({ target: { value: question.answer } }));
  await click(verbPrimary());
  await click(verbPrimary());
}
await click(renderer.root.findByProps({ 'data-action': 'sessions' }));
assert.equal(renderer.root.findByProps({ 'aria-label': 'Sesiuni parcurse' }).props['aria-valuenow'], 100);
assert.equal(JSON.parse(localStorage.getItem('challenge_verbs_progress_c2')).completed.length, 10);
await unmount();
console.log('✓ Verbs: touch matching, multiword expressions, contextual recall and sequential 100% completion.');

// Pronunciation keeps lesson selection and phrase navigation available on every level.
for (const level of Object.keys(courseCatalog)) {
  await render('pronunciation', {}, level);
  const lessonSelect = renderer.root.findAllByType('select').find((node) => node.props['aria-label'] !== 'Nivel de practică');
  await act(async () => lessonSelect.props.onChange({ target: { value: '24' } }));
  assert.equal(renderer.root.findAllByType(components.recorder)[0].props.lessonId, 24);
  await click(renderer.root.findByProps({ 'aria-label': 'Expresia următoare' }));
  assert.equal(renderer.root.findAllByType(components.recorder)[0].props.phraseIndex, 1);
  await unmount();
}
let resolvePermission;
let permissionCalls = 0;
let stoppedTracks = 0;
const stream = { getTracks: () => [{ stop: () => stoppedTracks++ }] };
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaDevices: { getUserMedia: () => { permissionCalls++; return new Promise((resolve) => { resolvePermission = resolve; }); } } } });
const recorders = [];
globalThis.MediaRecorder = window.MediaRecorder = class {
  static isTypeSupported() { return true; }
  constructor() { this.state = 'inactive'; recorders.push(this); }
  start() { this.state = 'recording'; }
  stop() { this.state = 'inactive'; this.stops = (this.stops || 0) + 1; }
};
const phrase = { word: 'hei', example: 'Hei, jeg heter Ana.', translation: 'Bună, mă numesc Ana.' };
await render('recorder', { phrase, phraseIndex: 0, level: 'A1', lessonId: 1 });
const startRecording = renderer.root.findByProps({ 'aria-label': 'Începe înregistrarea' });
await act(async () => { startRecording.props.onClick(); startRecording.props.onClick(); });
assert.equal(permissionCalls, 1);
assert.ok(renderer.root.findByProps({ 'aria-label': 'Pregătim microfonul…' }).props.disabled);
await unmount();
await act(async () => resolvePermission(stream));
assert.equal(stoppedTracks, 1); assert.equal(recorders.length, 0, 'late microphone permission cannot record after leaving');
await render('recorder', { phrase, phraseIndex: 0, level: 'A1', lessonId: 1 });
await click(renderer.root.findByProps({ 'aria-label': 'Începe înregistrarea' }));
await act(async () => resolvePermission(stream));
assert.equal(recorders.length, 1);
await click(renderer.root.findByProps({ 'aria-label': 'Oprește înregistrarea' }));
assert.equal(recorders[0].stops, 1);
await unmount();
assert.equal(stoppedTracks, 2);
console.log('✓ Pronunciation: lesson and phrase selection, tap start/stop, pending permission and microphone cleanup.');

// Review cannot skip a second card on a repeated tap, and changing level resets its queue.
storage.clear(); mobileEvents.length = 0;
localStorage.setItem('norwegian_review_items', JSON.stringify([
  { id: 'one', level: 'B1', lessonId: 1, prompt: 'Prima expresie', answer: 'å ta hensyn til', dueAt: '2020-01-01' },
  { id: 'two', level: 'B1', lessonId: 2, prompt: 'A doua expresie', answer: 'å spise', dueAt: '2020-01-01' },
]));
await render('review', {}, 'B1');
assert.equal(byClass('review-rating').length, 0);
await click(button('Arată răspunsul'));
assert.ok(text(byClass('review-answer')[0]).includes('å ta hensyn til'));
const good = byClass('review-rating--good')[0];
await act(async () => { good.props.onClick(); good.props.onClick(); });
assert.equal(byClass('review-rating').length, 0);
assert.ok(text(byClass('review-card')[0]).includes('A doua expresie'));
await click(button('Arată răspunsul')); await click(byClass('review-rating--good')[0]);
assert.equal(byClass('review-finished').length, 1); assert.equal(mobileEvents.length, 1);
await act(async () => renderer.root.findByProps({ 'aria-label': 'Nivel de practică' }).props.onChange({ target: { value: 'C2' } }));
assert.equal(byClass('review-empty').length, 1);
assert.ok(text(byClass('review-empty')[0]).includes('C2'));
await unmount();
console.log('✓ Review: hidden/revealed answers, rating once, complete session and separate level queues.');
console.log('Mobile exercise interaction checks passed. Visual checks on a real phone remain separate.');
