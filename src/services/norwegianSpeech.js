const audioCache = new Map();
let activeAudio = null;
const speechEndpoint = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000/api/speech'
  : '/api/speech';

const reportSpeechStatus = (detail) => {
  window.dispatchEvent(new CustomEvent('norwegian-speech-status', { detail }));
};

const fetchAudio = async (text, slow) => {
  const cacheKey = `${slow ? 'slow' : 'normal'}:${text}`;
  if (audioCache.has(cacheKey)) return audioCache.get(cacheKey);

  const response = await fetch(speechEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, slow }),
  });

  const contentType = response.headers.get('content-type') || '';
  const provider = response.headers.get('x-audio-provider') || '';
  if (!response.ok || !contentType.includes('audio/')) {
    throw new Error('Serviciul audio nu este disponibil.');
  }
  if (!provider.startsWith('elevenlabs')) {
    throw new Error('Răspunsul audio nu provine de la ElevenLabs.');
  }

  const audioUrl = URL.createObjectURL(await response.blob());
  const audio = { audioUrl, provider };
  audioCache.set(cacheKey, audio);
  return audio;
};

export const speakNorwegian = async (text, options = {}) => {
  const slow = Boolean(options.slow);

  try {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const { audioUrl, provider } = await fetchAudio(text, slow);
    activeAudio = new Audio(audioUrl);
    activeAudio.preload = 'auto';
    await activeAudio.play();
    reportSpeechStatus({ status: 'playing', provider });
    return { ok: true, provider };
  } catch (error) {
    console.error('ElevenLabs audio could not be played.', error);
    reportSpeechStatus({
      status: 'error',
      provider: 'elevenlabs',
      message: 'Vocea ElevenLabs nu este disponibilă momentan.',
    });
    return { ok: false, provider: 'elevenlabs', error };
  }
};
