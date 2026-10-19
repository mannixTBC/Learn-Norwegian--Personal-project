export const practiceLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export const normalizePracticeLevel = (level) => practiceLevels.includes(level) ? level : 'A1';

export const shuffleItems = (items, random = Math.random) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
};

const normalize = (text) => String(text).trim().toLocaleLowerCase('ro-RO').replace(/[.!?]+$/g, '');
const uniqueBy = (items, key) => [...new Map(items.map((item) => [key(item), item])).values()];

export const buildListeningQuestions = ({ lessons, level, mode = 'words', lessonId = 'all', length = 5, random }) => {
  const normalizedLevel = normalizePracticeLevel(level);
  const allItems = lessons.flatMap((lesson) => mode === 'dialogue'
    ? (lesson.dialogue || []).filter((line) => line[1] && line[2]).map((line, index) => ({
      id: `${lesson.id}-dialogue-${index}`, lessonId: lesson.id, topic: lesson.title, audioText: line[1], answer: line[2],
    }))
    : (lesson.vocabulary || []).filter((entry) => entry[0] && entry[1]).map((entry, index) => ({
      id: `${lesson.id}-word-${index}`, lessonId: lesson.id, topic: lesson.title, audioText: entry[0], answer: entry[1],
    })));
  const pool = uniqueBy(allItems, (item) => normalize(item.audioText));
  const selected = pool.filter((item) => lessonId === 'all' || String(item.lessonId) === String(lessonId));
  return shuffleItems(selected, random).slice(0, length).flatMap((item) => {
    // Prefer distractors from the same lesson; never repeat an answer or use
    // another translation of the exact same recording as a wrong choice.
    const alternateMeanings = new Set(allItems.filter((other) => normalize(other.audioText) === normalize(item.audioText)).map((other) => normalize(other.answer)));
    const candidates = uniqueBy(pool.filter((other) => !alternateMeanings.has(normalize(other.answer))), (other) => normalize(other.answer));
    const nearby = shuffleItems(candidates.filter((other) => other.lessonId === item.lessonId), random);
    const remaining = shuffleItems(candidates.filter((other) => other.lessonId !== item.lessonId), random);
    const distractors = [...nearby, ...remaining].slice(0, 2).map((other) => other.answer);
    if (distractors.length < 2) return [];
    return [{ ...item, id: `listen-${normalizedLevel}-${item.id}`, kind: 'listen', prompt: 'Ce ai auzit?',
      options: shuffleItems([item.answer, ...distractors], random), explanation: `${item.audioText} — ${item.answer}` }];
  });
};

export const buildMissionQuestions = ({ scenes, level, pathId, count = 3, random }) => {
  const levelIndex = practiceLevels.indexOf(normalizePracticeLevel(level));
  if (!scenes?.length || scenes.some((scene) => !scene[4 + levelIndex])) return [];
  const missions = shuffleItems(scenes, random).slice(0, count);
  return missions.flatMap((scene, index) => {
    const [title, context, request, meaning] = scene;
    const response = scene[4 + levelIndex];
    const base = { level, pathId, mission: index + 1, title, context, topic: title, lessonId: `career-${pathId}` };
    const meanings = shuffleItems(scenes.filter((other) => other !== scene), random).slice(0, 2).map((other) => other[3]);
    const replies = shuffleItems(scenes.filter((other) => other !== scene), random).slice(0, 2).map((other) => other[4 + levelIndex]);
    return [
      { ...base, id: `mission-${pathId}-${level}-${scenes.indexOf(scene)}-intent`, kind: 'intent',
        prompt: 'Ce ți se cere?', quote: request, answer: meaning, options: shuffleItems([meaning, ...meanings], random),
        explanation: `„${request}” — ${meaning}` },
      { ...base, id: `mission-${pathId}-${level}-${scenes.indexOf(scene)}-reply`, kind: 'reply',
        prompt: 'Cum răspunzi în această situație?', task: meaning, answer: response,
        options: shuffleItems([response, ...replies], random), explanation: `Replica potrivită: „${response}”. ${meaning}` },
    ];
  });
};

export const practiceProgressKey = ({ game, level, pathId = 'general', userId = 'guest' }) =>
  `norwegian_activity_game_${userId}_${game}_${normalizePracticeLevel(level)}${game === 'missions' ? `_${pathId}` : ''}`;

export const readPracticeProgress = (storage, settings) => {
  try {
    const value = JSON.parse(storage.getItem(practiceProgressKey(settings)));
    return { sessions: Math.max(0, Number(value?.sessions) || 0), best: Math.min(100, Math.max(0, Number(value?.best) || 0)) };
  } catch (_) { return { sessions: 0, best: 0 }; }
};

export const savePracticeProgress = (storage, settings, results) => {
  if (!results.length) return null;
  const previous = readPracticeProgress(storage, settings);
  const score = Math.round(results.filter((item) => item.correct).length / results.length * 100);
  const next = { sessions: previous.sessions + 1, best: Math.max(previous.best, score), last: score };
  storage.setItem(practiceProgressKey(settings), JSON.stringify(next));
  return next;
};
