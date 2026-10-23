// Learning history only: no transcript, draft or signed token is stored here.
export const resultPrefix = (userId, level) => `scenario_result_v1_${userId || 'guest'}_${level}_`;
export const scenarioDefinition = scenario => JSON.stringify([
  scenario.revision || 1, scenario.objectiveIds || [], scenario.goals, scenario.difficulty.turns,
]);
const parse = value => { try { return JSON.parse(value); } catch { return null; } };
const valid = (value, scenario) => value?.version === 1
  && value.definition === scenarioDefinition(scenario)
  && typeof value.date === 'string' && Number.isFinite(Date.parse(value.date)) && new Date(value.date).toISOString() === value.date && value.turn > 0
  && Number.isInteger(value.turn) && value.turn <= scenario.difficulty.turns
  && Array.isArray(value.achieved) && new Set(value.achieved).size === value.achieved.length
  && value.achieved.every(id => Number.isInteger(id) && id >= 0 && id < scenario.goals.length)
  && (value.endReason === 'success' ? value.achieved.length === scenario.goals.length
    : value.endReason === 'turn_limit' && value.turn === scenario.difficulty.turns
      && value.achieved.length < scenario.goals.length);
export function readScenarioProgress(storage, userId, level, scenarios) {
  const summary = {};
  const outdated = new Set();
  try {
    const prefix = resultPrefix(userId, level);
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key?.startsWith(prefix)) continue;
      const suffix = key.slice(prefix.length);
      const scenario = scenarios.find(s => suffix.startsWith(s.id + '_') && /^[a-f0-9]{64}$/.test(suffix.slice(s.id.length + 1)));
      if (!scenario) continue;
      const value = parse(storage.getItem(key));
      if (!valid(value, scenario)) {
        if (value?.version === 1 && typeof value.definition === 'string' && value.definition !== scenarioDefinition(scenario)) outdated.add(scenario.id);
        continue;
      }
      const previous = summary[scenario.id];
      const latest = !previous || value.date >= previous.latest.date ? value : previous.latest;
      const best = !previous || value.achieved.length > previous.best.achieved.length
        || (value.achieved.length === previous.best.achieved.length && value.date > previous.best.date) ? value : previous.best;
      summary[scenario.id] = { attempts: (previous?.attempts || 0) + 1, latest, best };
    }
    for (const id of outdated) if (!summary[id]) summary[id] = { legacy: true };
    // Old records cannot establish completion or goal identity. Leave them untouched.
    const legacy = parse(storage.getItem(`conversation-studio:${userId || 'guest'}:${level}`));
    for (const s of scenarios) if (!summary[s.id] && legacy?.[s.id]) summary[s.id] = { legacy: true };
  } catch { /* Blocked or corrupt storage must never prevent practice. */ }
  return summary;
}
export async function saveScenarioResult({ storage, userId, level, scenario, result, isCurrent = () => true }) {
  if (!result.done) return { saved: false };
  const bytes = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(result.sessionToken));
  const id = Array.from(new Uint8Array(bytes), n => n.toString(16).padStart(2, '0')).join('');
  if (!isCurrent()) return { saved: false };
  const key = resultPrefix(userId, level) + scenario.id + '_' + id;
  const previous = parse(storage.getItem(key));
  const value = valid(previous, scenario) ? previous : { version: 1, definition: scenarioDefinition(scenario),
    achieved: [...result.achieved].sort((a, b) => a - b), endReason: result.endReason,
    turn: result.turn, date: new Date().toISOString() };
  if (!valid(value, scenario)) throw new Error('Invalid scenario result');
  storage.setItem(key, JSON.stringify(value));
  return { saved: true, key, value };
}
