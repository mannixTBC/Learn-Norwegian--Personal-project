const normalize = (value) => String(value ?? '').normalize('NFC').trim().toLocaleLowerCase('nb-NO').replace(/[.!?]+$/g, '').replace(/\s+/g, ' ');
const categories = { choice: 'Alege', fill: 'Completează', order: 'Construiește' };

const validExercise = (exercise, type) => {
  if (exercise?.type !== type || !exercise.prompt) return false;
  if (type === 'choice') return Array.isArray(exercise.options) && exercise.options.length >= 2
    && exercise.options.every((option) => typeof option === 'string' && option.trim())
    && new Set(exercise.options.map(normalize)).size === exercise.options.length
    && Number.isInteger(exercise.answer) && exercise.answer >= 0 && exercise.answer < exercise.options.length;
  if (type === 'fill') return typeof exercise.answer === 'string' && Boolean(exercise.answer.trim());
  return Array.isArray(exercise.words) && Array.isArray(exercise.answer) && exercise.answer.length > 0
    && exercise.words.every((word) => typeof word === 'string' && word.trim())
    && JSON.stringify([...exercise.words].sort()) === JSON.stringify([...exercise.answer].sort());
};

// Each section contributes one task of each type, taken from its teaching
// lessons. Audio is interleaved after sections 2, 4 and 6, never appended from
// numeric lesson positions that change when the curriculum is reorganised.
export const buildExam = (course) => {
  const sections = course.sections || [];
  const audioPool = course.lessons.flatMap((lesson) => (lesson.vocabulary || []).filter((entry) => entry[2]?.trim() && entry[3]?.trim()).map((entry, index) => ({ lesson, text: entry[2], meaning: entry[3], index })));
  const usedAudio = new Set();
  return sections.flatMap((section, sectionIndex) => {
    const teaching = section.lessons.filter((lesson) => lesson.kind !== 'consolidation');
    const fixed = ['choice', 'fill', 'order'].flatMap((type, typeIndex) => {
      const ordered = [...teaching.slice(typeIndex), ...teaching.slice(0, typeIndex)];
      const lesson = ordered.find((candidate) => candidate.exercises.some((exercise) => validExercise(exercise, type)));
      if (!lesson) return [];
      const exercise = lesson.exercises.find((candidate) => validExercise(candidate, type));
      return [{ ...exercise, id: `${lesson.uid}-final-${type}`, lessonId: lesson.id, lessonUid: lesson.uid, sectionId: section.id, sectionTitle: section.title, category: categories[type] }];
    });
    if (![1, 3, 5].includes(sectionIndex)) return fixed;
    const preferred = audioPool.filter((item) => item.lesson.sectionId === section.id && item.lesson.kind !== 'consolidation');
    const rotated = [...preferred.slice(sectionIndex), ...preferred.slice(0, sectionIndex)];
    for (const item of rotated) {
      if (usedAudio.has(normalize(item.text))) continue;
      const alternativeMeanings = new Set(audioPool.filter((candidate) => normalize(candidate.text) === normalize(item.text)).map((candidate) => normalize(candidate.meaning)));
      const distractors = [];
      const meanings = new Set(alternativeMeanings);
      for (const candidate of [...audioPool.filter((entry) => entry.lesson.sectionId === section.id), ...audioPool]) {
        if (meanings.has(normalize(candidate.meaning))) continue;
        distractors.push(candidate.meaning);
        meanings.add(normalize(candidate.meaning));
        if (distractors.length === 2) break;
      }
      if (distractors.length < 2) continue;
      // Rotate the correct position across the three recordings.
      const options = [...distractors];
      options.splice(Math.floor(sectionIndex / 2) % 3, 0, item.meaning);
      usedAudio.add(normalize(item.text));
      return [...fixed, {
        id: `${item.lesson.uid}-final-audio-${item.index}`, type: 'audio', category: 'Ascultă', lessonId: item.lesson.id,
        lessonUid: item.lesson.uid, sectionId: section.id, sectionTitle: section.title,
        prompt: 'Ascultă fraza și alege sensul potrivit.', audioText: item.text,
        options, answer: options.indexOf(item.meaning), explanation: `„${item.text}” — ${item.meaning}`,
      }];
    }
    return fixed;
  });
};

export const isCompleteAnswer = (question, answer) => {
  if (question.type === 'choice' || question.type === 'audio') return Number.isInteger(answer) && answer >= 0 && answer < question.options.length;
  if (question.type === 'fill') return typeof answer === 'string' && Boolean(answer.trim());
  if (question.type !== 'order') return false;
  return Array.isArray(answer) && answer.length === question.answer.length
    && new Set(answer).size === answer.length
    && answer.every((index) => Number.isInteger(index) && index >= 0 && index < question.words.length);
};

export const isCorrectAnswer = (question, answer) => {
  if (!isCompleteAnswer(question, answer)) return false;
  if (question.type === 'choice' || question.type === 'audio') return answer === question.answer;
  if (question.type === 'fill') return normalize(answer) === normalize(question.answer);
  return normalize(answer.map((index) => question.words[index]).join(' ')) === normalize(question.answer.join(' '));
};

export const correctAnswerText = (question) => question.type === 'choice' || question.type === 'audio'
  ? question.options[question.answer]
  : Array.isArray(question.answer) ? question.answer.join(' ') : question.answer;

export const givenAnswerText = (question, answer) => {
  if (question.type === 'order') return Array.isArray(answer) ? answer.map((index) => question.words[index] || '').join(' ') : '';
  if (question.type === 'choice' || question.type === 'audio') return Number.isInteger(answer) ? question.options[answer] || '' : '';
  return typeof answer === 'string' ? answer : '';
};
