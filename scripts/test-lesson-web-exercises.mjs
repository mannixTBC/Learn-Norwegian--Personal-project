import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter, Route } from 'react-router-dom';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/lesson-web-exercise-tests');
await build({ configFile: resolve(root, 'vite.config.js'), logLevel: 'error', plugins: [{
  name: 'lesson-web-exercise-test-services', enforce: 'pre',
  resolveId(id) {
    if (id.endsWith('/AuthContext')) return 'virtual:web-exercise-auth';
    if (id.endsWith('/supabaseLearning')) return 'virtual:web-exercise-sync';
    if (id.endsWith('/norwegianSpeech')) return 'virtual:web-exercise-speech';
    if (id.endsWith('/VoiceLessonConversation')) return 'virtual:web-exercise-voice';
    if (id.endsWith('/PremiumGate')) return 'virtual:web-exercise-premium';
  },
  load(id) {
    if (id === 'virtual:web-exercise-auth') return 'export const useAuth = () => ({ user: globalThis.webExerciseUser });';
    if (id === 'virtual:web-exercise-sync') return 'export const syncLearningProgress = async () => ({}); export const syncStudyActivity = async () => ({});';
    if (id === 'virtual:web-exercise-speech') return 'export const speakNorwegian = async () => ({ ok: true });';
    if (id === 'virtual:web-exercise-voice') return 'import React from "react"; export default () => React.createElement("p", { id: "web-voice-stage" }, "Dialog vocal");';
    if (id === 'virtual:web-exercise-premium') return 'export default ({ children }) => children;';
  },
}], build: { ssr: true, outDir, emptyOutDir: false, rollupOptions: {
  input: {
    parts: resolve(root, 'src/modules/lessons/norwegian-program/lessonParts.js'),
    lesson: resolve(root, 'src/modules/lessons/norwegian-program/LessonProgram.js'),
    content: resolve(root, 'src/modules/lessons/norwegian-program/lessonContent.js'),
    progress: resolve(root, 'src/services/curriculumProgress.js'),
    career: resolve(root, 'src/services/careerProfile.js'),
    review: resolve(root, 'src/services/spacedReview.js'),
  }, output: { entryFileNames: '[name].mjs' },
} } });
const load = (name) => import(pathToFileURL(resolve(outDir, `${name}.mjs`)));
const { LessonExercise: Exercise } = await load('parts');
const { default: LessonProgram } = await load('lesson');
const { courseCatalog } = await load('content');
const { lessonResumeKey, readCurrentLesson } = await load('progress');
const { getCareerLessonModule } = await load('career');
const { readReviewItems } = await load('review');

const storage = new Map();
globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: (key) => storage.delete(key) };
globalThis.window = Object.assign(new EventTarget(), { localStorage, scrollTo() {}, location: { search: '' } });
globalThis.document = { documentElement: { classList: { contains: () => false } } };
globalThis.webExerciseUser = { id: 'lesson-web-exercise-test' };

const text = (node) => node.children.map((child) => typeof child === 'string' ? child : text(child)).join('');
let renderer;
const byClass = (name, scope = renderer.root) => scope.findAll((node) => typeof node.type === 'string' && String(node.props.className || '').split(/\s+/).includes(name));
const button = (label, scope = renderer.root) => scope.findAllByType('button').find((node) => text(node).includes(label));
const click = async (node) => {
  assert.ok(node, 'control exists');
  assert.ok(!node.props.disabled, 'control is enabled');
  await act(async () => node.props.onClick());
};
const unmount = async () => act(async () => renderer.unmount());
const renderExercise = async (exercise, extra = {}) => {
  const events = [];
  const drafts = [];
  await act(async () => {
    renderer = TestRenderer.create(React.createElement(Exercise, {
      exercise, index: 0, isMobileActive: true,
      onResult: (...args) => events.push(args), onDraft: (...args) => drafts.push(args), ...extra,
    }), { createNodeMock: () => ({ focus() {} }) });
  });
  return { events, drafts };
};
const write = async (value, scope = renderer.root) => act(async () => scope.findByType('input').props.onChange({ target: { value } }));
const submit = async (scope = renderer.root, twice = false) => {
  const control = byClass('check-button', scope)[0];
  assert.ok(control && !control.props.disabled, 'a complete answer can be submitted');
  const check = control.props.onClick;
  await act(async () => { check(); if (twice) check(); });
};
const addAnswerWords = async (exercise, scope = renderer.root) => {
  for (const word of exercise.answer) {
    const bank = byClass(exercise.type === 'order' ? 'word-bank' : 'gap-word-bank', scope)[0];
    await click(bank.findAllByType('button').find((node) => text(node) === word && !node.props.disabled));
  }
};

