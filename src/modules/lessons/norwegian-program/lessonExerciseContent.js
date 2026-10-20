export const lessonExerciseSentence = (exercise) => exercise.sentence || (exercise.type === 'fill'
  ? exercise.prompt.match(/[„“«"]([^”»"]*___[^”»"]*)[”»"]/)?.[1]
  : null);

export const lessonExerciseAnswer = (exercise) => {
  if (exercise.answerSentence) return exercise.answerSentence;
  if (exercise.type === 'choice') return exercise.options[exercise.answer];
  const sentence = lessonExerciseSentence(exercise);
  if (exercise.type === 'fill' && sentence) return sentence.replace('___', exercise.answer);
  if (exercise.type === 'gaps' && sentence) return sentence.split('___').map((part, index) => part + (exercise.answer[index] || '')).join('');
  return Array.isArray(exercise.answer) ? exercise.answer.join(' ') : exercise.answer;
};

export const lessonExerciseReviewPrompt = (exercise) => [exercise.prompt, exercise.context?.description, exercise.translation ? `Sensul cerut: „${exercise.translation}”` : '', lessonExerciseSentence(exercise)].filter(Boolean).join(' ');
