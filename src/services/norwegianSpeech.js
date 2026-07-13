const audioCache = new Map();
let activeAudio = null;
const speechEndpoint = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000/api/speech'
  : '/api/speech';

const getNorwegianVoice = () => {
  if (!window.speechSynthesis) return null;

  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => voice.lang === 'nb-NO' && /Microsoft|Google/i.test(voice.name))
    || voices.find((voice) => voice.lang === 'nb-NO')
    || voices.find((voice) => /^nb|^no/i.test(voice.lang))
    || null;
};

const speakWithBrowser = (text, slow) => {
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getNorwegianVoice();

  utterance.lang = 'nb-NO';
  utterance.rate = slow ? 0.62 : 0.88;
  utterance.pitch = 1;
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
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
  if (!response.ok || !contentType.includes('audio/')) {
    throw new Error('Serviciul audio nu este disponibil.');
  }

  const audioUrl = URL.createObjectURL(await response.blob());
  audioCache.set(cacheKey, audioUrl);
  return audioUrl;
};

export const speakNorwegian = async (text, options = {}) => {
  const slow = Boolean(options.slow);

  try {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const audioUrl = await fetchAudio(text, slow);
    activeAudio = new Audio(audioUrl);
    await activeAudio.play();
  } catch (_) {
    speakWithBrowser(text, slow);
  }
};
