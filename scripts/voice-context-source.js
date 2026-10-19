import { courseCatalog } from '../src/modules/lessons/norwegian-program/lessonContent';
import { careerPaths, getCareerLessonModule } from '../src/services/careerProfile';

export const voiceCatalog = Object.fromEntries(Object.entries(courseCatalog).map(([level, course]) => [level,
  Object.fromEntries(course.lessons.map((lesson) => [lesson.id, {
    title: lesson.title, uid: lesson.uid, curriculumVersion: lesson.curriculumVersion, sectionTitle: lesson.sectionTitle,
    objectives: lesson.objectives, vocabulary: lesson.vocabulary, recycledVocabulary: lesson.recycledVocabulary,
    conversationPrompts: lesson.conversationPrompts, production: lesson.production,
    dialogue: lesson.dialogue, grammar: lesson.grammar,
    reading: lesson.reading ? { title: lesson.reading.title, text: lesson.reading.text } : undefined,
    directions: Object.fromEntries(careerPaths.map((path) => {
      const module = getCareerLessonModule(path.id, level, lesson.id, lesson);
      return [path.id, { title: path.title, phrases: module.phrases, scenario: module.scenario }];
    })),
  }])),
]));
