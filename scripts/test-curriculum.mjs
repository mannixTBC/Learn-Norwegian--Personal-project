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
  input: { review: entry('src/services/spacedReview.js'), catalog: entry('src/modules/lessons/norwegian-program/lessonContent.js'), overview: entry('src/modules/lessons/courseData.js'), progress: entry('src/services/curriculumProgress.js'), hub: entry('src/modules/lessons/LearningHub.js'), practice: entry('src/modules/lessons/norwegian-program/CurriculumPractice.js'), career: entry('src/services/careerProfile.js'), lesson: entry('src/modules/lessons/norwegian-program/LessonProgram.js'), flow: entry('src/modules/lessons/norwegian-program/lessonFlow.js') },
  output: { entryFileNames: '[name].mjs' },
} } });
const load = (name) => import(pathToFileURL(resolve(outDir, `${name}.mjs`)));
const { courseCatalog } = await load('catalog');
const { levelLessons, levelDetails } = await load('overview');
const { courseProgressKey, currentLessonKey, finalTestKey, lessonResumeKey, readCourseProgress, readCurrentLesson } = await load('progress');
const { getCareerLessonModule, careerPaths } = await load('career');
const { default: LearningHub } = await load('hub');
const { CurriculumProduction, CurriculumRecall } = await load('practice');
const { default: LessonProgram } = await load('lesson');
const { saveReviewItem, rateReviewItem, getDueReviewItems } = await load('review');
const { LESSON_STAGE, lessonStepState } = await load('flow');
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

const freshUser = { id: 'fresh-learner' };
assert.equal(readCurrentLesson(freshUser, courseCatalog), null, 'unstarted levels have no lesson in progress');
localStorage.setItem('norwegian_active_level', 'C2');
assert.equal(readCurrentLesson(freshUser, courseCatalog), null, 'browsing a level does not start it');
localStorage.setItem(`${lessonResumeKey('B1', 8, freshUser)}_voice_v1`, '2');
assert.deepEqual(readCurrentLesson(freshUser, courseCatalog), { level: 'B1', lessonId: 8 }, 'existing saved lessons remain resumable');
localStorage.setItem(`${lessonResumeKey('B1', 8, freshUser)}_voice_v1`, JSON.stringify(lessonStepState(LESSON_STAGE.RECALL)));
assert.deepEqual(readCurrentLesson(freshUser, courseCatalog), { level: 'B1', lessonId: 8 }, 'versioned recall progress is recognized as a started lesson without a current marker');
localStorage.setItem(currentLessonKey(freshUser), JSON.stringify({ level: 'A2', lessonId: 6 }));
assert.deepEqual(readCurrentLesson(freshUser, courseCatalog), { level: 'A2', lessonId: 6 }, 'the last opened lesson takes priority over older partial lessons');
localStorage.setItem(courseProgressKey('A2', freshUser), JSON.stringify({ completed: [6, 7] }));
assert.deepEqual(readCurrentLesson(freshUser, courseCatalog), { level: 'A2', lessonId: 8 }, 'completion moves the current marker forward');
localStorage.setItem(currentLessonKey(freshUser), JSON.stringify({ level: 'A2', lessonId: 999 }));
assert.deepEqual(readCurrentLesson(freshUser, courseCatalog), { level: 'B1', lessonId: 8 }, 'invalid saved routes recover from real progress');
localStorage.setItem(currentLessonKey(freshUser), '{invalid');
assert.deepEqual(readCurrentLesson(freshUser, courseCatalog), { level: 'B1', lessonId: 8 });
assert.notEqual(currentLessonKey(freshUser), currentLessonKey(user));
localStorage.setItem(currentLessonKey(user), JSON.stringify({ level: 'A1', lessonId: 6 }));
localStorage.setItem(`${lessonResumeKey('A1', 6, user)}_voice_v1`, JSON.stringify(lessonStepState(LESSON_STAGE.RECALL)));
console.log('✓ Current lesson follows actual user progress and survives browsing, completion and invalid saved data.');

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

