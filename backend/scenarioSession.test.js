const test = require('node:test');
const assert = require('node:assert/strict');
const tutor = require('./scenarioTutor');

test('signed sessions validate ownership, shape, expiry and large legal histories', t => {
  const secret = process.env.CHAT_SESSION_SECRET;
  process.env.CHAT_SESSION_SECRET = 'scenario-session-tests';
  t.after(() => {
    if (secret === undefined) delete process.env.CHAT_SESSION_SECRET;
    else process.env.CHAT_SESSION_SECRET = secret;
  });
  const base = { userId: 'test-user', scenarioId: 'bus-delay', level: 'C2', turn: 0,
    done: false, achieved: [], feedback: '', expires: Date.now() + 3600000,
    history: [{ role: 'assistant', content: 'Hei' }] };
  assert.deepEqual(tutor.verify(tutor.sign(base), base.userId), base);
  for (const mutation of [
    s => { s.expires = null; }, s => { s.turn = 11; }, s => { s.turn = -1; },
    s => { s.history.push({ role: 'user', content: 'Hei' }); },
    s => { s.history[0].role = 'user'; }, s => { s.history[0].content = ''; },
    s => { s.achieved = [0, 0]; }, s => { s.achieved = [-1]; },
    s => { s.feedback = 'a'.repeat(1801); }, s => { s.done = 'yes'; },
  ]) {
    const copy = structuredClone(base); mutation(copy);
    assert.throws(() => tutor.verify(tutor.sign(copy), base.userId), e => e.code === 'SCENARIO_SESSION_INVALID');
  }
  assert.throws(() => tutor.verify(tutor.sign(base), 'different-user'), e => e.code === 'SCENARIO_SESSION_INVALID');
  assert.throws(() => tutor.verify(tutor.sign({ ...base, expires: Date.now() - 1 }), base.userId),
    e => e.status === 410 && e.code === 'SCENARIO_SESSION_EXPIRED');
  const large = { ...base, turn: 10, feedback: '\u0001'.repeat(1800),
    history: [{ role: 'assistant', content: '\u0001'.repeat(1800) }] };
  for (let i = 0; i < 10; i++) large.history.push({ role: 'user', content: '\u0001'.repeat(1200) },
    { role: 'assistant', content: '\u0001'.repeat(1800) });
  const token = tutor.sign(large);
  assert.ok(token.length > 45000 && token.length < 280000);
  assert.deepEqual(tutor.verify(token, base.userId), large, 'long supported conversations must remain resumable');
});
