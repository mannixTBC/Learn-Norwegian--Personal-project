export const gameProgressTargets = { quiz: 5, order: 5, word: 5 };
export const normalizePracticeAnswer = (value) => String(value || '').normalize('NFC').toLocaleLowerCase('nb-NO').replace(/[.!?,;:“”„«»"]/g, '').replace(/\s+/g, ' ').trim();
export const shufflePractice = (items, random = Math.random) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const next = Math.floor(random() * (index + 1));
    [result[index], result[next]] = [result[next], result[index]];
  }
  return result;
};

export const createPracticeQuestions = (lessons, game, difficulty = 'normal', random = Math.random) => {
  const vocabulary = lessons.flatMap((lesson) => lesson.vocabulary.map(([word, translation, example], index) => ({ id: 'v-' + lesson.uid + '-' + index, lessonId: lesson.id, word, translation, example })));
  if (game === 'quiz') return vocabulary.map((item) => {
    const hard = difficulty === 'hard';
    const validMeanings = new Set(vocabulary.filter((other) => normalizePracticeAnswer(other.word) === normalizePracticeAnswer(item.word)).map((other) => normalizePracticeAnswer(other.translation)));
    const distractors = [...new Map(vocabulary.filter((other) => !validMeanings.has(normalizePracticeAnswer(other.translation))).map((other) => [normalizePracticeAnswer(other.translation), other.translation])).values()];
    const options = shufflePractice([item.translation, ...shufflePractice(distractors, random).slice(0, difficulty === 'easy' ? 2 : 3)], random);
    return { ...item, type: hard ? 'text' : 'choice', prompt: hard ? 'Scrie în norvegiană: „' + item.translation + '”' : 'Ce înseamnă „' + item.word + '”?', answer: hard ? item.word : item.translation,
      acceptedAnswers: hard ? vocabulary.filter((other) => normalizePracticeAnswer(other.translation) === normalizePracticeAnswer(item.translation)).map((other) => other.word) : [item.translation], options };
  }).filter((item) => item.type === 'text' || item.options.length >= 2);
  if (game === 'word') return vocabulary.map((item) => ({ ...item, type: 'word', prompt: item.translation, answer: item.word }));
  return lessons.flatMap((lesson) => [
    ...lesson.exercises.filter((exercise) => exercise.type === 'order').map((exercise, index) => ({ id: 'o-' + lesson.uid + '-' + index, lessonId: lesson.id, type: 'order', prompt: exercise.prompt, answer: exercise.answer.join(' '), words: shufflePractice(exercise.answer, random), explanation: exercise.explanation })),
    ...lesson.dialogue.map((line, index) => { const words = line[1].replace(/[.!?]/g, '').split(/\s+/).filter(Boolean); return { id: 'd-' + lesson.uid + '-' + index, lessonId: lesson.id, type: 'order', prompt: 'Construiește: „' + line[2] + '”', answer: words.join(' '), words: shufflePractice(words, random), explanation: line[1] }; }),
  ]);
};

const progressKey = (game, level, userId) => 'practice_game_v2_' + (userId || 'guest') + '_' + level + '_' + game;
export const readGameProgress = (storage, game, level, userId) => {
  const target = gameProgressTargets[game];
  let value = null;
  try { value = JSON.parse(storage.getItem(progressKey(game, level, userId))); } catch (_) { /* Start with an empty record. */ }
  return { completed: Math.max(0, Math.min(target, Number(value?.completed) || 0)), target, best: Math.max(0, Math.min(100, Number(value?.best) || 0)), sessions: Math.max(0, Number(value?.sessions) || 0) };
};
export const saveGameProgress = (storage, game, level, userId, results) => {
  const previous = readGameProgress(storage, game, level, userId);
  const correct = results.filter((item) => item.correct).length;
  const score = results.length ? Math.round(correct / results.length * 100) : 0;
  const value = { ...previous, completed: Math.min(previous.target, Math.max(previous.completed, correct)), best: Math.max(previous.best, score), sessions: previous.sessions + 1 };
  storage.setItem(progressKey(game, level, userId), JSON.stringify(value));
  return value;
};
