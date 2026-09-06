/**
 * Chat — wrapper pentru endpoint-ul /api/chat.
 *
 * Trimite istoricul conversației + contextul lecției către backend, care
 * apelează OpenAI (cheia e doar pe server, niciodată în frontend).
 */

/** Rezolvă URL-ul bazei pentru API (localhost:5000 în dev, same-origin în producție). */
const apiBase = () => {
  const local = typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost';
  return local ? 'http://localhost:5000' : '';
};

/**
 * Trimite un mesaj către asistentul virtual și primește răspunsul.
 * @param {{ messages: Array<{role: string, content: string}>, level: string, lessonId: number }} params
 * @returns {Promise<{ reply: string }>}
 */
export const sendChatMessage = async ({ messages, level, lessonId }) => {
  const response = await fetch(`${apiBase()}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, level, lessonId }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Asistentul nu a putut răspunde.');

  return { reply: data.reply };
};
