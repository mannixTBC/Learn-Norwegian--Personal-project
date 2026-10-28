import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter, useHistory, useLocation } from 'react-router-dom';
const require = createRequire(import.meta.url);
const catalog = require('../src/modules/exercises/conversationScenarios.json');
const { resolvePublicScenario } = await import('../src/modules/exercises/scenarioDifficulty.mjs');
const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/scenario-session-ui-tests');
await build({ configFile: resolve(root, 'vite.config.js'), logLevel: 'error',
  plugins: [{ name: 'scenario-session-services', enforce: 'pre',
    resolveId(id) {
      if (id.endsWith('/AuthContext')) return 'virtual:session-auth';
      if (id.endsWith('/supabaseClient')) return 'virtual:session-token';
    },
    load(id) {
      if (id === 'virtual:session-auth') return 'export const useAuth = () => ({ user: globalThis.scenarioTestUser });';
      if (id === 'virtual:session-token') return 'export const supabase = null;';
    },
  }],
  build: { ssr: true, outDir, emptyOutDir: true, rollupOptions: {
    input: {studio:resolve(root, 'src/modules/exercises/ConversationStudio.js'),review:resolve(root, 'src/modules/lessons/ReviewPage.js')}, output: { entryFileNames: '[name].mjs' },
  } },
});
const { default: Studio } = await import(pathToFileURL(resolve(outDir, 'studio.mjs')));
const { default: Review } = await import(pathToFileURL(resolve(outDir, 'review.mjs')));
const temporary = new Map(), progress = new Map(), server = new Map();
const storage = map => ({ getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, String(value)), removeItem: key => map.delete(key), key: i => [...map.keys()][i], get length() { return map.size; } });
globalThis.sessionStorage = storage(temporary);
globalThis.localStorage = storage(progress);
globalThis.window = {SpeechRecognition:class{},addEventListener(){},removeEventListener(){},localStorage:globalThis.localStorage};
globalThis.scenarioTestUser = { id: 'flow-test-user' };
let installed = false, history, handler, calls, nextToken = 0;
globalThis.document = { documentElement: { classList: { contains: name => installed && name === 'is-installed-app' } } };
const reply = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const source = catalog.scenarios.find(s => s.id === 'bus-delay');
function opening(level = 'A1') {
  const selected = resolvePublicScenario(source, catalog.levels, level);
  const data = { scenarioId: source.id, level, sessionToken: 'session-' + ++nextToken,
    reply: selected.scenario.opening, feedback: '', turn: 0, done: false, achieved: [],
    maxTurns: selected.difficulty.turns, expiresAt: Date.now() + 3600000, endReason: null,
    messages: [{ role: 'assistant', text: selected.scenario.opening }] };
  server.set(data.sessionToken, data);
  return data;
}
const baseResponse = data => {
  const { scenarioId, level, messages, ...response } = data;
  return response;
};
function turn(body, extra = {}) {
  const previous = server.get(body.sessionToken);
  assert.ok(previous, 'turn uses a confirmed token');
  const data = { ...previous, sessionToken: 'session-' + ++nextToken, turn: previous.turn + 1,
    reply: 'Hva er årsaken?', feedback: 'Ai comunicat durata.', achieved: [0], ...extra };
  data.messages = [...previous.messages, { role: 'user', text: body.message }, { role: 'assistant', text: data.reply }];
  server.set(data.sessionToken, data);
  return data;
}
const normal = (operation, body) => operation === 'start' ? reply(200, baseResponse(opening(body.level)))
  : operation === 'resume' ? reply(200, server.get(body.sessionToken))
  : reply(200, baseResponse(turn(body)));
