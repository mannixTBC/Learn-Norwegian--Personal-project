let activeAudio = null;
let playbackSequence = 0;

const speechEndpoint = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000/api/speech'
  : '/api/speech';

const reportSpeechStatus = (detail) => {
  window.dispatchEvent(new CustomEvent('norwegian-speech-status', { detail }));
};

const releaseAudio = (audio) => {
  audio.onplay = null;
  audio.onended = null;
  audio.onerror = null;
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
};

const stopActiveAudio = () => {
  if (!activeAudio) return;

  const audio = activeAudio;
  activeAudio = null;
  releaseAudio(audio);
};

const buildSpeechUrl = (text, slow, voice) => (
  `${speechEndpoint}?text=${encodeURIComponent(text)}&slow=${slow ? '1' : '0'}&voice=${voice}&player=native-v2${slow ? '&slowVersion=2' : ''}`
);

const mediaErrorMessage = (audio) => {
  if (!audio.error) return 'Redarea audio nu a putut porni.';

  const messages = {
    1: 'Redarea audio a fost întreruptă.',
    2: 'Fișierul audio nu a putut fi descărcat.',
    3: 'Fișierul audio nu a putut fi decodat.',
    4: 'Formatul audio nu este acceptat de browser.',
  };

  return messages[audio.error.code] || 'Eroare audio necunoscută.';
};

export const speakNorwegian = (text, options = {}) => {
  const slow = Boolean(options.slow);
  const voice = options.voice === 'female' ? 'female' : 'male';
  const waitForEnd = Boolean(options.waitForEnd);

  stopActiveAudio();
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  const playbackId = ++playbackSequence;
  const audio = new Audio();
  activeAudio = audio;
  audio.preload = 'auto';
  audio.playsInline = true;
  audio.src = buildSpeechUrl(text, slow, voice);

  return new Promise((resolve) => {
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const fail = (reason) => {
      if (playbackId !== playbackSequence || activeAudio !== audio) {
        finish({ ok: false, provider: 'elevenlabs', cancelled: true });
        return;
      }

      const error = reason instanceof Error ? reason : new Error(mediaErrorMessage(audio));
      activeAudio = null;
      releaseAudio(audio);

      console.error('ElevenLabs audio could not be played.', error);
      reportSpeechStatus({
        status: 'error',
        provider: 'elevenlabs',
        message: 'Vocea ElevenLabs nu este disponibilă momentan.',
      });
      finish({ ok: false, provider: 'elevenlabs', error });
    };

    audio.onplay = () => {
      reportSpeechStatus({ status: 'playing', provider: 'elevenlabs', voice });
      if (!waitForEnd) finish({ ok: true, provider: 'elevenlabs', voice });
    };

    audio.onended = () => {
      if (activeAudio === audio) activeAudio = null;
      releaseAudio(audio);
      finish({ ok: true, provider: 'elevenlabs', voice });
    };

    audio.onerror = () => fail(new Error(mediaErrorMessage(audio)));

    // Calling play immediately inside the click keeps browser playback permission active
    // while the MP3 is downloaded from the Netlify function.
    const playRequest = audio.play();
    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(fail);
    }
  });
};
