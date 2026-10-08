const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const auth = require('../middleware/authSupabaseUser');
const realAuth = auth.requireAuth;
// A verified free user: authentication is simulated, but the real voice route runs.
auth.requireAuth = (req, res, next) => {
  if (req.headers.authorization === 'Bearer test-free-user') { req.userId = 'test-free-user'; return next(); }
  return realAuth(req, res, next);
};
const router = require('./voice');
auth.requireAuth = realAuth;

test('API vocal: lipsă cheie, validare, acces, token temporar și limitarea pornirilor', async () => {
  const saved = { key: process.env.OPENAI_API_KEY, bypass: process.env.VITE_PREMIUM_DEV_BYPASS, env: process.env.NODE_ENV, netlify: process.env.NETLIFY };
  const realFetch = global.fetch;
  let upstreamCalls = 0;
  let upstreamBody;
  const app = express(); app.use(express.json()); app.use('/api/voice', router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/voice`;
  const request = (body, token) => realFetch(`${base}/session`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
  try {
    delete process.env.OPENAI_API_KEY;
    assert.equal((await request({})).status, 503);
    process.env.OPENAI_API_KEY = 'test-key-never-sent';
    process.env.VITE_PREMIUM_DEV_BYPASS = 'true'; process.env.NODE_ENV = 'development'; delete process.env.NETLIFY;
    global.fetch = async (url, options) => {
      assert.equal(url, 'https://api.openai.com/v1/realtime/client_secrets');
      upstreamCalls += 1; upstreamBody = JSON.parse(options.body);
      return { ok: true, json: async () => ({ value: 'temporary-test-token', expires_at: 100 }) };
    };
    assert.equal((await request({ level: 'A1', lessonId: 999 })).status, 400);
    assert.equal((await request({ level: 'A1', lessonId: 1, pathId: 'invalid' })).status, 400);
    assert.equal(upstreamCalls, 0);
    const response = await request({ level: 'A1', lessonId: 1, pathId: 'studies' });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { value: 'temporary-test-token', expiresAt: 100 });
    assert.equal(upstreamBody.expires_after.seconds, 60);
    assert.match(upstreamBody.session.instructions, /Studii/);
    assert.equal((await request({ level: 'A1', lessonId: 1 })).status, 429);
    process.env.NODE_ENV = 'production';
    const denied = await request({ level: 'A1', lessonId: 1 });
    assert.ok([401, 503].includes(denied.status));
    assert.equal(upstreamCalls, 1);
    const freeUser = await request({ level: 'A1', lessonId: 1 }, 'test-free-user');
    assert.equal(freeUser.status, 200, 'Un utilizator autentificat fără Premium poate începe dialogul.');
    assert.equal(upstreamCalls, 2);
  } finally {
    global.fetch = realFetch;
    for (const [key, value] of Object.entries({ OPENAI_API_KEY: saved.key, VITE_PREMIUM_DEV_BYPASS: saved.bypass, NODE_ENV: saved.env, NETLIFY: saved.netlify })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    await new Promise((resolve) => server.close(resolve));
  }
});
