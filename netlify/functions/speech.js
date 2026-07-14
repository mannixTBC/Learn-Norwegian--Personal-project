const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const ELEVENLABS_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5';
const MAX_TEXT_LENGTH = 3000;
const MAX_CACHE_ITEMS = 100;
const audioCache = new Map();

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  },
  body: JSON.stringify(body),
});

const rememberAudio = (key, audio) => {
  if (audioCache.size >= MAX_CACHE_ITEMS) {
    audioCache.delete(audioCache.keys().next().value);
  }
  audioCache.set(key, audio);
};

const readInput = (event) => {
  if (event.httpMethod === 'GET') {
    return event.queryStringParameters || {};
  }

  if (!event.body) return {};

  try {
    return JSON.parse(event.body);
  } catch (_error) {
    return null;
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Metodă neacceptată.' });
  }

  const input = readInput(event);
  if (!input) {
    return jsonResponse(400, { error: 'Cererea nu conține JSON valid.' });
  }

  const { text } = input;
  const slow = input.slow === true || input.slow === 'true' || input.slow === '1';

  if (!text || typeof text !== 'string' || !text.trim()) {
    return jsonResponse(400, { error: 'Lipsește textul pentru pronunție.' });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return jsonResponse(413, { error: 'Textul este prea lung pentru un singur fragment audio.' });
  }
  if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
    return jsonResponse(503, {
      error: 'ElevenLabs nu este configurat.',
      fallback: true,
    });
  }

  const normalizedText = text.trim();
  const cacheKey = `${ELEVENLABS_VOICE_ID}:${ELEVENLABS_MODEL_ID}:${slow ? 'slow' : 'normal'}:${normalizedText}`;
  let audio = audioCache.get(cacheKey);
  let provider = 'elevenlabs-cache';

  try {
    if (!audio) {
      const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(ELEVENLABS_VOICE_ID)}?output_format=mp3_44100_128`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: normalizedText,
          model_id: ELEVENLABS_MODEL_ID,
          language_code: 'no',
          voice_settings: {
            stability: 0.58,
            similarity_boost: 0.78,
            style: 0.12,
            use_speaker_boost: true,
            speed: slow ? 0.72 : 0.94,
          },
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        console.error(`ElevenLabs request failed with ${response.status}: ${details.slice(0, 500)}`);
        return jsonResponse(response.status, {
          error: 'ElevenLabs nu a putut genera pronunția.',
          fallback: true,
        });
      }

      audio = Buffer.from(await response.arrayBuffer());
      rememberAudio(cacheKey, audio);
      provider = 'elevenlabs';
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'private, max-age=86400',
        'X-Audio-Provider': provider,
        'Content-Length': String(audio.length),
      },
      body: audio.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('ElevenLabs speech function failed:', error);
    return jsonResponse(500, {
      error: 'Pronunția nu a putut fi generată momentan.',
      fallback: true,
    });
  }
};
