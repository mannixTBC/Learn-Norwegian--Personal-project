export const NORTHERN_PASS_UPDATE_EVENT = 'nordlingo:northern-pass-updated';
export const NORTHERN_PASS_STORAGE_PREFIX = 'nordlingo_northern_pass_v1_';
export const NORTHERN_PASS_PROCESSED_LIMIT = 256;

export const NORTHERN_PASS_STOPS = [
  { id: 'port', title: 'Portul de plecare', action: 'Ridică ancora', description: 'Încheie prima sesiune și pornește spre nord.', reward: 'Călător', cost: 0, sessions: 1 },
  { id: 'far', title: 'Farul de coastă', action: 'Aprinde farul', description: 'Găsește drumul prin ceața de pe coastă.', reward: 'Paznic de far', cost: 150, sessions: 2 },
  { id: 'fiord', title: 'Fiordul adânc', action: 'Traversează fiordul', description: 'Pregătește traversarea apei reci.', reward: 'Navigator', cost: 350, sessions: 3 },
  { id: 'pod', title: 'Podul rupt', action: 'Repară podul', description: 'Adună resurse pentru a lega cele două maluri.', reward: 'Constructor de poduri', cost: 1000, sessions: 5 },
  { id: 'padure', title: 'Pădurea de brazi', action: 'Găsește poteca', description: 'Urmează poteca ascunsă printre brazi.', reward: 'Cercetaș', cost: 1250, sessions: 6 },
  { id: 'cascada', title: 'Cascada vuietoare', action: 'Ocolește cascada', description: 'Pregătește urcarea pe lângă cascadă.', reward: 'Deschizător de drumuri', cost: 1500, sessions: 7 },
  { id: 'trecatoare', title: 'Trecătoarea Nordului', action: 'Deschide trecătoarea', description: 'Treci printre stânci și pornește spre zăpadă.', reward: 'Călăuza Nordului', cost: 2000, sessions: 8 },
  { id: 'ghetar', title: 'Ghețarul albastru', action: 'Traversează ghețarul', description: 'Pregătește o traversare sigură peste gheață.', reward: 'Cuceritor de ghețari', cost: 2500, sessions: 9 },
  { id: 'varf', title: 'Vârful înzăpezit', action: 'Urcă pe vârf', description: 'Strânge provizii pentru ultima urcare.', reward: 'Alpinist nordic', cost: 3000, sessions: 10 },
  { id: 'aurora', title: 'Aurora boreală', action: 'Ajungi la auroră', description: 'Încheie expediția sub luminile nordului.', reward: 'Maestrul Nordului', cost: 4000, sessions: 12 },
];

const eligibleTypes = new Set(['listening-game', 'work-missions', 'practice-quiz', 'practice-order', 'practice-word', 'verbs', 'pronunciation']);
const MAX_VALUE = Number.MAX_SAFE_INTEGER;
const ownerId = (userId) => typeof userId === 'string' && userId.trim() ? userId.trim() : 'guest';
export const northernPassStorageKey = (userId) => NORTHERN_PASS_STORAGE_PREFIX + encodeURIComponent(ownerId(userId));
const integer = (value) => Number.isFinite(Number(value)) ? Math.min(MAX_VALUE, Math.max(0, Math.floor(Number(value)))) : 0;
const parse = (value) => { try { return JSON.parse(value); } catch (_) { return null; } };
const read = (storage, key) => { try { return storage?.getItem(key) ?? null; } catch (_) { return null; } };
const fresh = (coins = 0) => ({ version: 1, coins, earnedCoins: 0, sessions: 0, completedStops: [], stageSessionBaseline: 0, processedIds: [], completedVerbSessions: [] });

const normalize = (value) => {
  if (!value || typeof value !== 'object' || value.version !== 1) return fresh();
  const completedStops = [];
  for (const stop of NORTHERN_PASS_STOPS) {
    if (value.completedStops?.[completedStops.length] !== stop.id) break;
    completedStops.push(stop.id);
  }
  const sessions = integer(value.sessions);
  return {
    version: 1,
    coins: integer(value.coins),
    earnedCoins: integer(value.earnedCoins),
    sessions,
    completedStops,
    stageSessionBaseline: completedStops.length ? Math.min(sessions, integer(value.stageSessionBaseline)) : 0,
    processedIds: Array.isArray(value.processedIds) ? [...new Set(value.processedIds.filter((id) => typeof id === 'string' && id.length > 0))].slice(-NORTHERN_PASS_PROCESSED_LIMIT) : [],
    completedVerbSessions: Array.isArray(value.completedVerbSessions) ? [...new Set(value.completedVerbSessions.filter((id) => /^[ABC][12]:(?:[1-9]|10)$/.test(id)))] : [],
  };
};

