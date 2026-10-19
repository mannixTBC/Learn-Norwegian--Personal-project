import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/curriculum-assessment-tests');
await build({ configFile: resolve(root, 'vite.config.js'), logLevel: 'error', plugins: [{
  name: 'assessment-test-services', enforce: 'pre',
  resolveId(id) {
    if (id.endsWith('/AuthContext')) return 'virtual:assessment-auth';
    if (id.endsWith('/learningActivity')) return 'virtual:assessment-study';
    if (id.endsWith('/norwegianSpeech')) return 'virtual:assessment-speech';
  },
  load(id) {
    if (id === 'virtual:assessment-auth') return 'export const useAuth = () => ({ user: globalThis.assessmentUser });';
    if (id === 'virtual:assessment-study') return 'export const recordStudyActivity = (event) => globalThis.assessmentEvents.push(event);';
    if (id === 'virtual:assessment-speech') return 'export const speakNorwegian = async () => ({ ok: true });';
  },
}], build: { ssr: true, outDir, emptyOutDir: false, rollupOptions: {
  input: {
    assessment: resolve(root, 'src/modules/lessons/curriculumAssessment.js'),
    screen: resolve(root, 'src/modules/lessons/LevelFinalTest.js'),
    content: resolve(root, 'src/modules/lessons/norwegian-program/lessonContent.js'),
    progress: resolve(root, 'src/services/curriculumProgress.js'),
  }, output: { entryFileNames: '[name].mjs' },
} } });

const load = (name) => import(pathToFileURL(resolve(outDir, `${name}.mjs`)));
const { buildExam, isCompleteAnswer, isCorrectAnswer } = await load('assessment');
const { courseCatalog } = await load('content');
const { default: LevelFinalTest } = await load('screen');
const { finalTestKey } = await load('progress');
const correctOrder = (question) => {
  const used = new Set();
  return question.answer.map((word) => {
    const index = question.words.findIndex((candidate, position) => candidate === word && !used.has(position));
    used.add(index);
    return index;
  });
};
const validatedLevels = [];
for (const course of Object.values(courseCatalog)) {
  if (process.env.CURRICULUM_PARTIAL_TEST === 'true' && course.sections.length !== 6) {
    console.log(`Pending content: ${course.code} has ${course.sections.length}/6 sections; running component integration independently.`);
    continue;
  }
  const exam = buildExam(course);
  assert.equal(exam.length, 21, `${course.code}: 21 tasks`);
  assert.equal(new Set(exam.map((question) => question.id)).size, 21);
  assert.equal(exam.filter((question) => question.type === 'audio').length, 3);
  for (const section of course.sections) assert.deepEqual(exam.filter((question) => question.sectionId === section.id && question.type !== 'audio').map((question) => question.type).sort(), ['choice', 'fill', 'order']);
  for (const question of exam) {
    for (const missing of [undefined, null, false, '', []]) assert.equal(isCorrectAnswer(question, missing), false, `${question.id}: absent answer`);
    const answer = question.type === 'order' ? correctOrder(question) : question.answer;
    assert.equal(isCompleteAnswer(question, answer), true, `${question.id}: valid complete answer`);
    assert.equal(isCorrectAnswer(question, answer), true, `${question.id}: correct answer`);
    if (question.options) {
      assert.equal(new Set(question.options.map((option) => option.toLocaleLowerCase().trim())).size, question.options.length);
      assert.equal(isCompleteAnswer(question, -1), false);
      assert.equal(isCompleteAnswer(question, question.options.length), false);
      assert.equal(isCompleteAnswer(question, String(question.answer)), false);
    }
    if (question.type === 'order') {
      assert.equal(isCompleteAnswer(question, answer.slice(1)), false);
      assert.equal(isCompleteAnswer(question, answer.map(() => 0)), false);
      assert.equal(isCompleteAnswer(question, answer.map(() => 999)), false);
    }
    if (question.type === 'fill') assert.equal(isCorrectAnswer(question, `  ${question.answer.toLocaleUpperCase('nb-NO')}!  `), true);
  }
  validatedLevels.push(course.code);
}
console.log(`✓ ${validatedLevels.join(', ')}: 21 tasks per level, all sections and types covered, valid options and strict answer completeness.`);