const { useLocation: useHubTestLocation } = await import('react-router-dom');
const hubText = (node) => node.children.map((child) => typeof child === 'string' ? child : hubText(child)).join('');
const hubHasClass = (node, name) => typeof node.type === 'string' && String(node.props.className || '').split(/\s+/).includes(name);
for (const level of Object.keys(courseCatalog)) {
  let hubRenderer;
  let hubLocation;
  let hubFocusedId;
  const HubLocationProbe = () => { hubLocation = useHubTestLocation(); return null; };
  await act(async () => {
    hubRenderer = TestRenderer.create(React.createElement(MemoryRouter, { initialEntries: [`/invata?nivel=${level}&sursa=hub-test`] },
      React.createElement(React.Fragment, null, React.createElement(LearningHub), React.createElement(HubLocationProbe))),
    { createNodeMock: ({ props }) => ({ focus() { hubFocusedId = props.id; } }) });
  });
  assert.equal(hubRenderer.root.findAll((node) => hubHasClass(node, 'learn-page')).length, 1, 'the earlier page shell is retained');
  if (level === 'A1') {
    assert.ok(hubText(hubRenderer.root).includes('1 din 9 pași'), 'hub progress includes the new recall step in the total');
    assert.ok(!hubText(hubRenderer.root).includes('din 7 pași'), 'the earlier seven-step count is no longer displayed');
  }
  const mobile = () => hubRenderer.root.find((node) => hubHasClass(node, 'learn-app'));
  const web = () => hubRenderer.root.find((node) => hubHasClass(node, 'level-section'));
  const mobileRows = () => mobile().findAll((node) => node.type === 'a' && hubHasClass(node, 'learn-app__lesson'));
  const webRows = () => web().findAll((node) => hubHasClass(node, 'course-lesson'));
  const levelTab = (variant, code) => hubRenderer.root.findByProps({ id: `learn-${variant}-tab-${code}` });
  const assertLevel = (expected) => {
    for (const container of [mobile(), web()]) {
      const tabs = container.findAllByProps({ role: 'tab' });
      assert.equal(tabs.length, 6, 'each original tablist exposes all six levels');
      assert.equal(tabs.filter((tab) => tab.props['aria-selected']).length, 1);
      assert.equal(tabs.filter((tab) => tab.props.tabIndex === 0).length, 1);
      assert.ok(tabs.filter((tab) => !tab.props['aria-selected']).every((tab) => tab.props.tabIndex === -1));
      assert.ok(hubText(tabs.find((tab) => tab.props['aria-selected'])).startsWith(expected));
    }
    assert.equal(hubLocation.pathname, '/invata');
    assert.equal(new URLSearchParams(hubLocation.search).get('nivel'), expected, 'level selection updates the router URL');
    assert.equal(new URLSearchParams(hubLocation.search).get('sursa'), 'hub-test', 'unrelated URL parameters are preserved');
    assert.equal(localStorage.getItem('norwegian_active_level'), expected);
    assert.doesNotMatch(hubText(hubRenderer.root), /în pregătire|în curând/i, 'all six levels are available');
    assert.equal(hubRenderer.root.findAll((node) => hubHasClass(node, 'curriculum-section__toggle')).length, 0, 'sections use headings rather than an accordion');
    const currentRows = mobileRows().filter((node) => hubHasClass(node, 'is-current'));
    assert.equal(currentRows.length, expected === 'A1' ? 1 : 0, 'only the actual current level has an in-progress lesson');
    if (currentRows.length) assert.equal(currentRows[0].props.href, '/curs/a1/6', 'the current lesson is not inferred from the first unfinished row');
    const resumeLinks = hubRenderer.root.findAll((node) => node.type === 'a' && hubText(node).includes('Continuă lecția'));
    assert.equal(resumeLinks.length, expected === 'A1' ? 3 : 0, 'untouched levels offer start rather than resume');
    for (const link of resumeLinks) assert.equal(link.props.href, '/curs/a1/6');
    assert.deepEqual(readCurrentLesson(user, courseCatalog), { level: 'A1', lessonId: 6 }, 'switching tabs preserves the actual study position');
  };
  const assertRoutes = (expected) => {
    for (const link of hubRenderer.root.findAll((node) => node.type === 'a' && String(node.props.href || '').startsWith('/curs/'))) {
      const route = /^\/curs\/([a-c][12])\/(\d+)$/.exec(link.props.href);
      assert.ok(route, `valid lesson route ${link.props.href}`);
      assert.equal(route[1].toUpperCase(), expected);
      assert.ok(courseCatalog[expected].lessons.some((lesson) => lesson.id === Number(route[2])));
    }
  };
  const assertCollapsed = () => {
    assert.equal(mobileRows().length, 4, 'the mobile timeline returns to its original four-lesson preview');
    assert.equal(webRows().length, 4, 'the web list returns to its original four-lesson preview');
    const toggles = hubRenderer.root.findAll((node) => node.type === 'button' && (hubHasClass(node, 'learn-app__all') || hubHasClass(node, 'lesson-list-toggle')));
    assert.equal(toggles.length, 2, 'the mobile and web lists keep their original expansion buttons');
    for (const button of toggles) {
      assert.equal(button.props['aria-expanded'], false);
      assert.match(hubText(button), /Vezi toate.*24.*lecții/);
    }
  };
  assertLevel(level);
  assertCollapsed();
  assertRoutes(level);
  if (['A1', 'C1', 'C2'].includes(level)) {
    const expand = mobile().find((node) => node.type === 'button' && hubHasClass(node, 'learn-app__all'));
    await act(async () => expand.props.onClick());
    assert.equal(mobileRows().length, 24, `${level}: mobile exposes every lesson after expansion`);
    assert.equal(webRows().length, 24, `${level}: web exposes every lesson after expansion`);
    assert.equal(new Set(mobileRows().map((link) => link.props.href)).size, 24, `${level}: all mobile lesson routes are distinct`);
    for (const container of [mobile(), web()]) {
      const headings = container.findAll((node) => hubHasClass(node, 'learn-section-heading')).map((section) => section.findByType('h3'));
      assert.equal(headings.length, 6, `${level}: all section titles appear in each original list`);
      for (const section of courseCatalog[level].sections) assert.equal(headings.filter((heading) => hubText(heading).includes(section.title)).length, 1, `${section.id}: section heading`);
    }
    assertRoutes(level);
  }
  const other = level === 'C2' ? 'A1' : 'C2';
  await act(async () => levelTab('app', other).props.onClick());
  assertLevel(other);
  assertCollapsed();
  assertRoutes(other);
  await act(async () => levelTab('web', level).props.onClick());
  assertLevel(level);
  assertCollapsed();
  await act(async () => levelTab('web', level).props.onKeyDown({ key: 'End', preventDefault() {} }));
  assertLevel('C2');
  assert.equal(hubFocusedId, 'learn-web-tab-C2', 'keyboard navigation focuses the destination tab in the same view');
  await act(async () => levelTab('app', 'C2').props.onKeyDown({ key: 'ArrowRight', preventDefault() {} }));
  assertLevel('A1');
  assert.equal(hubFocusedId, 'learn-app-tab-A1', 'keyboard navigation wraps from C2 to A1');
  assertCollapsed();
  await act(async () => hubRenderer.unmount());
}
console.log('✓ Earlier mobile/web lesson layouts retain six-level tabs, valid routes, section headings, expansion and keyboard/URL navigation.');

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
localStorage.setItem(`${lessonResumeKey('A1', 1, user)}_voice_v1`, JSON.stringify(lessonStepState(LESSON_STAGE.VOCABULARY)));
const renderLesson = (level, id) => React.createElement(MemoryRouter, null, React.createElement(LessonProgram, { match: { params: { level, lessonId: String(id) } } }));
await act(async () => { renderer = TestRenderer.create(renderLesson('a1', 1)); });
assert.ok(renderer.root.findByProps({ className: `lesson-content lesson-content--step-${LESSON_STAGE.VOCABULARY}` }));
assert.deepEqual(readCurrentLesson(user, courseCatalog), { level: 'A1', lessonId: 6 }, 'reviewing a completed lesson does not replace the study position');
await act(async () => renderer.update(renderLesson('c1', 7)));
assert.ok(renderer.root.findByProps({ className: 'lesson-content lesson-content--step-0' }));
assert.deepEqual(readCurrentLesson(user, courseCatalog), { level: 'C1', lessonId: 7 }, 'opening an incomplete lesson records it even at the introduction');
assert.deepEqual(readCourseProgress('C1', user, courseCatalog.C1.lessons), c1Progress, 'switching levels must not write the previous level state');
assert.deepEqual(readCourseProgress('A1', user, courseCatalog.A1.lessons), a1Progress);
await act(async () => renderer.unmount());
console.log('✓ Switching lesson routes resets the session without overwriting another level’s progress.');
