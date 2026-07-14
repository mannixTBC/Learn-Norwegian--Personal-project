let activeAudio = null;

const speechEndpoint = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000/api/speech'
  : '/api/speech';

const reportSpeechStatus = (detail) => {
  window.dispatchEvent(new CustomEvent('norwegian-speech-status', { detail }));
};

const stopActiveAudio = () => {
  if (!activeAudio) return;

  activeAudio.pause();
  activeAudio.removeAttribute('src');
  activeAudio.load();
  activeAudio = null;
};

const buildSpeechUrl = (text, slow) => (
  `${speechEndpoint}?text=${encodeURIComponent(text)}&slow=${slow ? '1' : '0'}`
);

export const speakNorwegian = async (text, options = {}) => {
  const slow = Boolean(options.slow);

  try {
    stopActiveAudio();
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    // play() is called immediately inside the user's click. The browser then
    // streams and decodes the ElevenLabs MP3 without losing user activation.
    const audio = new Audio(buildSpeechUrl(text, slow));
    activeAudio = audio;
    audio.preload = 'auto';
    audio.onplaying = () => {
      reportSpeechStatus({ status: 'playing', provider: 'elevenlabs' });
    };
    audio.onended = () => {
      if (activeAudio === audio) activeAudio = null;
    };

    await audio.play();
    return { ok: true, provider: 'elevenlabs' };
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