// The previous wallet had no account owner. Preserve its balance for the guest
// only; never infer sessions or copy a shared balance into a signed-in account.
export const readNorthernPassProgress = (storage, userId) => {
  const stored = read(storage, northernPassStorageKey(userId));
  if (stored !== null) return normalize(parse(stored));
  return fresh(ownerId(userId) === 'guest' ? integer(read(storage, 'norwegian_reward_balance')) : 0);
};

export const getNorthernPassStatus = (value) => {
  const state = normalize(value);
  const completedCount = state.completedStops.length;
  const currentStop = NORTHERN_PASS_STOPS[completedCount] || null;
  const stageSessions = Math.max(0, state.sessions - state.stageSessionBaseline);
  const remainingSessions = currentStop ? Math.max(0, currentStop.sessions - stageSessions) : 0;
  const remainingCoins = currentStop ? Math.max(0, currentStop.cost - state.coins) : 0;
  return {
    state, completedCount, currentStop, currentIndex: completedCount,
    rank: NORTHERN_PASS_STOPS[completedCount - 1]?.reward || 'La start',
    stageSessions, requiredSessions: currentStop?.sessions || 0,
    remainingSessions, remainingCoins,
    canClaim: Boolean(currentStop) && remainingSessions === 0 && remainingCoins === 0,
    finished: !currentStop,
  };
};

const persist = (storage, userId, state) => {
  try { storage.setItem(northernPassStorageKey(userId), JSON.stringify(state)); }
  catch (_) { return false; }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
    window.dispatchEvent(new CustomEvent(NORTHERN_PASS_UPDATE_EVENT, { detail: { userId: ownerId(userId) } }));
  }
  return true;
};

export const awardNorthernPassActivity = (storage, event = {}) => {
  const state = readNorthernPassProgress(storage, event.userId);
  const reject = (reason) => ({ state, awarded: false, reward: 0, reason });
  if (!eligibleTypes.has(event.type) || event.retry || event.completed === false) return reject('ineligible');
  if (typeof event.id !== 'string' || !event.id.trim()) return reject('missing-id');
  if (state.processedIds.includes(event.id)) return reject('duplicate');
  const verbSession = event.type === 'verbs' ? `${event.level}:${event.session}` : null;
  if (verbSession && !/^[ABC][12]:(?:[1-9]|10)$/.test(verbSession)) return reject('invalid-session');
  if (verbSession && state.completedVerbSessions.includes(verbSession)) return reject('duplicate-session');
  const hasScore = event.score !== null && event.score !== undefined && event.score !== '';
  if ((!hasScore && event.type !== 'verbs') || (hasScore && !Number.isFinite(Number(event.score)))) return reject('invalid-score');
  const reward = hasScore ? Math.round(40 + Math.min(100, Math.max(0, Number(event.score))) * 0.6) : 70;
  const next = {
    ...state,
    coins: Math.min(MAX_VALUE, state.coins + reward),
    earnedCoins: Math.min(MAX_VALUE, state.earnedCoins + reward),
    sessions: Math.min(MAX_VALUE, state.sessions + 1),
    processedIds: [...state.processedIds, event.id].slice(-NORTHERN_PASS_PROCESSED_LIMIT),
    completedVerbSessions: verbSession ? [...state.completedVerbSessions, verbSession] : state.completedVerbSessions,
  };
  return persist(storage, event.userId, next) ? { state: next, awarded: true, reward, reason: 'awarded' } : reject('storage-unavailable');
};

export const claimNorthernPassStop = (storage, userId, stopId) => {
  // Re-read at click time: a stale rendered button cannot spend twice or skip a stop.
  const state = readNorthernPassProgress(storage, userId);
  const status = getNorthernPassStatus(state);
  const reject = (reason) => ({ state, claimed: false, reason });
  if (!status.currentStop || status.currentStop.id !== stopId) return reject('not-current-stop');
  if (!status.canClaim) return reject('requirements');
  const next = {
    ...state,
    coins: state.coins - status.currentStop.cost,
    completedStops: [...state.completedStops, stopId],
    stageSessionBaseline: state.sessions,
  };
  return persist(storage, userId, next) ? { state: next, claimed: true, reason: 'claimed' } : reject('storage-unavailable');
};
