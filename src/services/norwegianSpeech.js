const audioCache = new Map();
let audioContext = null;
let activeSource = null;
let activeAudio = null;

const speechEndpoint = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000/api/speech'
  : '/api/speech';

const reportSpeechStatus = (detail) => {
  window.dispatchEvent(new CustomEvent('norwegian-speech-status', { detail }));
};

// AudioContext must be created/resumed synchronously inside the user's click.
// Otherwise browsers may reject playback after the ElevenLabs request finishes.
const prepareAudioContext = () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return { context: null, ready: Promise.resolve() };

  if (!audioContext) audioContext = new AudioContextClass();
  const ready = audioContext.state === 'suspended'
    ? audioContext.resume()
    : Promise.resolve();

  return { context: audioContext, ready };
};

const stopActiveAudio = () => {
  if (activeSource) {
    try {
      activeSource.stop();
    } catch (_) {
      // The source may already have ended.
    }
    activeSource.disconnect();
    activeSource = null;
  }

  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
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

  const audio = { blob: await response.blob(), provider };
  audioCache.set(cacheKey, audio);
  return audio;
};

const playWithAudioContext = async (context, blob) => {
  const audioBuffer = await context.decodeAudioData(await blob.arrayBuffer());
  const source = context.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(context.destination);
  source.onended = () => {
    if (activeSource === source) activeSource = null;
    source.disconnect();
  };
  activeSource = source;
  source.start(0);
};

const playWithAudioElement = async (blob) => {
  const audioUrl = URL.createObjectURL(blob);
  const audio = new Audio(audioUrl);
  activeAudio = audio;
  audio.preload = 'auto';
  audio.onended = () => {
    URL.revokeObjectURL(audioUrl);
    if (activeAudio === audio) activeAudio = null;
  };
  try {
    await audio.play();
  } catch (error) {
    URL.revokeObjectURL(audioUrl);
    if (activeAudio === audio) activeAudio = null;
    throw error;
  }
};

export const speakNorwegian = async (text, options = {}) => {
  const slow = Boolean(options.slow);
  const playback = prepareAudioContext();

  try {
    stopActiveAudio();
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const { blob, provider } = await fetchAudio(text, slow);
    await playback.ready;

    if (playback.context) {
      await playWithAudioContext(playback.context, blob);
    } else {
      await playWithAudioElement(blob);
    }

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
