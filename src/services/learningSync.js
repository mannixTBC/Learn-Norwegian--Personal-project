const object = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const scenarioKey = /^scenario_result_v1_([0-9a-f-]{36})_[ABC][12]_[a-z0-9-]{1,80}_[a-f0-9]{64}$/;
const ownerOf = (key) => scenarioKey.exec(key)?.[1] || /^curriculum_\d+\.\d+_([0-9a-f-]{36})_/.exec(key)?.[1];
const ownedKey = (key, id) => ownerOf(key) === id && (scenarioKey.test(key) ||
  /^curriculum_\d+\.\d+_[0-9a-f-]{36}_(?:[abc][12]_(?:progress|final_(?:best|passed)|\d+_resume.*)|current_lesson)$/.test(key));
const mergeValue = (key, remote, local) => {
  if (scenarioKey.test(key)) return remote ?? local;
  if (/_progress$/.test(key)) return {
    completed: [...new Set([...(Array.isArray(remote?.completed) ? remote.completed : []), ...(Array.isArray(local?.completed) ? local.completed : [])])]
      .filter((id) => Number.isInteger(id) && id >= 1 && id <= 24).sort((a, b) => a - b),
    unlocked: Math.min(24, Math.max(1, Number(remote?.unlocked) || 1, Number(local?.unlocked) || 1)),
  };
  if (/_final_best$/.test(key)) return Math.max(Number(remote) || 0, Number(local) || 0);
  if (/(_final_passed|_voice_complete)$/.test(key)) return remote === true || local === true;
  return local;
};

// Injected dependencies let tests exercise real offline and account-switch behavior.
export const createLearningSync = ({ client, storage, delay = 300 }) => {
  const timers = new Map();
  const running = new Map();
  const queueKey = (id) => `nordlingo_sync_${id}`;
  const read = (key) => { try { return JSON.parse(storage().getItem(key)); } catch (_) { return null; } };
  const queue = (id) => ({ progress: {}, activities: {}, ...object(read(queueKey(id))) });
  const write = (id, next) => storage().setItem(queueKey(id), JSON.stringify(next));
  const request = async (query) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try { return await (query.abortSignal ? query.abortSignal(controller.signal) : query); }
    finally { clearTimeout(timeout); }
  };
  const schedule = (id) => {
    clearTimeout(timers.get(id));
    timers.set(id, setTimeout(() => {
      timers.delete(id);
      void flush(id).catch((error) => console.warn('Sincronizarea rămâne în așteptare.', error.message));
    }, delay));
  };
  const flush = async (id) => {
    if (!client || !id) return { synced: false };
    if (running.has(id)) return running.get(id);
    const task = (async () => {
      // This check routes local queues only; the database authorizes every write with auth.uid()/RLS.
      const { data, error } = await client.auth.getSession();
      if (error || data?.session?.user?.id !== id) return { synced: false };
      const snapshot = queue(id);
      const patch = Object.fromEntries(Object.entries(object(snapshot.progress)).filter(([key]) => ownedKey(key, id)));
      let scenarioError;
      for (const [rpc, group] of [
        ['patch_learning_progress', Object.fromEntries(Object.entries(patch).filter(([key]) => !scenarioKey.test(key)))],
        ['patch_scenario_results', Object.fromEntries(Object.entries(patch).filter(([key]) => scenarioKey.test(key)))],
      ]) {
        if (!Object.keys(group).length) continue;
        const result = await request(client.rpc(rpc, { p_patch: group }));
        if (result.error) {
          if (rpc !== 'patch_scenario_results') throw result.error;
          scenarioError = result.error;
          continue; // A pending scenario deployment must not block existing activity sync.
        }
        const latest = queue(id);
        for (const [key, value] of Object.entries(group)) {
          if (JSON.stringify(latest.progress[key]) === JSON.stringify(value)) delete latest.progress[key];
        }
        write(id, latest);
      }
      for (const [eventId, row] of Object.entries(object(snapshot.activities))) {
        if (row.user_id !== id) continue;
        const result = await request(client.from('study_activity').upsert(row, {
          onConflict: 'user_id,client_event_id', ignoreDuplicates: true,
        }));
        if (result.error) throw result.error;
        const latest = queue(id);
        delete latest.activities[eventId];
        write(id, latest);
      }
      if (scenarioError) throw scenarioError;
      return { synced: true };
    })();
    running.set(id, task);
    let succeeded = false;
    try { const result = await task; succeeded = result.synced; return result; }
    finally {
      running.delete(id);
      const pending = queue(id);
      if (succeeded && (Object.keys(pending.progress).length || Object.keys(pending.activities).length)) schedule(id);
    }
  };
  const syncProgress = async (key, value) => {
    const id = ownerOf(key);
    if (!client || !id || !ownedKey(key, id)) return { synced: false };
    const pending = queue(id);
    pending.progress[key] = value;
    write(id, pending);
    schedule(id);
    return { queued: true };
  };
  const syncActivity = async (event) => {
    if (!client) return { synced: false };
    const { data, error } = await client.auth.getSession();
    const id = data?.session?.user?.id;
    if (error || !id) return { synced: false };
    const { id: eventId, type, level, minutes, score, date, day, words, ...details } = event;
    const pending = queue(id);
    pending.activities[eventId] = {
      user_id: id, client_event_id: eventId, activity_type: type, level, minutes, score,
      occurred_at: date, metadata: { day, words, ...details },
    };
    write(id, pending);
    schedule(id);
    return { queued: true };
  };
  const restore = async (id, isCurrent = () => true) => {
    if (!client || !id) return;
    const { data, error } = await request(client.from('learning_progress').select('state').eq('user_id', id).maybeSingle());
    if (error) throw error;
    if (!isCurrent()) return;
    const remote = object(data?.state);
    const pending = queue(id);
    const firstRestore = !storage().getItem(`${queueKey(id)}_restored`);
    // Import pre-sync local progress once; never import another account's keys.
    for (let index = 0; index < storage().length; index += 1) {
      const key = storage().key(index);
      if (ownedKey(key, id) && (firstRestore || scenarioKey.test(key) || /(_progress|_final_best|_final_passed|_voice_complete)$/.test(key))) {
        const local = read(key);
        if (local !== null) pending.progress[key] = mergeValue(key, remote[key], local);
      }
    }
    for (const [key, value] of Object.entries(remote)) {
      if (ownedKey(key, id)) storage().setItem(key, JSON.stringify(value));
    }
    for (const [key, value] of Object.entries(pending.progress)) {
      if (ownedKey(key, id)) {
        const merged = mergeValue(key, remote[key], value);
        pending.progress[key] = merged;
        storage().setItem(key, JSON.stringify(merged));
      }
    }
    write(id, pending);
    storage().setItem(`${queueKey(id)}_restored`, 'true');
    schedule(id);
  };
  const dispose = () => { for (const timer of timers.values()) clearTimeout(timer); timers.clear(); };
  return { syncProgress, syncActivity, restore, flush, dispose };
};
