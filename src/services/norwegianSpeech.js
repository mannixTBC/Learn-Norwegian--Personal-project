import { Howl } from 'howler';

let activeSound = null;

const speechEndpoint = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000/api/speech'
  : '/api/speech';

const reportSpeechStatus = (detail) => {
  window.dispatchEvent(new CustomEvent('norwegian-speech-status', { detail }));
};

const stopActiveAudio = () => {
  if (!activeSound) return;

  activeSound.stop();
  activeSound.unload();
  activeSound = null;
};

const buildSpeechUrl = (text, slow) => (
  `${speechEndpoint}?text=${encodeURIComponent(text)}&slow=${slow ? '1' : '0'}&player=v3`
);

const normalizeAudioError = (reason) => (
  reason instanceof Error ? reason : new Error(String(reason || 'Eroare audio necunoscută.'))
);

export const speakNorwegian = (text, options = {}) => {
  const slow = Boolean(options.slow);

  stopActiveAudio();
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  return new Promise((resolve) => {
    let settled = false;
    let sound = null;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const fail = (reason) => {
      const error = normalizeAudioError(reason);
      if (activeSound === sound) activeSound = null;
      if (sound) sound.unload();

      console.error('ElevenLabs audio could not be played.', error);
      reportSpeechStatus({
        status: 'error',
        provider: 'elevenlabs',
        message: 'Vocea ElevenLabs nu este disponibilă momentan.',
      });
      finish({ ok: false, provider: 'elevenlabs', error });
    };

    sound = new Howl({
      src: [buildSpeechUrl(text, slow)],
      format: ['mp3'],
      html5: true,
      preload: true,
      onplay: () => {
        reportSpeechStatus({ status: 'playing', provider: 'elevenlabs' });
        finish({ ok: true, provider: 'elevenlabs' });
      },
      onloaderror: (_id, error) => fail(error),
      onplayerror: (_id, error) => fail(error),
      onend: () => {
        if (activeSound === sound) activeSound = null;
        sound.unload();
      },
    });

    activeSound = sound;
    sound.play();
  });
};
