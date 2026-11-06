// Server only. Never import this module into the Expo application.
const fail = (message, status, code) => Object.assign(new Error(message), { status, code });
const languages = new Set(['no', 'en', 'de', 'fr', 'ro', 'pl', 'uk', 'sv', 'da']);
const audioTypes = new Set(['audio/mp4', 'audio/webm', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/mpeg']);
const MAX_AUDIO_BYTES = 1_000_000;

function languageCode(value = 'no') {
  if (typeof value !== 'string') throw fail('Limba înregistrării nu este validă.', 400, 'STT_LANGUAGE');
  const base = value.trim().toLowerCase().split('-')[0];
  const code = base === 'nb' ? 'no' : base;
  if (!languages.has(code)) throw fail('Limba înregistrării nu este disponibilă.', 400, 'STT_LANGUAGE');
  return code;
}

function deepgramEnabled() {
  const provider = (process.env.VOICE_STT_PROVIDER || (process.env.DEEPGRAM_API_KEY ? 'deepgram' : 'openai')).trim();
  if (!['deepgram', 'openai'].includes(provider)) throw fail('Transcrierea nu este configurată corect.', 503, 'STT_CONFIGURATION');
  return provider === 'deepgram';
}

function validateAudio({ audioBase64, mimeType, duration } = {}) {
  if (typeof mimeType !== 'string' || !audioTypes.has(mimeType.split(';')[0].toLowerCase())) {
    throw fail('Formatul audio nu este acceptat.', 415, 'STT_AUDIO_TYPE');
  }
  if (!Number.isFinite(duration) || duration < 0.4 || duration > 60.25) {
    throw fail('Înregistrează un răspuns între 0,4 și 60 de secunde.', 400, 'STT_DURATION');
  }
  if (typeof audioBase64 !== 'string' || audioBase64.length > Math.ceil(MAX_AUDIO_BYTES / 3) * 4
    || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(audioBase64)) {
    throw fail('Înregistrarea este invalidă sau prea mare.', 400, 'STT_AUDIO_INVALID');
  }
  const audio = Buffer.from(audioBase64, 'base64');
  if (audio.length < 100 || audio.length > MAX_AUDIO_BYTES || audio.toString('base64') !== audioBase64) {
    throw fail('Înregistrarea este invalidă sau prea mare.', 400, 'STT_AUDIO_INVALID');
  }
  return { audio, mimeType: mimeType.toLowerCase() };
}

function normalizeTranscript(payload, requestedLanguage) {
  const channel = payload?.results?.channels?.[0];
  const best = channel?.alternatives?.[0];
  if (!best || typeof best.transcript !== 'string') {
    throw fail('Serviciul de transcriere a trimis un răspuns incomplet.', 502, 'STT_RESPONSE_INVALID');
  }
  const detected = channel.detected_language;
  const words = Array.isArray(best.words) ? best.words.filter(word => typeof word.word === 'string').map(word => ({
    text: word.punctuated_word || word.word,
    start: Number.isFinite(word.start) ? word.start : null,
    end: Number.isFinite(word.end) ? word.end : null,
    confidence: Number.isFinite(word.confidence) ? word.confidence : null,
  })) : [];
  return {
    text: best.transcript.trim().slice(0, 1600), words,
    confidence: Number.isFinite(best.confidence) ? best.confidence : null,
    languageCode: detected || requestedLanguage || null,
    // A requested language is not evidence of what the user actually spoke.
    languages: typeof detected === 'string' ? [{ code: detected }] : [],
    provider: 'deepgram-nova-3',
  };
}

async function transcribeDeepgram({ audio, mimeType, language = 'no', detectLanguages, signal }, fetchImpl = fetch) {
  const key = process.env.DEEPGRAM_API_KEY?.trim();
  if (!key) throw fail('Transcrierea Deepgram nu este încă activată pe server.', 503, 'STT_NOT_CONFIGURED');
  const region = process.env.DEEPGRAM_REGION || 'eu';
  if (!['eu', 'global'].includes(region)) throw fail('Regiunea Deepgram nu este configurată corect.', 503, 'STT_CONFIGURATION');
  const url = new URL('/v1/listen', region === 'eu' ? 'https://api.eu.deepgram.com' : 'https://api.deepgram.com');
  url.searchParams.set('model', 'nova-3');
  url.searchParams.set('punctuate', 'true');
  // Keep learners' words as spoken; avoid normalizing numbers/grammar or adding paid add-ons.
  if (Array.isArray(detectLanguages)) {
    if (detectLanguages.length) for (const code of new Set(detectLanguages.map(languageCode))) url.searchParams.append('detect_language', code);
    else url.searchParams.set('detect_language', 'true');
  } else url.searchParams.set('language', languageCode(language));
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, 20_000);
  try {
    const response = await fetchImpl(url.toString(), {
      method: 'POST', signal: controller.signal,
      headers: { Authorization: `Token ${key}`, 'Content-Type': mimeType, Accept: 'application/json' },
      body: audio,
    });
    if (!response.ok) {
      if (response.status === 429) throw fail('Transcrierea este ocupată. Încearcă din nou peste puțin timp.', 429, 'STT_RATE_LIMIT');
      if ([401, 402, 403].includes(response.status)) throw fail('Transcrierea nu este disponibilă. Verifică activarea și creditul Deepgram pe server.', 503, 'STT_PROVIDER_ACCESS');
      throw fail('Nu am putut transcrie înregistrarea. Încearcă din nou.', 502, 'STT_PROVIDER_ERROR');
    }
    const payload = await response.json().catch(() => null);
    return normalizeTranscript(payload, Array.isArray(detectLanguages) ? null : languageCode(language));
  } catch (error) {
    if (error.status) throw error;
    throw fail(controller.signal.aborted ? 'Transcrierea a durat prea mult. Încearcă din nou.' : 'Serviciul de transcriere nu răspunde momentan.',
      controller.signal.aborted ? 504 : 502, controller.signal.aborted ? 'STT_TIMEOUT' : 'STT_NETWORK');
  } finally {
    clearTimeout(timer); signal?.removeEventListener('abort', abort);
  }
}

// In-process guard, matching the existing voice routes. It is not a global
// billing cap across Netlify instances; configure provider spend alerts as well.
function createTranscriptionGuard(now = Date.now) {
  const actors = new Map();
  return userId => {
    const time = now();
    for (const [id, state] of actors) if (!state.active && state.expires <= time) actors.delete(id);
    const state = actors.get(userId) || { recent: [], active: false, expires: time + 60_000 };
    state.recent = state.recent.filter(value => time - value < 60_000);
    if (state.active || state.recent.length >= 6) throw fail('Așteaptă puțin înainte de următoarea înregistrare.', 429, 'STT_RATE_LIMIT');
    state.active = true; state.recent.push(time); state.expires = time + 60_000; actors.set(userId, state);
    return () => { state.active = false; };
  };
}

module.exports = { deepgramEnabled, languageCode, validateAudio, normalizeTranscript, transcribeDeepgram, createTranscriptionGuard };