const allLessons = Object.values(courseCatalog).flatMap((course) => course.lessons.map((lesson) => ({ course, lesson })));
assert.equal(allLessons.length, 144, 'all six levels are covered');
let audited = 0;
for (const { course, lesson } of allLessons) {
  const exercises = [...lesson.exercises, getCareerLessonModule('general', course.code, lesson.id, lesson).exercise];
  assert.equal(exercises.length, 4);
  for (const exercise of exercises) {
    const state = await renderExercise(exercise);
    assert.equal(byClass('practice-card').length, 1, 'desktop keeps its existing card structure');
    assert.equal(byClass('lapp-exercise').length, 0, 'desktop does not inherit the installed-app design');
    if (exercise.type === 'choice') {
      assert.equal(byClass('check-button').length, 0, 'a choice is checked immediately');
      const options = byClass('choice-list')[0].findAllByType('button');
      const tap = options[exercise.answer].props.onClick;
      await act(async () => { tap(); tap(); });
      assert.ok(options.every((option) => option.props.disabled));
    } else if (exercise.type === 'fill') {
      assert.equal(byClass('check-button')[0].props.disabled, true);
      await write(exercise.answer);
      await submit(renderer.root, true);
    } else {
      if (exercise.type === 'order' || exercise.answer.length > 1) assert.equal(byClass('check-button')[0].props.disabled, true);
      await addAnswerWords(exercise);
      if (exercise.type === 'order' || exercise.answer.length > 1) await submit(renderer.root, true);
      else assert.equal(byClass('check-button').length, 0, 'a single gap is checked immediately');
    }
    assert.equal(state.events.length, 1, `${lesson.uid}/${exercise.type}: duplicate submissions record one result`);
    assert.equal(state.events[0][1], true, `${lesson.uid}/${exercise.type}: the published answer is accepted`);
    assert.equal(state.events[0][2], exercise);
    assert.ok(state.events[0][3] && typeof state.events[0][3] === 'object', 'the selected answer is saved alongside its result');
    assert.equal(byClass('answer-feedback--correct').length, 1);
    const response = state.events[0][3];
    await unmount();
    const restored = await renderExercise(exercise, { result: true, response });
    assert.equal(restored.events.length, 0, 'restoring a checked answer does not score it again');
    assert.equal(byClass('answer-feedback--correct').length, 1);
    assert.ok(byClass('practice-card')[0].findAllByType('button').filter((node) => !text(node).includes('Ascultă')).every((node) => node.props.disabled), 'checked answers stay locked');
    await unmount();
    audited += 1;
  }
}
assert.equal(audited, 576);
console.log('✓ Desktop: all 144 A1–C2 lessons and 576 questions accept their answers once and restore locked feedback.');

