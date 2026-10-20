import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/lesson-exercise-tests');
await build({ configFile: resolve(root, 'vite.config.js'), logLevel: 'error', plugins: [{
  name: 'lesson-exercise-test-services', enforce: 'pre',
  resolveId(id) {
    if (id.endsWith('/AuthContext')) return 'virtual:lesson-auth';
    if (id.endsWith('/supabaseLearning')) return 'virtual:lesson-sync';
    if (id.endsWith('/norwegianSpeech')) return 'virtual:lesson-speech';
    if (id.endsWith('/VoiceLessonConversation')) return 'virtual:lesson-voice';
    if (id.endsWith('/PremiumGate')) return 'virtual:lesson-premium';
  },
  load(id) {
    if (id === 'virtual:lesson-auth') return 'export const useAuth = () => ({ user: globalThis.lessonAppUser });';
    if (id === 'virtual:lesson-sync') return 'export const syncLearningProgress = async () => ({}); export const syncStudyActivity = async () => ({});';
    if (id === 'virtual:lesson-speech') return 'export const speakNorwegian = async (text, options = {}) => { globalThis.lessonSpeech.push({ text, options }); if (globalThis.holdLessonSpeech) return new Promise(resolve => options.signal.addEventListener("abort", () => resolve({ cancelled: true }), { once: true })); return { ok: true }; };';
    if (id === 'virtual:lesson-voice') return 'import React from "react"; export default () => React.createElement("p", { id: "voice-stage" }, "Dialog vocal");';
    if (id === 'virtual:lesson-premium') return 'export default ({ children }) => children;';
  },
}], build: { ssr: true, outDir, emptyOutDir: false, rollupOptions: {
  input: {
    exercise: resolve(root, 'src/modules/lessons/norwegian-program/LessonAppExercise.js'),
    lesson: resolve(root, 'src/modules/lessons/norwegian-program/LessonProgram.js'),
    content: resolve(root, 'src/modules/lessons/norwegian-program/lessonContent.js'),
    progress: resolve(root, 'src/services/curriculumProgress.js'),
    career: resolve(root, 'src/services/careerProfile.js'),
    review: resolve(root, 'src/services/spacedReview.js'),
  }, output: { entryFileNames: '[name].mjs' },
} } });
const load = (name) => import(pathToFileURL(resolve(outDir, `${name}.mjs`)));
const { default: Exercise } = await load('exercise');
const { default: LessonProgram } = await load('lesson');
const { courseCatalog } = await load('content');
const { courseProgressKey, lessonResumeKey, readCurrentLesson } = await load('progress');
const { careerPaths, getCareerLessonModule } = await load('career');
const { readReviewItems } = await load('review');
const storage = new Map();
globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: (key) => storage.delete(key) };
globalThis.window = Object.assign(new EventTarget(), { localStorage, scrollTo() {}, location: { search: '' } });
globalThis.document = { documentElement: { classList: { contains: (name) => name === 'is-installed-app' } } };
globalThis.lessonSpeech = [];
globalThis.holdLessonSpeech = false;
globalThis.lessonAppUser = { id: 'lesson-app-test' };
const text = (node) => node.children.map((child) => typeof child === 'string' ? child : text(child)).join('');
let renderer;
const buttons = () => renderer.root.findAllByType('button');
const button = (label) => buttons().find((node) => text(node).includes(label));
const continueExercise = () => button('Următorul') || button('Continuă');
const byClass = (name) => renderer.root.findAll((node) => typeof node.type === 'string' && String(node.props.className || '').split(/\s+/).includes(name));
const click = async (node) => { assert.ok(node, 'control exists'); assert.ok(!node.props.disabled, 'control is enabled'); await act(async () => node.props.onClick()); };
const renderExercise = async (exercise, extra = {}) => {
  const events = [];
  let continued = 0;
  await act(async () => { renderer = TestRenderer.create(React.createElement(Exercise, { exercise, index: 0, onResult: (...args) => events.push(args), onContinue: () => { continued += 1; }, ...extra }), { createNodeMock: () => ({ focus() {} }) }); });
  return { events, continued: () => continued };
};
const unmount = async () => act(async () => renderer.unmount());

