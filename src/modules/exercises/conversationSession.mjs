const restartCodes = new Set(['SCENARIO_SESSION_INVALID', 'SCENARIO_SESSION_EXPIRED', 'SCENARIO_UPDATED', 'SCENARIO_ENDED']);
export class ConversationError extends Error {
  constructor(message, kind = 'retry') { super(message); this.name = 'ConversationError'; this.kind = kind; }
}
const abortError = () => Object.assign(new Error('Request cancelled'), { name: 'AbortError' });
function httpError(status, result) {
  const supplied = typeof result?.error === 'string' && result.error.length <= 600 ? result.error : '';
  if (restartCodes.has(result?.code) || status === 410 || status === 409) {
    return new ConversationError(supplied || 'Conversația trebuie începută din nou.', 'restart');
  }
  if (status === 401 || status === 403) return new ConversationError('Conectează-te din nou pentru a continua conversația.', 'auth');
  if (status === 429) return new ConversationError(supplied || 'Ai atins limita de mesaje. Încearcă mai târziu.', 'limit');
  return new ConversationError(status >= 500 ? 'Nora nu poate răspunde momentan. Încearcă din nou.'
    : supplied || 'Cererea nu a putut fi procesată. Încearcă din nou.');
}

export async function conversationRequest(operation, payload, {
  signal, getAccessToken = async () => null, fetcher = globalThis.fetch,
  baseUrl = '/api/scenarios', timeoutMs = 45000,
} = {}) {
  if (signal?.aborted) throw abortError();
  const controller = new AbortController();
  let rejectStop;
  const stopped = new Promise((_, reject) => { rejectStop = reject; });
  const cancel = () => { rejectStop(abortError()); controller.abort(); };
  signal?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(() => {
    rejectStop(new ConversationError('Răspunsul întârzie prea mult. Poți încerca din nou.'));
    controller.abort();
  }, timeoutMs);
  try {
    const work = (async () => {
      const token = await getAccessToken();
      if (controller.signal.aborted) throw abortError();
      const response = await fetcher(baseUrl + '/' + operation, {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        body: JSON.stringify(payload),
      });
      let result;
      try { result = await response.json(); } catch { result = null; }
      if (!response.ok) throw httpError(response.status, result);
      if (!result || typeof result !== 'object' || Array.isArray(result)) {
        throw new ConversationError('Am primit un răspuns incomplet. Încearcă din nou.');
      }
      return result;
    })();
    return await Promise.race([work, stopped]);
  } catch (error) {
    if (error instanceof ConversationError || error.name === 'AbortError') throw error;
    throw new ConversationError('Nu am putut contacta serverul. Verifică conexiunea și încearcă din nou.');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}

export function validateConversation(result, scenario, { operation, previousTurn = 0, level } = {}) {
  const validText = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
  if (!result || !validText(result.sessionToken, 280000) || !validText(result.reply, 1800)
    || typeof result.feedback !== 'string' || result.feedback.length > 1800
    || !Number.isFinite(result.expiresAt) || !Number.isInteger(result.turn) || result.turn < 0
    || result.maxTurns !== scenario.difficulty.turns || result.turn > result.maxTurns
    || typeof result.done !== 'boolean' || !Array.isArray(result.achieved)
    || new Set(result.achieved).size !== result.achieved.length
    || !result.achieved.every(id => Number.isInteger(id) && id >= 0 && id < scenario.goals.length)
    || (operation === 'start' && (result.turn !== 0 || result.done || result.achieved.length))
    || (operation === 'turn' && result.turn !== previousTurn + 1)) {
    throw new ConversationError('Răspunsul conversației este incomplet. Încearcă din nou.');
  }
  const success = result.achieved.length === scenario.goals.length;
  const done = success || result.turn >= result.maxTurns;
  if (result.done !== done || result.endReason !== (done ? success ? 'success' : 'turn_limit' : null)) {
    throw new ConversationError('Rezultatul conversației nu a putut fi verificat. Încearcă din nou.');
  }
  if (operation === 'resume' && (result.scenarioId !== scenario.id || result.level !== level
    || !Array.isArray(result.messages) || result.messages.length !== result.turn * 2 + 1
    || !result.messages.every((entry, i) => entry?.role === (i % 2 ? 'user' : 'assistant')
      && validText(entry.text, i % 2 ? 1200 : 1800))
    || result.messages.at(-1)?.text !== result.reply)) {
    throw new ConversationError('Conversația salvată nu a putut fi verificată. Încearcă din nou.');
  }
  return result;
}

export const conversationStorageKey = (userId, level, pathId) =>
  'conversation-session:v1:' + JSON.stringify([userId || 'guest', level, pathId]);
export function readConversation(key, scenarios) {
  try {
    const data = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (data?.version !== 1 || !scenarios.some(s => s.id === data.scenarioId)
      || typeof data.sessionToken !== 'string' || !data.sessionToken || data.sessionToken.length > 280000
      || typeof data.draft !== 'string' || data.draft.length > 1200) return null;
    return data;
  } catch { return null; }
}
export function saveConversation(key, data) {
  try {
    if (!data) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify({ version: 1, ...data }));
  } catch { /* Conversation remains usable if browser storage is unavailable. */ }
}
