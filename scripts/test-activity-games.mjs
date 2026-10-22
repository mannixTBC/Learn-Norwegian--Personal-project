import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter, Route } from 'react-router-dom';
import { workMissionData } from '../src/modules/exercises/workMissionData.js';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/activity-game-tests');
await build({ configFile: resolve(root, 'vite.config.js'), logLevel: 'error', plugins: [{
  name: 'activity-test-services', enforce: 'pre',
  resolveId(id) {
    if (id.endsWith('/AuthContext')) return 'virtual:activity-auth';
    if (id.endsWith('/learningActivity')) return 'virtual:activity-study';
  },
  load(id) {
    if (id === 'virtual:activity-auth') return 'export const useAuth = () => ({ user: globalThis.activityTestUser });';
    if (id === 'virtual:activity-study') return 'export const recordStudyActivity = (event) => globalThis.activityTestEvents.push(event);';
  },
}], build: { ssr: true, outDir, emptyOutDir: false, rollupOptions: {
  input: { game: resolve(root, 'src/modules/exercises/ActivityGame.js'), speech: resolve(root, 'src/services/norwegianSpeech.js'), content: resolve(root, 'src/modules/lessons/norwegian-program/lessonContent.js'), progress: resolve(root, 'src/services/curriculumProgress.js') },
  output: { entryFileNames: '[name].mjs' },
} } });

const { default: ActivityGame } = await import(pathToFileURL(resolve(outDir, 'game.mjs')));
const { speakNorwegian } = await import(pathToFileURL(resolve(outDir, 'speech.mjs')));
const { courseCatalog } = await import(pathToFileURL(resolve(outDir, 'content.mjs')));
const { courseProgressKey } = await import(pathToFileURL(resolve(outDir, 'progress.mjs')));
const { buildAdaptiveListeningQuestions, buildListeningQuestions } = await import('../src/modules/exercises/practiceActivities.js');
const storage = new Map();
globalThis.localStorage = { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) };
let advanceTimer;
const advanceListening = async () => { assert.ok(advanceTimer); const callback = advanceTimer; advanceTimer = null; await act(async () => callback()); };
globalThis.window = Object.assign(new EventTarget(), { scrollTo() {}, setTimeout(callback) { advanceTimer = callback; return 1; }, clearTimeout() { advanceTimer = null; }, speechSynthesis: { cancel() {} } });
globalThis.document = { activeElement: null };
globalThis.activityTestUser = { id: 'game-test' };
globalThis.activityTestEvents = [];
const audios = [];
globalThis.Audio = class {
  constructor() { audios.push(this); this.released = false; }
  play() { return Promise.resolve(); }
  pause() { this.paused = true; }
  removeAttribute() { this.released = true; }
  load() {}
};

for (const level of Object.keys(courseCatalog)) {
  for (const mode of ['words', 'dialogue']) {
    for (const lesson of courseCatalog[level].lessons) {
      const questions = buildListeningQuestions({ lessons: courseCatalog[level].lessons, level, mode, lessonId: lesson.id, length: 10 });
      assert.ok(questions.length >= 3, `${level}/${lesson.id}/${mode} needs enough real questions`);
      assert.ok(questions.every((item) => item.lessonId === lesson.id && item.options.length === 3));
    }
  }
}
console.log('✓ Real lesson content: both listening modes work for every lesson at A1–C2.');

for (const [level, course] of Object.entries(courseCatalog)) {
  for (let current = 0; current < course.lessons.length; current++) {
    const completed = course.lessons.slice(0, current).map((lesson) => lesson.id);
    const familiar = course.lessons.slice(0, current + 1);
    const familiarPool = buildListeningQuestions({ lessons: familiar, level, mode: 'mixed', length: Infinity, random: () => .5 });
    const questions = buildAdaptiveListeningQuestions({ lessons: course.lessons, level, completed, random: () => .5 });
    assert.equal(questions.length, 10, level + '/' + (current + 1) + ': ten real questions');
    assert.equal(new Set(questions.map((question) => question.audioText)).size, 10);
    assert.ok(questions.every((question) => question.options.length === 3 && new Set(question.options).size === 3));
    assert.ok(new Set(questions.map((question) => question.contentType)).size >= 2);
    if (familiarPool.length >= 10) assert.ok(questions.every((question) => familiar.some((lesson) => lesson.id === question.lessonId)), 'no future lessons when familiar content is sufficient');
  }
}
console.log('✓ Adaptive listening: ten mixed questions at every curriculum position, prioritizing completed and current lessons.');

let renderer;
const buttonText = (node) => node.children.map((child) => typeof child === 'string' ? child : buttonText(child)).join('');
const buttons = () => renderer.root.findAllByType('button');
const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const findButton = (text) => buttons().find((button) => normalize(buttonText(button)).includes(normalize(text)));
const click = async (button) => { assert.ok(button, 'button exists'); assert.ok(!button.props.disabled, 'button is enabled'); await act(async () => { button.props.onClick(); }); };
const renderGame = async (game, query = 'A1') => {
  await act(async () => { renderer = TestRenderer.create(React.createElement(MemoryRouter, { initialEntries: [`/${game}?nivel=${query}`] }, React.createElement(Route, { exact: true, path: '/' + game }, React.createElement(ActivityGame, { game })), React.createElement(Route, { path: '/jocuri' }, React.createElement('p', { id: 'games-return' }, 'Jocuri și exerciții'))), { createNodeMock: () => ({ showModal() {}, close() {}, focus() { document.activeElement = this; } }) }); });
};
const unmount = async () => act(async () => renderer.unmount());
const choices = () => buttons().filter((button) => button.props.className?.includes('selected') || button.props['aria-pressed'] !== undefined);

