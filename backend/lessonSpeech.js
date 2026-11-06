'use strict';

// Public library voice: Lars — Casual Conversationalist (Norwegian).
const LARS_VOICE_ID = 'd6dca1b6-cdd8-4e9c-823c-e03979261740';
const audioCache = new Map();
const MAX_CACHE_BYTES = 20 * 1024 * 1024;
let cacheBytes = 0;
const fail = (message, status) => Object.assign(new Error(message), {status});

async function lessonSpeech({text, voice = 'male', slow = false, locale = 'no-NO'}) {
  if (typeof text !== 'string' || !text.trim()) throw fail('Lipsește textul pentru pronunție.', 400);
  if (text.length > 3000) throw fail('Textul este prea lung pentru un singur fragment audio.', 413);
  const key = process.env.CARTESIA_API_KEY;
  const role = voice === 'female' ? 'female' : 'male';
  const voiceId = role === 'female'
    ? process.env.CARTESIA_FEMALE_VOICE_ID || process.env.CARTESIA_VOICE_ID
    : process.env.CARTESIA_MALE_VOICE_ID || LARS_VOICE_ID;
  if (!key || !voiceId) throw fail('Vocile Cartesia pentru lecții nu sunt configurate.', 503);
  const model = process.env.CARTESIA_LESSON_MODEL_ID || 'sonic-3.6-2026-08-27';
  const version = process.env.CARTESIA_API_VERSION || '2026-08-14';
  const speed = slow ? 0.75 : (role === 'female' ? 0.85 : 0.94);
  const transcript = text.trim();
  const cacheKey = JSON.stringify([voiceId, model, version, locale, speed, transcript]);
  let audio = audioCache.get(cacheKey);
  const cached = Boolean(audio);
  if (!audio) {
    const response = await fetch('https://api.cartesia.ai/tts/bytes', {
      method: 'POST',
      signal: AbortSignal.timeout(25_000),
      headers: {Authorization: `Bearer ${key}`, 'Cartesia-Version': version,
        'Content-Type': 'application/json', Accept: 'audio/mpeg'},
      body: JSON.stringify({model_id: model, transcript, voice: voiceId, locale,
        output_format: {container: 'mp3', sample_rate: 44100, bit_rate: 128000},
        generation_config: {speed}}),
    });
    // Never expose provider responses, credentials or submitted lesson text in errors.
    if (!response.ok) throw fail('Cartesia nu a putut genera replica. Încearcă din nou.', 502);
    audio = Buffer.from(await response.arrayBuffer());
    if (!audio.length) throw fail('Cartesia a returnat un fragment audio gol.', 502);
    if (audio.length <= MAX_CACHE_BYTES) {
      while (audioCache.size >= 100 || cacheBytes + audio.length > MAX_CACHE_BYTES) {
        const oldest = audioCache.keys().next().value;
        cacheBytes -= audioCache.get(oldest).length;
        audioCache.delete(oldest);
      }
      // Concurrent requests for the same line may have filled the entry meanwhile.
      cacheBytes -= audioCache.get(cacheKey)?.length || 0;
      audioCache.set(cacheKey, audio);
      cacheBytes += audio.length;
    }
  }
  return {audio, headers: {'Content-Type': 'audio/mpeg', 'Cache-Control': 'private, max-age=86400',
    'X-Audio-Provider': cached ? 'cartesia-cache' : 'cartesia', 'X-Audio-Voice': role,
    'Content-Length': String(audio.length)}};
}

module.exports = {lessonSpeech};
