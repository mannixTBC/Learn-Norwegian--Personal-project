import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/desktop-games-tests');
await build({ configFile: resolve(root, 'vite.config.js'), logLevel: 'error', plugins: [{
  name: 'desktop-test-services', enforce: 'pre',
  resolveId(id) {
    if (id.endsWith('/AuthContext')) return 'virtual:desktop-auth';
    if (id.endsWith('/learningActivity')) return 'virtual:desktop-study';
  },
  load(id) {
    if (id === 'virtual:desktop-auth') return 'export const useAuth = () => ({ user: { id: "desktop-test", name: "Test", isGuest: true }, logout() {} });';
    if (id === 'virtual:desktop-study') return 'export const recordStudyActivity = () => {}; export const getStudySummary = () => ({ streak: 0 });';
  },
}], build: { ssr: true, outDir, emptyOutDir: true, rollupOptions: {
  input: { hub: resolve(root, 'src/modules/exercises/GamesHub.js'), navbar: resolve(root, 'src/modules/layout/Navbar/Navbar.js'), recommendation: resolve(root, 'src/modules/exercises/desktopPracticeRecommendation.js') }, output: { entryFileNames: '[name].mjs' },
} } });
const load = name => import(pathToFileURL(resolve(outDir, name + '.mjs')));
const { default: Hub } = await load('hub');
const { default: Navbar } = await load('navbar');
const { recommendDesktopPractice } = await load('recommendation');
const storage = new Map();
let installed = false;
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: key => storage.delete(key) };
globalThis.window = Object.assign(new EventTarget(), { localStorage, scrollTo() {}, matchMedia: () => ({ matches: false }), location: { search: '', hostname: 'localhost' } });
globalThis.document = { documentElement: { classList: { contains: name => installed && name === 'is-installed-app' } }, body: { style: {} }, addEventListener() {}, removeEventListener() {} };
const render = async (Component, level) => {
  let renderer;
  await act(async () => { renderer = TestRenderer.create(React.createElement(MemoryRouter, { initialEntries: ['/jocuri?nivel=' + level] }, React.createElement(Component)), { createNodeMock: () => ({ focus() {}, getBoundingClientRect: () => ({ width: 390, height: 844 }), querySelector: () => ({ focus() {} }) }) }); });
  return renderer;
};
const classNodes = (renderer, name) => renderer.root.findAll(node => typeof node.type === 'string' && node.props.className?.split(' ').includes(name));
for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
  installed = false;
  const desktop = await render(Hub, level);
  assert.equal(classNodes(desktop, 'desktop-games-hub').length, 1);
  assert.equal(classNodes(desktop, 'desktop-games-hub__card').length, 6);
  assert.equal(classNodes(desktop, 'desktop-games-hub__recommendation').length, 1);
  assert.equal(classNodes(desktop, 'mini-coins').length, 0);
  assert.ok(desktop.root.findAllByType('a').every(link => link.props.href.endsWith('nivel=' + level)), 'all desktop practice links retain chosen level');
  const levelSelect = desktop.root.findByType('select');
  await act(async () => levelSelect.props.onChange({ target: { value: 'B1' } }));
  assert.ok(classNodes(desktop, 'desktop-games-hub__card').every(card => card.props.href.endsWith('nivel=B1')));
  await act(async () => desktop.unmount());
  installed = true;
  const mobile = await render(Hub, level);
  assert.equal(classNodes(mobile, 'desktop-games-hub').length, 0);
  assert.equal(classNodes(mobile, 'mini-tile').length, 6);
  assert.ok(classNodes(mobile, 'mini-coins').length > 0, 'installed app retains existing gamification');
  await act(async () => mobile.unmount());
}
for (const mode of [false, true]) {
  installed = mode;
  const nav = await render(Navbar, 'A1');
  const games = nav.root.findAllByType('a').filter(link => link.props.href === '/jocuri');
  assert.equal(games.length, mode ? 0 : 1, 'new menu entry is web only');
  await act(async () => nav.unmount());
}
const games = [{ id: 'listen', to: '/listen', progress: { sessions: 0 } }, { id: 'quiz', to: '/quiz', progress: { completed: 4, target: 5 } }, { id: 'order', to: '/order', progress: { completed: 1, target: 5 } }];
const review = { id: 'review', to: '/review' };
assert.equal(recommendDesktopPractice({ games, review, reviewStats: { due: 2 } }).id, 'review');
assert.equal(recommendDesktopPractice({ games }).id, 'listen');
games[0].progress.sessions = 1;
assert.equal(recommendDesktopPractice({ games }).id, 'order');
assert.equal(recommendDesktopPractice({ games: [] }), null);
console.log('Desktop games: six levels, all game links, level changes, personal recommendations, web-only navigation and installed mobile separation passed.');