const ambiguous = structuredClone(courseCatalog.A1);
const audioLesson = ambiguous.sections[1].lessons[0];
audioLesson.vocabulary[0][2] = 'Hei';
audioLesson.vocabulary[0][3] = 'Salut';
audioLesson.vocabulary[1][2] = 'Hei!';
audioLesson.vocabulary[1][3] = 'Bună';
const ambiguousQuestion = buildExam(ambiguous).find((question) => question.type === 'audio' && question.sectionId === ambiguous.sections[1].id);
assert.equal(ambiguousQuestion.audioText, 'Hei!');
assert.equal(ambiguousQuestion.options[ambiguousQuestion.answer], 'Bună');
assert.equal(ambiguousQuestion.options.includes('Salut'), false, 'another valid translation of the same recording must never be a distractor');
const duplicateChoice = structuredClone(courseCatalog.A1);
const duplicateLesson = duplicateChoice.sections[0].lessons[0];
duplicateLesson.exercises.find((question) => question.type === 'choice').options = ['Hei', 'Hei', 'Nei'];
const replacementChoice = buildExam(duplicateChoice).find((question) => question.type === 'choice' && question.sectionId === duplicateChoice.sections[0].id);
assert.notEqual(replacementChoice.lessonUid, duplicateLesson.uid, 'malformed duplicate options are skipped in favour of another valid task');
console.log('✓ Audio alternatives stay unambiguous; duplicate answer options do not enter the exam.');

const storage = new Map();
globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: (key) => storage.delete(key) };
globalThis.window = { scrollTo() {}, location: { search: '' } };
globalThis.assessmentUser = { id: 'assessment-ana' };
globalThis.assessmentEvents = [];
localStorage.setItem('final_test_best_a1', '100');
let renderer;
const render = (level) => React.createElement(MemoryRouter, null, React.createElement(LevelFinalTest, { match: { params: { level } } }));
await act(async () => { renderer = TestRenderer.create(render('a1'), { createNodeMock: () => ({ focus() {} }) }); });
const mapButtons = () => renderer.root.findByProps({ 'aria-label': 'Navigarea întrebărilor' }).findAllByType('button');
const allButtons = () => renderer.root.findAllByType('button');
const text = (node) => node.children.map((child) => typeof child === 'string' ? child : text(child)).join('');
const button = (phrase) => allButtons().find((node) => text(node).includes(phrase));
const click = async (node) => { assert.ok(node); assert.ok(!node.props.disabled); await act(async () => node.props.onClick()); };
const exam = buildExam(courseCatalog.A1);
await click(mapButtons()[exam.length - 1]);
const blockedFinish = button('Finalizează');
assert.equal(blockedFinish.props.disabled, true);
await act(async () => blockedFinish.props.onClick());
assert.equal(assessmentEvents.length, 0);
for (const [index, question] of exam.entries()) {
  await click(mapButtons()[index]);
  if (question.options) await click(allButtons().filter((node) => node.props['aria-pressed'] !== undefined)[question.answer]);
  else if (question.type === 'fill') await act(async () => renderer.root.findByProps({ id: 'final-answer' }).props.onChange({ target: { value: question.answer } }));
  else {
    const order = correctOrder(question);
    const bank = () => renderer.root.findByProps({ className: 'final-order__bank' }).findAllByType('button');
    const first = bank()[order[0]];
    await act(async () => { first.props.onClick(); first.props.onClick(); });
    assert.equal(renderer.root.findByProps({ className: 'final-order__sentence' }).findAllByType('button').length, 1);
    if (index < exam.length - 1) assert.equal(button('Următoarea').props.disabled, true);
    for (const wordIndex of order.slice(1)) await click(bank()[wordIndex]);
  }
}
const finish = button('Finalizează');
await act(async () => { finish.props.onClick(); finish.props.onClick(); });
assert.equal(assessmentEvents.length, 1, 'one completion event even after repeated click');
assert.equal(localStorage.getItem(finalTestKey('A1', 'best', assessmentUser)), '100');
assert.equal(localStorage.getItem(finalTestKey('A1', 'passed', assessmentUser)), 'true');
assert.equal(localStorage.getItem('final_test_best_a1'), '100', 'legacy scores preserved separately');
assert.ok(renderer.root.findByProps({ id: 'final-production-title' }));
assert.ok(renderer.root.findAllByType('a').some((node) => node.props.href === '/invata?nivel=A2'));
await act(async () => renderer.update(render('c2')));
assert.equal(mapButtons().filter((node) => String(node.props.className).includes('answered')).length, 0, 'level change resets session');
globalThis.assessmentUser = { id: 'assessment-mihai' };
await act(async () => renderer.update(render('a1')));
assert.equal(mapButtons().filter((node) => String(node.props.className).includes('answered')).length, 0, 'user change resets session');
assert.equal(localStorage.getItem(finalTestKey('A1', 'best', assessmentUser)), null, 'progress scoped to user');
await act(async () => renderer.unmount());
console.log('✓ Final test UI: incomplete answer guard, repeated word/finalize protection, separate production, level and user reset.');
