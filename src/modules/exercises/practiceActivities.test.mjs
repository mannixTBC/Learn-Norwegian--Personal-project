import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAdaptiveListeningQuestions, buildListeningQuestions, buildMissionQuestions, practiceProgressKey, readPracticeProgress, savePracticeProgress } from './practiceActivities.js';
import { workMissionData } from './workMissionData.js';

const lessons = [
  { id: 1, title: 'Cafenea', vocabulary: [['Kaffe', 'Cafea'], ['Te', 'Ceai'], ['Vann', 'Apă'], ['Kaffe', 'Cafea.']], dialogue: [['A', 'Jeg vil ha kaffe.', 'Vreau cafea.'], ['B', 'Vil du ha te?', 'Vrei ceai?'], ['A', 'Et glass vann, takk.', 'Un pahar cu apă, vă rog.']] },
  { id: 2, title: 'La lucru', vocabulary: [['En jobb', 'Un serviciu'], ['Et møte', 'O întâlnire'], ['En kollega', 'Un coleg']], dialogue: [['A', 'Når er møtet?', 'Când este întâlnirea?']] },
];

test('listening filters the chosen lesson and hides the recording from the prompt', () => {
  const questions = buildListeningQuestions({ lessons, level: 'B2', lessonId: '1', length: 10 });
  assert.equal(questions.length, 3);
  for (const item of questions) {
    assert.equal(item.lessonId, 1);
    assert.match(item.id, /listen-B2/);
    assert.equal(item.options.length, 3);
    assert.equal(new Set(item.options).size, 3);
    assert.ok(item.options.includes(item.answer));
    assert.equal(item.prompt.includes(item.audioText), false);
  }
});

test('dialogue mode uses sentences with their exact translations', () => {
  const questions = buildListeningQuestions({ lessons, level: 'A2', mode: 'dialogue', length: 10 });
  assert.equal(questions.length, 4);
  const item = questions.find((question) => question.audioText === 'Når er møtet?');
  assert.equal(item.answer, 'Când este întâlnirea?');
});

test('another translation of the same audio is never a distractor', () => {
  const ambiguous = [{ id: 1, title: 'Test', vocabulary: [['Hei', 'Salut'], ['Hei!', 'Bună'], ['Takk', 'Mulțumesc'], ['Ja', 'Da'], ['Nei', 'Nu']] }];
  const question = buildListeningQuestions({ lessons: ambiguous, level: 'A1', length: 10 }).find((item) => /hei/i.test(item.audioText));
  assert.ok(!question.options.includes(question.answer === 'Salut' ? 'Bună' : 'Salut'));
});

test('small pools do not create duplicated or undefined choices', () => {
  assert.deepEqual(buildListeningQuestions({ lessons: [{ id: 1, vocabulary: [['Hei', 'Salut']] }], length: 5 }), []);
  assert.deepEqual(buildListeningQuestions({ lessons, lessonId: 'missing' }), []);
});

const listeningLesson = (id) => ({
  id, title: `Lecția ${id}`,
  vocabulary: [
    ...Array.from({ length: 3 }, (_, index) => [`ord${id}-${index}`, `Cuvânt ${id}-${index}`]),
    ...Array.from({ length: 3 }, (_, index) => [`uttrykk ${id}-${index}`, `Expresie ${id}-${index}`]),
  ],
  dialogue: Array.from({ length: 4 }, (_, index) => ['A', `Dette er replikk ${id}-${index}.`, `Replica ${id}-${index}.`]),
});
const seededRandom = (seed) => () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };

test('adaptive listening mixes ten unique words, expressions and dialogue lines from the current lesson', () => {
  const questions = buildAdaptiveListeningQuestions({ lessons: [listeningLesson(1), listeningLesson(2)], level: 'A2', random: seededRandom(3) });
  assert.equal(questions.length, 10);
  assert.equal(new Set(questions.map((question) => question.audioText)).size, 10);
  assert.ok(questions.every((question) => question.lessonId === 1 && question.id.startsWith('listen-A2-')));
  assert.deepEqual(new Set(questions.map((question) => question.contentType)), new Set(['word', 'expression', 'dialogue']));
  assert.ok(questions.every((question) => question.options.length === 3 && new Set(question.options).size === 3));
  assert.ok(questions.every((question) => !question.options.some((option) => /2-/.test(option))), 'future lessons cannot enter as distractors when familiar content is sufficient');
});

test('all completed lessons remain eligible, including completed lessons after gaps', () => {
  const source = [1, 2, 3, 4].map(listeningLesson);
  const seenLessons = new Set();
  for (let seed = 1; seed <= 20; seed++) {
    const questions = buildAdaptiveListeningQuestions({ lessons: source, level: 'B1', completed: [1, 3], random: seededRandom(seed) });
    assert.equal(questions.length, 10);
    for (const question of questions) { assert.ok([1, 2, 3].includes(question.lessonId)); seenLessons.add(question.lessonId); }
  }
  assert.deepEqual(seenLessons, new Set([1, 2, 3]), 'each completed lesson and the current lesson can supply questions');
});

