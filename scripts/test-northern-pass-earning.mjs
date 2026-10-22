import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { readNorthernPassProgress } from '../src/services/northernPassProgress.js';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/northern-pass-earning-tests');
await build({ configFile: resolve(root, 'vite.config.js'), logLevel: 'error', plugins: [{
  name: 'northern-pass-offline-components', enforce: 'pre',
  resolveId(id) {
    if (id.endsWith('/AuthContext')) return 'virtual:northern-auth';
    if (id.endsWith('/supabaseLearning')) return 'virtual:northern-sync';
    if (id.endsWith('/PremiumGate')) return 'virtual:northern-premium';
    if (id.endsWith('/norwegianSpeech') || id.endsWith('/azurePronunciationSpeech')) return 'virtual:northern-speech';
  },
  load(id) {
    if (id === 'virtual:northern-auth') return 'export const useAuth = () => ({ user: globalThis.northernEarningUser });';
    if (id === 'virtual:northern-sync') return 'export const syncStudyActivity = async () => ({ synced: false });';
    if (id === 'virtual:northern-premium') return 'export default ({ children }) => children;';
    if (id === 'virtual:northern-speech') return 'export const speakNorwegian = async () => ({ ok: true }); export const speakPronunciationModel = speakNorwegian;';
  },
}], build: { ssr: true, outDir, emptyOutDir: false, rollupOptions: {
  input: { verbs: resolve(root, 'src/modules/exercises/challenge30/Challenge30.js'), data: resolve(root, 'src/modules/exercises/challenge30/verbsForLevel.js'), pronunciation: resolve(root, 'src/modules/pronunciation/Pronunciation.js') },
  output: { entryFileNames: '[name].mjs' },
} } });

const load = (name) => import(pathToFileURL(resolve(outDir, name + '.mjs')));
const { default: Verbs } = await load('verbs');
const { getVerbSessions } = await load('data');
const { default: Pronunciation } = await load('pronunciation');
const values = new Map();
globalThis.localStorage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
globalThis.window = Object.assign(new EventTarget(), { localStorage, scrollTo() {}, location: { hostname: 'localhost', search: '' }, setTimeout, clearTimeout, setInterval, clearInterval });
globalThis.document = { getElementById: () => null };
globalThis.northernEarningUser = { id: 'account-a' };
const progress = (id = northernEarningUser.id) => readNorthernPassProgress(localStorage, id);
let stoppedTracks = 0;
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaDevices: { getUserMedia: async () => ({ getTracks: () => [{ stop: () => stoppedTracks++ }] }) } } });
globalThis.FileReader = class {
  readAsDataURL() { this.result = 'data:audio/webm;base64,c3BlZWNo'; queueMicrotask(() => this.onloadend()); }
};
const recorders = [];
globalThis.MediaRecorder = window.MediaRecorder = class {
  static isTypeSupported() { return true; }
  constructor() { this.state = 'inactive'; this.mimeType = 'audio/webm'; recorders.push(this); }
  start() { this.state = 'recording'; }
  stop() {
    this.state = 'inactive';
    this.ondataavailable?.({ data: new Blob(['speech'], { type: 'audio/webm' }) });
    this.onstop?.();
  }
};
globalThis.fetch = async (_url, options) => ({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ text: JSON.parse(options.body).referenceText, provider: 'browser' }) });

let renderer;
const text = (node) => node.children.map((child) => typeof child === 'string' ? child : text(child)).join('');
const tree = (component) => React.createElement(MemoryRouter, { initialEntries: ['/?nivel=A1&appPreview=1'] }, React.createElement(component));
const mount = async (component) => act(async () => { renderer = TestRenderer.create(tree(component), { createNodeMock: () => ({ focus() {} }) }); });
const unmount = async () => act(async () => renderer.unmount());
const click = async (node) => { assert.ok(node); assert.ok(!node.props.disabled); await act(async () => { node.props.onClick(); }); };
const button = (label) => renderer.root.findAllByType('button').find((node) => text(node).includes(label));
const completeFirstVerbSession = async () => {
  const picker = renderer.root.findByProps({ 'aria-label': 'Alege sesiunea de verbe' });
  await act(async () => picker.props.onChange({ target: { value: '1' } }));
  await click(renderer.root.findAllByProps({ role: 'tab' })[2]);
  for (const verb of getVerbSessions('A1')[0]) await act(async () => renderer.root.findByProps({ 'aria-label': 'Scrie în norvegiană: ' + verb.romanian }).props.onChange({ target: { value: verb.norwegian } }));
  await click(button('Verifică'));
};

// Legacy lesson completion is deliberately shared; reward ownership is not.
localStorage.setItem('challenge_verbs_progress_a1', JSON.stringify({ day: 2, completed: [1] }));
await mount(Verbs);
await completeFirstVerbSession();
assert.equal(progress().coins, 70, 'an existing completed verb session can earn the current account its first reward');
await unmount();
await mount(Verbs);
await completeFirstVerbSession();
assert.equal(progress().coins, 70, 'remounting and redoing the same verb session cannot award it again');
northernEarningUser = { id: 'account-b' };
await act(async () => renderer.update(tree(Verbs)));
await completeFirstVerbSession();
assert.equal(progress().coins, 70, 'a second account can earn independently despite the shared legacy lesson progress');
assert.equal(progress('account-a').coins, 70);
await unmount();
console.log('✓ Verbs: existing lesson progress stays intact; each account earns once per level/session, including after reload.');

const recordPhrase = async () => {
  await click(renderer.root.findByProps({ 'aria-label': 'Începe înregistrarea' }));
  await click(renderer.root.findByProps({ 'aria-label': 'Oprește înregistrarea' }));
  assert.ok(button('Înregistrează din nou'), 'a real assessment completed');
};
northernEarningUser = { id: 'account-a' };
await mount(Pronunciation);
const before = progress().sessions;
await recordPhrase();
assert.equal(progress().sessions, before + 1);
await click(button('Înregistrează din nou'));
await recordPhrase();
assert.equal(progress().sessions, before + 1, 'the retry action cannot earn another reward');
await click(renderer.root.findByProps({ 'aria-label': 'Expresia următoare' }));
await recordPhrase();
assert.equal(progress().sessions, before + 2);
await click(renderer.root.findByProps({ 'aria-label': 'Expresia anterioară' }));
await recordPhrase();
assert.equal(progress().sessions, before + 2, 'A→B→A phrase navigation cannot reset retry eligibility');

// Account changes remount the session and cancel its old recording.
await click(button('Înregistrează din nou'));
await click(renderer.root.findByProps({ 'aria-label': 'Începe înregistrarea' }));
const oldRecorder = recorders.at(-1);
const tracksBefore = stoppedTracks;
northernEarningUser = { id: 'account-b' };
await act(async () => renderer.update(tree(Pronunciation)));
assert.equal(oldRecorder.state, 'inactive');
assert.ok(stoppedTracks > tracksBefore);
const accountBBefore = progress().sessions;
await recordPhrase();
assert.equal(progress().sessions, accountBBefore + 1, 'the new account gets an independent first pronunciation attempt');
assert.equal(progress('account-a').sessions, before + 2, 'the cancelled old recording cannot award the previous account');
await unmount();
console.log('✓ Pronunciation: retry/navigation share session eligibility; account switches cancel old recording and isolate rewards.');
