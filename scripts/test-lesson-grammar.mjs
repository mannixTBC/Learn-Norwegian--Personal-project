import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter, Route } from 'react-router-dom';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/lesson-grammar-tests');
await build({ configFile: resolve(root, 'vite.config.js'), logLevel: 'error', plugins: [{
  name: 'grammar-test-services', enforce: 'pre',
  resolveId(id) {
    if (id.endsWith('/AuthContext')) return 'virtual:grammar-auth';
    if (id.endsWith('/supabaseLearning')) return 'virtual:grammar-sync';
    if (id.endsWith('/norwegianSpeech')) return 'virtual:grammar-speech';
    if (id.endsWith('/PremiumGate')) return 'virtual:grammar-premium';
    if (id.endsWith('/VoiceLessonConversation')) return 'virtual:grammar-voice';
  },
  load(id) {
    if (id === 'virtual:grammar-auth') return 'export const useAuth = () => ({ user: { id: "grammar-test" } });';
    if (id === 'virtual:grammar-sync') return 'export const syncLearningProgress = async () => ({}); export const syncStudyActivity = async () => ({});';
    if (id === 'virtual:grammar-premium') return 'export default ({ children }) => children;';
    if (id === 'virtual:grammar-voice') return 'export default () => null;';
    if (id === 'virtual:grammar-speech') return `export const speakNorwegian = async (text, options) => {
      globalThis.grammarSpeech.push({ text, options });
      if (globalThis.grammarAudioMode === 'hold') return new Promise(resolve => options.signal.addEventListener('abort', () => resolve({ cancelled: true }), { once: true }));
      if (globalThis.grammarAudioMode === 'fail') throw Error('Audio offline');
      return { ok: true };
    };`;
  },
}], build: { ssr: true, outDir, emptyOutDir: false, rollupOptions: {
  input: {
    grammar: resolve(root, 'src/modules/lessons/norwegian-program/LessonGrammar.js'),
    catalog: resolve(root, 'src/modules/lessons/norwegian-program/lessonContent.js'),
    lesson: resolve(root, 'src/modules/lessons/norwegian-program/LessonProgram.js'),
    progress: resolve(root, 'src/services/curriculumProgress.js'),
    flow: resolve(root, 'src/modules/lessons/norwegian-program/lessonFlow.js'),
  }, output: { entryFileNames: '[name].mjs' },
} } });
const load = (name) => import(pathToFileURL(resolve(outDir, `${name}.mjs`)));
const { default: Grammar, GrammarHighlight } = await load('grammar');
const { courseCatalog } = await load('catalog');
const { default: LessonProgram } = await load('lesson');
const { lessonResumeKey } = await load('progress');
const { LESSON_STAGE, lessonStepState } = await load('flow');
const normalize = (text) => text.normalize('NFC').toLocaleLowerCase('nb-NO').replace(/[.!?,]/g, '').replace(/\s+/g, ' ').trim();
const all = Object.values(courseCatalog).flatMap((course) => course.lessons.map((lesson) => ({ course, lesson })));
const positions = new Map(all.map(({ lesson }, index) => [lesson.uid, index]));
let points = 0;
for (const { course, lesson } of all) {
  const mission = lesson.kind === 'consolidation';
  assert.equal(lesson.grammar.points.length, mission ? 3 : 2, `${lesson.uid}: focused point count`);
  assert.equal(lesson.grammar.mode, mission ? 'review' : 'learn');
  assert.equal(new Set(lesson.grammar.points.map((point) => point.title)).size, lesson.grammar.points.length, `${lesson.uid}: distinct explanations`);
  const practiced = new Set();
  for (const point of lesson.grammar.points) {
    points += 1;
    assert.ok(['grammar', 'usage'].includes(point.kind));
    assert.ok(point.explanation.length > 50, `${lesson.uid}: substantive explanation`);
    assert.equal(point.examples.length, 2, `${lesson.uid}: two bilingual examples`);
    assert.equal(new Set(point.examples.map((example) => normalize(example.norwegian))).size, 2, `${lesson.uid}: examples must be distinct`);
    point.examples.forEach((example) => assert.ok(example.norwegian && example.romanian));
    assert.notEqual(normalize(point.contrast.before), normalize(point.contrast.after), `${lesson.uid}: useful contrast`);
    assert.ok(point.contrast.explanation.length > 30);
    assert.ok(point.examples.some((example) => point.focus.some((focus) => example.norwegian.toLocaleLowerCase('nb-NO').includes(focus.toLocaleLowerCase('nb-NO')))), `${lesson.uid}: visible focus`);
    assert.ok(point.exerciseIndexes.length);
    point.exerciseIndexes.forEach((index) => {
      assert.ok(lesson.exercises[index], `${lesson.uid}: practiced question exists`);
      practiced.add(index);
    });
    if (mission) {
      const source = course.lessons.find((item) => item.uid === point.sourceLesson.uid);
      assert.ok(source && source.sectionId === lesson.sectionId && source.kind === 'lesson');
      assert.ok(source.grammar.points.some((item) => item.concept === point.concept));
      assert.ok(positions.get(source.uid) < positions.get(lesson.uid));
    }
  }
  assert.ok(practiced.size >= (mission ? 3 : 2), `${lesson.uid}: grammar is applied in at least two questions`);
  if (mission) assert.equal(new Set(lesson.grammar.points.map((point) => point.sourceLesson.uid)).size, 3);
  const recall = lesson.grammar.recall;
  if (recall) {
    assert.ok(!mission);
    const source = all.find((item) => item.lesson.uid === recall.sourceLesson.uid);
    assert.ok(source && source.course.code === recall.sourceLesson.level);
    assert.equal(source.lesson.id, recall.sourceLesson.id);
    assert.ok(positions.get(source.lesson.uid) < positions.get(lesson.uid), `${lesson.uid}: recall comes from an earlier lesson`);
    assert.ok(source.lesson.grammar.points.some((point) => point.concept === recall.concept));
  }
  const fill = lesson.exercises.find((exercise) => exercise.type === 'fill');
  assert.ok(fill.translation, `${lesson.uid}: fill has an explicit target meaning`);
  assert.equal(fill.sentence.split('___').length, 2, `${lesson.uid}: exactly one blank`);
  assert.equal(fill.answerSentence, fill.sentence.replace('___', fill.answer));
}
assert.equal(all.length, 144);
assert.equal(points, 324);
console.log('✓ All 144 lessons: 324 focused points, 648 bilingual examples, practiced questions and earlier source references.');

