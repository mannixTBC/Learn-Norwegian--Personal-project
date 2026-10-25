import { readScenarioProgress } from './scenarioProgress.mjs';
export function getScenarioReviewItems(storage, userId, level, scenarios) {
  const progress = readScenarioProgress(storage, userId, level, scenarios);
  return scenarios.flatMap(scenario => {
    const item = progress[scenario.id];
    if (!item || item.legacy || item.latest.endReason === 'success') return [];
    const missing = scenario.goals.filter((_, i) => !item.latest.achieved.includes(i));
    return missing.length ? [{ id: scenario.id, title: scenario.title, missing,
      date: item.latest.date, attempts: item.attempts,
      previouslyCompleted: item.best.endReason === 'success' }] : [];
  }).sort((a, b) => b.date.localeCompare(a.date));
}
