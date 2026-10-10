const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

const auth = require('../middleware/authSupabaseUser');
const openai = require('../openai');
const chatUsage = require('../chatUsage');

const originalModules = {
  requireAuth: auth.requireAuth,
  getOpenAI: openai.getOpenAI,
  isOpenAIConfigured: openai.isOpenAIConfigured,
  consumeChatQuota: chatUsage.consumeChatQuota,
  recordChatUsage: chatUsage.recordChatUsage,
};

const providerCalls = [];
const providerOptions = [];
const usageCalls = [];
let providerMode = 'valid';
let quotaCalls = 0;

auth.requireAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!['Bearer user-a', 'Bearer user-b'].includes(token)) return res.status(401).json({ error: 'Autentificare necesară.' });
  req.userId = token.slice(7);
  req.accessToken = `access-${req.userId}`;
  return next();
};
openai.isOpenAIConfigured = () => true;
openai.getOpenAI = () => ({
  chat: {
    completions: {
      create: async (request, options) => {
        providerCalls.push(request);
        providerOptions.push(options);
        if (providerMode === 'throw') throw new Error('upstream failed');
        if (providerMode === 'refusal') return {
          choices: [{ finish_reason: 'stop', message: { refusal: 'refused', content: '' } }],
          usage: { prompt_tokens: 20, completion_tokens: 2, total_tokens: 22 },
        };
        if (providerMode === 'invalid') return {
          choices: [{ finish_reason: 'length', message: { content: '{' } }],
          usage: { prompt_tokens: 20, completion_tokens: 2, total_tokens: 22 },
        };
        return {
          choices: [{
            finish_reason: 'stop',
            message: {
              content: JSON.stringify({
                reply: 'Det høres bra ut.',
                question: 'Hva vil du gjøre videre?',
                correction: null,
                memory: 'Eleven synes kunstig intelligens er nyttig.',
              }),
            },
          }],
          usage: { prompt_tokens: 120, completion_tokens: 18, total_tokens: 138 },
        };
      },
    },
  },
});
chatUsage.consumeChatQuota = async () => {
  quotaCalls += 1;
  return { allowed: true, remaining: 23, limit: 24, source: 'test' };
};
chatUsage.recordChatUsage = async (_req, usage) => {
  usageCalls.push(usage);
};

const router = require('./chat');

// The router captured the test doubles above. Restore shared module exports for
// other tests that may load these modules in the same Node process.
Object.assign(auth, { requireAuth: originalModules.requireAuth });
Object.assign(openai, {
  getOpenAI: originalModules.getOpenAI,
  isOpenAIConfigured: originalModules.isOpenAIConfigured,
});
Object.assign(chatUsage, {
  consumeChatQuota: originalModules.consumeChatQuota,
  recordChatUsage: originalModules.recordChatUsage,
});

const decodeSession = (token) => JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString('utf8'));

