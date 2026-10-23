import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter, useHistory } from 'react-router-dom';

const require = createRequire(import.meta.url);
const catalog = require('../src/modules/exercises/conversationScenarios.json');
const { resolvePublicScenario } = await import('../src/modules/exercises/scenarioDifficulty.mjs');
const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/scenario-level-ui-tests');
await build({
  configFile: resolve(root, 'vite.config.js'), logLevel: 'error',
  plugins: [{
    name: 'scenario-ui-services', enforce: 'pre',
    resolveId(id) {
      if (id.endsWith('/AuthContext')) return 'virtual:scenario-auth';
      if (id.endsWith('/supabaseClient')) return 'virtual:scenario-session';
    },
    load(id) {
      if (id === 'virtual:scenario-auth') return 'export const useAuth = () => ({ user: { id: "scenario-ui-test" } });';
      if (id === 'virtual:scenario-session') return 'export const supabase = null;';
    },
  }],
  build: { ssr: true, outDir, emptyOutDir: true, rollupOptions: {
    input: resolve(root, 'src/modules/exercises/ConversationStudio.js'),
    output: { entryFileNames: 'studio.mjs' },
  } },
});
const { default: Studio } = await import(pathToFileURL(resolve(outDir, 'studio.mjs')));
const storage = new Map();
let installed = false;
let history;
let answerFocusCount = 0;
const calls = [];
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
};
globalThis.document = { documentElement: { classList: { contains: name => installed && name === 'is-installed-app' } } };
globalThis.fetch = async (url, options) => {
  assert.ok(url.endsWith('/api/scenarios/start'));
  const body = JSON.parse(options.body);
  calls.push(body);
  const source = catalog.scenarios.find(s => s.id === body.scenarioId);
  const resolved = resolvePublicScenario(source, catalog.levels, body.level);
  return { ok: true, json: async () => ({
    sessionToken: 'test-session', reply: resolved.scenario.opening, feedback: '',
    achieved: [], turn: 0, done: false, maxTurns: resolved.difficulty.turns, expiresAt: Date.now() + 3600000, endReason: null,
  }) };
};
function Harness() {
  history = useHistory();
  return React.createElement(Studio);
}
const classNodes = (renderer, name) => renderer.root.findAll(node =>
  typeof node.type === 'string' && node.props.className?.split(' ').includes(name));