const sampledLessons = Object.values(courseCatalog).flatMap((course, position) => (position < 2 ? [1, 8, 16, 24] : [1, 12, 24]).map((id) => ({ course, lesson: course.lessons.find((item) => item.id === id) })));
assert.equal(sampledLessons.length, 20, 'keep the requested twenty-lesson sample');
for (const { course, lesson } of sampledLessons) {
  const exercises = [...lesson.exercises, getCareerLessonModule('general', course.code, lesson.id, lesson).exercise];
  for (const exercise of exercises) {
    const state = await renderExercise(exercise, { vocabulary: lesson.vocabulary });
    assert.equal(button('Continuă'), undefined, 'no premature advance before answering');
    if (exercise.type === 'choice') {
      assert.equal(button('Verifică'), undefined, 'choices do not require a second confirmation');
      const options = byClass('lapp-options')[0].findAllByType('button');
      const tap = options[exercise.answer].props.onClick;
      await act(async () => { tap(); tap(); });
      assert.ok(options.every((option) => option.props.disabled));
    } else if (exercise.type === 'fill') {
      await act(async () => renderer.root.findByType('input').props.onChange({ target: { value: exercise.answer } }));
      const submit = renderer.root.findByType('form').props.onSubmit;
      await act(async () => { submit({ preventDefault() {} }); submit({ preventDefault() {} }); });
    } else {
      for (const word of exercise.answer) {
        const bank = byClass(exercise.type === 'order' ? 'word-bank' : 'gap-word-bank')[0];
        await click(bank.findAllByType('button').find((node) => text(node) === word && !node.props.disabled));
      }
      if (exercise.type === 'order' || exercise.answer.length > 1) {
        const confirm = button('Verifică').props.onClick;
        await act(async () => { confirm(); confirm(); });
      } else assert.equal(button('Verifică'), undefined, 'a single gap is checked immediately after selecting a word');
    }
    assert.equal(state.events.length, 1, 'one response records exactly one result, even when submitted twice');
    assert.equal(state.events[0][1], true);
    assert.equal(byClass('lapp-exercise__feedback').length, 1);
    const advance = button('Continuă').props.onClick;
    await act(async () => { advance(); advance(); });
    assert.equal(state.continued(), 1, 'repeated Continue taps cannot skip a question');
    await unmount();
  }
}
console.log('✓ 20 sampled A1–C2 lessons: choices, typing, ordering and career gaps; one score per answer and no skipped questions.');

const choice = courseCatalog.A1.lessons[0].exercises[0];
const wrong = await renderExercise(choice);
await click(byClass('lapp-options')[0].findAllByType('button')[0]);
assert.equal(wrong.events[0][1], false);
assert.equal(byClass('is-wrong').length, 2, 'wrong choice and feedback are clearly marked');
assert.ok(text(renderer.root).includes('Salvat la Recapitulare'));
assert.equal(button('Încearcă din nou'), undefined, 'wrong answers may continue without a forced retry');
assert.equal(wrong.continued(), 0, 'feedback stays visible until the learner continues');
const savedResponse = wrong.events[0][3];
await unmount();
const restored = await renderExercise(choice, { result: false, response: savedResponse });
assert.equal(restored.events.length, 0, 'restoring feedback never records another attempt');
assert.equal(byClass('lapp-options')[0].findAllByType('button')[0].props['aria-pressed'], true);
assert.ok(button('Următorul'));
await unmount();

const fill = await renderExercise({ type: 'fill', prompt: 'Completează', answer: 'heter', explanation: 'Numele.' });
const input = () => renderer.root.findByType('input');
await act(async () => input().props.onChange({ target: { value: '  ' } }));
assert.equal(button('Verifică').props.disabled, true);
await act(async () => input().props.onChange({ target: { value: ' HETER ' } }));
await act(async () => renderer.root.findByType('form').props.onSubmit({ preventDefault() {} }));
assert.equal(fill.events[0][1], true, 'keyboard submission accepts normalized input');
await unmount();

const order = await renderExercise({ type: 'order', prompt: 'Construiește', words: ['er', 'det', 'det'], answer: ['det', 'er', 'det'], explanation: 'Ordinea.' });
const bank = () => byClass('word-bank')[0].findAllByType('button');
const firstTap = bank()[1].props.onClick;
await act(async () => { firstTap(); firstTap(); });
assert.equal(byClass('sentence-builder')[0].findAllByType('button').length, 1, 'a repeated tap cannot insert the same token twice');
assert.equal(button('Verifică').props.disabled, true, 'incomplete sentences cannot be submitted');
await click(bank()[0]);
await click(bank()[2]);
await click(button('Verifică'));
assert.equal(order.events[0][1], true, 'repeated words retain their distinct token positions');
await unmount();
console.log('✓ Incorrect feedback persists without rescoring; keyboard input and repeated-word sentences remain usable.');

