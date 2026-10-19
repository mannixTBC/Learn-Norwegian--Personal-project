import { curriculumLevels } from './curriculumMetadata';

export const learningLevels = curriculumLevels.map((level) => level.code);

export const getLearningLevel = (search = '') => {
  const requested = new URLSearchParams(search).get('nivel');
  const stored = localStorage.getItem('norwegian_active_level');
  const level = (requested || stored || 'A1').toUpperCase();
  return learningLevels.includes(level) ? level : 'A1';
};

export const levelName = Object.fromEntries(curriculumLevels.map((level) => [level.code, level.title]));
