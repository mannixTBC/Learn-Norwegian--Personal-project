import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLearningSync } from '../src/services/learningSync.js';

const user = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const key = (suffix, id = user) => `curriculum_2026.2_${id}_${suffix}`;
const fixture = () => {
  const values = new Map();
  const storage = { getItem: (k) => values.get(k) ?? null, setItem: (k, v) => values.set(k, v),
    key: (i) => [...values.keys()][i], get length() { return values.size; } };
  const state = { user, cloud: {}, patches: [], events: [], fail: false, beforePatch: null, beforeRead: null };
  const client = {
    auth: { getSession: async () => ({ data: { session: state.user ? { user: { id: state.user } } : null } }) },
    rpc: async (name, { p_patch }) => {
      assert.ok(['patch_learning_progress', 'patch_scenario_results'].includes(name));
      state.patches.push(structuredClone(p_patch));
      if (state.beforePatch) await state.beforePatch();
      if (state.fail) return { error: new Error('offline') };
      state.cloud = { ...state.cloud, ...p_patch };
      return { data: state.cloud };
    },
    from: (table) => table === 'learning_progress' ? {
      select: () => ({ eq: (_, id) => ({ maybeSingle: async () => {
        assert.equal(id, user);
        if (state.beforeRead) await state.beforeRead();
        return state.fail ? { error: new Error('offline') } : { data: { state: state.cloud } };
      } }) }),
    } : { upsert: async (row, options) => {
      assert.equal(options.onConflict, 'user_id,client_event_id');
      if (state.fail) return { error: new Error('offline') };
      if (!state.events.some((item) => item.client_event_id === row.client_event_id)) state.events.push(row);
      return {};
    } },
  };
  const sync = createLearningSync({ client, storage: () => storage, delay: 100000 });
  return { storage, state, sync, pending: () => JSON.parse(storage.getItem(`nordlingo_sync_${user}`)) };
};

test('fresh device restores C1/C2, drafts and final results without importing foreign storage keys', async () => {
  const f = fixture();
  try {
    f.state.cloud = { [key('c1_progress')]: { completed: [1, 2], unlocked: 3 }, [key('c2_1_resume_voice_v1_responses')]: { 0: 'draft' },
      [key('c2_final_best')]: 90, [key('c1_progress', other)]: { completed: [24] }, malicious: 'ignored' };
    await f.sync.restore(user);
    assert.deepEqual(JSON.parse(f.storage.getItem(key('c1_progress'))), { completed: [1, 2], unlocked: 3 });
    assert.equal(JSON.parse(f.storage.getItem(key('c2_1_resume_voice_v1_responses')))[0], 'draft');
    assert.equal(f.storage.getItem(key('c2_final_best')), '90');
    assert.equal(f.storage.getItem(key('c1_progress', other)), null);
    assert.equal(f.storage.getItem('malicious'), null);
  } finally { f.sync.dispose(); }
});

test('existing local completions and offline drafts survive cloud restoration', async () => {
  const f = fixture();
  try {
    f.storage.setItem(key('c1_progress'), JSON.stringify({ completed: [1, 999], unlocked: 2 }));
    f.state.cloud[key('c1_progress')] = { completed: [2], unlocked: 3 };
    await f.sync.syncProgress(key('c1_1_resume_voice_v1_responses'), { 0: 'offline' });
    f.state.cloud[key('c1_1_resume_voice_v1_responses')] = { 0: 'older' };
    await f.sync.restore(user);
    assert.deepEqual(JSON.parse(f.storage.getItem(key('c1_progress'))), { completed: [1, 2], unlocked: 3 });
    assert.equal(JSON.parse(f.storage.getItem(key('c1_1_resume_voice_v1_responses')))[0], 'offline');
    await f.sync.flush(user);
    assert.deepEqual(f.pending().progress, {});
  } finally { f.sync.dispose(); }
});

test('subsequent login uses cloud drafts rather than stale local copies', async () => {
  const f = fixture();
  try {
    await f.sync.restore(user);
    f.storage.setItem(key('c1_1_resume_voice_v1_responses'), JSON.stringify({ 0: 'stale' }));
    f.state.cloud[key('c1_1_resume_voice_v1_responses')] = { 0: 'other device' };
    await f.sync.restore(user);
    assert.equal(JSON.parse(f.storage.getItem(key('c1_1_resume_voice_v1_responses')))[0], 'other device');
  } finally { f.sync.dispose(); }
});

test('failed writes persist across reload and replay without replacing unrelated server keys', async () => {
  const f = fixture();
  try {
    const progressKey = key('c2_progress');
    f.state.cloud[key('a1_progress')] = { completed: [1] };
    await f.sync.syncProgress(progressKey, { completed: [1], unlocked: 2 });
    f.state.fail = true;
    await assert.rejects(f.sync.flush(user), /offline/);
    f.sync.dispose();
    const reloaded = createLearningSync({ client: {
      auth: { getSession: async () => ({ data: { session: { user: { id: user } } } }) },
      rpc: async (_, { p_patch }) => { f.state.cloud = { ...f.state.cloud, ...p_patch }; return {}; },
    }, storage: () => f.storage, delay: 100000 });
    await reloaded.flush(user);
    reloaded.dispose();
    assert.deepEqual(f.state.cloud[key('a1_progress')], { completed: [1] });
    assert.deepEqual(f.state.cloud[progressKey], { completed: [1], unlocked: 2 });
    assert.deepEqual(f.pending().progress, {});
  } finally { f.sync.dispose(); }
});

