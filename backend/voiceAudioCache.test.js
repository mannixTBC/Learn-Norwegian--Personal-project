const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setEnvironmentContext } = require('@netlify/blobs');

test('Netlify cache persists audio across cold functions and arbitrates concurrent generation', async () => {
  const saved = { netlify: process.env.NETLIFY, context: process.env.NETLIFY_BLOBS_CONTEXT, fetch: global.fetch };
  const entries = new Map();
  let serial = 0;
  process.env.NETLIFY = 'true';
  setEnvironmentContext({ edgeURL: 'https://test-blobs.invalid', siteID: 'test-site', token: 'test-token' });
  global.fetch = async (url, options) => {
    const key = new URL(url).pathname;
    const item = entries.get(key);
    if (options.method === 'get') return item ? new Response(item.body, { headers: { etag: item.etag } }) : new Response(null, { status: 404 });
    if (options.method === 'delete') { entries.delete(key); return new Response(null, { status: 200 }); }
    assert.equal(options.method, 'put');
    if ((options.headers['if-none-match'] === '*' && item) || (options.headers['if-match'] && options.headers['if-match'] !== item?.etag)) return new Response(null, { status: 412 });
    const etag = `"${++serial}"`;
    entries.set(key, { body: options.body, etag });
    return new Response(null, { status: 200, headers: { etag } });
  };
  const freshCache = () => { delete require.cache[require.resolve('./voiceAudioCache')]; return require('./voiceAudioCache').getQuestionAudio; };
  let generations = 0;
  const generate = async () => { generations += 1; return Buffer.from('shared-question-audio'); };
  try {
    const settings = { model: 'test-tts', voice: 'marin', input: 'Hva heter du?' };
    const audio = await freshCache()(settings, generate);
    assert.equal(audio.toString(), 'shared-question-audio');
    assert.equal((await freshCache()(settings, generate)).toString(), audio.toString());
    assert.equal(generations, 1);
    let resolveGeneration;
    const pending = freshCache()({ ...settings, input: 'Hvordan har du det?' }, () => new Promise((resolve) => { resolveGeneration = resolve; }));
    // Wait until the first function acquires its lock, without calling any real network.
    while (!resolveGeneration) await new Promise((resolve) => setImmediate(resolve));
    await assert.rejects(freshCache()({ ...settings, input: 'Hvordan har du det?' }, generate), { status: 409 });
    resolveGeneration(Buffer.from('second-audio')); await pending;
    assert.equal((await freshCache()({ ...settings, input: 'Hvordan har du det?' }, generate)).toString(), 'second-audio');
    assert.equal(generations, 1);
  } finally {
    global.fetch = saved.fetch;
    for (const [key, value] of Object.entries({ NETLIFY: saved.netlify, NETLIFY_BLOBS_CONTEXT: saved.context })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
