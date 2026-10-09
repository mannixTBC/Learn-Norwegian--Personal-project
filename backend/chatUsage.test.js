const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');

const savedEnvironment = {
  NODE_ENV: process.env.NODE_ENV,
  NETLIFY: process.env.NETLIFY,
  VITE_PREMIUM_DEV_BYPASS: process.env.VITE_PREMIUM_DEV_BYPASS,
  CHAT_QUOTA_MAX_PER_MINUTE: process.env.CHAT_QUOTA_MAX_PER_MINUTE,
  CHAT_QUOTA_MAX_CONCURRENT: process.env.CHAT_QUOTA_MAX_CONCURRENT,
};

process.env.NODE_ENV = 'development';
delete process.env.NETLIFY;
delete process.env.VITE_PREMIUM_DEV_BYPASS;
process.env.CHAT_QUOTA_MAX_PER_MINUTE = '6';
process.env.CHAT_QUOTA_MAX_CONCURRENT = '1';

const { consumeChatQuota, recordChatUsage, __test } = require('./chatUsage');

beforeEach(() => __test.resetForTests());

after(() => {
  for (const [key, value] of Object.entries(savedEnvironment)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test('fallback-ul local rezervă cota și recordChatUsage(null) eliberează cererea', async () => {
  const firstRequest = { userId: 'local-test-user' };
  const quota = await consumeChatQuota(firstRequest);

  assert.deepEqual(quota, {
    allowed: true,
    remaining: 23,
    limit: 24,
    source: 'local-memory',
  });

  await assert.rejects(
    consumeChatQuota({ userId: 'local-test-user' }),
    (error) => error.status === 429 && error.source === 'memory-concurrency',
  );

  assert.deepEqual(await recordChatUsage(firstRequest, null), { recorded: false, source: 'none' });
  const secondQuota = await consumeChatQuota({ userId: 'local-test-user' });
  assert.equal(secondQuota.remaining, 22);
});

test('protecția pe minut refuză rafalele chiar dacă fiecare lease este eliberat', async () => {
  for (let index = 0; index < 6; index += 1) {
    const req = { userId: 'minute-test-user' };
    await consumeChatQuota(req);
    await recordChatUsage(req, null);
  }

  await assert.rejects(
    consumeChatQuota({ userId: 'minute-test-user' }),
    (error) => error.status === 429
      && error.source === 'memory-minute'
      && /un minut/.test(error.message),
  );
});

test('normalizează numai câmpurile Chat Completions și limitează valori anormale', () => {
  assert.deepEqual(__test.normalizeUsage({
    prompt_tokens: 321,
    completion_tokens: 45,
    prompt_tokens_details: { cached_tokens: 200 },
    input_tokens: 999,
  }), {
    promptTokens: 321,
    completionTokens: 45,
    cachedTokens: 200,
  });

  assert.deepEqual(__test.normalizeUsage({
    prompt_tokens: -10,
    completion_tokens: Number.NaN,
    prompt_tokens_details: { cached_tokens: 9_000_000 },
  }), {
    promptTokens: 0,
    completionTokens: 0,
    cachedTokens: 5_000_000,
  });
});

test('în producție refuză sigur cererea dacă RPC-ul durabil nu este disponibil', async () => {
  process.env.NODE_ENV = 'production';
  try {
    await assert.rejects(
      consumeChatQuota({ userId: 'production-test-user' }),
      (error) => error.status === 503 && /nu poate fi verificată/.test(error.message),
    );
  } finally {
    process.env.NODE_ENV = 'development';
  }
});