const user = { id: 'lesson-app-test' };
const key = `${lessonResumeKey('A1', 1, user)}_voice_v1`;
localStorage.setItem(key, '5');
const renderLesson = async () => act(async () => {
  renderer = TestRenderer.create(React.createElement(MemoryRouter, null, React.createElement(LessonProgram, { match: { params: { level: 'a1', lessonId: '1' } } })), { createNodeMock: () => ({ focus() {}, scrollTo() {} }) });
});
await renderLesson();
assert.equal(byClass('lapp-heading').length, 0, 'the exercise stage uses a compact introduction');
assert.equal(byClass('lapp-practice__art').length, 0, 'the exercise illustration is removed');
assert.equal(renderer.root.findAllByType('img').length, 0, 'exercise screens have no decorative illustration');
assert.ok(text(renderer.root).includes('Hai să exersăm'));
assert.equal(renderer.root.findByProps({ 'aria-label': 'Întrebări verificate' }).props['aria-valuenow'], 0);
assert.equal(byClass('lapp-header__back').length, 0, 'the misleading course-exit arrow is replaced by the exercise menu');
assert.ok(button('Meniu'));
assert.equal(byClass('lapp-exercise__back')[0].props.disabled, true, 'the first question cannot navigate out of exercises with Back');
await click(byClass('lapp-options')[0].findAllByType('button')[0]);
assert.equal(readReviewItems().filter((item) => item.source === 'lesson').length, 1);
globalThis.holdLessonSpeech = true;
const play = button('Ascultă').props.onClick;
await act(async () => { void play(); void play(); });
assert.equal(lessonSpeech.length, 1, 'repeated audio taps cannot start overlapping playback');
assert.equal(lessonSpeech[0].text, 'Hva heter du?', 'feedback plays the Norwegian answer');
assert.equal(button('Se redă').props.disabled, true);
await unmount();
assert.equal(lessonSpeech[0].options.signal.aborted, true, 'leaving the exercise cancels its feedback audio');
globalThis.holdLessonSpeech = false;
await renderLesson();
assert.equal(byClass('lapp-options')[0].findAllByType('button')[0].props['aria-pressed'], true, 'reload restores the wrong selected answer');
assert.equal(readReviewItems().filter((item) => item.source === 'lesson').length, 1, 'reload does not duplicate recap items');
await click(continueExercise());
assert.ok(text(renderer.root).includes('Mă numesc Anna'), 'the written question states the intended meaning');
await act(async () => renderer.root.findByType('input').props.onChange({ target: { value: 'he' } }));
const backTap = byClass('lapp-exercise__back')[0].props.onClick;
await act(async () => { backTap(); backTap(); });
assert.ok(text(renderer.root).includes('Răspuns deja verificat'));
assert.equal(byClass('lapp-options')[0].findAllByType('button')[0].props['aria-pressed'], true, 'Back restores the original wrong answer');
assert.ok(byClass('lapp-options')[0].findAllByType('button').every((node) => node.props.disabled), 'reviewed answers stay locked');
assert.equal(readReviewItems().filter((item) => item.source === 'lesson').length, 1, 'reviewing an answer does not duplicate recap items');
await click(continueExercise());
assert.equal(renderer.root.findByType('input').props.value, 'he', 'an unfinished written answer survives Back and forward navigation');
await click(button('Meniu'));
assert.equal(byClass('lapp-header__menu')[0].props['aria-expanded'], true);
await click(button('Etapele lecției'));
const stageButtons = byClass('lapp-exercise-menu__steps')[0].findAllByType('button');
assert.equal(stageButtons[6].props.disabled, true, 'the menu cannot skip unanswered exercises to reach voice');
assert.equal(stageButtons[7].props.disabled, true, 'the menu cannot skip to a completed result');
await click(stageButtons[4]);
assert.equal(byClass('lapp-exercise-menu').length, 0);
assert.equal(byClass('lapp-grammar').length, 1, 'the menu allows reviewing previously learned material');
await click(byClass('lapp-exercise-return')[0]);
assert.equal(renderer.root.findByType('input').props.value, 'he', 'returning from grammar retains the current exercise draft');
await click(button('Meniu'));
assert.ok(renderer.root.findAllByType('a').some((node) => node.props.href === '/invata?nivel=A1'), 'leaving through the menu retains the selected level');
await act(async () => renderer.root.findByType('dialog').props.onCancel({ preventDefault() {} }));
assert.equal(byClass('lapp-exercise-menu').length, 0, 'Escape closes the menu');
await unmount();
await renderLesson();
assert.equal(renderer.root.findByType('input').props.value, 'he', 'reloading resumes at the same unfinished exercise with its draft');
await act(async () => renderer.root.findByType('input').props.onChange({ target: { value: 'heter' } }));
await act(async () => renderer.root.findByType('form').props.onSubmit({ preventDefault() {} }));
await click(button('Ascultă'));
assert.equal(lessonSpeech.at(-1).text, 'Jeg heter Anna.', 'writing feedback plays the full sentence');
await click(button('Continuă'));
assert.ok(text(renderer.root).includes('Hvordan har du det?'), 'word order is linked to the dialogue');
await click(byClass('word-bank')[0].findAllByType('button').find((node) => text(node) === 'Bra'));
await click(byClass('lapp-exercise__back')[0]);
assert.equal(renderer.root.findByType('input').props.value, 'heter');
assert.equal(renderer.root.findByType('input').props.disabled, true, 'a reviewed written response cannot be edited');
await click(continueExercise());
assert.equal(byClass('sentence-builder')[0].findAllByType('button').length, 1, 'unfinished word ordering survives navigation');
await click(byClass('word-bank')[0].findAllByType('button').find((node) => text(node) === 'takk'));
await click(button('Verifică'));
await click(button('Ascultă'));
assert.equal(lessonSpeech.at(-1).text, 'Bra, takk.', 'the complete response includes natural punctuation');
await click(button('Continuă'));
const careerExercise = getCareerLessonModule('general', 'A1', 1, courseCatalog.A1.lessons[0]).exercise;
for (const word of careerExercise.answer) await click(byClass('gap-word-bank')[0].findAllByType('button').find((node) => text(node) === word));
assert.equal(button('Verifică'), undefined, 'the contextual gap does not need a second confirmation');
assert.equal(renderer.root.findByProps({ 'aria-label': 'Întrebări verificate' }).props['aria-valuenow'], 4);
await click(byClass('lapp-exercise__back')[0]);
assert.ok(byClass('sentence-builder')[0].findAllByType('button').every((node) => node.props.disabled), 'reviewed word-order responses remain locked');
await click(continueExercise());
assert.ok(byClass('gap-word-bank')[0].findAllByType('button').every((node) => node.props.disabled), 'reviewed gap responses remain locked');
assert.equal(renderer.root.findByProps({ 'aria-label': 'Întrebări verificate' }).props['aria-valuenow'], 4, 'reviewing completed responses never changes the answered count');
await click(continueExercise());
assert.ok(renderer.root.findByProps({ id: 'voice-stage' }), 'finishing exercises continues to the voice stage despite a wrong answer');
await click(button('Finalizează lecția'));
assert.ok(text(renderer.root).includes('75%'), 'the original wrong answer remains in the lesson score');
assert.equal(readReviewItems().filter((item) => item.source === 'lesson').length, 1);
assert.deepEqual(readCurrentLesson(user, courseCatalog), { level: 'A1', lessonId: 2 });
await unmount();
console.log('✓ Full installed-app lesson: immediate feedback → persisted recap → Continue → voice → original score and next lesson.');
console.log('✓ Back/forward review locks original answers; written and ordered drafts survive navigation and reload; the menu safely reviews stages and exits at the active level.');