const firstLesson = courseCatalog.A1.lessons[0];
const choice = firstLesson.exercises[0];
const wrongIndex = (choice.answer + 1) % choice.options.length;
const wrong = await renderExercise(choice);
const wrongTap = byClass('choice-list')[0].findAllByType('button')[wrongIndex].props.onClick;
await act(async () => { wrongTap(); wrongTap(); });
assert.equal(wrong.events.length, 1);
assert.equal(wrong.events[0][1], false);
assert.equal(button('Încearcă din nou'), undefined, 'a wrong answer does not reopen for retry');
assert.equal(byClass('answer-feedback--wrong').length, 1);
const wrongResponse = wrong.events[0][3];
await unmount();
const restoredWrong = await renderExercise(choice, { result: false, response: wrongResponse });
assert.equal(restoredWrong.events.length, 0);
assert.ok(byClass('choice-list')[0].findAllByType('button')[wrongIndex].props.className.includes('selected'));
assert.ok(byClass('choice-list')[0].findAllByType('button').every((node) => node.props.disabled));
await unmount();

const fillExercise = { type: 'fill', prompt: 'Completează', sentence: 'Jeg ___ Anna.', answer: 'heter', explanation: 'Numele.' };
const fill = await renderExercise(fillExercise);
await write('  ');
assert.equal(byClass('check-button')[0].props.disabled, true, 'whitespace is not an answer');
const earlySubmit = byClass('check-button')[0].props.onClick;
await act(async () => earlySubmit());
assert.equal(fill.events.length, 0, 'even a direct premature submission does not create a score');
await write(' HETER ');
const typedInput = renderer.root.findByType('input');
if (typedInput.props.onKeyDown) {
  const enter = typedInput.props.onKeyDown;
  await act(async () => { enter({ key: 'Enter', preventDefault() {} }); enter({ key: 'Enter', preventDefault() {} }); });
} else {
  const formSubmit = renderer.root.findByType('form').props.onSubmit;
  await act(async () => { formSubmit({ preventDefault() {} }); formSubmit({ preventDefault() {} }); });
}
assert.equal(fill.events.length, 1, 'Enter is guarded against duplicate submission');
assert.equal(fill.events[0][1], true, 'typed answers ignore surrounding whitespace and case');
await unmount();

const draft = await renderExercise(fillExercise);
await write('he');
assert.ok(draft.drafts.some(([index, response]) => index === 0 && response.value === 'he'), 'unfinished text is reported to the lesson');
await unmount();
const restoredDraft = await renderExercise(fillExercise, { response: { value: 'he', wordIndexes: [], gapAnswers: [] } });
assert.equal(renderer.root.findByType('input').props.value, 'he');
assert.equal(renderer.root.findByType('input').props.disabled, false);
assert.equal(restoredDraft.events.length, 0);
await unmount();

const orderExercise = { type: 'order', prompt: 'Construiește', words: ['er', 'det', 'det'], answer: ['det', 'er', 'det'], explanation: 'Ordinea.' };
const ordered = await renderExercise(orderExercise);
const bank = () => byClass('word-bank')[0].findAllByType('button');
const firstTap = bank()[1].props.onClick;
await act(async () => { firstTap(); firstTap(); });
assert.equal(byClass('sentence-builder')[0].findAllByType('button').length, 1, 'double clicks cannot duplicate a word token');
assert.equal(byClass('check-button')[0].props.disabled, true, 'all tokens are needed before checking');
await act(async () => byClass('check-button')[0].props.onClick());
assert.equal(ordered.events.length, 0);
await click(bank()[0]);
await click(bank()[2]);
await click(byClass('sentence-builder')[0].findAllByType('button')[1]);
assert.equal(byClass('sentence-builder')[0].findAllByType('button').length, 2, 'selected words can be removed before checking');
await click(bank()[0]);
await click(byClass('sentence-builder')[0].findAllByType('button')[1]);
await click(bank()[2]);
await submit();
assert.equal(ordered.events[0][1], true, 'duplicate words are distinct movable tokens');
await unmount();

