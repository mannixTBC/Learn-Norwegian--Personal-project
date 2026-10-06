import { speakNorwegian } from './norwegianSpeech';

let activeAudio = null;
let activeAudioUrl = '';

const releaseAudio = () => {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.removeAttribute('src');
    activeAudio.load();
  }
  if (activeAudioUrl) URL.revokeObjectURL(activeAudioUrl);
  activeAudio = null;
  activeAudioUrl = '';
};

const playBlob = (blob) => new Promise((resolve, reject) => {
  releaseAudio();
  activeAudioUrl = URL.createObjectURL(blob);
  activeAudio = new Audio(activeAudioUrl);
  activeAudio.preload = 'auto';
  activeAudio.onended = () => {
    releaseAudio();
    resolve();
  };
  activeAudio.onerror = () => {
    releaseAudio();
    reject(new Error('Browserul nu a putut reda modelul Azure Speech.'));
  };
  activeAudio.play().catch((error) => {
    releaseAudio();
    reject(error);
  });
});

export const speakPronunciationModel = async (text, { slow = false } = {}) => {
  try {
    const response = await fetch('/api/pronunciation/model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, slow }),
    });
    if (!response.ok) throw new Error('Azure Speech nu este disponibil.');
    const blob = await response.blob();
    if (!blob.size || !blob.type.startsWith('audio/')) throw new Error('Răspunsul Azure Speech nu conține audio valid.');
    await playBlob(blob);
    return { ok: true, provider: 'azure-speech' };
  } catch (_) {
    return speakNorwegian(text, { slow });
  }
};

export const getAzurePronunciationStatus = async () => {
  try {
    const response = await fetch('/api/pronunciation/status');
    if (!response.ok) return { azureConfigured: false };
    return response.json();
  } catch (_) {
    return { azureConfigured: false };
  }
};
