import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  NORTHERN_PASS_STOPS, NORTHERN_PASS_PROCESSED_LIMIT,
  awardNorthernPassActivity, claimNorthernPassStop, getNorthernPassStatus,
  northernPassStorageKey, readNorthernPassProgress,
} from '../src/services/northernPassProgress.js';

const fixture = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  const writes = [];
  return {
    values, writes,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { writes.push(key); values.set(key, value); },
  };
};
const completion = (id, extra = {}) => ({ id, userId: 'account-one', type: 'practice-quiz', score: 100, ...extra });
const state = (storage, userId = 'account-one') => readNorthernPassProgress(storage, userId);

test('a fresh expedition requires a real completed session even at the free port', () => {
  const storage = fixture();
  const fresh = state(storage);
  assert.equal(fresh.coins, 0);
  assert.equal(fresh.sessions, 0);
  assert.deepEqual(fresh.completedStops, []);
  assert.equal(getNorthernPassStatus(fresh).currentStop.id, 'port');
  assert.equal(getNorthernPassStatus(fresh).canClaim, false);
  assert.equal(claimNorthernPassStop(storage, 'account-one', 'port').claimed, false);
  assert.equal(storage.writes.length, 0);
});

test('completed recognized games earn score-based coins and exactly one session', () => {
  const storage = fixture();
  const types = ['listening-game', 'work-missions', 'practice-quiz', 'practice-order', 'practice-word', 'pronunciation'];
  for (const [index, type] of types.entries()) {
    const result = awardNorthernPassActivity(storage, completion(`game-${index}`, { type, score: 50 }));
    assert.equal(result.awarded, true);
    assert.equal(result.reward, 70);
  }
  const verbs = awardNorthernPassActivity(storage, completion('verb-session', { type: 'verbs', level: 'A1', session: 1, score: null }));
  assert.equal(verbs.reward, 70);
  assert.equal(state(storage).sessions, 7);
  assert.equal(state(storage).coins, 490);
  assert.equal(state(storage).earnedCoins, 490);
});

test('lessons, passive time, incomplete sessions, retries and invalid scores earn nothing', () => {
  const storage = fixture();
  const events = [
    completion('lesson', { type: 'lesson' }), completion('passive', { type: 'time', minutes: 900 }),
    completion('retry', { retry: true }), completion('unfinished', { completed: false }),
    completion('missing-score', { score: null }), completion('nan', { score: Number.NaN }),
    completion('infinite', { score: Infinity }), completion('not-score', { score: 'bad' }),
    completion('', {}),
  ];
  events.forEach((event) => assert.equal(awardNorthernPassActivity(storage, event).awarded, false));
  assert.equal(state(storage).sessions, 0);
  assert.equal(state(storage).coins, 0);
  assert.equal(storage.writes.length, 0);
});

test('finite scores clamp to 0–100 without negative or excessive rewards', () => {
  const storage = fixture();
  assert.equal(awardNorthernPassActivity(storage, completion('low', { score: -600 })).reward, 40);
  assert.equal(awardNorthernPassActivity(storage, completion('high', { score: 800 })).reward, 100);
  assert.equal(awardNorthernPassActivity(storage, completion('fraction', { score: 91.6 })).reward, 95);
  assert.equal(state(storage).coins, 235);
});

test('duplicate completion IDs do not grant a second reward after reload', () => {
  const storage = fixture();
  const event = completion('same-event');
  assert.equal(awardNorthernPassActivity(storage, event).awarded, true);
  assert.equal(awardNorthernPassActivity(storage, { ...event, score: 0 }).reason, 'duplicate');
  assert.equal(readNorthernPassProgress(storage, event.userId).sessions, 1);
  assert.equal(storage.writes.length, 1);
});

test('accounts and guests keep separate balances, progress and processed IDs', () => {
  const storage = fixture();
  awardNorthernPassActivity(storage, completion('same-id'));
  awardNorthernPassActivity(storage, completion('same-id', { userId: 'account-two', score: 0 }));
  awardNorthernPassActivity(storage, completion('same-id', { userId: 'guest', score: 50 }));
  assert.equal(state(storage).coins, 100);
  assert.equal(state(storage, 'account-two').coins, 40);
  assert.equal(state(storage, 'guest').coins, 70);
  assert.equal(state(storage, 'third-account').sessions, 0);
  claimNorthernPassStop(storage, 'account-one', 'port');
  assert.deepEqual(state(storage).completedStops, ['port']);
  assert.deepEqual(state(storage, 'account-two').completedStops, []);
});