const gapsExercise = { type: 'gaps', prompt: 'Completează', sentence: 'Jeg ___ og ___.', answer: ['spiser', 'drikker'], options: ['drikker', 'spiser'], explanation: 'Două verbe.' };
const multiple = await renderExercise(gapsExercise);
await click(byClass('gap-word-bank')[0].findAllByType('button').find((node) => text(node) === 'spiser'));
assert.equal(multiple.events.length, 0);
assert.equal(byClass('check-button')[0].props.disabled, true);
await click(byClass('gap-word-bank')[0].findAllByType('button').find((node) => text(node) === 'drikker'));
assert.equal(multiple.events.length, 0, 'multiple gaps stay editable until manual verification');
await submit(renderer.root, true);
assert.equal(multiple.events.length, 1);
assert.equal(multiple.events[0][1], true);
await unmount();
for (const exercise of [fillExercise, orderExercise, gapsExercise, {
  type: 'gaps', prompt: 'Completează', sentence: 'Jeg ___ Anna.', answer: ['heter'], options: ['er', 'heter'], explanation: 'Numele.',
}]) {
  const failed = await renderExercise(exercise);
  if (exercise.type === 'fill') {
    await write('er');
    await submit(renderer.root, true);
  } else if (exercise.type === 'order') {
    for (const originalIndex of [0, 1, 2]) await click(byClass('word-bank')[0].findAllByType('button')[originalIndex]);
    await submit(renderer.root, true);
  } else {
    for (const word of exercise.answer.length === 1 ? ['er'] : [...exercise.answer].reverse()) {
      const tap = byClass('gap-word-bank')[0].findAllByType('button').find((node) => text(node) === word).props.onClick;
      await act(async () => { tap(); tap(); });
    }
    if (exercise.answer.length > 1) await submit(renderer.root, true);
  }
  assert.equal(failed.events.length, 1, `${exercise.type}: a wrong answer also scores only once`);
  assert.equal(failed.events[0][1], false);
  assert.equal(byClass('answer-feedback--wrong').length, 1);
  assert.equal(button('Încearcă din nou'), undefined);
  const response = failed.events[0][3];
  await unmount();
  const reloaded = await renderExercise(exercise, { result: false, response });
  assert.equal(reloaded.events.length, 0);
  assert.equal(byClass('answer-feedback--wrong').length, 1, `${exercise.type}: incorrect feedback survives reload`);
  assert.ok(renderer.root.findAllByType('input').every((node) => node.props.disabled));
  assert.ok([...byClass('word-bank'), ...byClass('gap-word-bank'), ...byClass('sentence-builder')].flatMap((node) => node.findAllByType('button')).every((node) => node.props.disabled));
  await unmount();
}
console.log('✓ Desktop edge cases: wrong answers stay locked, Enter scores once, drafts restore, incomplete answers are guarded and duplicate words work.');

