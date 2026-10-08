import { courseCatalog } from '../src/modules/lessons/norwegian-program/lessonContent';
import { careerPaths, getCareerLessonModule } from '../src/services/careerProfile';

export const voiceCatalog = Object.fromEntries(Object.entries(courseCatalog).map(([level, course]) => [level,
  Object.fromEntries(course.lessons.map((lesson) => [lesson.id, {
    title: lesson.title, objectives: lesson.objectives, vocabulary: lesson.vocabulary,
    dialogue: lesson.dialogue, grammar: lesson.grammar,
    directions: Object.fromEntries(careerPaths.map((path) => {
      const module = getCareerLessonModule(path.id, level, lesson.id);
      return [path.id, { title: path.title, phrases: module.phrases, scenario: module.scenario }];
    })),
  }])),
]));