const storage = new Map();
globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: (key) => storage.delete(key) };
globalThis.window = Object.assign(new EventTarget(), { localStorage, scrollTo() {}, location: { search: '' } });
let mobile = true;
globalThis.document = { documentElement: { classList: { contains: (name) => name === 'is-installed-app' && mobile } } };
globalThis.grammarSpeech = [];
globalThis.grammarAudioMode = 'ok';
const text = (node) => node.children.map((child) => typeof child === 'string' ? child : text(child)).join('');
const nodes = (renderer, className) => renderer.root.findAll((node) => typeof node.type === 'string' && String(node.props.className || '').split(/\s+/).includes(className));
let renderer;
for (const isMobile of [true, false]) {
  mobile = isMobile;
  for (const { course, lesson } of all) {
    storage.clear();
    localStorage.setItem(`${lessonResumeKey(course.code, lesson.id, { id: 'grammar-test' })}_voice_v1`, JSON.stringify(lessonStepState(LESSON_STAGE.GRAMMAR)));
    await act(async () => { renderer = TestRenderer.create(React.createElement(MemoryRouter, { initialEntries: [`/curs/${course.code.toLowerCase()}/${lesson.id}`] }, React.createElement(Route, { path: '/curs/:level/:lessonId', component: LessonProgram })), { createNodeMock: () => ({ scrollTo() {}, focus() {} }) }); });
    assert.equal(nodes(renderer, 'lesson-grammar').length, 1, `${lesson.uid}: actual ${mobile ? 'mobile' : 'web'} route renders grammar`);
    assert.equal(nodes(renderer, 'lesson-grammar__card').length, lesson.grammar.points.length + (lesson.grammar.recall ? 1 : 0));
    assert.equal(nodes(renderer, 'lesson-grammar__audio').length, 2 * (lesson.grammar.points.length + (lesson.grammar.recall ? 1 : 0)));
    assert.ok(!text(renderer.root).includes('Transfer · scriere și vorbire'));
    const reading = nodes(renderer, 'lesson-grammar__reading');
    assert.equal(reading.length, lesson.reading ? 1 : 0);
    if (reading.length) assert.ok(!reading[0].props.open, 'extended reading starts collapsed');
    nodes(renderer, 'lesson-grammar__optional').forEach((node) => assert.ok(!node.props.open));
    nodes(renderer, 'lesson-grammar__source').forEach((node) => assert.match(node.props.href, /^\/curs\/(a1|a2|b1|b2|c1|c2)\/\d+$/));
    await act(async () => renderer.unmount());
  }
}
console.log('✓ All 144 mobile and 144 web grammar routes: correct cards, audio, links, optional reading and no production box.');