test('each account can earn a completed verb session once, independently of shared legacy verb progress', () => {
  const storage = fixture({ challenge_verbs_progress_a1: JSON.stringify({ day: 10, completed: [1, 2, 3] }) });
  const verb = { type: 'verbs', level: 'A1', session: 1, score: null };
  assert.equal(awardNorthernPassActivity(storage, completion('verb-a', verb)).reward, 70);
  assert.equal(awardNorthernPassActivity(storage, completion('verb-a-repeat', verb)).reason, 'duplicate-session');
  for (let index = 0; index <= NORTHERN_PASS_PROCESSED_LIMIT; index += 1) awardNorthernPassActivity(storage, completion(`other-game-${index}`));
  assert.equal(awardNorthernPassActivity(storage, completion('verb-after-history-eviction', verb)).reason, 'duplicate-session');
  assert.equal(awardNorthernPassActivity(storage, completion('verb-b', { ...verb, userId: 'account-two' })).reward, 70);
  assert.equal(awardNorthernPassActivity(storage, completion('verb-next-level', { ...verb, level: 'A2' })).reward, 70);
  assert.equal(awardNorthernPassActivity(storage, completion('invalid-verb', { ...verb, session: 11 })).awarded, false);
  assert.equal(storage.values.get('challenge_verbs_progress_a1'), JSON.stringify({ day: 10, completed: [1, 2, 3] }));
});

test('unowned legacy coins remain with the guest and never imply completed stops or sessions', () => {
  const storage = fixture({ norwegian_reward_balance: '890', norwegian_learning_activity: JSON.stringify([completion('old')]) });
  assert.equal(state(storage).coins, 0);
  assert.equal(state(storage, 'guest').coins, 890);
  assert.equal(state(storage, 'guest').sessions, 0);
  assert.deepEqual(state(storage, 'guest').completedStops, []);
  assert.equal(claimNorthernPassStop(storage, 'guest', 'port').claimed, false);
  awardNorthernPassActivity(storage, completion('new-guest', { userId: 'guest' }));
  assert.equal(state(storage, 'guest').coins, 990);
  assert.equal(storage.values.get('norwegian_reward_balance'), '890');
  assert.equal(storage.writes.some((key) => key === 'norwegian_reward_balance'), false);
});

test('claiming a current stop spends once in one write and resets its session baseline', () => {
  const storage = fixture();
  awardNorthernPassActivity(storage, completion('first'));
  const before = storage.writes.length;
  const result = claimNorthernPassStop(storage, 'account-one', 'port');
  assert.equal(result.claimed, true);
  assert.equal(storage.writes.length - before, 1);
  assert.equal(result.state.coins, 100);
  assert.equal(result.state.stageSessionBaseline, 1);
  assert.equal(claimNorthernPassStop(storage, 'account-one', 'port').claimed, false);
  assert.equal(claimNorthernPassStop(storage, 'account-one', 'fiord').claimed, false);
  assert.equal(getNorthernPassStatus(state(storage)).stageSessions, 0);
  assert.equal(claimNorthernPassStop(storage, 'account-one', 'far').claimed, false);
  awardNorthernPassActivity(storage, completion('second'));
  assert.equal(getNorthernPassStatus(state(storage)).remainingCoins, 0);
  assert.equal(getNorthernPassStatus(state(storage)).remainingSessions, 1);
  assert.equal(claimNorthernPassStop(storage, 'account-one', 'far').claimed, false);
  awardNorthernPassActivity(storage, completion('third'));
  assert.equal(claimNorthernPassStop(storage, 'account-one', 'far').state.coins, 150);
});

test('both requirements apply: sufficient sessions cannot spend coins the player does not own', () => {
  const storage = fixture();
  let eventId = 0;
  const play = () => awardNorthernPassActivity(storage, completion(`minimum-${eventId++}`, { score: 0 }));
  play(); claimNorthernPassStop(storage, 'account-one', 'port');
  play(); play();
  assert.equal(getNorthernPassStatus(state(storage)).remainingSessions, 0);
  assert.equal(getNorthernPassStatus(state(storage)).remainingCoins, 30);
  const before = storage.writes.length;
  assert.equal(claimNorthernPassStop(storage, 'account-one', 'far').claimed, false);
  assert.equal(storage.writes.length, before);
  play();
  assert.equal(claimNorthernPassStop(storage, 'account-one', 'far').state.coins, 10);
});

