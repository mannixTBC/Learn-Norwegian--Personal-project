const CARTESIA_ENDPOINT = 'https://api.cartesia.ai/tts/bytes';

const configured = () => Boolean(process.env.CARTESIA_API_KEY && process.env.CARTESIA_VOICE_ID);
const speed = () => {
  const value = Number(process.env.CARTESIA_VOICE_SPEED || 0.82);
  return Number.isFinite(value) ? Math.min(1.5, Math.max(0.6, value)) : 0.82;
};

const cartesiaSpeechStream = async (text, signal) => {
  if (!configured()) throw Object.assign(new Error('Streamingul Cartesia nu este configurat.'), { status: 503 });
  const timeout = AbortSignal.timeout(25_000);
  const requestSignal = signal && typeof AbortSignal.any === 'function' ? AbortSignal.any([signal, timeout]) : timeout;
  const response = await fetch(CARTESIA_ENDPOINT, {
    method: 'POST',
    signal: requestSignal,
    headers: {
      'X-API-Key': process.env.CARTESIA_API_KEY,
      'Cartesia-Version': process.env.CARTESIA_API_VERSION || '2026-08-14',
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      model_id: process.env.CARTESIA_MODEL_ID || 'sonic-latest',
      transcript: text,
      voice: { mode: 'id', id: process.env.CARTESIA_VOICE_ID },
      language: 'no',
      output_format: { container: 'mp3', sample_rate: 44100, bit_rate: 128000 },
      generation_config: { speed: speed(), emotion: 'calm' },
    }),
  });
  if (!response.ok || !response.body) {
    throw Object.assign(new Error('Cartesia nu a putut genera vocea Norei.'), { status: 502, providerStatus: response.status });
  }
  return response;
};

module.exports = { cartesiaConfigured: configured, cartesiaSpeechStream };
