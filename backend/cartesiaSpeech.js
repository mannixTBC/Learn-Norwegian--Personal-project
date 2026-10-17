const CARTESIA_ENDPOINT = 'https://api.cartesia.ai/tts/bytes';

const configured = () => Boolean(process.env.CARTESIA_API_KEY && process.env.CARTESIA_VOICE_ID);
const speed = (value, fallback) => {
  const parsed = Number(value || fallback);
  return Number.isFinite(parsed) ? Math.min(1.5, Math.max(0.6, parsed)) : fallback;
};

const cartesiaSpeechStream = async (text, signal, options = {}) => {
  if (!configured()) throw Object.assign(new Error('Streamingul Cartesia nu este configurat.'), { status: 503 });
  const locale = options.locale || 'no-NO';
  const isRomanian = locale.toLowerCase().startsWith('ro');
  const voiceId = options.voiceId || (isRomanian && process.env.CARTESIA_FEEDBACK_VOICE_ID) || process.env.CARTESIA_VOICE_ID;
  const voiceSpeed = speed(
    options.speed || (isRomanian ? process.env.CARTESIA_FEEDBACK_VOICE_SPEED : process.env.CARTESIA_VOICE_SPEED),
    isRomanian ? 0.95 : 0.82,
  );
  const timeout = AbortSignal.timeout(25_000);
  const requestSignal = signal && typeof AbortSignal.any === 'function' ? AbortSignal.any([signal, timeout]) : timeout;
  const response = await fetch(CARTESIA_ENDPOINT, {
    method: 'POST',
    signal: requestSignal,
    headers: {
      Authorization: `Bearer ${process.env.CARTESIA_API_KEY}`,
      'Cartesia-Version': process.env.CARTESIA_API_VERSION || '2026-08-14',
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      model_id: process.env.CARTESIA_MODEL_ID || 'sonic-latest',
      transcript: text,
      voice: voiceId,
      locale,
      output_format: { container: 'mp3', sample_rate: 44100, bit_rate: 128000 },
      generation_config: { speed: voiceSpeed, emotion: 'calm' },
    }),
  });
  if (!response.ok || !response.body) {
    throw Object.assign(new Error('Cartesia nu a putut genera vocea Norei.'), { status: 502, providerStatus: response.status });
  }
  return response;
};

const cartesiaSpeechBuffer = async (text, signal, options = {}) => {
  const response = await cartesiaSpeechStream(text, signal, options);
  return Buffer.from(await response.arrayBuffer());
};

module.exports = { cartesiaConfigured: configured, cartesiaSpeechStream, cartesiaSpeechBuffer };
