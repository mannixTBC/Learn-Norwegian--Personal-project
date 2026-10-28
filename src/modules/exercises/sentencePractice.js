import {createPracticeQuestions, normalizePracticeAnswer, shufflePractice} from './practiceGameData';

const normalize = normalizePracticeAnswer;
const bag = text => normalize(text).split(' ').sort().join('|');
const promptKey = text => normalize(text).replace(/^construiește\s*:\s*/u, '');

// Keep common short phrases together, without changing their original spelling.
export const sentenceTiles = text => text.replace(/[.!?]/gu, '').match(/\bi (?:dag|morgen|går)\b|\bpå skolen\b|\S+/giu) || [];

export function createSentenceSession(lessons, progress = {}, random = Math.random) {
  const completed = new Set(progress.completed || []);
  const current = lessons[Math.max(0, (progress.unlocked || 1) - 1)] || lessons[0];
  const studied = lessons.filter(lesson => completed.has(lesson.id));
  const eligible = studied.length ? studied : current ? [current] : [];
  let pool = createPracticeQuestions(eligible, 'order', 'normal', random);
  // A small completed pool may include the current lesson, never later lessons.
  if (new Set(pool.map(item => normalize(item.answer))).size < 5 && current && !eligible.includes(current)) {
    pool = pool.concat(createPracticeQuestions([current], 'order', 'normal', random));
  }
  const authored = eligible.concat(current && !eligible.includes(current) ? [current] : []).flatMap(lesson => lesson.exercises || []);
  pool = pool.map(question => {
    const exercise = authored.find(item => item.type === 'order' && normalize(item.answer.join(' ')) === normalize(question.answer) && promptKey(item.prompt) === promptKey(question.prompt));
    const alternatives = (exercise?.acceptedAnswers || []).map(value => Array.isArray(value) ? value.join(' ') : value);
    // Accept only attested equivalents with exactly the available words.
    const equivalents = pool.filter(item => promptKey(item.prompt) === promptKey(question.prompt)).map(item => item.answer);
    const tiles = sentenceTiles(question.answer);
    let words = shufflePractice(tiles, random);
    if (words.length > 1 && normalize(words.join(' ')) === normalize(question.answer)) words = [...words.slice(1), words[0]];
    return {...question, words, acceptedAnswers:[...new Set([question.answer,...alternatives,...equivalents].filter(answer => bag(answer) === bag(question.answer))) ]};
  });
  const unique = [...new Map(pool.map(item => [normalize(item.answer), item])).values()];
  return shufflePractice(unique, random).slice(0, 5).sort((a,b) => a.answer.split(/\s+/u).length - b.answer.split(/\s+/u).length);
}

export function sentenceHint(question, selected) {
  const target = sentenceTiles(question.answer);
  const given = selected.map(index => question.words[index]);
  const position = target.findIndex((word,index) => normalize(word) !== normalize(given[index]));
  if (question.hint) return {text:question.hint, positions:position < 0 ? [] : [position]};
  if (position <= 0) return {text:`Începe propoziția cu „${target[0]}”.`,positions:[0]};
  return {text:`După „${target.slice(0,position).join(' ')}”, așază „${target[position]}”.`,positions:[position]};
}
