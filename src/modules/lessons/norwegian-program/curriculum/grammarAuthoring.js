import { grammarFillMeanings } from './grammarFillContext';

// Editorial references: numbers select an existing grammar example; v:N and
// d:N select a bilingual vocabulary example or dialogue line from this lesson.
export const G = (concept, correction, exercises, options = {}) => ({ base: true, concept, correction, exercises, ...options });
export const R = (concept, title, explanation, examples, contrast, exercises, options = {}) => ({ concept, title, explanation, examples, contrast, exercises, ...options });
export const F = (prompt, sentence, answer, translation, explanation) => ({ type: 'fill', prompt, sentence, answer, translation, explanation, answerSentence: sentence.replace('___', answer) });
export const O = (prompt, answer, translation, explanation) => ({ type: 'order', prompt, words: [...answer.slice(1), answer[0]], answer, translation, explanation });
export const C = (prompt, options, answer, explanation) => ({ type: 'choice', prompt, options, answer, explanation });

const example = (reference, lesson) => {
  if (Array.isArray(reference)) return { norwegian: reference[0], romanian: reference[1] };
  if (typeof reference === 'number') {
    const [norwegian, ...meaning] = lesson.grammar.examples[reference].split(' — ');
    return { norwegian, romanian: meaning.join(' — ') };
  }
  const [collection, index] = reference.split(':');
  const entry = collection === 'v' ? lesson.vocabulary[Number(index)] : lesson.dialogue[Number(index)];
  return { norwegian: entry[collection === 'v' ? 2 : 1], romanian: entry[collection === 'v' ? 3 : 2] };
};

const changedWords = (before, after) => {
  const earlier = before.split(/\s+/);
  return after.split(/\s+/).filter((word, index) => word !== earlier[index]).map((word) => word.replace(/^[.,!?;:]+|[.,!?;:]+$/g, '')).filter(Boolean);
};

export const authorGrammar = (lesson, plan, level) => {
  if (!plan || plan.points.length !== 2) throw new Error(`Lipsesc cele două repere editoriale: ${lesson.uid}`);
  const points = plan.points.map((definition) => {
    const examples = (definition.examples || [0, 1]).map((reference) => example(reference, lesson));
    const explanation = definition.explanation || lesson.grammar.rule;
    const before = definition.base ? definition.before || lesson.grammar.wrong : definition.contrast[0];
    const after = definition.base ? typeof definition.correction === 'number' ? examples[definition.correction].norwegian : definition.correction : definition.contrast[1];
    return {
      concept: definition.concept,
      title: definition.title || lesson.grammar.title,
      kind: definition.kind || (level.startsWith('C') ? 'usage' : 'grammar'),
      explanation, examples,
      contrast: { before, after, explanation: definition.reason || (definition.base ? explanation : definition.contrast[2]) },
      focus: definition.focus || changedWords(before, after),
      exerciseIndexes: definition.exercises,
    };
  });
  const exercises = lesson.exercises.map((exercise, index) => {
    if (plan.exercises?.[index]) return { ...plan.exercises[index], answerRevision: `grammar-context-v1-${lesson.uid}-${index}` };
    const meaning = exercise.type === 'fill' && grammarFillMeanings[lesson.uid];
    if (!meaning) return exercise;
    const sentence = exercise.sentence || exercise.prompt.match(/„([^”]*___[^”]*)”/)?.[1];
    if (!sentence) throw new Error(`Lipsește propoziția pentru completare: ${lesson.uid}`);
    return { ...exercise, sentence, translation: meaning, answerSentence: sentence.replace('___', exercise.answer), prompt: `Completează expresia din lecție pentru sensul „${meaning}”`, answerRevision: `grammar-context-v1-${lesson.uid}-${index}` };
  });
  return {
    ...lesson, exercises,
    grammar: {
      title: plan.title || lesson.grammar.title,
      rule: points.map((point) => point.explanation).join(' '),
      examples: points.flatMap((point) => point.examples.map((item) => `${item.norwegian} — ${item.romanian}`)),
      wrong: points[0].contrast.before,
      points, recallConcept: plan.recall,
    },
  };
};