globalThis.fetch = async (url, options) => {
  const operation = url.split('/').at(-1), body = JSON.parse(options.body);
  calls.push({ operation, body, signal: options.signal });
  return handler(operation, body, options);
};
function Harness() { history = useHistory(); const location = useLocation(); return React.createElement(location.pathname === '/recapitulare' ? Review : Studio); }
const nodes = (renderer, name) => renderer.root.findAll(node => typeof node.type === 'string' && node.props.className?.split(' ').includes(name));
const textOf = node => typeof node === 'string' ? node : node.children.map(textOf).join('');
const plain = text => text.normalize('NFD').replace(/\p{M}/gu,'');
const button = (renderer, text) => renderer.root.findAllByType('button').find(node => plain(node.props['aria-label'] || textOf(node)) === plain(text));
const click = async (renderer, text) => {
  const node = button(renderer, text); assert.ok(node, 'Missing button: ' + text);
  await act(async () => { await node.props.onClick(); });
};
const render = async (entry = '/scenarii?nivel=A1') => {
  let renderer;
  await act(async () => { renderer = TestRenderer.create(React.createElement(MemoryRouter,
    { initialEntries: [entry] }, React.createElement(Harness)),
    { createNodeMock: () => ({ focus() {}, scrollIntoView() {} }) }); });
  return renderer;
};
const choose = async renderer => {
  await act(async () => renderer.root.find(n => typeof n.type === 'function' && n.props.flow && n.props.scenarios).props.flow.choose(source.id));
};
const voiceFlow = renderer => renderer.root.find(n => typeof n.type === 'function' && n.props.flow && n.props.onHelp).props.flow;
const write = async (renderer, text) => {
  await act(async () => voiceFlow(renderer).setDraft(text));
};
const send = async renderer => {
  await act(async () => { button(renderer, 'Trimite răspunsul vocal').props.onClick(); });
};
const unmount = async renderer => { await act(async () => renderer.unmount()); };
const setup = () => { temporary.clear(); progress.clear(); server.clear(); calls = []; handler = normal; globalThis.scenarioTestUser = { id: 'flow-test-user' }; };
const start = async () => { const r = await render(); await choose(r); await click(r, 'Începe conversația'); return r; };
let checks = 0;
for (const mode of [false, true]) {
  installed = mode;

  setup();
  const fromLesson=await render('/scenarii?nivel=A1&scenariu=bus-delay&porneste=1');
  assert.equal(calls.length,1,'lesson recommendation starts once');
  assert.equal(calls[0].operation,'start');
  assert.equal(calls[0].body.scenarioId,'bus-delay');
  await unmount(fromLesson);
  checks++;
  setup();
  const direct=await render();
  const directFlow=direct.root.find(n=>typeof n.type==='function'&&n.props.flow&&n.props.scenarios).props.flow;
  await act(async()=>{directFlow.choose(source.id,true);directFlow.choose(source.id,true);});
  assert.equal(calls.length,1,'direct entry starts once after a double click');
  assert.equal(nodes(direct,'conversation-messages').length,1);
  await unmount(direct);
  setup();
  let linked = await render('/scenarii?nivel=A1&scenariu=hotel-booking');
  assert.equal(linked.root.findByProps({id:'guided-scenario-title'}).children.join(''),catalog.scenarios.find(s=>s.id==='hotel-booking').title);
  assert.equal(calls.length,0,'a recap link selects preparation without starting AI');
  await unmount(linked);
  linked = await render('/scenarii?nivel=A1&scenariu=unknown');
  assert.ok(nodes(linked,'conversation-card').length);
  await unmount(linked);
  setup();
  linked = await start();
  await unmount(linked);
  linked = await render('/scenarii?nivel=A1&scenariu=hotel-booking');
  assert.equal(linked.root.findByProps({id:'guided-scenario-title'}).children.join(''),source.title,'recap link must not discard an existing checkpoint');
  await unmount(linked); checks++;

  // Complete journey: catalog -> failed attempt -> recap -> retry -> success.
  setup();
  let journey = await start();
  const max = resolvePublicScenario(source,catalog.levels,'A1').difficulty.turns;
  handler = (op,body) => op === 'turn'
    ? reply(200,baseResponse(turn(body,server.get(body.sessionToken).turn + 1 === max
      ? {done:true,endReason:'turn_limit',achieved:[0],reply:'Takk for samtalen.'}:{}))) : normal(op,body);
  for(let i=0;i<max;i++){await write(journey,'Jeg prøver igjen.');await send(journey);}
  await act(async()=>{await new Promise(resolve=>setTimeout(resolve,25));});
  assert.equal(progress.size>0,true);
  const recapLink=journey.root.findAllByType('a').find(a=>a.props.href==='/recapitulare?nivel=A1');
  assert.ok(recapLink,'terminal result links to recap');
  await act(async()=>history.push(recapLink.props.href));
  const recap=journey.root.findByProps({className:'recall-scenarios'});
  assert.equal(recap.findAllByType('li').length,2);
  const snapshot=JSON.stringify([...progress]);
  await act(async()=>history.push(recap.findByType('a').props.href));
  handler=normal;
  await click(journey,'Exerseaza din nou');
  await act(async()=>nodes(journey,'scenario-voice__mic')[0].props.onClick());
  assert.equal(JSON.stringify([...progress]),snapshot,'opening a retry cannot clear review');
  handler=(op,body)=>reply(200,baseResponse(turn(body,{done:true,endReason:'success',achieved:[0,1,2],reply:'Takk!'})));
  await write(journey,'Ja, det gjør jeg.');await send(journey);
  await act(async()=>{await new Promise(resolve=>setTimeout(resolve,25));});
  await act(async()=>history.push('/recapitulare?nivel=A1'));
  assert.equal(nodes(journey,'recall-scenarios').length,0,'successful retry clears missing objectives');
  await unmount(journey); checks++;

  // Two clicks/submits in one event batch must reserve only one request.
  setup();
  let r = await render(); await choose(r);
  let gate = deferred(); handler = () => gate.promise;
  const begin = button(r, 'Începe conversația');
  await act(async () => { void begin.props.onClick(); void begin.props.onClick(); });
  assert.equal(calls.length, 1);
  await act(async () => { gate.resolve(normal('start', { level: 'A1' })); });
  await write(r, 'Jeg er ti minutter forsinket.');
  gate = deferred(); handler = () => gate.promise;
  const form = {props:{onSubmit:()=>voiceFlow(r).send()}};
  await act(async () => { form.props.onSubmit({ preventDefault() {} }); form.props.onSubmit({ preventDefault() {} }); });
  assert.equal(calls.length, 2);
  assert.equal(nodes(r, 'conversation-pending').length, 1);
  assert.equal(voiceFlow(r).busy, true);
  await act(async () => { gate.resolve(normal('turn', calls.at(-1).body)); });
  assert.equal(nodes(r, 'airy-message').length, 3);
  assert.equal(voiceFlow(r).draft, '');
  assert.equal(nodes(r,'airy-message').length,3,'full dialogue remains visible');
  await unmount(r); checks++;

  // A failed start can be retried without abandoning the selected brief.
  setup(); r = await render(); await choose(r);
  handler = () => reply(503, { error: 'Unavailable' });
  await click(r, 'Începe conversația');
  assert.equal(nodes(r, 'conversation-error').length, 1);
  handler = normal; await click(r, 'Reîncearcă');
  assert.equal(nodes(r, 'conversation-messages').length, 1);
  assert.deepEqual(calls.map(c => c.operation), ['start', 'start']);
  await unmount(r); checks++;

  // A failed turn preserves the last token, history and editable draft; retry commits once.
  setup(); r = await start(); await write(r, 'Jeg er ti minutter forsinket.');
  const token = [...server.keys()][0];
  handler = () => { throw new TypeError('Network failed'); };
  await send(r);
  assert.equal(nodes(r, 'airy-message').length, 1);
  assert.equal(voiceFlow(r).draft, 'Jeg er ti minutter forsinket.');
  await write(r, 'Jeg er omtrent ti minutter forsinket.');
  handler = normal; await click(r, 'Reîncearcă');
  assert.equal(calls.at(-1).body.sessionToken, token);
  assert.equal(calls.at(-1).body.message, 'Jeg er omtrent ti minutter forsinket.');
  assert.equal(nodes(r, 'airy-message').length, 3);
  await unmount(r); checks++;

  // Reload restores the verified transcript and unsent draft without a new start or turn.
  setup(); r = await start(); await write(r, 'Jeg er ti minutter forsinket.'); await send(r);
  await write(r, 'Det er mye trafikk.'); await unmount(r);
  const beforeReload = calls.length;
  r = await render();
  assert.equal(calls.length, beforeReload + 1);
  assert.equal(calls.at(-1).operation, 'resume');
  assert.equal(nodes(r, 'airy-message').length, 3);
  assert.equal(voiceFlow(r).draft, 'Det er mye trafikk.');
  assert.match(textOf(r.root), /Conversația a fost reluată/);
  await unmount(r); checks++;

  // Expiry offers a new session, preserving the learner draft until they deliberately send it.
  setup(); r = await start(); await write(r, 'Det er mye trafikk.');
  handler = () => reply(410, { code: 'SCENARIO_SESSION_EXPIRED', error: 'Sesiunea a expirat.' });
  await send(r);
  assert.ok(button(r, 'Începe o sesiune nouă'));
  assert.equal(button(r, 'Trimite răspunsul vocal').props.disabled, true);
  handler = () => reply(503, { error: 'Unavailable' });
  await click(r, 'Începe o sesiune nouă');
  assert.equal(button(r, 'Trimite răspunsul vocal').props.disabled, true, 'failed restart must not send into the expired session');
  assert.equal(voiceFlow(r).draft, 'Det er mye trafikk.');
  handler = normal; await click(r, 'Reîncearcă');
  assert.equal(calls.at(-1).operation, 'start');
  assert.equal(voiceFlow(r).draft, 'Det er mye trafikk.');
  assert.equal(nodes(r, 'airy-message').length, 1);
  await unmount(r); checks++;

  // Authentication and quota problems have distinct actions and never retry automatically.
  setup(); r = await start(); await write(r, 'Hei');
  handler = () => reply(429, { code: 'SCENARIO_QUOTA', error: 'Așteaptă un minut.' });
  await send(r); const beforeQuota = calls.length;
  assert.ok(button(r, 'Verifică din nou disponibilitatea'));
  assert.equal(calls.length, beforeQuota);
  handler = () => reply(401, { error: 'Token expired' });
  await click(r, 'Verifică din nou disponibilitatea');
  const login = r.root.findAllByType('a').find(a => textOf(a) === 'Conectează-te');
  assert.match(login.props.href, /^\/autentificare\?redirect=/);
  assert.equal(voiceFlow(r).draft, 'Hei');
  await unmount(r); checks++;

  // Late responses cannot resurrect a discarded scenario or a different account/level.
  setup(); r = await start(); await write(r, 'Hei');
  gate = deferred(); handler = () => gate.promise;
  await send(r); const waiting = calls.at(-1);
  await click(r, 'Înapoi la situații');
  assert.equal(waiting.signal.aborted, true);
  assert.equal(temporary.size, 0);
  await act(async () => { gate.resolve(normal('turn', waiting.body)); });
  assert.equal(nodes(r, 'sc-grid').length, 1);
  assert.equal(nodes(r, 'conversation-messages').length, 0);
  handler = normal; await choose(r); await click(r, 'Începe conversația');
  await write(r, 'Hei'); gate = deferred(); handler = () => gate.promise; await send(r);
  const levelPending = calls.at(-1);
  await act(async () => history.push('/scenarii?nivel=C2'));
  assert.equal(levelPending.signal.aborted, true);
  await act(async () => { gate.resolve(normal('turn', levelPending.body)); });
  assert.equal(nodes(r, 'sc-grid').length, 1);
  globalThis.scenarioTestUser = { id: 'different-user' };
  await act(async () => history.push('/scenarii?nivel=A1'));
  assert.equal(nodes(r, 'conversation-messages').length, 0);
  await unmount(r); checks++;

  // A result accurately distinguishes success from an exhausted turn budget and is restartable.
  setup(); r = await start(); await write(r, 'Ja');
  handler = (op, body) => reply(200, baseResponse(turn(body, { done: true, endReason: 'success', achieved: [0, 1, 2], reply: 'Takk!', feedback: 'Misiune reușită.' })));
  await send(r);
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 25)); });
  assert.match(textOf(nodes(r, 'conversation-result')[0]), /Te-ai descurcat!/);
  assert.match(textOf(r.root), /Rezultatul este salvat pe acest dispozitiv/);
  await click(r, 'Salvează pentru recapitulare');
  const savedHint=JSON.parse(progress.get('norwegian_review_items'));
  assert.equal(savedHint.length,1);
  assert.equal(savedHint[0].norwegian,source.variants.A1.hint);
  assert.equal(button(r,'Salvat pentru recapitulare').props.disabled,true);
  assert.equal([...progress.keys()].filter(k => k.startsWith('scenario_result_v1_')).length, 1);
  assert.equal(r.root.findAllByType('textarea').length, 0);
  await unmount(r); handler = normal; r = await render();
  assert.match(textOf(nodes(r, 'conversation-result')[0]), /Misiune reușită/);
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 25)); });
  assert.equal([...progress.keys()].filter(k => k.startsWith('scenario_result_v1_')).length, 1, 'terminal resume must not duplicate progress');
  await click(r, 'Exersează din nou');
  assert.ok(textOf(r.root).includes('Cel mai bun rezultat: 3/3'));
  assert.equal(temporary.size, 0);
  assert.equal(nodes(r, 'conversation-result').length, 0);
  assert.ok(button(r, 'Începe conversația'));
  assert.equal(r.root.findByProps({ id: mode ? 'mc-context' : 'dc-context' }).props.hidden, true, 'advanced context starts collapsed; the role and brief remain visible in the scenario card');
  await click(r, 'Începe conversația');
  const last = server.get([...server.keys()].at(-1));
  last.turn = 6;
  last.messages = [last.messages[0], ...Array.from({ length: 6 }, () => [
    { role: 'user', text: 'Hei' }, { role: 'assistant', text: 'Hei igjen' },
  ]).flat()];
  last.reply = 'Hei igjen';
  await unmount(r); r = await render();
  assert.match(textOf(r.root), /Mai ai un răspuns disponibil/);
  await write(r, 'Hei');
  handler = (op, body) => reply(200, baseResponse(turn(body, { done: true, endReason: 'turn_limit', reply: 'Takk for samtalen.' })));
  await send(r);
  const result = textOf(nodes(r, 'conversation-result')[0]);
  assert.match(result, /Ai vorbit în norvegiană!/);
  assert.match(result, /De exersat/);
  assert.doesNotMatch(result, /Te-ai descurcat!/);
  await unmount(r); checks++;

  // Failed restoration can retry, then a cancelled turn restores only its last confirmed checkpoint.
  setup(); r = await start(); await write(r, 'Et utkast.'); await unmount(r);
  handler = () => reply(502, {}); r = await render();
  assert.equal(r.root.findAllByType('textarea').length, 0);
  assert.ok(button(r, 'Reîncearcă'));
  handler = normal; await click(r, 'Reîncearcă');
  assert.equal(calls.at(-1).operation, 'resume');
  assert.equal(voiceFlow(r).draft, 'Et utkast.');
  gate = deferred(); handler = () => gate.promise; await send(r);
  const interrupted = calls.at(-1);
  await unmount(r);
  assert.equal(interrupted.signal.aborted, true);
  handler = normal; r = await render();
  assert.equal(nodes(r, 'airy-message').length, 1);
  assert.equal(voiceFlow(r).draft, 'Et utkast.');
  await act(async () => { gate.resolve(normal('turn', interrupted.body)); });
  assert.equal(nodes(r, 'airy-message').length, 1, 'abandoned response cannot alter a restored checkpoint');
  await unmount(r); checks++;

  // Explicit finish clears the resumable session without inventing completed progress.
  setup(); r=await start();
  await click(r,'Încheie conversația');
  assert.equal(temporary.size,0);
  assert.equal(nodes(r,'conversation-result').length,1);
  assert.match(textOf(r.root),/înainte de evaluarea finală/);
  assert.equal([...progress.keys()].filter(k=>k.startsWith('scenario_result_v1_')).length,0);
  await click(r,'Exersează din nou');
  assert.equal(nodes(r,'conversation-result').length,0);
  await unmount(r);checks++;

  // Corrupt or unavailable storage cannot prevent a new conversation.
  setup();
  globalThis.sessionStorage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
  r = await start(); assert.equal(nodes(r, 'conversation-messages').length, 1);
  await unmount(r);
  globalThis.sessionStorage = storage(temporary);
  checks++;
}
console.log('Scenario session UI: ' + checks + ' lifecycle checks passed across web and installed app.');