test('catalogul complet poate porni sesiuni semnate pentru fiecare lecție și direcție', () => {
  const saved = { secret: process.env.CHAT_SESSION_SECRET, key: process.env.OPENAI_API_KEY };
  process.env.CHAT_SESSION_SECRET = 'catalog-test-secret';
  const catalog = require('../voiceCatalog.json');
  const tutor = require('../chatTutor');
  try {
    for (const [level, lessons] of Object.entries(catalog)) {
      for (const [lessonId, lesson] of Object.entries(lessons)) {
        for (const pathId of Object.keys(lesson.directions)) {
          const context = tutor.lessonFor({ level, lessonId: Number(lessonId), pathId });
          assert.ok(context, `${level}/${lessonId}/${pathId}`);
          const { session, opening } = tutor.newSession(context, 'catalog-user');
          assert.ok(opening.reply);
          assert.ok(opening.question.endsWith('?'));
          assert.equal(tutor.verifySession(tutor.signSession(session), 'catalog-user').context.direction.title, lesson.directions[pathId].title);
        }
      }
    }

    const context = tutor.lessonFor({ level: 'A1', lessonId: 1, pathId: 'general' });
    let session = tutor.newSession(context, 'turn-limit-user').session;
    assert.deepEqual(session.askedQuestions, ['Hva heter du?']);

    const guarded = tutor.finalizeTurn({
      reply: 'Hei, jeg heter ChatGPT. Hva heter du? Hvordan har du det? Bra, takk.',
      question: 'Hva heter du?',
      correction: null,
      memory: null,
    }, session, context);
    assert.equal(guarded.reply, 'Hyggelig å møte deg!');
    assert.equal(guarded.question, 'Hvordan har du det?');
    assert.doesNotMatch(`${guarded.reply} ${guarded.question}`, /ChatGPT|Hva heter du\?/i);

    const afterGuard = tutor.nextSession(session, 'Peter Theofir.', guarded);
    assert.deepEqual(afterGuard.askedQuestions, ['Hva heter du?', 'Hvordan har du det?']);
    assert.equal(tutor.finalizeTurn({
      reply: 'Bra, takk. Hva heter du?',
      question: 'Kan du fortelle meg hva du heter?',
      correction: null,
      memory: null,
    }, afterGuard, context).question, 'Hva sier du når du møter noen?');

    const beginnerAfterPreparedQuestions = {
      ...session,
      turn: 2,
      askedQuestions: ['Hva heter du?', 'Hvordan har du det?', 'Hva sier du når du møter noen?'],
    };
    const guardedLessonBoundary = tutor.finalizeTurn({
      reply: 'Fint.',
      question: 'Hva vil du bestille?',
      correction: null,
      memory: null,
    }, beginnerAfterPreparedQuestions, context);
    assert.equal(guardedLessonBoundary.question, 'Kan du si litt mer?');
    assert.notEqual(guardedLessonBoundary.question, 'Hva vil du bestille?');

    const safeLessonFollowUp = tutor.finalizeTurn({
      reply: 'Fint.',
      question: 'Kan du fortelle litt om det?',
      correction: null,
      memory: null,
    }, beginnerAfterPreparedQuestions, context);
    assert.equal(safeLessonFollowUp.question, 'Kan du fortelle litt om det?');

    for (let index = 0; index < tutor.MAX_TURNS; index += 1) {
      session = tutor.nextSession(session, `Svar ${index + 1}`, {
        reply: 'Fint.', question: 'Kan du fortsette?', correction: null, memory: null,
      });
      assert.ok(session.history.length <= 4);
    }
    assert.equal(session.turn, 8);
    assert.equal(session.done, true);
    assert.equal(session.lastQuestion, null);
  } finally {
    if (saved.secret === undefined) delete process.env.CHAT_SESSION_SECRET; else process.env.CHAT_SESSION_SECRET = saved.secret;
    if (saved.key === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = saved.key;
  }
});

test('API chat: sesiune compactă, comenzi locale, un singur apel structurat și fallback fără retry', async () => {
  const saved = {
    secret: process.env.CHAT_SESSION_SECRET,
    key: process.env.OPENAI_API_KEY,
    env: process.env.NODE_ENV,
    netlify: process.env.NETLIFY,
    bypass: process.env.VITE_PREMIUM_DEV_BYPASS,
  };
  process.env.CHAT_SESSION_SECRET = 'route-test-secret-that-is-not-returned';
  process.env.OPENAI_API_KEY = 'provider-key-that-is-not-returned';
  process.env.NODE_ENV = 'production';
  delete process.env.NETLIFY;
  delete process.env.VITE_PREMIUM_DEV_BYPASS;

  providerCalls.length = 0;
  providerOptions.length = 0;
  usageCalls.length = 0;
  quotaCalls = 0;
  providerMode = 'valid';

  const app = express();
  app.use(express.json({ limit: '8kb' }));
  app.use('/api/chat', router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/chat`;
  const request = (operation, body, user = 'user-a') => fetch(`${base}/${operation}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(user ? { Authorization: `Bearer ${user}` } : {}) },
    body: JSON.stringify(body),
  });

  try {
    assert.equal((await request('start', { level: 'A1', lessonId: 1 }, null)).status, 401);
    assert.equal((await request('start', { level: 'A1', lessonId: 99 })).status, 400);
    assert.equal((await request('start', { level: 'A1', lessonId: 1, pathId: 'made-up' })).status, 400);
    assert.equal((await request('start', { level: 'A1', lessonId: 1, pathId: 'toString' })).status, 400);
    assert.equal((await request('start', { level: 'A1', lessonId: 1, unexpected: true })).status, 400);

    const startResponse = await request('start', { level: 'B2', lessonId: 9, pathId: 'transport' });
    assert.equal(startResponse.status, 200);
    assert.equal(startResponse.headers.get('cache-control'), 'no-store');
    const started = await startResponse.json();
    assert.equal(started.turn, 0);
    assert.equal(started.done, false);
    assert.equal(started.maxTurns, 8);
    assert.equal(started.remainingTurns, 8);
    assert.ok(started.reply);
    assert.ok(started.question);
    assert.equal(started.usage, null);
    assert.equal(providerCalls.length, 0, 'start must not contact OpenAI');
    assert.equal(quotaCalls, 0, 'start must not consume message quota');
    assert.equal(JSON.stringify(started).includes('route-test-secret'), false);
    assert.equal(JSON.stringify(started).includes('provider-key'), false);

    const compact = decodeSession(started.sessionToken);
    assert.equal(compact.level, 'B2');
    assert.equal(compact.lessonId, 9);
    assert.equal(compact.pathId, 'transport');
    assert.equal(compact.history.length, 1);
    assert.deepEqual(compact.memory, []);
    assert.equal(JSON.stringify(compact).includes('user-a'), false, 'owner id is one-way protected');
    assert.equal((await request('turn', { sessionToken: started.sessionToken, message: 'Hei' }, 'user-b')).status, 401);
    assert.equal((await request('turn', { sessionToken: `${started.sessionToken}x`, message: 'Hei' })).status, 401);
    assert.equal((await request('turn', { sessionToken: started.sessionToken, message: 'x'.repeat(351) })).status, 400);
    assert.equal((await request('turn', { sessionToken: started.sessionToken, message: 'Hei', messages: [] })).status, 400);

    const repeated = await (await request('turn', { sessionToken: started.sessionToken, message: 'Repetă' })).json();
    assert.equal(repeated.question, started.question);
    assert.equal(repeated.turn, 0);
    const helped = await (await request('turn', { sessionToken: repeated.sessionToken, message: 'Ajută-mă' })).json();
    assert.match(helped.reply, /Du kan si/);
    assert.equal(helped.turn, 0);
    assert.equal(providerCalls.length, 0);
    assert.equal(quotaCalls, 0);

    const firstTurn = await request('turn', { sessionToken: helped.sessionToken, message: 'Jeg synes kunstig intelligens er nyttig.' });
    assert.equal(firstTurn.status, 200);
    const first = await firstTurn.json();
    assert.equal(first.turn, 1);
    assert.equal(first.quotaRemaining, 23);
    assert.deepEqual(first.usage, { inputTokens: 120, outputTokens: 18, totalTokens: 138 });
    assert.equal(providerCalls.length, 1);
    assert.equal(quotaCalls, 1);
    assert.equal(usageCalls.length, 1);

    const sent = providerCalls[0];
    assert.equal(sent.model, 'gpt-4o-mini');
    assert.equal(sent.store, false);
    assert.equal(sent.max_tokens, 150);
    assert.equal(sent.response_format.type, 'json_schema');
    assert.equal(sent.response_format.json_schema.strict, true);
    assert.equal(sent.response_format.json_schema.schema.additionalProperties, false);
    assert.ok(sent.response_format.json_schema.schema.required.includes('memory'));
    assert.deepEqual(providerOptions[0], { timeout: 15_000 });
    assert.ok(sent.messages.length <= 6, 'system + no more than four previous messages + current user');
    assert.match(sent.messages[0].content, /B2/);
    assert.match(sent.messages[0].content, /Transport și logistică/);
    assert.match(sent.messages[0].content, /Nu juca niciodată rolul cursantului/);
    assert.match(sent.messages[0].content, /nu trebuie repetate sau reformulate/);
    assert.match(sent.messages[0].content, /rămâi strict la tema, vocabularul și gramatica lecției de bază/);
    assert.doesNotMatch(sent.messages[0].content, /Salutări și prezentări/);

    const afterFirst = decodeSession(first.sessionToken);
    assert.ok(afterFirst.history.length <= 4);
    assert.equal(afterFirst.turn, 1);
    assert.equal(afterFirst.askedQuestions.length, 2);
    assert.notEqual(afterFirst.askedQuestions[0], afterFirst.askedQuestions[1]);
    assert.deepEqual(afterFirst.memory, ['Eleven synes kunstig intelligens er nyttig.']);

    providerMode = 'refusal';
    const refused = await (await request('turn', { sessionToken: first.sessionToken, message: 'La oss fortsette.' })).json();
    assert.equal(providerCalls.length, 2, 'a refusal is not retried');
    assert.equal(refused.turn, 2);
    assert.equal(refused.reply, 'Takk for svaret.');
    assert.equal(refused.correction, null);
    assert.ok(decodeSession(refused.sessionToken).history.length <= 4);

    providerMode = 'invalid';
    const invalid = await (await request('turn', { sessionToken: refused.sessionToken, message: 'Et svar til.' })).json();
    assert.equal(providerCalls.length, 3, 'truncated JSON is not retried');
    assert.equal(invalid.turn, 3);

    const beforeFailureUsageCalls = usageCalls.length;
    providerMode = 'throw';
    const failed = await request('turn', { sessionToken: invalid.sessionToken, message: 'Dette feiler.' });
    assert.equal(failed.status, 502);
    assert.equal(usageCalls.length, beforeFailureUsageCalls + 1);
    assert.equal(usageCalls.at(-1), null, 'the quota lease is released even when OpenAI fails');

    const stopped = await (await request('turn', { sessionToken: invalid.sessionToken, message: 'Stop' })).json();
    assert.equal(stopped.done, true);
    assert.equal(stopped.question, null);
    assert.equal(stopped.turn, 3);
    assert.equal(stopped.remainingTurns, 0);
    assert.equal((await request('turn', { sessionToken: stopped.sessionToken, message: 'Hei' })).status, 409);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    for (const [key, value] of Object.entries({
      CHAT_SESSION_SECRET: saved.secret,
      OPENAI_API_KEY: saved.key,
      NODE_ENV: saved.env,
      NETLIFY: saved.netlify,
      VITE_PREMIUM_DEV_BYPASS: saved.bypass,
    })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
