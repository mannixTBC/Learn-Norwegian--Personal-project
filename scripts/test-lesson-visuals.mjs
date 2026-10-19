import { build } from 'vite';
import { resolve, relative, isAbsolute, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { existsSync, readFileSync, statSync } from 'node:fs';
import assert from 'node:assert/strict';

// This check imports the real curriculum and its visual resolver through Vite.
// It does not start a web server or depend on a browser or image provider.
const root = resolve(import.meta.dirname, '..');
const publicRoot = resolve(root, 'public');
const outDir = resolve(root, 'node_modules/.cache/lesson-visual-tests');
await build({ configFile: false, logLevel: 'error', build: {
  ssr: true, outDir, emptyOutDir: false,
  rollupOptions: {
    input: {
      catalog: resolve(root, 'src/modules/lessons/norwegian-program/lessonContent.js'),
      visuals: resolve(root, 'src/modules/lessons/lessonVisuals.js'),
    },
    output: { entryFileNames: '[name].mjs' },
  },
} });
const { courseCatalog } = await import(pathToFileURL(resolve(outDir, 'catalog.mjs')));
const { getLessonVisual, getLessonImage } = await import(pathToFileURL(resolve(outDir, 'visuals.mjs')));
assert.equal(typeof getLessonVisual, 'function', 'the semantic visual resolver is exported');
assert.equal(typeof getLessonImage, 'function', 'the existing image URL API stays available');
assert.deepEqual(Object.keys(courseCatalog), ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

const checkedFiles = new Set();
const usedThemes = new Set();
const knownThemes = new Set(['greetings', 'cafe', 'shopping', 'home', 'work', 'family', 'time', 'weather', 'transport', 'daily-life', 'healthcare', 'discussion', 'repairs', 'career', 'public-services', 'sources', 'library', 'teamwork', 'sustainability', 'digital-life', 'presentation', 'writing']);
let lessonCount = 0;
let missionCount = 0;
const checkVisual = (level, lesson) => {
  const label = `${level}/${lesson.uid}`;
  const visual = getLessonVisual(level, lesson.id);
  assert.ok(visual && typeof visual === 'object', `${label}: visual object`);
  assert.equal(typeof visual.src, 'string', `${label}: image URL`);
  assert.match(visual.src, /^\/images\/lessons\/.+\.(?:webp|png|jpe?g)$/i, `${label}: local lesson image`);
  assert.doesNotMatch(visual.src, /auth-norway-fjord/i, `${label}: no generic auth background`);
  assert.ok(typeof visual.alt === 'string' && visual.alt.trim().length >= 12, `${label}: descriptive alternative text`);
  assert.doesNotMatch(visual.alt.trim(), /^(?:imagine|ilustrație|fotografie|lecție|lesson|image)$/i, `${label}: no placeholder alternative text`);
  assert.ok(typeof visual.theme === 'string' && visual.theme.trim().length >= 3, `${label}: semantic theme`);
  assert.ok(knownThemes.has(visual.theme), `${label}: valid, explicit curriculum theme`);
  assert.equal(getLessonImage(level, lesson.id), visual.src, `${label}: legacy API resolves the same asset`);
  assert.equal(getLessonImage(level.toLowerCase(), String(lesson.id)), visual.src, `${label}: level/id normalisation remains compatible`);
  const localPath = resolve(publicRoot, visual.src.replace(/^\/+/, ''));
  const localRelative = relative(publicRoot, localPath);
  assert.ok(localRelative && !localRelative.startsWith('..') && !isAbsolute(localRelative), `${label}: asset stays inside public/`);
  if (!checkedFiles.has(localPath)) {
    assert.ok(existsSync(localPath), `${label}: missing asset ${visual.src}`);
    const stats = statSync(localPath);
    assert.ok(stats.isFile() && stats.size > 128, `${label}: image is a non-empty local file`);
    if (extname(localPath).toLowerCase() === '.webp') {
      const bytes = readFileSync(localPath);
      assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF', `${visual.src}: valid WebP container`);
      assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP', `${visual.src}: valid WebP signature`);
    }
    checkedFiles.add(localPath);
  }
  usedThemes.add(visual.theme);
  return visual;
};

for (const [level, course] of Object.entries(courseCatalog)) {
  assert.equal(course.lessons.length, 24, `${level}: complete curriculum`);
  assert.equal(course.sections.length, 6, `${level}: all sections represented`);
  const levelThemes = new Set();
  for (const lesson of course.lessons) {
    const visual = checkVisual(level, lesson);
    levelThemes.add(visual.theme);
    lessonCount += 1;
  }
  assert.ok(levelThemes.size >= 3, `${level}: visuals distinguish different section topics`);
  for (const section of course.sections) {
    const missions = section.lessons.filter((lesson) => lesson.kind === 'consolidation');
    assert.equal(missions.length, 1, `${section.id}: one consolidation visual to check`);
    const mission = missions[0];
    const visual = checkVisual(level, mission);
    assert.ok(visual.theme && visual.alt && visual.src, `${mission.uid}: mission has a complete visual`);
    missionCount += 1;
  }
}
assert.equal(lessonCount, 144, 'all teaching and consolidation lessons are covered');
assert.equal(missionCount, 36, 'all section missions are covered');

const visualForUid = (level, uid) => {
  const lesson = courseCatalog[level].lessons.find((item) => item.uid === uid);
  assert.ok(lesson, `${level}: semantic fixture ${uid} exists`);
  return { lesson, visual: getLessonVisual(level, lesson.id) };
};
const expectTheme = (level, uid, expected) => {
  const { visual } = visualForUid(level, uid);
  assert.equal(visual.theme, expected, `${level}/${uid}: image theme follows lesson meaning`);
  return visual;
};

const cafe = expectTheme('A1', 'a1-cafe', 'cafe');
assert.notEqual(visualForUid('A1', 'a1-cafe').lesson.id, 2, 'the cafe lesson has moved away from its old numeric slot');
for (const uid of ['a1-origin-languages', 'a1-contact-details']) {
  const { visual } = visualForUid('A1', uid);
  assert.doesNotMatch(visual.theme, /cafe|cafenea/i, `${uid}: identity/contact lessons do not inherit the old cafe image`);
  assert.notEqual(visual.src, cafe.src, `${uid}: source follows meaning rather than numeric lesson ID`);
}
expectTheme('A1', 'a1-origin-languages', 'greetings');
expectTheme('A1', 'a1-contact-details', 'writing');
expectTheme('A1', 'a1-city-places', 'library');
expectTheme('B1', 'b1-sanatate-clarificare', 'healthcare');
expectTheme('C1', 'c1-pastand-belegg', 'sources');
expectTheme('C1', 'c1-sammenstille-kilder', 'sources');
expectTheme('B2', 'b2-decizii-tehnologie', 'digital-life');
expectTheme('C2', 'c2-stilistisk-redigering', 'writing');
// The C1 source mission applies its analysis to a digital-interview trial;
// its teaching lessons use documents, while the mission uses that real scene.
for (const [level, sectionId, theme] of [['A1', 'a1-city-travel', 'library'], ['B2', 'b2-surse', 'library'], ['B2', 'b2-decizii', 'digital-life'], ['C1', 'c1-kilder-og-syntese', 'digital-life'], ['C2', 'c2-stil-og-sprakvalg', 'writing']]) {
  const mission = courseCatalog[level].sections.find((section) => section.id === sectionId).lessons.find((lesson) => lesson.kind === 'consolidation');
  assert.equal(getLessonVisual(level, mission.id).theme, theme, `${sectionId}: mission image follows its actual task`);
}
assert.ok(checkedFiles.size >= 12, 'the curriculum uses a varied set of local illustrations');
console.log(`✓ ${lessonCount} lessons and ${missionCount} missions: valid local images, ${checkedFiles.size} distinct assets, ${usedThemes.size} semantic themes.`);
console.log('✓ Semantic regressions: reordered A1 identity/contact/cafe, library, C1 sources, technology and C2 editing.');