storage.clear();
const key = `${lessonResumeKey('A1', 1, webExerciseUser)}_voice_v1`;
localStorage.setItem(key, '5');
let lessonScrollCalls = 0;
const renderLesson = async () => act(async () => {
  renderer = TestRenderer.create(React.createElement(MemoryRouter, { initialEntries: ['/curs/a1/1'] },
    React.createElement(Route, { path: '/curs/:level/:lessonId', component: LessonProgram }),
  ), { createNodeMock: () => ({ focus() {}, scrollTo() { lessonScrollCalls += 1; } }) });
});
const cards = () => byClass('practice-card');
const navigation = () => byClass('lesson-navigation')[0];
await renderLesson();
assert.equal(cards().length, 4, 'desktop retains its four-card exercise list');
assert.equal(byClass('lapp-exercise').length, 0);
assert.ok(lessonScrollCalls > 0, 'the lesson content scroll mock is connected');
assert.ok(button('Răspunde la toate întrebările', navigation()).props.disabled);
await click(byClass('choice-list', cards()[0])[0].findAllByType('button')[wrongIndex]);
const scrollsBeforeDraft = lessonScrollCalls;
await write('he', cards()[1]);
assert.equal(lessonScrollCalls, scrollsBeforeDraft, 'typing in the second desktop card preserves the current scroll position');
const orderQuestion = firstLesson.exercises[2];
await click(byClass('word-bank', cards()[2])[0].findAllByType('button').find((node) => text(node) === orderQuestion.answer[0]));
assert.equal(readReviewItems().filter((item) => item.source === 'lesson').length, 1);
await click(button('Înapoi', navigation()));
assert.equal(byClass('lesson-grammar').length, 1, 'desktop Back reaches grammar');
await click(button('Continuă', navigation()));
assert.ok(byClass('choice-list', cards()[0])[0].findAllByType('button').every((node) => node.props.disabled));
assert.equal(cards()[1].findByType('input').props.value, 'he');
assert.equal(byClass('sentence-builder', cards()[2])[0].findAllByType('button').length, 1);
assert.equal(JSON.parse(localStorage.getItem(`${key}_answers`))[0], false);
assert.equal(JSON.parse(localStorage.getItem(`${key}_responses`))[1].value, 'he');
await unmount();
await renderLesson();
assert.equal(cards().length, 4, 'reload resumes the saved exercise stage');
assert.equal(byClass('answer-feedback--wrong', cards()[0]).length, 1);
assert.equal(cards()[1].findByType('input').props.value, 'he', 'reload preserves the unfinished answer');
assert.equal(byClass('sentence-builder', cards()[2])[0].findAllByType('button').length, 1, 'reload preserves partial word ordering');
await write(firstLesson.exercises[1].answer, cards()[1]);
await submit(cards()[1]);
for (const word of orderQuestion.answer.slice(1)) await click(byClass('word-bank', cards()[2])[0].findAllByType('button').find((node) => text(node) === word && !node.props.disabled));
await submit(cards()[2]);
const career = getCareerLessonModule('general', 'A1', 1, firstLesson).exercise;
await addAnswerWords(career, cards()[3]);
if (career.answer.length > 1) await submit(cards()[3]);
assert.equal(byClass('answer-feedback').length, 4);
assert.ok(!button('Dialog vocal', navigation()).props.disabled, 'all four recorded answers unlock the next stage');
assert.equal(readReviewItems().filter((item) => item.source === 'lesson').length, 1, 'navigation and reload do not duplicate recap items');
await unmount();

document.documentElement.classList.contains = (name) => name === 'is-installed-app';
await renderLesson();
assert.equal(byClass('lapp-exercise__feedback').length, 1, 'the app reads the desktop result');
assert.equal(byClass('gap-word-bank').length, 1, 'the app resumes the last question answered on desktop');
for (let previousQuestion = 0; previousQuestion < 3; previousQuestion += 1) await click(byClass('lapp-exercise__back')[0]);
const appOptions = byClass('lapp-options')[0].findAllByType('button');
assert.equal(appOptions[wrongIndex].props['aria-pressed'], true, 'the app restores the actual wrong desktop choice');
assert.ok(appOptions.every((node) => node.props.disabled));
await click(button('Următorul'));
assert.equal(renderer.root.findByType('input').props.value, firstLesson.exercises[1].answer, 'the app restores the full desktop written response');
assert.equal(renderer.root.findByType('input').props.disabled, true);
await unmount();
document.documentElement.classList.contains = () => false;
await renderLesson();
assert.equal(byClass('answer-feedback').length, 4, 'returning to desktop preserves all original results');
await click(button('Dialog vocal', navigation()));
assert.ok(renderer.root.findByProps({ id: 'web-voice-stage' }));
await click(button('Finalizează lecția', navigation()));
assert.ok(text(renderer.root).includes('75%'), 'reviewing answers and switching devices preserves the original score');
assert.deepEqual(readCurrentLesson(webExerciseUser, courseCatalog), { level: 'A1', lessonId: 2 });
assert.equal(readReviewItems().filter((item) => item.source === 'lesson').length, 1);
await unmount();
console.log('✓ Desktop lesson integration: grammar/back navigation, reload, saved drafts, shared app responses, voice stage, original score and next lesson.');
