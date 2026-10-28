import { supabase } from './supabaseClient';
import { apiUrl } from './api';

const chatRequest = async (operation, payload, signal) => {
  const session = supabase ? await supabase.auth.getSession() : null;
  const token = session?.data?.session?.access_token;

  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');

  let response;
  try {
    response = await fetch(apiUrl(`/api/chat/${operation}`), {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new Error('Nu ne-am putut conecta la asistent. Verifică conexiunea și încearcă din nou.');
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || 'Asistentul nu a putut răspunde momentan.');
  }

  return result;
};

export const startChatSession = ({ level, lessonId, pathId }, signal) => (
  chatRequest('start', { level, lessonId, pathId }, signal)
);

export const sendChatTurn = ({ sessionToken, message }, signal) => (
  chatRequest('turn', { sessionToken, message }, signal)
);

export const startFreeConversation = (level, signal) => chatRequest("free/start", {level}, signal);
export const sendFreeConversation = (payload, signal) => chatRequest("free/turn", payload, signal);
export const translateConversation = (text, signal) => chatRequest("translate", {text}, signal);
