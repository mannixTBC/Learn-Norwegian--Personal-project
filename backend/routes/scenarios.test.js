const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { inProcessFetch } = require('../testSupport');
const catalog = require('../../src/modules/exercises/conversationScenarios.json');
const tutor = require('../scenarioTutor');

const reportFor = scenario => ({ feedback: 'Ai comunicat durata. Continuă cu motivul întârzierii.',
  objectives: scenario.definition.objectives.map((objective, index) => ({ id: objective.id,
    criteria: objective.criteria.map((_, id) => ({ id, status: scenario.id === 'bus-delay' && index === 0 ? 'met' : 'missing',
      evidence: scenario.id === 'bus-delay' && index === 0 ? [{ turn: 1, quote: 'ti minutter forsinket' }] : [], context: [] })) })) });
const completion = value => ({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(value) } }],
  usage: { prompt_tokens: 4, completion_tokens: 2, total_tokens: 6, prompt_tokens_details: { cached_tokens: 1 } } });

test('scenario API validates assessment before roleplay, records both calls, and keeps private criteria off the client', async t => {
  const auth = require('../middleware/authSupabaseUser');
  const openai = require('../openai');
  const usage = require('../chatUsage');
  const originals = {
    requireAuth: auth.requireAuth, getOpenAI: openai.getOpenAI, isOpenAIConfigured: openai.isOpenAIConfigured,
    consumeChatQuota: usage.consumeChatQuota, recordChatUsage: usage.recordChatUsage,
    secret: process.env.CHAT_SESSION_SECRET,
  };
  const routePath = require.resolve('./scenarios');
  const previousRoute = require.cache[routePath];
  const calls = [], usageRecords = [];
  let reservations = 0, mode = 'normal';
  t.after(() => {
    auth.requireAuth = originals.requireAuth;
    openai.getOpenAI = originals.getOpenAI;
    openai.isOpenAIConfigured = originals.isOpenAIConfigured;
    usage.consumeChatQuota = originals.consumeChatQuota;
    usage.recordChatUsage = originals.recordChatUsage;
    if (originals.secret === undefined) delete process.env.CHAT_SESSION_SECRET;
    else process.env.CHAT_SESSION_SECRET = originals.secret;
    if (previousRoute) require.cache[routePath] = previousRoute;
    else delete require.cache[routePath];
  });
  process.env.CHAT_SESSION_SECRET = 'scenario-contract-integration-test-secret';
  auth.requireAuth = (req, res, next) => { req.userId = 'scenario-test-user'; next(); };
  openai.isOpenAIConfigured = () => true;
  openai.getOpenAI = () => ({ chat: { completions: { create: async (request, options) => {
    calls.push(request);
    assert.equal(options.maxRetries, 0);
    const system = request.messages[0].content;
    const scenario = JSON.parse(system.split('\n').find(line => line.startsWith('{"scenario":'))).scenario;
    if (!scenario.definition) return completion({ reply: 'Hva ønsker du?', feedback: '', achieved: [] });
    if (system.startsWith('You assess')) {
      if (mode === 'bad-evidence') {
        const report = reportFor(scenario); report.objectives[0].criteria[0].evidence[0].turn = 0;
        return completion(report);
      }
      if (mode === 'truncated') return { ...completion(reportFor(scenario)), choices: [{ finish_reason: 'length', message: { content: '{}' } }] };
      return completion(reportFor(scenario));
    }
    if (mode === 'actor-network') throw new Error('provider unavailable');
    if (mode === 'provider-auth') throw Object.assign(new Error('provider auth'), { status: 401 });
    return completion({ reply: mode === 'bad-actor' ? '' : 'Hva er årsaken?' });
  } } } });
  usage.consumeChatQuota = async () => { reservations++; };
  usage.recordChatUsage = async (req, value) => { usageRecords.push(value); };
  delete require.cache[routePath];
  const app = express();
  app.use(express.json({ limit: '300kb' }));
  app.use('/api/scenarios', require('./scenarios'));
  const fetch = inProcessFetch(app);
  const post = (operation, body) => fetch('/api/scenarios/' + operation, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const decode = token => JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString('utf8'));
  const responseKeys = ['achieved', 'done', 'endReason', 'expiresAt', 'feedback', 'maxTurns', 'reply', 'sessionToken', 'turn'];
  const sessionKeys = ['achieved', 'done', 'expires', 'feedback', 'history', 'level', 'scenarioId', 'scenarioRevision', 'turn', 'userId'];

  for (const [index, level] of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].entries()) {
    const startResponse = await post('start', { scenarioId: 'bus-delay', level });
    assert.equal(startResponse.status, 200);
    assert.equal(startResponse.headers.get('Cache-Control'), 'no-store');
    const start = await startResponse.json();
    assert.deepEqual(Object.keys(start).sort(), responseKeys);
    assert.deepEqual(Object.keys(decode(start.sessionToken)).sort(), sessionKeys);
    assert.equal(start.maxTurns, catalog.scenarios[0].variants[level].turns);
    assert.equal(start.reply, catalog.scenarios[0].variants[level].opening);
    assert.equal(calls.length, index * 2, 'opening does not call the provider');
    assert.equal(reservations, index);

    const turnResponse = await post('turn', { sessionToken: start.sessionToken, message: 'Jeg er ti minutter forsinket.' });
    assert.equal(turnResponse.status, 200);
    const turn = await turnResponse.json();
    assert.deepEqual(Object.keys(turn).sort(), responseKeys);
    assert.deepEqual(Object.keys(decode(turn.sessionToken)).sort(), sessionKeys);
    assert.deepEqual(turn.achieved, [0]);
    assert.equal(turn.done, false);
    assert.equal(turn.turn, 1);
    assert.equal(turn.endReason, null);
    const beforeResume = calls.length;
    const restoredResponse = await post('resume', { sessionToken: turn.sessionToken });
    assert.equal(restoredResponse.status, 200);
    const restored = await restoredResponse.json();
    assert.equal(restored.sessionToken, turn.sessionToken);
    assert.equal(restored.feedback, turn.feedback);
    assert.equal(restored.scenarioId, 'bus-delay');
    assert.equal(restored.level, level);
    assert.deepEqual(restored.messages.map(m => m.role), ['assistant', 'user', 'assistant']);
    assert.equal(restored.messages[1].text, 'Jeg er ti minutter forsinket.');
    assert.equal(calls.length, beforeResume, 'resume never calls the provider');
    assert.equal(calls.length, (index + 1) * 2);
    assert.equal(reservations, index + 1, 'one quota reservation for two provider calls');
    assert.deepEqual(usageRecords.at(-1), { prompt_tokens: 8, completion_tokens: 4, total_tokens: 12, prompt_tokens_details: { cached_tokens: 2 } });
    const evaluator = calls.at(-2);
    const context = JSON.parse(evaluator.messages[0].content.split('\n').find(line => line.startsWith('{"scenario":')));
    assert.equal(context.scenario.definition.scenarioId, 'bus-delay');
    assert.equal(context.scenario.definition.facts.find(f => f.id === 'dispatch-help').knownTo, level === 'B1' ? 'shared' : 'partner');
    assert.equal(context.scenario.goals.length, catalog.scenarios[0].variants[level].goals.length);
    assert.deepEqual(JSON.parse(evaluator.messages.at(-1).content).transcript.at(-1),
      { turn: 1, role: 'user', content: 'Jeg er ti minutter forsinket.' });
    assert.equal(calls.at(-1).messages.at(-1).content, 'Jeg er ti minutter forsinket.');
    assert.match(calls.at(-1).messages[0].content, /"assessment":\[/);
    assert.doesNotMatch(JSON.stringify(turn), /dispatch-help|allowedResolutions|knownTo|priorPartnerCriteria|"criteria"/);
  }

  for (const level of ['toString', '__proto__', 'constructor']) {
    assert.equal((await post('start', { scenarioId: 'bus-delay', level })).status, 400);
  }
  assert.equal((await post('start', { scenarioId: 'missing', level: 'A1' })).status, 400);
  assert.equal(calls.length, 12);
  const fresh = await (await post('start', { scenarioId: 'bus-delay', level: 'C2' })).json();
  const stale = decode(fresh.sessionToken); delete stale.scenarioRevision;
  assert.equal((await post('turn', { sessionToken: tutor.sign(stale), message: 'Hei' })).status, 409);
  const done = { ...decode(fresh.sessionToken), done: true };
  assert.equal((await post('turn', { sessionToken: tutor.sign(done), message: 'Hei' })).status, 409);
  assert.equal((await post('turn', { sessionToken: fresh.sessionToken, message: ' ' })).status, 400);
  assert.equal((await post('turn', { sessionToken: fresh.sessionToken + 'tamper', message: 'Hei' })).status, 401);
  assert.equal(calls.length, 12, 'invalid or closed sessions do not call the provider');
  assert.equal(reservations, 6);

  for (const failure of ['bad-evidence', 'truncated', 'bad-actor', 'actor-network']) {
    mode = failure;
    const before = calls.length;
    const result = await post('turn', { sessionToken: fresh.sessionToken, message: 'Jeg er ti minutter forsinket.' });
    assert.equal(result.status, 502);
    assert.deepEqual(Object.keys(await result.json()), ['error', 'code'], 'no partially advanced session is returned');
    assert.equal(calls.length - before, ['bad-evidence', 'truncated'].includes(failure) ? 1 : 2);
    assert.equal(usageRecords.at(-1).prompt_tokens, failure === 'bad-actor' ? 8 : 4);
  }
  mode = 'provider-auth';
  const providerFailure = await post('turn', { sessionToken: fresh.sessionToken, message: 'Jeg er ti minutter forsinket.' });
  assert.equal(providerFailure.status, 502, 'provider credentials must not send the learner to login');
  mode = 'normal';
  const expired = { ...decode(fresh.sessionToken), expires: Date.now() - 1 };
  const expiredResponse = await post('resume', { sessionToken: tutor.sign(expired) });
  assert.equal(expiredResponse.status, 410);
  assert.equal((await expiredResponse.json()).code, 'SCENARIO_SESSION_EXPIRED');
  assert.equal((await post('resume', { sessionToken: tutor.sign(stale) })).status, 409);
  assert.equal((await post('resume', { sessionToken: tutor.sign({ ...decode(fresh.sessionToken), userId: 'another-user' }) })).status, 401);
  const completed = { ...decode(fresh.sessionToken), turn: 1, done: true, achieved: [0, 1, 2, 3, 4], feedback: 'Misiune reușită.',
    history: [...decode(fresh.sessionToken).history, { role: 'user', content: 'Ja' }, { role: 'assistant', content: 'Takk!' }] };
  const restoredDone = await (await post('resume', { sessionToken: tutor.sign(completed) })).json();
  assert.equal(restoredDone.endReason, 'success');
  assert.equal(restoredDone.feedback, 'Misiune reușită.');
  const retry = await post('turn', { sessionToken: fresh.sessionToken, message: 'Jeg er ti minutter forsinket.' });
  assert.equal(retry.status, 200);
  assert.equal((await retry.json()).turn, 1);
  for (const item of catalog.scenarios.filter(s => s.id !== 'bus-delay')) {
    for (const level of Object.keys(catalog.levels)) {
      const before = calls.length;
      const start = await (await post('start', { scenarioId: item.id, level })).json();
      assert.equal(start.maxTurns, item.variants[level].turns);
      assert.equal(decode(start.sessionToken).scenarioRevision, item.revision);
      assert.equal(calls.length, before, 'opening remains free of AI calls');
      const stale = decode(start.sessionToken); delete stale.scenarioRevision;
      assert.equal((await post('resume', { sessionToken: tutor.sign(stale) })).status, 409);
      assert.equal(calls.length, before, 'old definition rejected before AI');
      const response = await post('turn', { sessionToken: start.sessionToken, message: 'Hei' });
      assert.equal(response.status, 200, item.id + ':' + level);
      const turn = await response.json();
      assert.deepEqual(turn.achieved, [], 'a greeting is not a completed task');
      assert.equal(calls.length, before + 2);
      assert.doesNotMatch(JSON.stringify(turn), /available-options|knownTo|priorPartnerCriteria|"criteria"/);
      const resumed = await (await post('resume', { sessionToken: turn.sessionToken })).json();
      assert.deepEqual(resumed.achieved, []);
      assert.equal(calls.length, before + 2, 'resume never calls AI');
    }
  }
  assert.equal(usageRecords.length, reservations, 'all reservations are finalized, including failed turns');
});