const lesson = courseCatalog.A1.lessons[1];
const renderGrammar = async () => act(async () => { renderer = TestRenderer.create(React.createElement(MemoryRouter, null, React.createElement(Grammar, { lesson }))); });
grammarAudioMode = 'hold';
await renderGrammar();
await act(async () => { nodes(renderer, 'lesson-grammar__audio')[0].props.onClick(); });
assert.equal(grammarSpeech.at(-1).text, lesson.grammar.points[0].examples[0].norwegian);
const firstAudio = grammarSpeech.at(-1);
await act(async () => { nodes(renderer, 'lesson-grammar__audio')[1].props.onClick(); });
assert.ok(firstAudio.options.signal.aborted, 'a new example cancels the previous audio');
const secondAudio = grammarSpeech.at(-1);
await act(async () => { nodes(renderer, 'lesson-grammar__audio')[1].props.onClick(); });
assert.ok(secondAudio.options.signal.aborted, 'the playing button stops audio');
await act(async () => { nodes(renderer, 'lesson-grammar__audio')[0].props.onClick(); });
const unmountAudio = grammarSpeech.at(-1);
await act(async () => renderer.unmount());
assert.ok(unmountAudio.options.signal.aborted, 'leaving grammar cancels audio');
grammarAudioMode = 'fail';
await renderGrammar();
await act(async () => { nodes(renderer, 'lesson-grammar__audio')[0].props.onClick(); });
assert.equal(nodes(renderer, 'lesson-grammar__audio-error').length, 1);
grammarAudioMode = 'ok';
await act(async () => { nodes(renderer, 'lesson-grammar__audio')[0].props.onClick(); });
assert.equal(nodes(renderer, 'lesson-grammar__audio-error').length, 0, 'audio can be retried');
await act(async () => renderer.unmount());
await act(async () => { renderer = TestRenderer.create(React.createElement(GrammarHighlight, { text: 'Har du lyst til å gå?', focus: ['lyst til å', 'å', 'gå'] })); });
assert.equal(renderer.root.findAllByType('mark').length, 2, 'phrases are highlighted without nested or duplicate marks');
await act(async () => renderer.unmount());
await act(async () => { renderer = TestRenderer.create(React.createElement(GrammarHighlight, { text: 'Hva er telefonnummeret ditt?', focus: ['er'] })); });
assert.equal(renderer.root.findAllByType('mark').length, 1, 'grammar words are not highlighted inside unrelated nouns');
await act(async () => renderer.unmount());
console.log('✓ Example audio, cancellation, stop, retry and phrase emphasis work without changing exercise scores.');
