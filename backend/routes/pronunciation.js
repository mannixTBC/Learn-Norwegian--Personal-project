const express = require('express');

const router = express.Router();

const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const MAX_REFERENCE_LENGTH = 500;
const MAX_AUDIO_BYTES = 4 * 1024 * 1024;
const AZURE_LANGUAGE = 'nb-NO';
const ALLOWED_AUDIO_TYPES = new Set([
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/ogg',
  'audio/ogg;codecs=opus',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
]);

const extensionFor = (mimeType) => {
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('mp4')) return 'm4a';
  if (mimeType.includes('mpeg')) return 'mp3';
  if (mimeType.includes('wav')) return 'wav';
  return 'webm';
};

const secondsFromTicks = (ticks = 0) => Number(ticks) / 10000000;

const normalizeAzureResult = (payload) => {
  const best = Array.isArray(payload.NBest) ? payload.NBest[0] : null;
  const pronunciation = best && best.PronunciationAssessment ? best.PronunciationAssessment : {};
  const azureWords = best && Array.isArray(best.Words) ? best.Words : [];

  return {
    text: (best && (best.Display || best.Lexical)) || payload.DisplayText || '',
    languageCode: AZURE_LANGUAGE,
    words: azureWords.map((word) => ({
      text: word.Word || '',
      start: secondsFromTicks(word.Offset),
      end: secondsFromTicks(Number(word.Offset || 0) + Number(word.Duration || 0)),
      accuracyScore: word.PronunciationAssessment?.AccuracyScore ?? null,
      errorType: word.PronunciationAssessment?.ErrorType || 'None',
      phonemes: Array.isArray(word.Phonemes)
        ? word.Phonemes.map((phoneme) => ({
          phoneme: phoneme.Phoneme,
          accuracyScore: phoneme.PronunciationAssessment?.AccuracyScore ?? null,
        }))
        : [],
    })),
    assessment: {
      pronunciationScore: pronunciation.PronScore ?? 0,
      accuracy: pronunciation.AccuracyScore ?? 0,
      fluency: pronunciation.FluencyScore ?? 0,
      completeness: pronunciation.CompletenessScore ?? 0,
    },
    provider: 'azure-speech-pronunciation',
  };
};

const evaluateWithAzure = async ({ audio, mimeType, referenceText }) => {
  if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) return null;
  if (!/^[a-z0-9-]+$/i.test(AZURE_SPEECH_REGION)) {
    throw new Error('Regiunea Azure Speech nu este validă.');
  }

  const isWav = mimeType.includes('wav');
  const isOgg = mimeType.includes('ogg');
  if (!isWav && !isOgg) return null;

  const assessmentOptions = Buffer.from(JSON.stringify({
    ReferenceText: referenceText,
    GradingSystem: 'HundredMark',
    Granularity: 'Phoneme',
    Dimension: 'Comprehensive',
    EnableMiscue: true,
  }), 'utf8').toString('base64');
  const endpoint = new URL(`https://${AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`);
  endpoint.searchParams.set('language', AZURE_LANGUAGE);
  endpoint.searchParams.set('format', 'detailed');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': isOgg ? 'audio/ogg; codecs=opus' : 'audio/wav; codecs=audio/pcm; samplerate=16000',
      'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
      'Pronunciation-Assessment': assessmentOptions,
    },
    body: audio,
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Azure Speech a răspuns cu ${response.status}: ${details.slice(0, 300)}`);
  }

  const payload = await response.json();
  if (payload.RecognitionStatus !== 'Success') {
    throw new Error(`Azure Speech nu a recunoscut înregistrarea (${payload.RecognitionStatus || 'NoMatch'}).`);
  }

  return normalizeAzureResult(payload);
};

const transcribeWithElevenLabs = async ({ audio, mimeType }) => {
  if (!ELEVENLABS_API_KEY) return null;
  if (typeof FormData !== 'function' || typeof Blob !== 'function') return null;

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
    throw new Error(`ElevenLabs a răspuns cu ${response.status}: ${details.slice(0, 300)}`);
  }

  const transcript = await response.json();
  return {
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
  };
};

router.post('/evaluate', async (req, res) => {
  const { audioBase64, mimeType = 'audio/webm', referenceText = '' } = req.body || {};

  if (!audioBase64 || typeof audioBase64 !== 'string') {
    return res.status(400).json({ error: 'Lipsește înregistrarea audio.' });
  }
  if (typeof referenceText !== 'string' || !referenceText.trim() || referenceText.length > MAX_REFERENCE_LENGTH) {
    return res.status(400).json({ error: 'Fraza de referință nu este validă.' });
  }
  if (!ALLOWED_AUDIO_TYPES.has(mimeType)) {
    return res.status(415).json({ error: 'Formatul audio nu este acceptat.' });
  }
  if (typeof fetch !== 'function') {
    return res.status(503).json({ error: 'Mediul serverului nu poate procesa fișiere audio.', fallback: true });
  }

  const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
  const audio = Buffer.from(cleanBase64, 'base64');
  if (!audio.length || audio.length > MAX_AUDIO_BYTES) {
    return res.status(413).json({ error: 'Înregistrarea este goală sau prea mare. Limita este de 30 de secunde.' });
  }

  const providerErrors = [];
  try {
    const azureResult = await evaluateWithAzure({ audio, mimeType, referenceText: referenceText.trim() });
    if (azureResult) return res.json(azureResult);
  } catch (error) {
    providerErrors.push(error.message);
    console.warn('[pronunciation] Azure Speech indisponibil:', error.message);
  }

  try {
    const elevenLabsResult = await transcribeWithElevenLabs({ audio, mimeType });
    if (elevenLabsResult) return res.json(elevenLabsResult);
  } catch (error) {
    providerErrors.push(error.message);
    console.warn('[pronunciation] ElevenLabs indisponibil:', error.message);
  }

  return res.status(503).json({
    error: 'Evaluarea pronunției nu este disponibilă momentan.',
    fallback: true,
    providerErrors: process.env.NODE_ENV === 'development' ? providerErrors : undefined,
  });
});

module.exports = router;
