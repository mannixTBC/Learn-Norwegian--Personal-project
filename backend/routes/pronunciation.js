const express = require('express');

const router = express.Router();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const MAX_REFERENCE_LENGTH = 500;
const MAX_AUDIO_BYTES = 4 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = new Set([
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/ogg',
  'audio/ogg;codecs=opus',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav',
]);

const extensionFor = (mimeType) => {
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('mp4')) return 'm4a';
  if (mimeType.includes('mpeg')) return 'mp3';
  if (mimeType.includes('wav')) return 'wav';
  return 'webm';
};

router.post('/evaluate', async (req, res, next) => {
  const { audioBase64, mimeType = 'audio/webm', referenceText = '' } = req.body || {};

  if (!audioBase64 || typeof audioBase64 !== 'string') {
    return res.status(400).json({ error: 'Lipsește înregistrarea audio.' });
  }
  if (typeof referenceText !== 'string' || referenceText.length > MAX_REFERENCE_LENGTH) {
    return res.status(400).json({ error: 'Fraza de referință nu este validă.' });
  }
  if (!ALLOWED_AUDIO_TYPES.has(mimeType)) {
    return res.status(415).json({ error: 'Formatul audio nu este acceptat.' });
  }
  if (!ELEVENLABS_API_KEY) {
    return res.status(503).json({ error: 'Evaluarea ElevenLabs nu este configurată.', fallback: true });
  }
  if (typeof fetch !== 'function' || typeof FormData !== 'function' || typeof Blob !== 'function') {
    return res.status(503).json({ error: 'Mediul serverului nu poate procesa fișiere audio.', fallback: true });
  }

  try {
    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
    const audio = Buffer.from(cleanBase64, 'base64');
    if (!audio.length || audio.length > MAX_AUDIO_BYTES) {
      return res.status(413).json({ error: 'Înregistrarea este goală sau prea mare. Limita este de 30 de secunde.' });
    }

    const form = new FormData();
    form.append('file', new Blob([audio], { type: mimeType }), `pronunciation.${extensionFor(mimeType)}`);
    form.append('model_id', 'scribe_v2');
    form.append('language_code', 'no');
    form.append('tag_audio_events', 'false');
    form.append('diarize', 'false');
    form.append('timestamps_granularity', 'word');

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: { 'xi-api-key': ELEVENLABS_API_KEY },
      body: form,
    });

    if (!response.ok) {
      const details = await response.text();
      const error = new Error(`ElevenLabs a răspuns cu ${response.status}: ${details}`);
      error.status = response.status;
      throw error;
    }

    const transcript = await response.json();
    return res.json({
      text: transcript.text || '',
      languageCode: transcript.language_code || 'no',
      languageProbability: transcript.language_probability || null,
      words: Array.isArray(transcript.words)
        ? transcript.words.filter((word) => word.type === 'word').map((word) => ({
          text: word.text,
          start: word.start,
          end: word.end,
          logprob: word.logprob,
        }))
        : [],
      provider: 'elevenlabs-scribe-v2',
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