// Complete a mission with a mistake, then retry it. Verify no double scoring,
// no progress pollution from retries, and no lost career selection.
localStorage.setItem('norwegian_career_profile_game-test', JSON.stringify({ pathId: 'office' }));
await renderGame('missions', 'B2');
assert.equal(renderer.root.findAllByType('select').length, 0);
assert.equal(renderer.root.findByProps({ 'aria-label': 'Progresul sesiunii' }).props.max, 5);
let missedAnswer;
for (let index = 0; index < 5; index++) {
  const context = buttonText(renderer.root.findByProps({ className: 'activity-scene' }).findByType('p'));
  const scene = workMissionData.office.find((item) => item[1] === context);
  assert.ok(scene, 'mission uses the saved career');
  const answer = renderer.root.findAllByType('blockquote').length ? scene[3] : scene[7];
  if (index === 0) missedAnswer = answer;
  await click(choices().find((button) => index === 0 ? !buttonText(button).includes(answer) : buttonText(button).includes(answer)));
  const verify = findButton('Verifică');
  await act(async () => { verify.props.onClick(); verify.props.onClick(); });
  if (index === 0) assert.equal(JSON.parse(localStorage.getItem('norwegian_review_items')).length, 1);
  const next = findButton(index === 4 ? 'Vezi rezultatul' : 'Continuă');
  await act(async () => { next.props.onClick(); next.props.onClick(); });
}
assert.equal(activityTestEvents.length, 1);
assert.equal(activityTestEvents[0].score, 80);
assert.equal(activityTestEvents[0].pathId, 'office');
const progressKey = 'norwegian_activity_game_game-test_missions_B2_office';
assert.equal(JSON.parse(localStorage.getItem(progressKey)).best, 80);
await click(findButton('Repetă greșelile'));
await click(choices().find((button) => buttonText(button).includes(missedAnswer)));
await click(findButton('Verifică'));
await click(findButton('Vezi rezultatul'));
assert.equal(activityTestEvents.length, 2);
assert.equal(activityTestEvents[1].retry, true);
assert.equal(JSON.parse(localStorage.getItem(progressKey)).best, 80, 'retry must not turn a partial score into a perfect session');
assert.equal(JSON.parse(localStorage.getItem(progressKey)).sessions, 1);
await unmount();
console.log('✓ Missions: saved career, B2 responses, duplicate clicks, review, results and retry.');

await renderGame('listen');
assert.equal(renderer.root.findAllByType('select').length, 0);
assert.equal(renderer.root.findByProps({ 'aria-label': 'Progresul sesiunii' }).props.max, 10);
assert.ok(choices().every((button) => button.props.disabled), 'must listen before answering');
assert.ok(findButton('Verifică').props.disabled);
await click(findButton('Ascultă înregistrarea'));
let audio = audios.at(-1);
assert.ok(!JSON.stringify(renderer.toJSON()).includes(decodeURIComponent(new URL(audio.src, 'http://localhost').searchParams.get('text'))), 'recording text stays hidden before answering');
await act(async () => audio.onplay());
assert.ok(choices().every((button) => button.props.disabled), 'playback must complete');
await act(async () => audio.onended());
assert.ok(choices().every((button) => !button.props.disabled));
await click(choices()[0]);
await click(findButton('Verifică'));
assert.equal(renderer.root.findAllByType('dialog').length, 1);
if (findButton('Repetă întrebarea')) {
  const answer = renderer.root.findByType('dialog').findAllByType('p')[1].children.join('');
  await click(findButton('Repetă întrebarea'));
  assert.ok(choices().every(button => button.props.disabled), 'repeat requires listening again');
  await click(findButton('Ascultă înregistrarea'));
  await act(async () => { audios.at(-1).onplay(); audios.at(-1).onended(); });
  await click(choices().find(button => buttonText(button).includes(answer)));
  await click(findButton('Verifica'));
}
await advanceListening();
assert.ok(choices().every((button) => button.props.disabled), 'next recording needs a new listen');
await click(findButton('Ascultă înregistrarea'));
audio = audios.at(-1);
const savedError = console.error;
try {
  console.error = () => {};
  await act(async () => { audio.error = { code: 2 }; audio.onerror(); });
} finally { console.error = savedError; }
assert.ok(renderer.root.findAllByProps({ role: 'alert' }).length);
assert.ok(choices().every((button) => button.props.disabled), 'network errors cannot award points');
await click(findButton('Reîncearcă redarea'));
audio = audios.at(-1);
await click(renderer.root.findByProps({ 'aria-label': 'Închide sesiunea' }));
assert.ok(renderer.root.findByProps({ id: 'games-return' }));
assert.equal(renderer.root.findAllByProps({ role: 'dialog' }).length, 0);
assert.equal(audio.released, true, 'direct exit releases its audio');
await unmount();
console.log('✓ Listening: hidden transcript, full playback gate, feedback, network errors and cleanup.');

