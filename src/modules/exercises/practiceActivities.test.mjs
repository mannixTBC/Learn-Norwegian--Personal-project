import test from 'node:test';
import assert from 'node:assert/strict';
import { buildListeningQuestions, buildMissionQuestions, practiceProgressKey, readPracticeProgress, savePracticeProgress } from './practiceActivities.js';
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
