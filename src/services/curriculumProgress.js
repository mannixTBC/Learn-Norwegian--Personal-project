import { CURRICULUM_VERSION } from '../modules/lessons/curriculumMetadata';
import { LESSON_FLOW_VERSION } from '../modules/lessons/norwegian-program/lessonFlow';

const owner = (user) => user?.id || 'guest';
export const courseProgressKey = (level, user) => `curriculum_${CURRICULUM_VERSION}_${owner(user)}_${level.toLowerCase()}_progress`;
export const lessonResumeKey = (level, id, user) => `curriculum_${CURRICULUM_VERSION}_${owner(user)}_${level.toLowerCase()}_${id}_resume`;
export const finalTestKey = (level, field, user) => `curriculum_${CURRICULUM_VERSION}_${owner(user)}_${level.toLowerCase()}_final_${field}`;
export const currentLessonKey = (user) => `curriculum_${CURRICULUM_VERSION}_${owner(user)}_current_lesson`;

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

export const readCurrentLesson = (user, courses) => {
  const remainingLesson = (course, lessonId) => {
    const index = course.lessons.findIndex((lesson) => lesson.id === lessonId);
    if (index < 0) return null;
    const { completed } = readCourseProgress(course.code, user, course.lessons);
    const lesson = course.lessons.slice(index).find((item) => !completed.includes(item.id));
    return lesson ? { level: course.code, lessonId: lesson.id } : null;
  };
  try {
    const saved = JSON.parse(localStorage.getItem(currentLessonKey(user)));
    const course = courses[saved?.level];
    if (course?.lessons.some((lesson) => lesson.id === saved.lessonId)) return remainingLesson(course, saved.lessonId);
  } catch (_) { /* Recover from existing lesson progress below. */ }

  // Earlier versions did not save a current lesson. Recover only from actual
  // study progress; browsing a level is not evidence that it has been started.
  const orderedCourses = Object.values(courses).reverse();
  for (const course of orderedCourses) {
    const { completed } = readCourseProgress(course.code, user, course.lessons);
    const started = course.lessons.find((lesson) => {
      if (completed.includes(lesson.id)) return false;
      const key = lessonResumeKey(course.code, lesson.id, user);
      try {
        const raw = localStorage.getItem(`${key}_voice_v1`) ?? localStorage.getItem(key);
        const savedStep = JSON.parse(raw);
        const step = typeof savedStep === 'number' ? savedStep : savedStep?.version === LESSON_FLOW_VERSION ? savedStep.step : null;
        return typeof step === 'number' && Number.isFinite(step) && step >= 0;
      } catch (_) { return false; }
    });
    if (started) return { level: course.code, lessonId: started.id };
  }
  for (const course of orderedCourses) {
    const { completed } = readCourseProgress(course.code, user, course.lessons);
    if (!completed.length) continue;
    const lesson = course.lessons.find((item) => !completed.includes(item.id));
    if (lesson) return { level: course.code, lessonId: lesson.id };
  }
  return null;
};
