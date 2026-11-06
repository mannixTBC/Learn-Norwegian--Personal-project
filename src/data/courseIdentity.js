import manifest from '../content/generated/course-manifest.json' with {type:'json'};
import { getLanguages, splitCourseStorageKey } from '../languages/runtime.js';
export const bundledCourses = manifest.courses;
export function courseIdentity(language = getLanguages().learningLanguage) {
    const course = bundledCourses.find(item => item.learningLanguage === language);
    if (!course)
        throw new Error(`Course unavailable: ${language}`);
    return { courseId: course.courseId, version: course.version, learningLanguage: course.learningLanguage };
}
export function progressLessonIds(key, courses = bundledCourses) {
    const scoped = splitCourseStorageKey(key);
    const match = /^curriculum_(\d+\.\d+)_[0-9a-f-]{36}_([abc][12])_progress$/.exec(scoped.key);
    return match ? courses.find(course => course.learningLanguage === scoped.learningLanguage && course.version === match[1])
        ?.levels[match[2].toUpperCase()]?.lessons.map(lesson => lesson.id) || null : null;
}
export function courseHeaders(language) {
    const course = courseIdentity(language);
    return { 'X-NordLingo-Course-Id': course.courseId, 'X-NordLingo-Course-Version': course.version };
}
