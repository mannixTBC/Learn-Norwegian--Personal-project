import { courseCatalog } from './norwegian-program/lessonContent';

export const levels = Object.values(courseCatalog).map(({ code, title, description }) => ({ code, title, description, available: true }));
export const levelLessons = Object.fromEntries(Object.entries(courseCatalog).map(([code, course]) => [code, course.lessons.map((lesson) => ({
  id: lesson.id, uid: lesson.uid, number: String(lesson.id).padStart(2, '0'), title: lesson.title,
  description: lesson.objectives[0], duration: `${lesson.duration} min`, vocabulary: lesson.vocabulary.length,
  topics: [lesson.sectionTitle, lesson.grammar.title], kind: lesson.kind, sectionId: lesson.sectionId,
}))]));
export const levelDetails = Object.fromEntries(Object.entries(courseCatalog).map(([code, course]) => [code, {
  heading: `${course.title}: ${course.sections[0].title}`, outcome: course.outcome,
  minutes: course.lessons.reduce((total, lesson) => total + lesson.duration, 0),
  words: course.lessons.reduce((total, lesson) => total + lesson.introducedVocabulary.length, 0),
}]));
export const a1Lessons = levelLessons.A1;
export const a2Lessons = levelLessons.A2;
export const b1Lessons = levelLessons.B1;
export const b2Lessons = levelLessons.B2;
export const c1Lessons = levelLessons.C1;
export const c2Lessons = levelLessons.C2;
