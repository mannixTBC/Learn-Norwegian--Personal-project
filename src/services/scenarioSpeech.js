import { supabase } from './supabaseClient';
import { apiUrl } from './api';

// The server resolves the spoken line from the signed scenario checkpoint.
export const speakScenario = (sessionToken, options) => speakSignedReply('/api/scenarios/speech', sessionToken, options);
export const speakFreeConversation = (sessionToken, options) => speakSignedReply('/api/chat/free/speech', sessionToken, options);

async function speakSignedReply(endpoint, sessionToken, { slow = false, messageIndex, signal, onPlaybackStart } = {}) {
  const auth = supabase ? await supabase.auth.getSession() : null;
  const token = auth?.data?.session?.access_token;
  const response = await fetch(apiUrl(endpoint), {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ sessionToken, slow, ...(messageIndex === undefined ? {} : { messageIndex }) }),
  });
  if (!response.ok) throw new Error('Vocea Cartesia nu este disponibilă momentan.');
  const blob = await response.blob();
  if (signal?.aborted) return { ok: false, cancelled: true };
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.playbackRate = 1;
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancel);
      audio.onplay = audio.onended = audio.onerror = null;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      URL.revokeObjectURL(url);
      resolve(result);
    };
    const cancel = () => finish({ ok: false, cancelled: true });
    const timer = setTimeout(() => finish({ ok: false }), 120000);
    signal?.addEventListener('abort', cancel, { once: true });
    audio.onplay = () => onPlaybackStart?.();
    audio.onended = () => finish({ ok: true, provider: 'cartesia' });
    audio.onerror = () => finish({ ok: false });
    if (signal?.aborted) return cancel();
    try { audio.play()?.catch(() => finish({ ok: false })); }
    catch { finish({ ok: false }); }
  });
}