const textOf = node => typeof node === 'string' ? node : node.children.map(textOf).join('');
const render = async level => {
  let renderer;
  answerFocusCount = 0;
  await act(async () => {
    renderer = TestRenderer.create(
      React.createElement(MemoryRouter, { initialEntries: ['/scenarii?nivel=' + level] }, React.createElement(Harness)),
      { createNodeMock: node => ({ focus() { if (node.type === 'textarea') answerFocusCount++; }, scrollIntoView() {} }) },
    );
  });
  return renderer;
};
const source = catalog.scenarios.find(s => s.id === 'bus-delay');
for (const mode of [false, true]) {
  installed = mode;
  for (const level of Object.keys(catalog.levels)) {
    const expected = source.variants[level];
    const renderer = await render(level);
    assert.equal(classNodes(renderer, 'desktop-conversation').length, mode ? 0 : 1,
      'illustrated desktop layout must not enter the installed app');
    assert.equal(classNodes(renderer, 'mobile-conversation').length, mode ? 1 : 0);
    if (mode) {
      const navigation = classNodes(renderer, 'mobile-app-nav')[0];
      assert.equal(navigation.findAllByType('a').find(n => n.props['aria-current'] === 'page').props.href, '/jocuri?nivel=' + level);
    }
    const card = classNodes(renderer, 'conversation-card').find(node => textOf(node).includes(source.title));
    assert.ok(textOf(card).includes(expected.turns + ' schimburi maximum'));
    await act(async () => card.props.onClick());
    const brief = classNodes(renderer, 'conversation-brief')[0];
    assert.ok(textOf(brief).includes(expected.brief));
    assert.deepEqual(brief.findAllByType('li').map(node => textOf(node).slice(1)), expected.goals);
    assert.equal(textOf(classNodes(renderer, 'conversation-criteria')[0]), expected.expectation);
    if (!mode) assert.equal(renderer.root.findByProps({ id: 'dc-context' }).props.hidden, false);
    if (mode) {
      assert.equal(classNodes(renderer, 'mobile-app-nav').length, 0, 'focused scenario has its own back control');
      assert.equal(renderer.root.findByProps({ id: 'mc-context' }).props.hidden, false);
      assert.equal(renderer.root.findByProps({ id: 'mc-objective-list' }).props.hidden, false);
    }
    await act(async () => classNodes(renderer, 'conversation-primary')[0].props.onClick());
    assert.deepEqual(calls.at(-1), { scenarioId: 'bus-delay', level });
    if (!mode) assert.ok(answerFocusCount > 0, 'desktop retains its keyboard-first composer');
    if (mode) {
      assert.equal(answerFocusCount, 0, 'the mobile keyboard must not open automatically over Nora’s reply');
      const goals = renderer.root.findByProps({ id: 'mc-objective-list' });
      assert.equal(goals.props.hidden, true);
      const goalButton = renderer.root.findAllByType('button').find(n => n.props['aria-controls'] === 'mc-objective-list');
      await act(async () => goalButton.props.onClick());
      assert.equal(renderer.root.findByProps({ id: 'mc-objective-list' }).props.hidden, false);
      const contextButton = renderer.root.findAllByType('button').find(n => n.props['aria-controls'] === 'mc-context');
      assert.equal(renderer.root.findByProps({ id: 'mc-context' }).props.hidden, true);
      await act(async () => contextButton.props.onClick());
      assert.equal(renderer.root.findByProps({ id: 'mc-context' }).props.hidden, false);
      await act(async () => contextButton.props.onClick());
    }
    if (!mode) {
      assert.equal(renderer.root.findByProps({ id: 'dc-context' }).props.hidden, true,
        'starting collapses the briefing so the dialogue stays in focus');
      const contextButton = renderer.root.findAllByType('button').find(n => n.props['aria-controls'] === 'dc-context');
      await act(async () => contextButton.props.onClick());
      assert.equal(renderer.root.findByProps({ id: 'dc-context' }).props.hidden, false,
        'the learner can reopen the context during the dialogue');
      await act(async () => contextButton.props.onClick());
    }
    assert.ok(textOf(classNodes(renderer, 'conversation-messages')[0]).includes(expected.opening));
    assert.equal(renderer.root.findAll(node => typeof node.type === 'string' && node.props['aria-label'] === `0 din ${expected.turns} răspunsuri`).length, 1);
    const hintButton = classNodes(renderer, 'conversation-link').find(node => textOf(node).includes('Un punct de pornire'));
    await act(async () => hintButton.props.onClick());
    assert.equal(textOf(classNodes(renderer, 'conversation-hint')[0]), expected.hint);
    const nextLevel = level === 'C2' ? 'A1' : 'C2';
    await act(async () => history.push('/scenarii?nivel=' + nextLevel));
    assert.equal(classNodes(renderer, 'conversation-brief').length, 0, 'level change clears the old session');
    assert.equal(classNodes(renderer, 'conversation-hint').length, 0, 'hints do not leak between levels');
    const nextCard = classNodes(renderer, 'conversation-card').find(node => textOf(node).includes(source.title));
    await act(async () => nextCard.props.onClick());
    assert.equal(classNodes(renderer, 'conversation-brief')[0].findAllByType('li').length, source.variants[nextLevel].goals.length);
    await act(async () => renderer.unmount());
  }
}
assert.equal(calls.length, 12);
console.log('Scenario UI: all six levels on web and installed app; goals, briefs, hints, openings, budgets and level reset passed.');

