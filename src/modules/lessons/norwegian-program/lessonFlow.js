export const LESSON_STEPS = Object.freeze([
  'Introducere',
  'Înainte de ceva nou',
  'Vocabular',
  'Direcția ta',
  'Dialog',
  'Gramatică',
  'Exerciții',
  'Dialog vocal',
  'Rezultat',
]);

export const LESSON_STAGE = Object.freeze({
  INTRO: 0,
  RECALL: 1,
  VOCABULARY: 2,
  CAREER: 3,
  DIALOGUE: 4,
  GRAMMAR: 5,
  EXERCISES: 6,
  VOICE: 7,
  RESULT: 8,
});

export const LESSON_FLOW_VERSION = 2;

const clampStep = (value, maximum) => Math.min(maximum, Math.max(0, Math.trunc(value)));
const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const withRecallStep = (step) => step === 0 ? 0 : step + 1;

// Keep the existing resume key and exercise/voice suffixes. The explicit version
// distinguishes the new nine-step flow from numbers saved by earlier releases.
export const lessonStepState = (step) => ({
  version: LESSON_FLOW_VERSION,
  step: isNumber(step) ? clampStep(step, LESSON_STAGE.RESULT) : LESSON_STAGE.INTRO,
});

export const decodeLessonStep = (current, legacy = 0) => {
  if (current && typeof current === 'object' && !Array.isArray(current)) {
    return current.version === LESSON_FLOW_VERSION && isNumber(current.step)
      ? clampStep(current.step, LESSON_STAGE.RESULT)
      : LESSON_STAGE.INTRO;
  }
  if (current === null || current === undefined) {
    // Before the voice stage existed, a saved result could have no exercise
    // answers. Preserve the previous recovery at exercises, then insert recall.
    return isNumber(legacy) ? withRecallStep(clampStep(legacy, 5)) : LESSON_STAGE.INTRO;
  }
  return isNumber(current) ? withRecallStep(clampStep(current, 7)) : LESSON_STAGE.INTRO;
};

export const readLessonStep = (key, legacyKey, storage = globalThis.localStorage) => {
  const read = (storageKey) => {
    try { return JSON.parse(storage.getItem(storageKey)); } catch (_) { return null; }
  };
  return decodeLessonStep(read(key), legacyKey ? read(legacyKey) : 0);
};
