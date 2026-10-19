import { CURRICULUM_VERSION } from '../modules/lessons/curriculumMetadata';

const owner = (user) => user?.id || 'guest';
export const courseProgressKey = (level, user) => `curriculum_${CURRICULUM_VERSION}_${owner(user)}_${level.toLowerCase()}_progress`;
export const lessonResumeKey = (level, id, user) => `curriculum_${CURRICULUM_VERSION}_${owner(user)}_${level.toLowerCase()}_${id}_resume`;
export const finalTestKey = (level, field, user) => `curriculum_${CURRICULUM_VERSION}_${owner(user)}_${level.toLowerCase()}_final_${field}`;

export const readCourseProgress = (level, user, lessons) => {
  try {
    const stored = JSON.parse(localStorage.getItem(courseProgressKey(level, user)));
    const ids = new Set(lessons.map((lesson) => lesson.id));
    return {
      unlocked: Math.max(1, Math.min(lessons.length, Number(stored?.unlocked) || 1)),
      completed: [...new Set(Array.isArray(stored?.completed) ? stored.completed : [])].filter((id) => ids.has(id)),
    };
  } catch (_) { return { unlocked: 1, completed: [] }; }
};
