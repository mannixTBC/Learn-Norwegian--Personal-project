import { supabase } from './supabaseClient';

const request = async (path, options = {}) => {
  if (!supabase) throw new Error('Preferințele de confidențialitate necesită o sesiune activă.');
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Sesiunea a expirat. Conectează-te din nou.');

  const response = await fetch(`/api/voice/transcripts${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || 'Preferința nu a putut fi actualizată.');
  return payload;
};

export const getVoiceTranscriptPreference = (signal) => request('/preference', { signal });

export const setVoiceTranscriptPreference = (enabled, signal) => request('/preference', {
  method: 'PUT',
  signal,
  body: JSON.stringify({ enabled }),
});

export const saveVoiceTranscript = (conversation, signal) => request('', {
  method: 'POST',
  signal,
  body: JSON.stringify(conversation),
});

