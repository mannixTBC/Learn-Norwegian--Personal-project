import { useRef, useState } from 'react';

export const normalizeLessonAnswer = (value) => String(value ?? '').normalize('NFC').trim().toLocaleLowerCase('nb-NO').replace(/\s+/g, ' ');

// Both presentations share answer validation, drafts and the original result.
export default function useLessonExercise({ exercise, index, onResult, onDraft, result, response }) {
  const [value, setValue] = useState(() => String(response?.value ?? (result === true && exercise.type === 'choice' ? exercise.answer : result === true && exercise.type === 'fill' ? exercise.answer : '')));
  const [wordIndexes, setWordIndexes] = useState(() => {
    if (Array.isArray(response?.wordIndexes)) return [...new Set(response.wordIndexes.filter((position) => Number.isInteger(position) && position >= 0 && position < (exercise.words?.length || 0)))];
    const indexes = [];
    if (result === true && exercise.type === 'order') exercise.answer.forEach((word) => {
      const position = exercise.words.findIndex((candidate, candidateIndex) => candidate === word && !indexes.includes(candidateIndex));
      if (position >= 0) indexes.push(position);
    });
    return indexes;
  });
  const [gapAnswers, setGapAnswers] = useState(() => Array.isArray(response?.gapAnswers) ? [...response.gapAnswers] : result === true && exercise.type === 'gaps' ? [...exercise.answer] : []);
  const [outcome, setOutcome] = useState(typeof result === 'boolean' ? result : null);
  const [reviewing] = useState(typeof result === 'boolean');
  const [practicing, setPracticing] = useState(false);
  const recorded = useRef(typeof result === 'boolean');
  const submitted = useRef(typeof result === 'boolean');
  const draft = useRef({ value, wordIndexes, gapAnswers });
  const checked = outcome !== null;
  const words = wordIndexes.map((position) => exercise.words?.[position]);
  const singleGap = exercise.type === 'gaps' && exercise.answer.length === 1;
  const manualCheck = exercise.type === 'fill' || exercise.type === 'order' || (exercise.type === 'gaps' && !singleGap);
  const isComplete = (current) => exercise.type === 'choice' ? current.value !== '' && Number.isInteger(Number(current.value)) && Boolean(exercise.options[Number(current.value)])
    : exercise.type === 'fill' ? Boolean(normalizeLessonAnswer(current.value))
      : exercise.type === 'order' ? current.wordIndexes.length === exercise.words.length
        : current.gapAnswers.length === exercise.answer.length && current.gapAnswers.every((word) => exercise.options.includes(word));
  const complete = isComplete({ value, wordIndexes, gapAnswers });

  const updateDraft = (patch) => {
    if (submitted.current) return;
    const next = { ...draft.current, ...patch };
    draft.current = next;
    setValue(next.value);
    setWordIndexes(next.wordIndexes);
    setGapAnswers(next.gapAnswers);
    if (!practicing) onDraft?.(index, next);
  };
  const submit = (choice = draft.current.value, nextGaps = draft.current.gapAnswers) => {
    const current = { ...draft.current, value: String(choice), gapAnswers: nextGaps };
    if (submitted.current || !isComplete(current)) return;
    const correct = exercise.type === 'choice' ? Number(choice) === exercise.answer
      : exercise.type === 'fill' ? normalizeLessonAnswer(current.value) === normalizeLessonAnswer(exercise.answer)
        : exercise.type === 'order' ? current.wordIndexes.map((position) => exercise.words[position]).join(' ') === exercise.answer.join(' ')
          : nextGaps.every((answer, position) => answer === exercise.answer[position]);
    submitted.current = true;
    draft.current = current;
    setValue(current.value);
    setOutcome(correct);
    if (!recorded.current) {
      recorded.current = true;
      onResult(index, correct, exercise, { ...current, wordIndexes: [...current.wordIndexes], gapAnswers: [...current.gapAnswers] });
    }
  };
  const repeatWrongAnswer = () => {
    if (outcome !== false || !submitted.current) return;
    // Practice stays local: neither its result nor its draft replaces the first attempt.
    submitted.current = false;
    draft.current = { value: '', wordIndexes: [], gapAnswers: [] };
    setValue('');
    setWordIndexes([]);
    setGapAnswers([]);
    setOutcome(null);
    setPracticing(true);
  };
  const addOrderWord = (position) => {
    if (!Number.isInteger(position) || !exercise.words?.[position] || draft.current.wordIndexes.includes(position)) return;
    updateDraft({ wordIndexes: [...draft.current.wordIndexes, position] });
  };
  const removeOrderWord = (position) => updateDraft({ wordIndexes: draft.current.wordIndexes.filter((_, item) => item !== position) });
  const placeGapAnswer = (option, preferredIndex) => {
    if (submitted.current || !exercise.options.includes(option) || draft.current.gapAnswers.includes(option)) return;
    const nextGaps = Array.from({ length: exercise.answer.length }, (_, position) => draft.current.gapAnswers[position] || '');
    const target = Number.isInteger(preferredIndex) ? preferredIndex : nextGaps.findIndex((word) => !word);
    if (target < 0 || target >= nextGaps.length) return;
    nextGaps[target] = option;
    updateDraft({ gapAnswers: nextGaps });
    if (singleGap) submit(draft.current.value, nextGaps);
  };
  const clearGapAnswer = (position) => updateDraft({ gapAnswers: draft.current.gapAnswers.map((word, item) => item === position ? '' : word) });

  return { value, wordIndexes, gapAnswers, words, outcome, reviewing, practicing, checked, complete, singleGap, manualCheck, submitted, updateDraft, submit, repeatWrongAnswer, addOrderWord, removeOrderWord, placeGapAnswer, clearGapAnswer };
}