test('edits made during an in-flight write are not acknowledged or discarded', async () => {
  const f = fixture();
  try {
    const k = key('c2_1_resume_voice_v1');
    await f.sync.syncProgress(k, 2);
    f.state.beforePatch = async () => { await f.sync.syncProgress(k, 3); f.state.beforePatch = null; };
    await f.sync.flush(user);
    assert.equal(f.pending().progress[k], 3);
    await f.sync.flush(user);
    assert.equal(f.state.cloud[k], 3);
    assert.deepEqual(f.pending().progress, {});
  } finally { f.sync.dispose(); }
});

test('account switch cannot upload another account queue or restore its late response', async () => {
  const f = fixture();
  try {
    await f.sync.syncProgress(key('c1_progress'), { completed: [1] });
    f.state.user = other;
    assert.equal((await f.sync.flush(user)).synced, false);
    assert.equal(f.state.patches.length, 0);
    let current = true;
    f.state.cloud[key('c2_progress')] = { completed: [1] };
    f.state.beforeRead = async () => { current = false; };
    await f.sync.restore(user, () => current);
    assert.equal(f.storage.getItem(key('c2_progress')), null);
    assert.equal((await f.sync.syncProgress('norwegian_active_level', 'C2')).synced, false);
  } finally { f.sync.dispose(); }
});

test('study events retry after failure and repeated delivery stays idempotent', async () => {
  const f = fixture();
  try {
    const event = { id: 'same-event', type: 'lesson', level: 'C2', minutes: 3, score: 90, date: new Date().toISOString() };
    await f.sync.syncActivity(event);
    f.state.fail = true;
    await assert.rejects(f.sync.flush(user), /offline/);
    assert.equal(Object.keys(f.pending().activities).length, 1);
    f.state.fail = false;
    await f.sync.flush(user);
    await f.sync.syncActivity(event);
    await f.sync.flush(user);
    assert.equal(f.state.events.length, 1);
    assert.equal(f.state.events[0].user_id, user);
    assert.deepEqual(f.pending().activities, {});
  } finally { f.sync.dispose(); }
});

test('scenario attempts restore on a new device, union across devices and remain isolated from other accounts', async () => {
  const f = fixture();
  const a = `scenario_result_v1_${user}_A1_bus-delay_${'a'.repeat(64)}`;
  const b = `scenario_result_v1_${user}_A1_bus-delay_${'b'.repeat(64)}`;
  const foreign = a.replace(user,other);
  const first = { version:1, achieved:[0], date:'2026-10-23T10:00:00.000Z' };
  const second = { version:1, achieved:[0,1,2], date:'2026-10-23T11:00:00.000Z' };
  try {
    f.state.cloud[a] = first; f.state.cloud[foreign] = second;
    await f.sync.restore(user);
    assert.deepEqual(JSON.parse(f.storage.getItem(a)), first);
    assert.equal(f.storage.getItem(foreign),null);
    f.storage.setItem(b,JSON.stringify(second));
    await f.sync.syncProgress(b,second);
    f.state.fail = true;
    await assert.rejects(f.sync.flush(user),/offline/);
    assert.deepEqual(f.pending().progress[b],second);
    f.state.fail = false;
    await f.sync.restore(user); await f.sync.flush(user);
    assert.deepEqual(f.state.cloud[a],first);
    assert.deepEqual(f.state.cloud[b],second);
    f.storage.setItem(a,JSON.stringify({wrong:'local duplicate'}));
    await f.sync.restore(user);
    assert.deepEqual(JSON.parse(f.storage.getItem(a)),first,'immutable remote result wins on duplicate ID');
    f.state.user=other;
    await f.sync.syncProgress(b,second);
    const before = f.state.patches.length;
    assert.equal((await f.sync.flush(user)).synced,false);
    assert.equal(f.state.patches.length,before);
  } finally { f.sync.dispose(); }
});

test('an unavailable scenario RPC cannot block existing curriculum and study activity delivery', async () => {
  const f = fixture();
  const k = `scenario_result_v1_${user}_A1_bus-delay_${'c'.repeat(64)}`;
  const client = {
    auth:{getSession:async()=>({data:{session:{user:{id:user}}}})},
    rpc:async(name,{p_patch})=> name==='patch_scenario_results' ? {error:new Error('RPC not deployed')}
      : (f.state.cloud={...f.state.cloud,...p_patch},{}),
    from:()=>({upsert:async row=>(f.state.events.push(row),{})}),
  };
  const sync=createLearningSync({client,storage:()=>f.storage,delay:100000});
  try {
    await sync.syncProgress(k,{version:1});
    await sync.syncProgress(key('a1_progress'),{completed:[1]});
    await sync.syncActivity({id:'lesson-event',type:'lesson',level:'A1',date:new Date().toISOString()});
    await assert.rejects(sync.flush(user),/RPC not deployed/);
    assert.deepEqual(f.state.cloud[key('a1_progress')],{completed:[1]});
    assert.equal(f.state.events.length,1);
    assert.deepEqual(f.pending().progress[k],{version:1});
    assert.deepEqual(f.pending().activities,{});
  } finally {sync.dispose();f.sync.dispose();}
});
