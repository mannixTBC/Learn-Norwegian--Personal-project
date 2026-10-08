import { supabase } from './supabaseClient';

export const practiceRequest = async (operation, payload, signal) => {
  const session = supabase ? await supabase.auth.getSession() : null;
  const token = session?.data?.session?.access_token;
  const response = await fetch(`/api/voice/practice/${operation}`, {
    method: 'POST', signal, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Practica vocală nu poate fi pornită momentan.');
  return result;
};
export const audioBlob = (data) => {
  const decoded = atob(data.audioBase64);
  return new Blob([Uint8Array.from(decoded, (character) => character.charCodeAt(0))], { type: data.mimeType });
};
export const recordingPayload = (blob, signal) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  const abort = () => reader.abort();
  const finish = (callback, value) => { signal?.removeEventListener('abort', abort); callback(value); };
  reader.onload = () => finish(resolve, { audioBase64: reader.result.split(',')[1], mimeType: blob.type });
  reader.onerror = () => finish(reject, new Error('Înregistrarea nu a putut fi citită.'));
  reader.onabort = () => finish(reject, new DOMException('Cancelled', 'AbortError'));
  if (signal?.aborted) { reject(new DOMException('Cancelled', 'AbortError')); return; }
  signal?.addEventListener('abort', abort, { once: true });
  reader.readAsDataURL(blob);
});
export const recordPracticeAnswer = async ({ signal, onComplete, onError }) => {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error('Browserul nu permite înregistrarea vocală. Folosește un browser actualizat și HTTPS.');
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
  catch (error) { throw new Error(error.name === 'NotAllowedError' ? 'Permite accesul la microfon pentru a răspunde.' : 'Nu am putut porni microfonul. Verifică dacă este conectat.'); }
  if (signal?.aborted) { stream.getTracks().forEach((track) => track.stop()); throw new DOMException('Cancelled', 'AbortError'); }
  let recorder;
  let timer;
  let cancelled = false;
  const parts = [];
  const release = () => { clearTimeout(timer); stream.getTracks().forEach((track) => track.stop()); signal?.removeEventListener('abort', cancel); };
  const stop = () => { if (recorder?.state === 'recording') recorder.stop(); };
  const cancel = () => { cancelled = true; stop(); release(); };
  try {
    const type = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4'].find((value) => MediaRecorder.isTypeSupported(value));
    recorder = type ? new MediaRecorder(stream, { mimeType: type }) : new MediaRecorder(stream);
    const started = Date.now();
    recorder.ondataavailable = ({ data }) => { if (data.size) parts.push(data); };
    recorder.onerror = () => { cancelled = true; stop(); release(); onError(new Error('Înregistrarea s-a întrerupt. Încearcă din nou.')); };
    recorder.onstop = () => {
      const duration = Math.min((Date.now() - started) / 1000, 20);
      release();
      if (!cancelled && !signal?.aborted) onComplete(new Blob(parts, { type: recorder.mimeType }), duration);
    };
    signal?.addEventListener('abort', cancel, { once: true });
    recorder.start();
    timer = setTimeout(stop, 20_000);
    return { stop, cancel };
  } catch (error) { release(); throw error; }
};