test('future lessons fill only missing places, in curriculum order', () => {
  const first = { ...listeningLesson(1), vocabulary: listeningLesson(1).vocabulary.slice(0, 3), dialogue: [] };
  const second = { ...listeningLesson(2), vocabulary: listeningLesson(2).vocabulary.slice(0, 2), dialogue: [] };
  const questions = buildAdaptiveListeningQuestions({ lessons: [first, second, listeningLesson(3), listeningLesson(4)], level: 'A1', random: seededRandom(8) });
  assert.equal(questions.length, 10);
  assert.equal(questions.filter((question) => question.lessonId === 1).length, 3, 'all available familiar items are retained');
  assert.equal(questions.filter((question) => question.lessonId === 2).length, 2, 'the immediately following lesson is used first');
  assert.equal(questions.filter((question) => question.lessonId === 3).length, 5);
  assert.equal(questions.filter((question) => question.lessonId === 4).length, 0);
});

test('supplementing never relabels familiar audio or offers another valid translation as a wrong choice', () => {
  const first = { ...listeningLesson(1), vocabulary: listeningLesson(1).vocabulary.slice(0, 3), dialogue: [] };
  const second = listeningLesson(2);
  second.dialogue.push(['B', 'ord1-0!', 'Alt sens corect']);
  const questions = buildAdaptiveListeningQuestions({ lessons: [first, second, listeningLesson(3)], level: 'B2', random: seededRandom(9) });
  assert.equal(questions.length, 10);
  const familiar = questions.find((question) => question.audioText === 'ord1-0');
  assert.equal(familiar.lessonId, 1);
  assert.ok(!familiar.options.includes('Alt sens corect'));
  assert.equal(new Set(questions.map((question) => question.audioText.toLowerCase().replace(/[.!?]+$/g, ''))).size, 10);
  assert.ok(questions.every((question) => question.lessonId !== 3));
});

test('fully completed levels remain reviewable and exhausted content is never duplicated', () => {
  const source = [listeningLesson(1), listeningLesson(2)];
  const questions = buildAdaptiveListeningQuestions({ lessons: source, level: 'C2', completed: [1, 2], random: seededRandom(12) });
  assert.equal(questions.length, 10);
  assert.deepEqual(buildAdaptiveListeningQuestions({ lessons: [], level: 'A1' }), []);
  assert.deepEqual(buildAdaptiveListeningQuestions({ lessons: [source[0]], level: 'A1', length: 0 }), []);
  const tiny = { id: 1, vocabulary: [['Hei', 'Salut']], dialogue: [] };
  assert.deepEqual(buildAdaptiveListeningQuestions({ lessons: [tiny], level: 'A1' }), []);
});

test('every career has three coherent two-step missions at all four levels', () => {
  assert.equal(Object.keys(workMissionData).length, 10);
  for (const [pathId, scenes] of Object.entries(workMissionData)) {
    for (const level of ['A1', 'A2', 'B1', 'B2']) {
      const questions = buildMissionQuestions({ scenes, pathId, level, count: 3 });
      assert.equal(questions.length, 6);
      assert.equal(new Set(questions.map((item) => item.id)).size, 6);
      for (let i = 0; i < questions.length; i += 2) {
        assert.equal(questions[i].kind, 'intent');
        assert.equal(questions[i + 1].kind, 'reply');
        assert.equal(questions[i].context, questions[i + 1].context);
        assert.equal(questions[i].answer, questions[i + 1].task);
      }
      for (const item of questions) {
        assert.equal(item.pathId, pathId);
        assert.equal(item.options.length, 3);
        assert.equal(new Set(item.options).size, 3);
        assert.ok(item.options.every((option) => typeof option === 'string' && option.length));
        assert.equal(item.options.filter((option) => option === item.answer).length, 1);
      }
    }
    for (const scene of scenes) assert.equal(new Set(scene.slice(4)).size, 4, `${pathId}: distinct responses for every level`);
    assert.equal(buildMissionQuestions({ scenes, pathId, level: 'A1', count: 1 }).length, 2);
  }
});

test('progress is isolated by user, level and career, preserving the best score', () => {
  const data = new Map();
  const storage = { getItem: (key) => data.get(key) || null, setItem: (key, value) => data.set(key, value) };
  const settings = { game: 'missions', level: 'A2', pathId: 'office', userId: 'ana' };
  savePracticeProgress(storage, settings, [{ correct: true }, { correct: true }]);
  savePracticeProgress(storage, settings, [{ correct: true }, { correct: false }]);
  assert.deepEqual(readPracticeProgress(storage, settings), { sessions: 2, best: 100 });
  for (const change of [{ userId: 'mihai' }, { level: 'B1' }, { pathId: 'retail' }]) {
    assert.deepEqual(readPracticeProgress(storage, { ...settings, ...change }), { sessions: 0, best: 0 });
  }
  assert.equal(savePracticeProgress(storage, settings, []), null);
  storage.setItem(practiceProgressKey(settings), '{invalid');
  assert.deepEqual(readPracticeProgress(storage, settings), { sessions: 0, best: 0 });
});
