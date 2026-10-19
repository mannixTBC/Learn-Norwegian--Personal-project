import { CURRICULUM_VERSION, curriculumLevels, curriculumPacing } from '../../curriculumMetadata';
import { missionScenariosA1A2 } from './missionScenariosA1A2';
import { missionScenariosB1B2 } from './missionScenariosB1B2';
import { missionScenariosC1C2 } from './missionScenariosC1C2';

const normalize = (text) => String(text).normalize('NFC').toLocaleLowerCase('nb-NO').replace(/[.!?,]/g, '').replace(/\s+/g, ' ').trim();
const unique = (items, key) => [...new Map(items.map((item) => [key(item), item])).values()];
const missionScenarios = { ...missionScenariosA1A2, ...missionScenariosB1B2, ...missionScenariosC1C2 };

const consolidation = (section, core, code) => {
  const scenario = missionScenarios[section.id];
  if (!scenario) throw new Error(`Lipsește scenariul misiunii: ${section.id}`);
  const vocabulary = core.flatMap((lesson) => lesson.vocabulary.slice(0, 2));
  const exercises = core.flatMap((lesson, index) => lesson.exercises.filter((exercise) => exercise.type === ['choice', 'fill', 'order'][index]).slice(0, 1));
  return {
    uid: `${code.toLowerCase()}-${section.id}-mission`, kind: 'consolidation',
    title: `Misiune: ${section.mission}`, duration: scenario.duration || (code.startsWith('C') ? 35 : code.startsWith('B') ? 30 : 25),
    objectives: [section.outcome, 'să reutilizezi expresiile secțiunii fără a consulta mai întâi traducerea', 'să verifici ce poți face singur și ce ai nevoie să repeți'],
    vocabulary, dialogue: scenario.dialogue,
    grammar: { title: 'Leagă ceea ce ai învățat', rule: 'Această misiune consolidează structurile din cele trei lecții. Nu introduce gramatică nouă obligatorie.', examples: core.map((lesson) => lesson.grammar.examples[0]), wrong: core[0].grammar.wrong },
    exercises,
    conversationPrompts: core.map((lesson) => lesson.conversationPrompts[0]),
    production: {
      writingPrompt: scenario.writingPrompt,
      speakingPrompt: `${section.mission.replace(/[.!?]\s*$/, '')}. Susține o conversație sau o prezentare folosind expresiile celor trei lecții.`,
      criteria: ['Am îndeplinit scopul situației și am răspuns la întrebările interlocutorului.', 'Am reutilizat cel puțin trei expresii ale secțiunii în propoziții proprii.', 'Pot identifica o dificultate concretă și o expresie pe care o voi repeta.'],
    },
    recycles: vocabulary.map((entry) => entry[0]),
    buildsOn: `Reunești lecțiile „${core.map((lesson) => lesson.title).join('”, „')}” într-o singură situație.`,
  };
};

// One source for lesson content, overview metadata and the generated AI context.
export const compileCurriculum = (sectionSources) => {
  const knownVocabulary = new Map();
  let previousLesson = null;
  return Object.fromEntries(curriculumLevels.map((definition) => {
    const code = definition.code;
    const lessons = [];
    const sections = sectionSources[code].map((section, sectionIndex) => {
      const all = [...section.lessons, consolidation(section, section.lessons, code)];
      const compiled = all.map((source, localIndex) => {
        const uid = source.uid.startsWith(`${code.toLowerCase()}-`) ? source.uid : `${code.toLowerCase()}-${source.uid}`;
        const recycles = unique((source.recycles || []).map((word) => knownVocabulary.get(normalize(word))).filter(Boolean), (entry) => normalize(entry.entry[0]));
        const introducedVocabulary = source.kind === 'consolidation' ? [] : source.vocabulary.filter((entry) => !knownVocabulary.has(normalize(entry[0])));
        const id = lessons.length + 1;
        const lesson = {
          ...source, uid, id, curriculumVersion: CURRICULUM_VERSION, kind: source.kind || 'lesson',
          sectionId: section.id, sectionNumber: sectionIndex + 1, sectionTitle: section.title, positionInSection: localIndex + 1,
          prerequisites: previousLesson ? [previousLesson.uid] : [],
          previousLesson: previousLesson ? { level: previousLesson.level, id: previousLesson.id, title: previousLesson.title } : null,
          buildsOn: source.buildsOn || (previousLesson ? `Reiei expresii cunoscute din „${previousLesson.title}” și le folosești pentru ${source.objectives[0].replace(/^să /, '')}.` : 'Începi cu formule complete, pe care le vei reutiliza în conversațiile următoare.'),
          recycledVocabulary: recycles, introducedVocabulary,
          reading: source.reading ? { ...source.reading, questionLanguage: source.reading.questionLanguage || (code.startsWith('B') ? 'nb' : 'ro'), answerLanguage: source.reading.answerLanguage || (code.startsWith('B') ? 'nb' : 'ro') } : undefined,
          dialogue: [...(source.bridgeDialogue || []), ...source.dialogue],
          reviewSchedule: [1, 3, 7],
        };
        source.vocabulary.forEach((entry) => {
          if (!knownVocabulary.has(normalize(entry[0]))) knownVocabulary.set(normalize(entry[0]), { entry, level: code, lessonId: id, lessonUid: uid, lessonTitle: source.title });
        });
        previousLesson = { ...lesson, level: code };
        lessons.push(lesson);
        return lesson;
      });
      return { ...section, number: sectionIndex + 1, lessons: compiled };
    });
    return [code, { ...definition, available: true, curriculumVersion: CURRICULUM_VERSION, pacing: curriculumPacing, sections, lessons }];
  }));
};
