const express = require('express');

const router = express.Router();
const fetch = typeof globalThis.fetch === 'function' ? globalThis.fetch : require('node-fetch');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const ELEVENLABS_FEMALE_VOICE_ID = process.env.ELEVENLABS_FEMALE_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
const ELEVENLABS_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5';
const MAX_TEXT_LENGTH = 3000;
const MAX_CACHE_ITEMS = 100;
const audioCache = new Map();

const rememberAudio = (key, audio) => {
  if (audioCache.size >= MAX_CACHE_ITEMS) {
    const oldestKey = audioCache.keys().next().value;
    audioCache.delete(oldestKey);
  }
  audioCache.set(key, audio);
};

const prepareSpeechText = (text, slow) => (
  slow && text === 'Bra, takk.' ? 'Bra, takk!' : text
);

const handleSpeech = async (req, res, next) => {
  const input = req.method === 'GET' ? req.query : (req.body || {});
  const { text } = input;
  const slow = input.slow === true || input.slow === 'true' || input.slow === '1';
  const voice = input.voice === 'female' ? 'female' : 'male';
  const voiceId = voice === 'female' ? ELEVENLABS_FEMALE_VOICE_ID : ELEVENLABS_VOICE_ID;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Lipsește textul pentru pronunție.' });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(413).json({ error: 'Textul este prea lung pentru un singur fragment audio.' });
  }
  if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
    return res.status(503).json({
      error: 'ElevenLabs nu este configurat.',
      fallback: true,
    });
  }

  const normalizedText = text.trim();
  const speechText = prepareSpeechText(normalizedText, slow);
  const cacheKey = `${voiceId}:${ELEVENLABS_MODEL_ID}:${slow ? 'slow-v2' : 'normal'}:${speechText}`;
  const cachedAudio = audioCache.get(cacheKey);

  if (cachedAudio) {
    res.set({
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'private, max-age=86400',
      'X-Audio-Provider': 'elevenlabs-cache',
      'X-Audio-Voice': voice,
      'Content-Length': cachedAudio.length,
    });
    return res.send(cachedAudio);
  }

  try {
    const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: speechText,
        model_id: ELEVENLABS_MODEL_ID,
        language_code: 'no',
        voice_settings: {
          stability: 0.58,
          similarity_boost: 0.78,
          style: 0.12,
          use_speaker_boost: true,
          speed: slow && speechText.length <= 12 ? 0.82 : (slow ? 0.72 : 0.94),
        },
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      const error = new Error(`ElevenLabs a răspuns cu ${response.status}: ${details}`);
      error.status = response.status;
      throw error;
    }

    const audio = Buffer.from(await response.arrayBuffer());
    rememberAudio(cacheKey, audio);
    res.set({
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'private, max-age=86400',
      'X-Audio-Provider': 'elevenlabs',
      'X-Audio-Voice': voice,
      'Content-Length': audio.length,
    });
    return res.send(audio);
  } catch (error) {
    return next(error);
  }
};

router.get('/', handleSpeech);
router.post('/', handleSpeech);

module.exports = router;
