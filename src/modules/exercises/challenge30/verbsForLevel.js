import { courseCatalog } from '../../lessons/norwegian-program/lessonContent';
import { verbsByDay } from './verbs';

export const getVerbSessions = (level) => {
  const offset = { A1: 0, A2: 10, B1: 20, B2: 30 }[level];
  if (offset !== undefined) return verbsByDay.slice(offset, offset + 10);
  const core = (code) => courseCatalog[code].lessons.filter((lesson) => lesson.kind === 'lesson').flatMap((lesson) => lesson.vocabulary).filter(([word]) => /^å /i.test(word));
  const candidates = [...core(level), ...core(level === 'C2' ? 'C1' : 'B2').reverse()];
  const known = new Map();
  candidates.forEach((entry) => { const key = entry[0].toLocaleLowerCase('nb-NO'); if (!known.has(key)) known.set(key, entry); });
  const unique = [...known.values()].slice(0, 30);
  const entries = unique.map(([norwegian, romanian, example, translation]) => ({ norwegian, romanian, example, translation }));
  return Array.from({ length: Math.ceil(entries.length / 3) }, (_, index) => entries.slice(index * 3, index * 3 + 3));
};

export const readVerbProgress = (storage, level, count = 10) => {
  let value;
  try { value = JSON.parse(storage.getItem('challenge_verbs_progress_' + level.toLowerCase())); } catch (_) { /* Use the initial session. */ }
  const day = Math.max(1, Math.min(count, Math.trunc(Number(value?.day) || 1)));
  const completed = Array.isArray(value?.completed) ? [...new Set(value.completed)].filter((id) => Number.isInteger(id) && id >= 1 && id <= count) : Array.from({ length: day - 1 }, (_, index) => index + 1);
  return { day, completed };
};
