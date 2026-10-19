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

const normalize = (text) => String(text).normalize('NFC').trim().toLocaleLowerCase('nb-NO').replace(/\s+/g, ' ').replace(/[.!?]+$/g, '');
const uniqueBy = (items, key) => {
  const seen = new Set();
  return items.filter((item) => { const value = key(item); if (seen.has(value)) return false; seen.add(value); return true; });
};
const vocabularyType = (text) => {
  const parts = normalize(text).split(' ');
  return parts.length === 1 || (parts.length === 2 && ['en', 'ei', 'et', 'å'].includes(parts[0])) ? 'word' : 'expression';
};

export const buildListeningQuestions = ({ lessons, level, mode = 'words', lessonId = 'all', length = 5, random }) => {
  const normalizedLevel = normalizePracticeLevel(level);
  const allItems = lessons.flatMap((lesson) => [
    ...(mode === 'words' || mode === 'mixed' ? (lesson.vocabulary || []).filter((entry) => entry[0] && entry[1]).map((entry, index) => ({
      id: `${lesson.id}-word-${index}`, lessonId: lesson.id, topic: lesson.title, audioText: entry[0], answer: entry[1], contentType: vocabularyType(entry[0]),
    })) : []),
    ...(mode === 'dialogue' || mode === 'mixed' ? (lesson.dialogue || []).filter((line) => line[1] && line[2]).map((line, index) => ({
      id: `${lesson.id}-dialogue-${index}`, lessonId: lesson.id, topic: lesson.title, audioText: line[1], answer: line[2], contentType: 'dialogue',
    })) : []),
  ]);
  const audioKeys = new Map();
  const answerKeys = new Map();
  const meaningsByAudio = new Map();
  for (const item of allItems) {
    const audioKey = normalize(item.audioText);
    const answerKey = normalize(item.answer);
    audioKeys.set(item, audioKey);
    answerKeys.set(item, answerKey);
    if (!meaningsByAudio.has(audioKey)) meaningsByAudio.set(audioKey, new Set());
    meaningsByAudio.get(audioKey).add(answerKey);
  }
  const orderedItems = lessonId === 'all' ? allItems : [...allItems.filter((item) => String(item.lessonId) === String(lessonId)), ...allItems.filter((item) => String(item.lessonId) !== String(lessonId))];
  const pool = uniqueBy(orderedItems, (item) => audioKeys.get(item));
  const selected = pool.filter((item) => lessonId === 'all' || String(item.lessonId) === String(lessonId));
  return shuffleItems(selected, random).slice(0, length).flatMap((item) => {
    // Prefer distractors from the same lesson; never repeat an answer or use
    // another translation of the exact same recording as a wrong choice.
    const alternateMeanings = meaningsByAudio.get(audioKeys.get(item));
    const candidates = Array.from({ length: 6 }, () => []);
    const usedMeanings = new Set(alternateMeanings);
    for (const other of pool) {
      const meaning = answerKeys.get(other);
      if (usedMeanings.has(meaning)) continue;
      usedMeanings.add(meaning);
      const rank = (other.contentType === item.contentType ? 0 : other.contentType !== 'dialogue' && item.contentType !== 'dialogue' ? 2 : 4) + (other.lessonId === item.lessonId ? 0 : 1);
      candidates[rank].push(other);
    }
    const distractors = [];
    for (const group of candidates) {
      if (distractors.length === 2) break;
      distractors.push(...shuffleItems(group, random).slice(0, 2 - distractors.length).map((other) => other.answer));
    }
    if (distractors.length < 2) return [];
    return [{ ...item, id: `listen-${normalizedLevel}-${item.id}`, kind: 'listen', prompt: 'Ce ai auzit?',
      options: shuffleItems([item.answer, ...distractors], random), explanation: `${item.audioText} — ${item.answer}` }];
  });
};

const sampleListeningTypes = (questions, length, random) => {
  const groups = shuffleItems(['word', 'expression', 'dialogue'], random).map((type) => shuffleItems(questions.filter((question) => question.contentType === type), random));
  const selected = [];
  while (selected.length < length && groups.some((group) => group.length)) {
    for (const group of groups) { if (group.length && selected.length < length) selected.push(group.pop()); }
  }
  return selected;
};

export const buildAdaptiveListeningQuestions = ({ lessons, level, completed = [], length = 10, random = Math.random }) => {
  if (!lessons.length || length <= 0) return [];
  const completedIds = new Set(completed);
  const currentLesson = lessons.find((lesson) => !completedIds.has(lesson.id)) || lessons[lessons.length - 1];
  const learnedIds = new Set([...completedIds, currentLesson.id]);
  const selectedLessons = lessons.filter((lesson) => learnedIds.has(lesson.id));
  const upcoming = lessons.slice(lessons.indexOf(currentLesson) + 1).filter((lesson) => !learnedIds.has(lesson.id));
  const buildPool = () => buildListeningQuestions({ lessons: selectedLessons, level, mode: 'mixed', length: Infinity, random });
  let pool = buildPool();
  for (const lesson of upcoming) {
    if (pool.length >= length) break;
    selectedLessons.push(lesson);
    pool = buildPool();
  }
  // Keep familiar material first; future lessons only fill the missing places.
  const selected = sampleListeningTypes(pool.filter((question) => learnedIds.has(question.lessonId)), length, random);
  for (const lesson of selectedLessons.filter((item) => !learnedIds.has(item.id))) {
    if (selected.length >= length) break;
    selected.push(...sampleListeningTypes(pool.filter((question) => question.lessonId === lesson.id), length - selected.length, random));
  }
  return shuffleItems(selected, random);
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
