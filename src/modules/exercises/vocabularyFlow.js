import { createPracticeQuestions, normalizePracticeAnswer, shufflePractice } from './practiceGameData';

const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const stem = word => word.replace(/^(?:en|ei|et|å)\s+/i, '').trim();
const family = word => /^å\s/i.test(word) ? 'verb' : /^(en|ei|et)\s/i.test(word) ? 'noun' : 'other';

// Only use attested, unchanged forms from the lesson example. Never invent inflections.
export function vocabularyContext(item) {
  if (!item.example || !item.word) return null;
  for (const candidate of [...new Set([item.word, stem(item.word)])]) {
    if (!candidate) continue;
    const pattern = new RegExp('(?<![\\p{L}\\p{N}])' + escape(candidate) + '(?![\\p{L}\\p{N}])', 'iu');
    const match = pattern.exec(item.example);
    if (match) return { sentence: item.example.slice(0, match.index) + '____' + item.example.slice(match.index + match[0].length), answer: match[0], fullForm: normalizePracticeAnswer(candidate) === normalizePracticeAnswer(item.word) };
  }
  return null;
}

export function createVocabularySession(lessons, random = Math.random) {
  const pool = createPracticeQuestions(lessons, 'quiz', 'normal', random).map(item => ({ ...item, context: vocabularyContext(item) })).filter(item => item.context);
  const seenWords = new Set(), seenMeanings = new Set();
  const words = shufflePractice(pool, random).filter(item => {
    const word = normalizePracticeAnswer(item.word), meaning = normalizePracticeAnswer(item.translation);
    if (seenWords.has(word) || seenMeanings.has(meaning)) return false;
    seenWords.add(word); seenMeanings.add(meaning); return true;
  }).slice(0, 3);
  const recognition = words.map(item => ({ ...item, id: item.id + '-recognize', vocabularyId: item.id, stage: 'recognize' }));
  const contextual = words.map(item => {
    const candidates = shufflePractice(pool.filter(other => family(other.word) === family(item.word) && normalizePracticeAnswer(other.translation) !== normalizePracticeAnswer(item.translation)), random);
    const unique = new Map();
    for (const other of candidates) {
      const value = item.context.fullForm ? other.word : stem(other.word);
      if (normalizePracticeAnswer(value) !== normalizePracticeAnswer(item.context.answer)) unique.set(normalizePracticeAnswer(value), value);
    }
    return { ...item, id: item.id + '-context', vocabularyId: item.id, stage: 'context', type: 'choice', prompt: item.context.sentence, answer: item.context.answer, acceptedAnswers: [item.context.answer], options: shufflePractice([item.context.answer, ...[...unique.values()].slice(0, 2)], random) };
  });
  const recall = words.map(item => ({ ...item, id: item.id + '-recall', vocabularyId: item.id, stage: 'recall', type: 'text', prompt: 'Scrie în norvegiană: ' + item.translation, answer: item.word, acceptedAnswers: [item.word] }));
  return [...recognition, ...contextual, ...recall];
}
