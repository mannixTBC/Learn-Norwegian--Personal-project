import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { apiUrl } from '../../services/api';
import { syncLearningProgress } from '../../services/supabaseLearning';
import { readScenarioProgress, saveScenarioResult } from './scenarioProgress.mjs';
import { conversationRequest, validateConversation, conversationStorageKey, readConversation, saveConversation } from './conversationSession.mjs';

const empty = () => ({ scenarioId: null, session: null, messages: [], draft: '', busy: false,
  error: null, operation: null, savedToken: null, notice: '', progress: {}, progressNotice: '' });
const getAccessToken = async () => {
  const session = supabase ? await supabase.auth.getSession() : null;
  return session?.data?.session?.access_token;
};

export default function useConversationSession({ userId, level, pathId, scenarios }) {
  const [state, setState] = useState(empty);
  const current = useRef(state);
  const pending = useRef(null);
  const mounted = useRef(true);
  const key = conversationStorageKey(userId, level, pathId);
  const scope = useRef(key);
  const options = useRef(scenarios);
  scope.current = key;
  options.current = scenarios;
  function readProgress() {
    try { return readScenarioProgress(localStorage, userId, level, options.current); }
    catch { return {}; }
  }
  function update(change) {
    current.current = typeof change === 'function' ? change(current.current) : change;
    setState(current.current);
  }
  function cancel() {
    pending.current?.abort();
    pending.current = null;
  }
  function persist(next, storageKey = key) {
    const token = next.session?.sessionToken || next.savedToken;
    if (token) saveConversation(storageKey, { scenarioId: next.scenarioId, sessionToken: token, draft: next.draft });
  }
  async function run(operation) {
    // Set the lock synchronously: two events in the same render cannot submit twice.
    if (pending.current) return;
    const before = current.current;
    const scenario = options.current.find(item => item.id === before.scenarioId);
    if (!scenario || (operation === 'turn' && (!before.session || before.session.done || !before.draft.trim()))) return;
    const controller = new AbortController();
    pending.current = controller;
    const requestKey = key;
    const isCurrent = () => pending.current === controller && !controller.signal.aborted && scope.current === requestKey;
    const sent = before.draft.trim();
    const payload = operation === 'start' ? { scenarioId: scenario.id, level }
      : operation === 'resume' ? { sessionToken: before.savedToken || before.session?.sessionToken }
      : { sessionToken: before.session.sessionToken, message: sent };
    update({ ...before, busy: true, error: null, operation, notice: '' });
    try {
      const result = validateConversation(await conversationRequest(operation, payload, {
        signal: controller.signal, getAccessToken, baseUrl: apiUrl('/api/scenarios'),
      }), scenario, { operation, previousTurn: before.session?.turn || 0, level });
      if (!isCurrent()) return;
      const next = { ...current.current, session: result, savedToken: null, busy: false, error: null,
        draft: operation === 'turn' ? '' : current.current.draft,
        messages: operation === 'resume' ? result.messages
          : [...(operation === 'start' ? [] : [...before.messages, { role: 'user', text: sent }]), { role: 'assistant', text: result.reply }],
        notice: operation === 'resume' ? 'Conversația a fost reluată.' : '',
      };
      // Save only confirmed results; an interrupted request retains the previous checkpoint and draft.
      persist(next, requestKey);
      update(next);
      if (result.done) {
        try {
          const saved = await saveScenarioResult({ storage: localStorage, userId, level, scenario, result, isCurrent: () => scope.current === requestKey });
          if (scope.current !== requestKey || !saved.saved) return;
          if (mounted.current) update(previous => ({ ...previous, progress: readProgress(),
            progressNotice: 'Rezultatul este salvat pe acest dispozitiv.' }));
          void syncLearningProgress(saved.key, saved.value).catch(() => {
            if (mounted.current && scope.current === requestKey) update(previous => ({ ...previous,
              progressNotice: 'Rezultatul este salvat local. Sincronizarea va fi reîncercată.' }));
          });
        } catch {
          if (isCurrent()) update(previous => ({ ...previous,
            progressNotice: 'Rezultatul este afișat, dar nu a putut fi salvat pe acest dispozitiv.' }));
        }
      }
    } catch (error) {
      if (isCurrent()) update(previous => ({ ...previous, busy: false,
        error: { kind: error.kind || 'retry', message: error.message || 'Încearcă din nou.' } }));
    } finally {
      if (pending.current === controller) pending.current = null;
    }
  }
  useEffect(() => {
    mounted.current = true;
    cancel();
    const saved = readConversation(key, options.current);
    const progress = readProgress();
    update(saved ? { ...empty(), progress, scenarioId: saved.scenarioId, savedToken: saved.sessionToken, draft: saved.draft } : { ...empty(), progress });
    if (saved) void run('resume');
    return () => { mounted.current = false; cancel(); };
    // Scope changes intentionally reset UI state before loading a separate checkpoint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  function choose(scenarioId) {
    cancel();
    saveConversation(key, null);
    update({ ...empty(), progress: readProgress(), scenarioId });
  }
  function setDraft(draft) {
    if (pending.current) return;
    const next = { ...current.current, draft: draft.slice(0, 1200) };
    persist(next);
    update(next);
  }
  return { ...state, choose, setDraft,
    start: () => run('start'), send: () => run('turn'), retry: () => run(current.current.operation || 'start'),
    restart: () => run('start'), again: () => choose(current.current.scenarioId), reset: () => choose(null),
  };
}
