import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
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
  input: { game: resolve(root, 'src/modules/exercises/ActivityGame.js'), speech: resolve(root, 'src/services/norwegianSpeech.js'), content: resolve(root, 'src/modules/lessons/norwegian-program/lessonContent.js') },
  output: { entryFileNames: '[name].mjs' },
} } });

const { default: ActivityGame } = await import(pathToFileURL(resolve(outDir, 'game.mjs')));
const { speakNorwegian } = await import(pathToFileURL(resolve(outDir, 'speech.mjs')));
const { courseCatalog } = await import(pathToFileURL(resolve(outDir, 'content.mjs')));
const { buildListeningQuestions } = await import('../src/modules/exercises/practiceActivities.js');
const storage = new Map();
globalThis.localStorage = { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) };
globalThis.window = Object.assign(new EventTarget(), { scrollTo() {}, speechSynthesis: { cancel() {} } });
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

let renderer;
const buttonText = (node) => node.children.map((child) => typeof child === 'string' ? child : buttonText(child)).join('');
const buttons = () => renderer.root.findAllByType('button');
const findButton = (text) => buttons().find((button) => buttonText(button).includes(text));
const click = async (button) => { assert.ok(button, 'button exists'); assert.ok(!button.props.disabled, 'button is enabled'); await act(async () => { button.props.onClick(); }); };
const renderGame = async (game, query = 'A1') => {
  await act(async () => { renderer = TestRenderer.create(React.createElement(MemoryRouter, { initialEntries: [`/${game}?nivel=${query}`] }, React.createElement(ActivityGame, { game })), { createNodeMock: () => ({ focus() { document.activeElement = this; } }) }); });
};
const unmount = async () => act(async () => renderer.unmount());
const choices = () => buttons().filter((button) => button.props.className?.includes('selected') || button.props['aria-pressed'] !== undefined);

// Complete a mission with a mistake, then retry it. Verify no double scoring,
// no progress pollution from retries, and no lost career selection.
localStorage.setItem('norwegian_career_profile_game-test', JSON.stringify({ pathId: 'office' }));
await renderGame('missions', 'B2');
assert.equal(renderer.root.findAllByType('select')[1].props.value, 'office');
await click(findButton('1 misiune'));
await click(findButton('Începe misiunile'));
const quote = renderer.root.findByType('blockquote').findByType('p').children.join('').replace(/[„”]/g, '');
const scene = workMissionData.office.find((item) => item[2] === quote);
assert.ok(scene);
await click(choices().find((button) => !buttonText(button).includes(scene[3])));
const verify = findButton('Verifică răspunsul');
await act(async () => { verify.props.onClick(); verify.props.onClick(); });
assert.equal(JSON.parse(localStorage.getItem('norwegian_review_items')).length, 1);
const next = findButton('Continuă');
await act(async () => { next.props.onClick(); next.props.onClick(); });
assert.equal(renderer.root.findAllByProps({ role: 'group' }).length, 1);
await click(choices().find((button) => buttonText(button).includes(scene[7])));
await click(findButton('Verifică răspunsul'));
const finish = findButton('Vezi rezultatul');
await act(async () => { finish.props.onClick(); finish.props.onClick(); });
assert.equal(activityTestEvents.length, 1);
assert.equal(activityTestEvents[0].score, 50);
assert.equal(activityTestEvents[0].pathId, 'office');
const progressKey = 'norwegian_activity_game_game-test_missions_B2_office';
assert.equal(JSON.parse(localStorage.getItem(progressKey)).best, 50);
await click(findButton('Repetă greșelile'));
await click(choices().find((button) => buttonText(button).includes(scene[3])));
await click(findButton('Verifică răspunsul'));
await click(findButton('Vezi rezultatul'));
assert.equal(activityTestEvents.length, 2);
assert.equal(activityTestEvents[1].retry, true);
assert.equal(JSON.parse(localStorage.getItem(progressKey)).best, 50, 'retry must not turn a partial score into a perfect session');
assert.equal(JSON.parse(localStorage.getItem(progressKey)).sessions, 1);
await unmount();
console.log('✓ Missions: saved career, B2 responses, duplicate clicks, review, results and retry.');

await renderGame('listen');
await click(findButton('Începe să asculți'));
assert.ok(choices().every((button) => button.props.disabled), 'must listen before answering');
assert.ok(findButton('Verifică răspunsul').props.disabled);
await click(findButton('Ascultă înregistrarea'));
let audio = audios.at(-1);
assert.ok(!JSON.stringify(renderer.toJSON()).includes(decodeURIComponent(new URL(audio.src, 'http://localhost').searchParams.get('text'))), 'recording text stays hidden before answering');
await act(async () => audio.onplay());
assert.ok(choices().every((button) => button.props.disabled), 'playback must complete');
await act(async () => audio.onended());
assert.ok(choices().every((button) => !button.props.disabled));
await click(choices()[0]);
await click(findButton('Verifică răspunsul'));
assert.ok(renderer.root.findAllByProps({ role: 'status' }).length);
await click(findButton('Continuă'));
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
await unmount();
assert.equal(audio.released, true, 'leaving a game releases its audio');
console.log('✓ Listening: hidden transcript, full playback gate, feedback, network errors and cleanup.');

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