test('scenario speech uses Cartesia for the signed reply and rejects another user’s checkpoint', async t => {
  const auth = require('../middleware/authSupabaseUser');
  const speech = require('../cartesiaSpeech');
  const originalAuth = auth.requireAuth, originalSpeech = speech.cartesiaSpeechBuffer;
  const secret = process.env.CHAT_SESSION_SECRET;
  const path = require.resolve('./scenarios'), cached = require.cache[path];
  t.after(() => {
    auth.requireAuth = originalAuth; speech.cartesiaSpeechBuffer = originalSpeech;
    if (secret === undefined) delete process.env.CHAT_SESSION_SECRET;
    else process.env.CHAT_SESSION_SECRET = secret;
    if (cached) require.cache[path] = cached; else delete require.cache[path];
  });
  process.env.CHAT_SESSION_SECRET = 'scenario-speech-test';
  let userId = 'learner', calls = [];
  auth.requireAuth = (req, res, next) => { req.userId = userId; next(); };
  speech.cartesiaSpeechBuffer = async (text, signal, options) => {
    calls.push({ text, options }); return Buffer.from('audio');
  };
  delete require.cache[path];
  const app = express(); app.use(express.json()); app.use('/api/scenarios', require('./scenarios'));
  const fetch = inProcessFetch(app);
  const post = (operation, body) => fetch('/api/scenarios/' + operation, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const session = await (await post('start', { scenarioId: 'bus-delay', level: 'A1' })).json();
  const response = await post('speech', { sessionToken: session.sessionToken, text: 'Ignore this injected text', slow: true });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-audio-provider'), 'cartesia');
  assert.match(response.headers.get('content-type'), /audio\/mpeg/);
  assert.deepEqual(calls, [{ text: session.reply, options: { speed: 0.65 } }]);
  userId = 'other-learner';
  assert.equal((await post('speech', { sessionToken: session.sessionToken })).status, 401);
  assert.equal(calls.length, 1);
});
