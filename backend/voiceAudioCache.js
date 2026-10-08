const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { getStore } = require('@netlify/blobs');
const pending = new Map();
const directory = path.join(__dirname, '../node_modules/.cache/lesson-question-audio');
// NETLIFY is a build flag. Functions expose SITE_ID and/or a Blobs context.
const isNetlifyRuntime = () => Boolean(process.env.NETLIFY || process.env.SITE_ID
  || process.env.NETLIFY_BLOBS_CONTEXT || globalThis.netlifyBlobsContext);

const getQuestionAudio = async (settings, generate) => {
  const key = crypto.createHash('sha256').update(JSON.stringify(settings)).digest('hex');
  if (pending.has(key)) return pending.get(key);
  const task = (async () => {
    if (!isNetlifyRuntime()) {
      const filename = path.join(directory, `${key}.mp3`);
      try { return await fs.readFile(filename); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      const audio = await generate(settings);
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(filename, audio);
      return audio;
    }
    // Lambda-compatible Blobs contexts expose the edge URL. Conditional writes
    // arbitrate the lock; newly created audio blobs become immediately available.
    const store = getStore({ name: 'lesson-question-audio-v1' });
    const cached = await store.get(key, { type: 'arrayBuffer' });
    if (cached) return Buffer.from(cached);
    const lockKey = `${key}-lock`;
    const lock = await store.getWithMetadata(lockKey, { type: 'json' });
    if (lock && lock.data.until > Date.now()) throw Object.assign(new Error('Vocea întrebării se pregătește. Încearcă din nou în câteva secunde.'), { status: 409 });
    const claim = await store.setJSON(lockKey, { until: Date.now() + 45_000 }, lock ? { onlyIfMatch: lock.etag } : { onlyIfNew: true });
    if (!claim.modified) throw Object.assign(new Error('Vocea întrebării se pregătește. Încearcă din nou în câteva secunde.'), { status: 409 });
    try {
      // Recheck after acquiring the lock: another function may have finished meanwhile.
      const ready = await store.get(key, { type: 'arrayBuffer' });
      if (ready) return Buffer.from(ready);
      const audio = await generate(settings);
      await store.set(key, new Uint8Array(audio).buffer);
      return audio;
    } finally { await store.delete(lockKey); }
  })();
  pending.set(key, task);
  try { return await task; } finally { pending.delete(key); }
};
module.exports = { getQuestionAudio, isNetlifyRuntime };
