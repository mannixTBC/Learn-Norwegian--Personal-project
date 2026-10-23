// Recommendations use learning history only, without a separate progress store.
export function recommendDesktopPractice({ games = [], review, reviewStats = {} }) {
  if (review && reviewStats.due > 0) return { ...review, reason: 'Ai expresii care au ajuns la momentul potrivit pentru repetare.' };
  const listening = games.find(game => game.id === 'listen');
  if (listening && !listening.progress?.sessions) return { ...listening, reason: 'Începe cu ascultarea: recunoaște sensul cuvintelor și expresiilor în norvegiană.' };
  const candidates = games.filter(game => ['quiz', 'order', 'verbs', 'word'].includes(game.id));
  const ratio = item => Math.max(0, Number(item.progress?.completed) || 0) / Math.max(1, Number(item.progress?.target) || 1);
  const next = candidates.reduce((best, game) => !best || ratio(game) < ratio(best) ? game : best, null) || listening || games[0];
  return next ? { ...next, reason: 'Acordă puțin timp unei abilități mai puțin exersate la nivelul ales.' } : null;
}