document.documentElement.classList.contains = () => false;
localStorage.setItem(key, '5');
localStorage.setItem(`${key}_exercise_index`, '0');
await renderLesson();
const webQuestion = byClass('practice-card')[0];
await click(webQuestion.findByProps({ className: 'choice-list' }).findAllByType('button')[choice.answer]);
await click(webQuestion.findAllByType('button').find((node) => text(node).includes('Verifică răspunsul')));
assert.equal(JSON.parse(localStorage.getItem(`${key}_responses`))[0], undefined, 'a new web attempt clears the old app answer selection');
await unmount();
document.documentElement.classList.contains = (name) => name === 'is-installed-app';
await renderLesson();
assert.equal(byClass('is-wrong').length, 0, 'returning to the app cannot show the previous wrong choice as the current answer');
assert.ok(text(byClass('lapp-exercise__feedback')[0]).includes('Exact!'));
await unmount();
console.log('✓ Alternating web and app keeps the latest result and removes stale answer selections.');

const contextualQuestions = careerPaths.map((path) => getCareerLessonModule(path.id, 'A1', 1, courseCatalog.A1.lessons[0]).exercise);
assert.equal(new Set(contextualQuestions.map((exercise) => exercise.context.description)).size, careerPaths.length, 'each direction has an appropriate situation');
assert.equal(contextualQuestions.find((exercise) => exercise.careerPath === 'hospitality').context.title, 'Prima zi la hotel');
for (const exercise of contextualQuestions) {
  assert.deepEqual(exercise.answer, ['heter']);
  assert.deepEqual(exercise.options, ['heter', 'er', 'har']);
  assert.ok(exercise.translation.includes('Mă numesc Anna'), 'the requested meaning removes the er/heter ambiguity');
}
const contextual = await renderExercise(contextualQuestions[1]);
const wrongGapTap = byClass('gap-word-bank')[0].findAllByType('button').find((node) => text(node) === 'er').props.onClick;
await act(async () => { wrongGapTap(); wrongGapTap(); });
assert.equal(contextual.events.length, 1, 'single-gap answers are scored once on touch');
assert.equal(contextual.events[0][1], false);
assert.ok(text(byClass('lapp-exercise__feedback')[0]).includes('Hei! Jeg heter Anna.'));
assert.ok(byClass('gap-word-bank')[0].findAllByType('button').every((node) => node.props.disabled));
await unmount();

