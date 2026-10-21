import { isCorrectAnswer } from './curriculumAssessment';

export const SECTION_TEST_VERSION = 1;
export const buildSectionTest = (section) => {
  const lessons = section.lessons.filter(l => l.kind !== 'consolidation');
  const questions = [];
  const attach = (exercise, lesson, category, suffix) => ({ ...exercise, id: `${section.id}-${suffix}`, lessonId: lesson.id, lessonUid: lesson.uid, lessonTitle: lesson.title, category });
  ['choice', 'choice', 'fill', 'order'].forEach((type, index) => {
    const rotated = [...lessons.slice(index % lessons.length), ...lessons.slice(0, index % lessons.length)];
    const lesson = rotated.find(l => l.exercises.some(e => e.type === type));
    if (!lesson) throw new Error(`Missing ${type}: ${section.id}`);
    questions.push(attach(lesson.exercises.find(e => e.type === type), lesson, type === 'choice' ? 'Înțelegere' : 'Construirea frazelor', index));
  });
  const pool = lessons.flatMap(lesson => lesson.vocabulary.map(entry => ({ lesson, entry })));
  [0, 1].forEach((slot) => {
    const item = pool.find(p => p.lesson.uid === lessons[(slot + 1) % lessons.length].uid);
    const options = [...new Set(pool.map(p => p.entry[3]).filter(t => t && t !== item.entry[3]))].slice(0, 2);
    options.splice(slot, 0, item.entry[3]);
    questions.push(attach({ type: 'audio', prompt: 'Ascultă fraza și alege sensul potrivit.', audioText: item.entry[2], options, answer: slot, explanation: `${item.entry[2]} — ${item.entry[3]}` }, item.lesson, 'Ascultare', `audio-${slot}`));
  });
  const mission = section.lessons.find(l => l.kind === 'consolidation');
  const lines = mission.dialogue;
  const practical = [1, lines.length - 1].map((index) => ({ cue: lines[index - 1][1], intent: lines[index][2], model: lines[index][1], lessonId: mission.id }));
  return { questions, practical, mission };
};
export const sectionTestSummary = (questions, answers) => {
  const wrong = questions.filter(q => !isCorrectAnswer(q, answers[q.id]));
  return { wrong, correct: questions.length - wrong.length, groups: [...new Set(questions.map(q => q.category))].map(label => {
    const items = questions.filter(q => q.category === label);
    return { label, total: items.length, correct: items.filter(q => isCorrectAnswer(q, answers[q.id])).length };
  }) };
};
