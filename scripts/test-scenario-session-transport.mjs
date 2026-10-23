import test from 'node:test';
import assert from 'node:assert/strict';
import { conversationRequest, ConversationError, validateConversation } from '../src/modules/exercises/conversationSession.mjs';
const response = (status, body) => ({ status, ok: status >= 200 && status < 300, json: async () => body });

test('transport provides actionable errors for expiry, authentication, quota and non-JSON failures', async () => {
  for (const [status, body, kind] of [
    [410, { code: 'SCENARIO_SESSION_EXPIRED' }, 'restart'],
    [401, { code: 'SCENARIO_SESSION_INVALID' }, 'restart'],
    [409, { code: 'SCENARIO_UPDATED' }, 'restart'],
    [401, { error: 'Token invalid' }, 'auth'], [403, {}, 'auth'],
    [429, { error: 'Așteaptă un minut.' }, 'limit'], [502, {}, 'retry'],
  ]) {
    await assert.rejects(conversationRequest('turn', {}, { fetcher: async () => response(status, body) }),
      e => e instanceof ConversationError && e.kind === kind);
  }
  await assert.rejects(conversationRequest('turn', {}, { fetcher: async () => ({ ok: false, status: 502,
    json: async () => { throw new Error('HTML gateway response'); } }) }), e => e.kind === 'retry');
});

test('deadline covers hung authentication, fetch and JSON reading; cancellation is distinct from timeout', async () => {
  const hang = () => new Promise(() => {});
  for (const options of [
    { getAccessToken: hang, fetcher: async () => { throw new Error('Must not reach fetch'); } },
    { fetcher: hang }, { fetcher: async () => ({ ok: true, json: hang }) },
  ]) {
    await assert.rejects(conversationRequest('turn', {}, { ...options, timeoutMs: 5 }),
      e => e.kind === 'retry' && e.message.includes('întârzie'));
  }
  const controller = new AbortController();
  const pending = conversationRequest('turn', {}, { fetcher: hang, signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, e => e.name === 'AbortError');
});

test('malformed or out-of-sequence successful responses cannot advance the session', () => {
  const scenario = { id: 'bus-delay', goals: ['a', 'b', 'c'], difficulty: { turns: 7 } };
  const valid = { sessionToken: 'signed', reply: 'Hei', feedback: '', expiresAt: Date.now() + 3600000,
    achieved: [], turn: 1, done: false, endReason: null, maxTurns: 7 };
  assert.equal(validateConversation(valid, scenario, { operation: 'turn', previousTurn: 0 }), valid);
  for (const mutate of [r => { r.achieved = [9]; }, r => { r.achieved = [0, 0]; },
    r => { r.reply = ''; }, r => { r.turn = 2; }, r => { r.done = true; },
    r => { r.maxTurns = 10; }, r => { r.endReason = 'success'; }, r => { delete r.expiresAt; }]) {
    const copy = structuredClone(valid); mutate(copy);
    assert.throws(() => validateConversation(copy, scenario, { operation: 'turn', previousTurn: 0 }), ConversationError);
  }
});
