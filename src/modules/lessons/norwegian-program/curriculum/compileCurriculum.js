import { CURRICULUM_VERSION, curriculumLevels, curriculumPacing } from '../../curriculumMetadata';
import { missionScenariosA1A2 } from './missionScenariosA1A2';
import { missionScenariosB1B2 } from './missionScenariosB1B2';
import { missionScenariosC1C2 } from './missionScenariosC1C2';
import { authorGrammar, C, F, O } from './grammarAuthoring';
import { grammarA1, grammarA2 } from './grammarA1A2';
import { grammarB1, grammarB2 } from './grammarB1B2';
import { grammarC1, grammarC2 } from './grammarC1C2';

const normalize = (text) => String(text).normalize('NFC').toLocaleLowerCase('nb-NO').replace(/[.!?,]/g, '').replace(/\s+/g, ' ').trim();
const unique = (items, key) => [...new Map(items.map((item) => [key(item), item])).values()];
const missionScenarios = { ...missionScenariosA1A2, ...missionScenariosB1B2, ...missionScenariosC1C2 };
const grammarPlans = { ...grammarA1, ...grammarA2, ...grammarB1, ...grammarB2, ...grammarC1, ...grammarC2 };

const sourceReference = (lesson, level) => ({ uid: lesson.uid, id: lesson.id, title: lesson.title, level });

// Each mission retrieves one practiced point from each of its three source lessons.
const missionGrammar = (core, code) => {
  const exercises = [];
  const points = core.map((lesson, index) => {
    const type = ['choice', 'fill', 'order'][index];
    const originalIndex = lesson.exercises.findIndex((exercise) => exercise.type === type);
    const practiced = lesson.grammar.points.find((point) => point.exerciseIndexes.includes(originalIndex));
    const point = practiced || lesson.grammar.points[0];
    let exercise = lesson.exercises[originalIndex];
    if (!practiced) {
      const example = point.examples.find((item) => normalize(item.norwegian) !== normalize(point.contrast.before));
      if (!example) throw new Error(`Lipsește exemplul distinct pentru misiune: ${lesson.uid}`);
      const prompt = `Reconstituie exemplul din „${lesson.title}” pentru sensul: „${example.romanian}”`;
      if (type === 'choice') {
        const correctIndex = lesson.id % 2;
        const options = correctIndex ? [point.contrast.before, example.norwegian] : [example.norwegian, point.contrast.before];
        exercise = C(prompt, options, correctIndex, point.explanation);
      } else if (type === 'order') {
        exercise = O(prompt, example.norwegian.replace(/[.!?]$/, '').split(/\s+/), example.romanian, point.explanation);
      } else {
        const focus = point.focus.find((word) => example.norwegian.toLocaleLowerCase('nb-NO').includes(word.toLocaleLowerCase('nb-NO')));
        if (!focus) throw new Error(`Lipsește reperul pentru completare: ${lesson.uid}`);
        const start = example.norwegian.toLocaleLowerCase('nb-NO').indexOf(focus.toLocaleLowerCase('nb-NO'));
        const answer = example.norwegian.slice(start, start + focus.length);
        exercise = F(prompt, `${example.norwegian.slice(0, start)}___${example.norwegian.slice(start + focus.length)}`, answer, example.romanian, point.explanation);
      }
    }
    exercises.push({ ...exercise, answerRevision: `grammar-mission-v1-${lesson.uid}-${index}` });
    return { ...point, exerciseIndexes: [index], sourceLesson: sourceReference(lesson, code) };
  });
  return {
    exercises,
    grammar: {
      title: 'Trei repere pe care le pui împreună',
      rule: points.map((point) => point.explanation).join(' '),
      examples: points.flatMap((point) => point.examples.map((example) => `${example.norwegian} — ${example.romanian}`)),
      wrong: points[0].contrast.before,
      mode: 'review', points,
    },
  };
};

const consolidation = (section, core, code) => {
  const scenario = missionScenarios[section.id];
  if (!scenario) throw new Error(`Lipsește scenariul misiunii: ${section.id}`);
  const vocabulary = core.flatMap((lesson) => lesson.vocabulary.slice(0, 2));
  return {
    uid: `${code.toLowerCase()}-${section.id}-mission`, kind: 'consolidation',
    title: `Misiune: ${section.mission}`, duration: scenario.duration || (code.startsWith('C') ? 35 : code.startsWith('B') ? 30 : 25),
    objectives: [section.outcome, 'să reutilizezi expresiile secțiunii fără a consulta mai întâi traducerea', 'să verifici ce poți face singur și ce ai nevoie să repeți'],
    vocabulary, dialogue: scenario.dialogue,
    ...missionGrammar(core, code),
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
  const knownGrammar = new Map();
  let previousLesson = null;
  return Object.fromEntries(curriculumLevels.map((definition) => {
    const code = definition.code;
    const lessons = [];
    const sections = sectionSources[code].map((section, sectionIndex) => {
      const core = section.lessons.map((source, index) => {
        const uid = source.uid.startsWith(`${code.toLowerCase()}-`) ? source.uid : `${code.toLowerCase()}-${source.uid}`;
        return authorGrammar({ ...source, uid, id: sectionIndex * 4 + index + 1 }, grammarPlans[uid], code);
      });
      const all = [...core, consolidation(section, core, code)];
      const compiled = all.map((source, localIndex) => {
        const uid = source.uid.startsWith(`${code.toLowerCase()}-`) ? source.uid : `${code.toLowerCase()}-${source.uid}`;
        const recycles = unique((source.recycles || []).map((word) => knownVocabulary.get(normalize(word))).filter(Boolean), (entry) => normalize(entry.entry[0]));
        const introducedVocabulary = source.kind === 'consolidation' ? [] : source.vocabulary.filter((entry) => !knownVocabulary.has(normalize(entry[0])));
        const id = lessons.length + 1;
        const requestedRecall = source.grammar.recallConcept;
        if (requestedRecall && !knownGrammar.has(requestedRecall)) throw new Error(`Recapitulare fără lecție anterioară: ${uid} / ${requestedRecall}`);
        const recalledPoint = source.kind === 'consolidation' ? null : knownGrammar.get(requestedRecall)
          || source.grammar.points.map((point) => knownGrammar.get(point.concept)).find(Boolean);
        const lesson = {
          ...source, uid, id, curriculumVersion: CURRICULUM_VERSION, kind: source.kind || 'lesson',
          grammar: { ...source.grammar, mode: source.grammar.mode || 'learn', recall: recalledPoint || null },
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
        if (lesson.kind === 'lesson') lesson.grammar.points.forEach((point) => {
          knownGrammar.set(point.concept, { ...point, sourceLesson: sourceReference(lesson, code) });
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