const writing = courseCatalog.A1.lessons[0].exercises[1];
const ambiguousAnswer = await renderExercise(writing);
await act(async () => renderer.root.findByType('input').props.onChange({ target: { value: 'er' } }));
await act(async () => renderer.root.findByType('form').props.onSubmit({ preventDefault() {} }));
assert.equal(ambiguousAnswer.events[0][1], false, 'er is not the requested translation of Mă numesc');
assert.ok(text(renderer.root).includes('Eu sunt Anna'), 'feedback explains the actual distinction');
await unmount();

const multipleGaps = await renderExercise({ type: 'gaps', prompt: 'Completează', sentence: 'Jeg ___ og ___.', answer: ['spiser', 'drikker'], options: ['drikker', 'spiser'], explanation: 'Două verbe.' });
await click(byClass('gap-word-bank')[0].findAllByType('button').find((node) => text(node) === 'spiser'));
assert.equal(multipleGaps.events.length, 0);
assert.equal(button('Verifică').props.disabled, true);
await click(byClass('gap-word-bank')[0].findAllByType('button').find((node) => text(node) === 'drikker'));
assert.equal(multipleGaps.events.length, 0, 'multiple gaps remain editable until manual verification');
await click(button('Verifică'));
assert.equal(multipleGaps.events[0][1], true);
await unmount();
console.log('✓ Clear er/heter meaning, ten contextual directions, immediate single-gap scoring and editable multi-gap answers.');

globalThis.lessonAppUser = { id: 'lesson-app-migration' };
const migrationKey = `${lessonResumeKey('A1', 1, lessonAppUser)}_voice_v1`;
localStorage.setItem(migrationKey, '6');
localStorage.setItem(`${migrationKey}_answers`, JSON.stringify({ 0: true, 1: true, 2: true, 3: true }));
localStorage.setItem(`${migrationKey}_responses`, JSON.stringify({ 3: { gapAnswers: ['Hei'] } }));
await renderLesson();
assert.equal(byClass('lapp--exercises').length, 1, 'an unfinished old session returns to exercises when its contextual question changes');
assert.equal(renderer.root.findByProps({ 'aria-label': 'Întrebări verificate' }).props['aria-valuenow'], 3, 'unchanged answers are preserved, the old context answer is not reused');
await click(continueExercise());
assert.equal(renderer.root.findByType('input').props.value, 'heter', 'legacy correct written answers restore the completed word');
await click(continueExercise());
assert.equal(byClass('sentence-builder')[0].findAllByType('button').length, 2, 'legacy correct order answers restore their tokens');
await click(continueExercise());
assert.equal(byClass('lapp-exercise__feedback').length, 0, 'the revised fourth question awaits a new answer');
assert.ok(text(byClass('lapp-exercise__meaning')[0]).includes('Mă numesc Anna'));
await click(byClass('gap-word-bank')[0].findAllByType('button').find((node) => text(node) === 'heter'));
assert.equal(renderer.root.findByProps({ 'aria-label': 'Întrebări verificate' }).props['aria-valuenow'], 4);
assert.equal(JSON.parse(localStorage.getItem(`${migrationKey}_exercise_versions`))[3], 'greetings-context-v2');
await unmount();
localStorage.setItem(migrationKey, '7');
localStorage.setItem(`${migrationKey}_exercise_versions`, '{}');
localStorage.setItem(courseProgressKey('A1', lessonAppUser), JSON.stringify({ completed: [1], unlocked: 2 }));
await renderLesson();
assert.ok(text(renderer.root).includes('100%'), 'previously completed lessons retain their historical result');
await unmount();
console.log('✓ Old unfinished sessions refresh the changed question without discarding other answers or completed-lesson results.');
