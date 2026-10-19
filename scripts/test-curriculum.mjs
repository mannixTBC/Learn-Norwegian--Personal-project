import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/curriculum-tests');
const entry = (file) => resolve(root, file);
await build({ configFile: entry('vite.config.js'), logLevel: 'error', plugins: [{
  name: 'curriculum-test-auth', enforce: 'pre',
  resolveId(id) { if (id.endsWith('/AuthContext')) return 'virtual:curriculum-auth'; if (id.endsWith('/supabaseLearning')) return 'virtual:curriculum-sync'; },
  load(id) { if (id === 'virtual:curriculum-auth') return 'export const useAuth = () => ({ user: { id: "curriculum-test" } });'; if (id === 'virtual:curriculum-sync') return 'export const syncLearningProgress = async () => ({}); export const syncStudyActivity = async () => ({});'; },
}], build: { ssr: true, outDir, emptyOutDir: false, rollupOptions: {
  input: { review: entry('src/services/spacedReview.js'), catalog: entry('src/modules/lessons/norwegian-program/lessonContent.js'), overview: entry('src/modules/lessons/courseData.js'), progress: entry('src/services/curriculumProgress.js'), hub: entry('src/modules/lessons/LearningHub.js'), practice: entry('src/modules/lessons/norwegian-program/CurriculumPractice.js'), career: entry('src/services/careerProfile.js'), lesson: entry('src/modules/lessons/norwegian-program/LessonProgram.js') },
  output: { entryFileNames: '[name].mjs' },
} } });
const load = (name) => import(pathToFileURL(resolve(outDir, `${name}.mjs`)));
const { courseCatalog } = await load('catalog');
const { levelLessons, levelDetails } = await load('overview');
const { courseProgressKey, finalTestKey, lessonResumeKey, readCourseProgress } = await load('progress');
const { getCareerLessonModule, careerPaths } = await load('career');
const { default: LearningHub } = await load('hub');
const { CurriculumProduction, CurriculumRecall } = await load('practice');
const { default: LessonProgram } = await load('lesson');
const { saveReviewItem, rateReviewItem, getDueReviewItems } = await load('review');
const normalize = (text) => text.normalize('NFC').toLocaleLowerCase('nb-NO').replace(/[.!?,]/g, '').replace(/\s+/g, ' ').trim();
const seenUids = new Set();
const known = new Set();
let vocabulary = 0;
let readings = 0;
assert.deepEqual(Object.keys(courseCatalog), ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
for (const [level, course] of Object.entries(courseCatalog)) {
  assert.equal(course.sections.length, 6, `${level} sections`);
  assert.equal(course.lessons.length, 24, `${level} lessons`);
  assert.equal(levelLessons[level].length, course.lessons.length);
  assert.equal(levelDetails[level].minutes, course.lessons.reduce((sum, lesson) => sum + lesson.duration, 0));
  for (const section of course.sections) {
    assert.equal(section.lessons.length, 4);
    assert.equal(section.lessons.filter((lesson) => lesson.kind === 'consolidation').length, 1);
    if (['B1', 'B2', 'C1', 'C2'].includes(level)) assert.ok(section.lessons.some((lesson) => lesson.reading), `${level}/${section.id}: substantial reading`);
    for (const lesson of section.lessons) {
      assert.ok(!seenUids.has(lesson.uid), `unique lesson UID: ${lesson.uid}`);
      seenUids.add(lesson.uid);
      assert.equal(lesson.id, course.lessons.indexOf(lesson) + 1);
      assert.equal(lesson.objectives.length, 3);
      assert.equal(lesson.vocabulary.length, 6);
      assert.ok(lesson.dialogue.length >= 6);
      assert.equal(lesson.conversationPrompts.length, 3);
      assert.ok(lesson.conversationPrompts.every((pair) => pair.length === 2 && pair.every(Boolean)));
      assert.ok(lesson.production.writingPrompt && lesson.production.speakingPrompt && lesson.production.criteria.length >= 3);
      assert.equal(lesson.exercises.length, 3);
      assert.ok(lesson.grammar.title && lesson.grammar.rule && lesson.grammar.examples.length >= 2);
      for (const item of lesson.vocabulary) assert.ok(item.length >= 4 && item.slice(0, 4).every((text) => typeof text === 'string' && text.trim()), `${lesson.uid}: complete bilingual vocabulary`);
      if (seenUids.size > 1) assert.ok(lesson.recycledVocabulary.length >= 2, `${lesson.uid}: at least two earlier expressions must return`);
      for (const recycled of lesson.recycledVocabulary) {
        assert.ok(known.has(normalize(recycled.entry[0])), `${lesson.uid}: recycled expression is already known`);
        assert.ok(seenUids.has(recycled.lessonUid), `${lesson.uid}: source exists`);
      }
      if (lesson.kind === 'consolidation') assert.equal(lesson.introducedVocabulary.length, 0);
      for (const exercise of lesson.exercises) {
        if (exercise.type === 'choice') { assert.ok(Number.isInteger(exercise.answer)); assert.ok(exercise.options[exercise.answer]); assert.equal(new Set(exercise.options).size, exercise.options.length); }
        else if (exercise.type === 'order') {
          assert.deepEqual([...exercise.words].sort(), [...exercise.answer].sort(), `${lesson.uid}: order has the exact token multiset`);
        } else assert.equal(exercise.type, 'fill');
      }
      if (lesson.reading) {
        readings += 1;
        const words = lesson.reading.text.trim().split(/\s+/).length;
        assert.ok(words >= ({ B1: 110, B2: 150, C1: 180, C2: 220 }[level] || 1), `${lesson.uid}: reading has ${words} words`);
        assert.ok(lesson.reading.question && lesson.reading.answer && lesson.reading.explanation);
      }
      for (const path of careerPaths) {
        const module = getCareerLessonModule(path.id, level, lesson.id, lesson);
        assert.ok(module.phrases.length >= 2);
        assert.ok(module.exercise.options.length >= 2, `${lesson.uid}/${path.id}: meaningful distinct answers`);
        assert.ok(module.exercise.sentence.includes('___'), `${lesson.uid}/${path.id}: usable contextual gap`);
      }
      if (lesson.kind === 'consolidation') {
        assert.equal(new Set(lesson.dialogue.map((line) => line[0])).size, 2, `${lesson.uid}: one coherent situation with two roles`);
        const dialogue = normalize(lesson.dialogue.map((line) => line[1]).join(' '));
        const repeated = lesson.recycledVocabulary.filter(({ entry }) => dialogue.includes(normalize(entry[0]).replace(/^(å|en|ei|et)\s+/, '')));
        assert.ok(repeated.length >= 3, `${lesson.uid}: at least three recalled expressions reappear in the mission dialogue`);
      }
      lesson.vocabulary.forEach((item) => known.add(normalize(item[0])));
      vocabulary += lesson.introducedVocabulary.length;
    }
  }
}
console.log(`✓ Six connected levels, 144 lessons, ${vocabulary} introduced expressions, ${readings} extended readings.`);

const data = new Map();
globalThis.localStorage = { getItem: (key) => data.get(key) || null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
globalThis.window = Object.assign(new EventTarget(), { localStorage: globalThis.localStorage, scrollTo() {}, location: { search: '' } });
const user = { id: 'curriculum-test' };
localStorage.setItem('lesson_prog_progress', JSON.stringify({ completed: [1, 2, 3], unlocked: 4 }));
assert.deepEqual(readCourseProgress('A1', user, courseCatalog.A1.lessons), { unlocked: 1, completed: [] }, 'old numbers must not complete unrelated new lessons');
localStorage.setItem(courseProgressKey('A1', user), JSON.stringify({ completed: [1, 1, 999, -1], unlocked: 99 }));
assert.deepEqual(readCourseProgress('A1', user, courseCatalog.A1.lessons), { unlocked: 24, completed: [1] });
assert.notEqual(courseProgressKey('A1', user), courseProgressKey('A1', { id: 'another' }));
assert.notEqual(lessonResumeKey('A1', 1, user), lessonResumeKey('C1', 1, user));
assert.notEqual(finalTestKey('A1', 'best', user), 'final_test_best_a1');
assert.ok(localStorage.getItem('lesson_prog_progress'), 'legacy history remains untouched');
console.log('✓ Versioned user progress, valid completion IDs and preserved legacy history.');

const reviewNow = Date.now();
const day = 86400000;
saveReviewItem({ id: 'curriculum-schedule-check', level: 'C2', prompt: 'Ce înseamnă uttrykk?', answer: 'expresie', dueAt: new Date(reviewNow + day).toISOString() });
assert.equal(getDueReviewItems('C2', reviewNow).length, 0);
assert.equal(getDueReviewItems('C2', reviewNow + day).length, 1);
const firstReview = rateReviewItem('curriculum-schedule-check', 'good', reviewNow + day);
assert.equal(firstReview.intervalDays, 3);
const nextReview = rateReviewItem('curriculum-schedule-check', 'good', reviewNow + day * 4);
assert.equal(nextReview.intervalDays, 7);
console.log('✓ New expressions enter review after one day; successful recall expands intervals to three and seven days.');

for (const level of Object.keys(courseCatalog)) {
  let renderer;
  await act(async () => { renderer = TestRenderer.create(React.createElement(MemoryRouter, { initialEntries: [`/invata?nivel=${level}`] }, React.createElement(LearningHub))); });
  const tabs = renderer.root.findAllByProps({ role: 'tab' });
  assert.equal(tabs.length, 6);
  assert.equal(tabs.filter((tab) => tab.props['aria-selected']).length, 1);
  assert.equal(tabs.filter((tab) => tab.props.tabIndex === 0).length, 1);
  assert.equal(localStorage.getItem('norwegian_active_level'), level);
  const sectionButtons = renderer.root.findAll((node) => node.type === 'button' && node.props.className === 'curriculum-section__toggle');
  assert.equal(sectionButtons.length, 6);
  await act(async () => sectionButtons[5].props.onClick());
  assert.equal(sectionButtons[5].props['aria-expanded'], true);
  await act(async () => tabs.find((tab) => tab.props['aria-selected']).props.onKeyDown({ key: 'End', preventDefault() {} }));
  assert.equal(renderer.root.findByProps({ id: 'curriculum-tab-C2' }).props['aria-selected'], true);
  await act(async () => renderer.root.findByProps({ id: 'curriculum-tab-C2' }).props.onKeyDown({ key: 'ArrowRight', preventDefault() {} }));
  assert.equal(renderer.root.findByProps({ id: 'curriculum-tab-A1' }).props['aria-selected'], true);
  await act(async () => renderer.unmount());
}
console.log('✓ Section navigation renders at every level, including C1 and C2.');

const lesson = courseCatalog.C1.lessons[2];
let renderer;
await act(async () => { renderer = TestRenderer.create(React.createElement(CurriculumProduction, { lesson, level: 'C1' })); });
await act(async () => renderer.root.findByType('textarea').props.onChange({ target: { value: 'Jeg vil gjerne presisere poenget.' } }));
await act(async () => renderer.unmount());
await act(async () => { renderer = TestRenderer.create(React.createElement(CurriculumProduction, { lesson, level: 'C1' })); });
assert.equal(renderer.root.findByType('textarea').props.value, 'Jeg vil gjerne presisere poenget.');
await act(async () => renderer.unmount());
await act(async () => { renderer = TestRenderer.create(React.createElement(CurriculumRecall, { lesson, level: 'C1' })); });
assert.ok(renderer.root.findAllByType('article').length >= 2);
await act(async () => renderer.unmount());
console.log('✓ Transfer drafts persist and earlier vocabulary is explicitly reactivated.');

const a1Progress = { unlocked: 3, completed: [1, 2] };
const c1Progress = { unlocked: 7, completed: [3, 4, 5, 6] };
localStorage.setItem(courseProgressKey('A1', user), JSON.stringify(a1Progress));
localStorage.setItem(courseProgressKey('C1', user), JSON.stringify(c1Progress));
localStorage.setItem(`${lessonResumeKey('A1', 1, user)}_voice_v1`, '1');
const renderLesson = (level, id) => React.createElement(MemoryRouter, null, React.createElement(LessonProgram, { match: { params: { level, lessonId: String(id) } } }));
await act(async () => { renderer = TestRenderer.create(renderLesson('a1', 1)); });
assert.ok(renderer.root.findByProps({ className: 'lesson-content lesson-content--step-1' }));
await act(async () => renderer.update(renderLesson('c1', 7)));
assert.ok(renderer.root.findByProps({ className: 'lesson-content lesson-content--step-0' }));
assert.deepEqual(readCourseProgress('C1', user, courseCatalog.C1.lessons), c1Progress, 'switching levels must not write the previous level state');
assert.deepEqual(readCourseProgress('A1', user, courseCatalog.A1.lessons), a1Progress);
await act(async () => renderer.unmount());
console.log('✓ Switching lesson routes resets the session without overwriting another level’s progress.');