// Exercise the real screen with account-scoped curriculum progress and finish all ten questions.
const learningProgressKey = courseProgressKey('B1', activityTestUser);
const savedLearningProgress = JSON.stringify({ unlocked: 4, completed: [1, 2, 3] });
localStorage.setItem(learningProgressKey, savedLearningProgress);
localStorage.setItem(courseProgressKey('B1', { id: 'another-user' }), JSON.stringify({ unlocked: 24, completed: courseCatalog.B1.lessons.map((lesson) => lesson.id) }));
const eventsBeforeListening = activityTestEvents.length;
const learnedLessons = courseCatalog.B1.lessons.slice(0, 4);
const audioMeanings = learnedLessons.flatMap((lesson) => [...lesson.vocabulary.map((entry) => [entry[0], entry[1]]), ...lesson.dialogue.map((line) => [line[1], line[2]])]);
const normalizeAudio = (value) => value.normalize('NFC').trim().toLocaleLowerCase('nb-NO').replace(/\s+/g, ' ').replace(/[.!?]+$/g, '');
let seed = 14;
const originalRandom = Math.random;
try {
  Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  await renderGame('listen', 'B1');
} finally { Math.random = originalRandom; }
const observedTypes = new Set();
let vocabularyAnswers = 0;
for (let index = 0; index < 10; index++) {
  const meta = renderer.root.findByProps({ className: 'activity-question__meta expedition-meta' }).findAllByType('span');
  assert.match(buttonText(meta[0]), /^Lecția [1-4] ·/, 'questions stay inside this user’s completed and current lessons');
  const type = buttonText(meta[1]);
  observedTypes.add(type);
  if (type !== 'Replică din dialog') vocabularyAnswers++;
  assert.ok(choices().every((option) => option.props.disabled));
  await click(findButton('Ascultă înregistrarea'));
  const recording = audios.at(-1);
  const text = new URL(recording.src, 'http://localhost').searchParams.get('text');
  const meanings = audioMeanings.filter(([phrase]) => normalizeAudio(phrase) === normalizeAudio(text)).map(([, translation]) => translation);
  assert.ok(meanings.length, 'audio comes from the eligible lesson content');
  await act(async () => { recording.onplay(); recording.onended(); });
  await click(choices().find((option) => meanings.includes(buttonText(option.findAllByType('span')[1]))));
  await click(findButton('Verifică'));
  await advanceListening();
}
assert.ok(observedTypes.has('Replică din dialog') && observedTypes.size >= 2);
assert.equal(activityTestEvents.length, eventsBeforeListening + 1);
assert.equal(activityTestEvents.at(-1).level, 'B1');
assert.equal(activityTestEvents.at(-1).score, 100);
assert.equal(activityTestEvents.at(-1).words, vocabularyAnswers, 'dialogue answers are not counted as new vocabulary');
assert.equal(localStorage.getItem(learningProgressKey), savedLearningProgress, 'listening practice does not mark curriculum lessons complete');
await click(findButton('Sesiune nouă'));
assert.equal(renderer.root.findAllByType('select').length, 0);
assert.equal(renderer.root.findByProps({ 'aria-label': 'Progresul sesiunii' }).props.max, 10);
assert.equal(renderer.root.findByProps({ 'aria-label': 'Progresul sesiunii' }).props.value, 1);
await unmount();
console.log('✓ Listening screen: account-scoped progress, mixed content, all ten answers, scoring and immediate restart.');

const controller = new AbortController();
const firstPlayback = speakNorwegian('Hei', { signal: controller.signal, waitForEnd: true });
const firstAudio = audios.at(-1);
const secondPlayback = speakNorwegian('Takk', { waitForEnd: true });
assert.equal((await firstPlayback).cancelled, true);
assert.equal(firstAudio.released, true);
audios.at(-1).onplay(); audios.at(-1).onended();
assert.equal((await secondPlayback).ok, true);
const aborted = new AbortController(); aborted.abort();
const numberBeforeAbort = audios.length;
assert.equal((await speakNorwegian('Hei', { signal: aborted.signal })).cancelled, true);
assert.equal(audios.length, numberBeforeAbort);
const loadingController = new AbortController();
const cancelledPlayback = speakNorwegian('Hei', { signal: loadingController.signal, waitForEnd: true });
const cancelledAudio = audios.at(-1);
loadingController.abort();
assert.equal((await cancelledPlayback).cancelled, true);
assert.equal(cancelledAudio.released, true);
const ordinaryPlayback = speakNorwegian('Takk');
const ordinaryAudio = audios.at(-1);
ordinaryAudio.onplay();
assert.equal((await ordinaryPlayback).ok, true, 'existing callers still resolve when playback starts');
ordinaryAudio.onended();
console.log('✓ Speech: replacing playback and aborting never leaves pending audio promises.');
