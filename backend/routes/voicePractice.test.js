const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const auth = require('../middleware/authSupabaseUser');
const realAuth = auth.requireAuth;
auth.requireAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (token === 'Bearer modular-free-user' || token === 'Bearer other-user') { req.userId = token; return next(); }
  return res.status(401).json({ error: 'Autentificare necesară' });
};
const router = require('./voicePractice');
auth.requireAuth = realAuth;
const { getPreparedQuestions } = require('../voiceQuestions');
const catalog = require('../voiceCatalog.json');

test('toate lecțiile au trei întrebări scurte pregătite în Bokmål', () => {
  for (const [level, lessons] of Object.entries(catalog)) for (const id of Object.keys(lessons)) {
    const questions = getPreparedQuestions(level, Number(id));
    assert.equal(questions.length, 3);
    assert.equal(new Set(questions).size, 3);
    questions.forEach((question) => assert.ok(question.split(/\s+/).length <= 12));
  }
});
test('flux modular: autentificare, voce reutilizată, trei transcrieri, o singură analiză și o singură voce finală', async () => {
  const saved = { key: process.env.OPENAI_API_KEY, env: process.env.NODE_ENV, netlify: process.env.NETLIFY, tts: process.env.OPENAI_VOICE_TTS_MODEL, stt: process.env.OPENAI_VOICE_STT_MODEL };
  const realFetch = global.fetch;
  const calls = { speech: 0, transcription: 0, feedback: 0 };
  process.env.OPENAI_API_KEY = 'test-key-not-exposed';
  process.env.NODE_ENV = 'production'; delete process.env.NETLIFY;
  delete process.env.OPENAI_VOICE_STT_MODEL;
  // Unique cache version for this test, never sent to a real provider.
  process.env.OPENAI_VOICE_TTS_MODEL = `test-tts-${Date.now()}`;
  let analysis;
  let failFeedbackAudio = false;
  let lowConfidenceNext = false;
  global.fetch = async (url, options) => {
    assert.ok(options.headers.Authorization.endsWith('test-key-not-exposed'));
    if (url.endsWith('/audio/speech')) {
      calls.speech += 1;
      const data = JSON.parse(options.body);
      if (failFeedbackAudio && data.input.includes('repetă')) return { ok: false, status: 503, json: async () => ({}) };
      return { ok: true, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer };
    }
    if (url.endsWith('/audio/transcriptions')) {
      calls.transcription += 1;
      assert.ok(options.body.get('file') instanceof Blob);
      assert.equal(options.body.get('model'), 'gpt-transcribe');
      assert.equal(options.body.get('languages[]'), 'no');
      assert.equal(options.body.get('language'), null);
      assert.equal(options.body.get('temperature'), '0');
      assert.equal(options.body.get('include[]'), null);
      assert.match(options.body.get('prompt'), /norsk bokmål/i);
      assert.doesNotMatch(options.body.get('prompt'), /Vocabulary:/i);
      if (lowConfidenceNext) {
        lowConfidenceNext = false;
        return { ok: true, json: async () => ({ text: 'Uklart svar', languages: [] }) };
      }
      return { ok: true, json: async () => ({ text: `Jeg heter Anna ${calls.transcription}.`, languages: [{ code: 'no' }] }) };
    }
    assert.ok(url.endsWith('/chat/completions'));
    calls.feedback += 1; analysis = JSON.parse(options.body);
    return { ok: true, json: async () => ({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ feedback: 'Ai răspuns clar; repetă expresia „Jeg heter”.' }) } }] }) };
  };
  const app = express(); app.use(express.json({ limit: '6mb' })); app.use('/practice', router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const request = (route, body, token = 'modular-free-user') => realFetch(`http://127.0.0.1:${server.address().port}/practice/${route}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body),
  });
  try {
    const lesson = { level: 'A1', lessonId: 1, pathId: 'studies' };
    assert.equal((await request('start', lesson, null)).status, 401);
    assert.equal((await request('start', { ...lesson, lessonId: 999 })).status, 400);
    const started = await request('start', lesson);
    assert.equal(started.status, 200);
    const session = await started.json();
    assert.equal(session.questions.length, 3);
    assert.equal(JSON.stringify(session).includes('test-key-not-exposed'), false);
    assert.deepEqual(calls, { speech: 0, transcription: 0, feedback: 0 });
    assert.equal((await request('start', lesson)).status, 429);
    assert.equal((await request('question', { sessionToken: session.sessionToken, index: 0 }, 'other-user')).status, 401);
    const questionBody = { sessionToken: session.sessionToken, index: 0 };
    const audio = await (await request('question', questionBody)).json();
    assert.ok(audio.audioBase64);
    await request('question', questionBody);
    assert.equal(calls.speech, 1, 'Question replay uses persistent audio cache');
    assert.equal((await request('question', { ...questionBody, index: 4 })).status, 400);
    assert.equal((await request('transcribe', { ...questionBody, audioBase64: 'invalid', mimeType: 'text/plain', duration: 20 })).status, 400);
    assert.equal((await request('transcribe', { ...questionBody, audioBase64: Buffer.alloc(120, 9).toString('base64'), mimeType: 'audio/webm', duration: 31.1 })).status, 400);
    const answers = [];
    for (let index = 0; index < 3; index += 1) {
      const body = { sessionToken: session.sessionToken, index, audioBase64: Buffer.alloc(120, index + 1).toString('base64'), mimeType: 'audio/webm;codecs=opus', duration: index === 0 ? 30 : 5 };
      const response = await request('transcribe', body);
      assert.equal(response.status, 200);
      answers.push(await response.json());
      await request('transcribe', body);
    }
    assert.equal(calls.transcription, 3, 'Network replay does not retranscribe');
    assert.equal(calls.feedback, 0, 'No evaluation between answers');
    assert.equal((await request('feedback', { sessionToken: session.sessionToken, answers: [{ ...answers[0], text: 'tampered' }, answers[1]] })).status, 400);
    const result = await (await request('feedback', { sessionToken: session.sessionToken, answers })).json();
    assert.ok(result.text.split(/\s+/).length <= 25); assert.ok(result.audioBase64);
    assert.equal(JSON.parse(analysis.messages[1].content).length, 3);
    assert.equal(analysis.store, false);
    await request('feedback', { sessionToken: session.sessionToken, answers });
    assert.equal(calls.feedback, 1); assert.equal(calls.speech, 2);
    // A second learner can finish after two answers and still see text if TTS fails.
    const second = await (await request('start', lesson, 'other-user')).json();
    const secondAnswers = [];
    lowConfidenceNext = true;
    const unclear = await request('transcribe', {
      sessionToken: second.sessionToken, index: 0, audioBase64: Buffer.alloc(120, 5).toString('base64'), mimeType: 'audio/mp4', duration: 5,
    }, 'other-user');
    assert.equal(unclear.status, 400);
    assert.match((await unclear.json()).error, /norvegiană/i);
    for (let index = 0; index < 2; index += 1) secondAnswers.push(await (await request('transcribe', {
      sessionToken: second.sessionToken, index, audioBase64: Buffer.alloc(120, 5).toString('base64'), mimeType: 'audio/mp4', duration: 5,
    }, 'other-user')).json());
    failFeedbackAudio = true;
    const textOnly = await (await request('feedback', { sessionToken: second.sessionToken, answers: secondAnswers }, 'other-user')).json();
    assert.ok(textOnly.text); assert.equal(textOnly.audioBase64, null);
    assert.equal(JSON.parse(analysis.messages[1].content).length, 2);
    await request('feedback', { sessionToken: second.sessionToken, answers: secondAnswers }, 'other-user');
    assert.equal(calls.feedback, 2, 'Audio failure does not repeat evaluation');
  } finally {
    global.fetch = realFetch;
    for (const [key, value] of Object.entries({ OPENAI_API_KEY: saved.key, NODE_ENV: saved.env, NETLIFY: saved.netlify, OPENAI_VOICE_TTS_MODEL: saved.tts, OPENAI_VOICE_STT_MODEL: saved.stt })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    await new Promise((resolve) => server.close(resolve));
  }
});
