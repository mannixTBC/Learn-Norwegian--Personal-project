import { courseCatalog } from '../lessons/norwegian-program/lessonContent';
import { readCourseProgress, finalTestKey } from '../../services/curriculumProgress';
import { stageFromLearning } from './scenarioStages.mjs';

// Use only current curriculum progress for this account and CEFR level.
export function readStudioLearning(level, user) {
  const lessons = courseCatalog[level]?.lessons || [];
  const { completed } = readCourseProgress(level, user, lessons);
  let finalTestPassed = false;
  try {
    finalTestPassed = localStorage.getItem(finalTestKey(level, 'passed', user)) === 'true';
  } catch { /* Storage may be unavailable; keep the introductory stage. */ }
  return { completed, total: lessons.length, finalTestPassed, stage: stageFromLearning(completed.length, finalTestPassed) };
}