test('all ten obstacles unlock in order, with newly earned sessions at every stop', () => {
  const storage = fixture();
  let id = 0;
  for (const [index, stop] of NORTHERN_PASS_STOPS.entries()) {
    const before = getNorthernPassStatus(state(storage));
    assert.equal(before.currentStop.id, stop.id);
    assert.equal(before.stageSessions, 0);
    assert.equal(before.canClaim, false);
    while (!getNorthernPassStatus(state(storage)).canClaim) awardNorthernPassActivity(storage, completion(`journey-${id++}`));
    const balance = state(storage).coins;
    const writes = storage.writes.length;
    const result = claimNorthernPassStop(storage, 'account-one', stop.id);
    assert.equal(result.claimed, true);
    assert.equal(result.state.coins, balance - stop.cost);
    assert.ok(result.state.coins >= 0);
    assert.equal(result.state.completedStops.length, index + 1);
    assert.equal(storage.writes.length, writes + 1);
    assert.equal(claimNorthernPassStop(storage, 'account-one', stop.id).claimed, false);
  }
  const status = getNorthernPassStatus(state(storage));
  assert.equal(status.finished, true);
  assert.equal(status.currentStop, null);
  assert.equal(status.rank, 'Maestrul Nordului');
  assert.equal(status.canClaim, false);
  assert.equal(awardNorthernPassActivity(storage, completion('keep-playing')).awarded, true);
});

test('malformed storage recovers safely and invalid progress cannot skip obstacles', () => {
  for (const malformed of ['{broken', 'null', '[]', '{"version":99,"coins":900}']) {
    const storage = fixture({ [northernPassStorageKey('account-one')]: malformed });
    assert.equal(state(storage).coins, 0);
    assert.equal(state(storage).sessions, 0);
  }
  const storage = fixture({ [northernPassStorageKey('account-one')]: JSON.stringify({ version: 1, coins: -25, sessions: 5, completedStops: ['port', 'aurora'], stageSessionBaseline: 50 }) });
  const value = state(storage);
  assert.equal(value.coins, 0);
  assert.deepEqual(value.completedStops, ['port']);
  assert.equal(value.stageSessionBaseline, 5);
  assert.equal(getNorthernPassStatus(value).currentStop.id, 'far');
});

test('idempotence history stays bounded while recent events remain protected', () => {
  const storage = fixture();
  for (let index = 0; index < NORTHERN_PASS_PROCESSED_LIMIT + 10; index += 1) awardNorthernPassActivity(storage, completion(`event-${index}`));
  assert.equal(state(storage).processedIds.length, NORTHERN_PASS_PROCESSED_LIMIT);
  const sessions = state(storage).sessions;
  assert.equal(awardNorthernPassActivity(storage, completion(`event-${NORTHERN_PASS_PROCESSED_LIMIT + 9}`)).awarded, false);
  assert.equal(state(storage).sessions, sessions);
});

test('storage failures do not pretend to award coins or claim an obstacle', () => {
  const storage = fixture();
  storage.setItem = () => { throw new Error('quota'); };
  assert.equal(awardNorthernPassActivity(storage, completion('failed')).reason, 'storage-unavailable');
  assert.equal(state(storage).sessions, 0);
  const seeded = fixture();
  awardNorthernPassActivity(seeded, completion('saved'));
  seeded.setItem = storage.setItem;
  assert.equal(claimNorthernPassStop(seeded, 'account-one', 'port').reason, 'storage-unavailable');
  assert.deepEqual(state(seeded).completedStops, []);
});

test('real study recording awards its explicit owner while lessons and retry records keep their original statistics', async () => {
  const { build } = await import('vite');
  const { resolve } = await import('node:path');
  const { pathToFileURL } = await import('node:url');
  const root = resolve(import.meta.dirname, '..');
  const outDir = resolve(root, 'node_modules/.cache/northern-pass-tests');
  await build({ configFile: resolve(root, 'vite.config.js'), logLevel: 'error', plugins: [{
    name: 'northern-pass-offline-study', enforce: 'pre',
    resolveId(id) { if (id.endsWith('/supabaseLearning')) return 'virtual:northern-pass-sync'; },
    load(id) { if (id === 'virtual:northern-pass-sync') return 'export const syncStudyActivity = async () => ({ synced: false });'; },
  }], build: { ssr: true, outDir, emptyOutDir: false, rollupOptions: {
    input: resolve(root, 'src/services/learningActivity.js'), output: { entryFileNames: 'study.mjs' },
  } } });
  const { recordStudyActivity, getStudySummary } = await import(pathToFileURL(resolve(outDir, 'study.mjs')));
  const storage = fixture();
  const previousStorage = globalThis.localStorage;
  globalThis.localStorage = storage;
  try {
    const event = recordStudyActivity({ type: 'practice-order', userId: 'account-two', score: 80, minutes: 2 });
    assert.equal(event.userId, 'account-two');
    assert.equal(state(storage, 'account-two').coins, 88);
    assert.equal(state(storage).coins, 0);
    recordStudyActivity({ type: 'practice-order', userId: 'account-two', score: 100, retry: true, minutes: 1 });
    recordStudyActivity({ type: 'lesson', userId: 'account-two', score: 100, minutes: 5 });
    assert.equal(state(storage, 'account-two').sessions, 1);
    assert.equal(state(storage, 'account-two').coins, 88);
    assert.equal(getStudySummary().events.length, 3);
    assert.equal(getStudySummary().totalMinutes, 8);
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});
