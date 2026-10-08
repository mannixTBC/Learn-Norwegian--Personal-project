const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getVoiceLesson, buildVoiceSession } = require('./voiceTutor');
const catalog = require('./voiceCatalog.json');

test('contextul vocal acoperă fiecare lecție și fiecare direcție, fără răspunsuri la exerciții', () => {
  for (const [level, lessons] of Object.entries(catalog)) {
    assert.ok(Object.keys(lessons).length >= 10);
    for (const [id, lesson] of Object.entries(lessons)) {
      for (const pathId of Object.keys(lesson.directions)) {
        const context = getVoiceLesson({ level, lessonId: Number(id), pathId });
        assert.equal(context.title, lesson.title);
        assert.ok(context.vocabulary.length);
        assert.ok(context.direction.phrases.length);
        assert.equal(context.exercises, undefined);
        assert.equal(context.directions, undefined);
      }
    }
  }
});
test('cererile pentru lecții și direcții inexistente sunt respinse', () => {
  assert.equal(getVoiceLesson({ level: 'A9', lessonId: 1, pathId: 'general' }), null);
  assert.equal(getVoiceLesson({ level: 'A1', lessonId: 999, pathId: 'general' }), null);
  assert.equal(getVoiceLesson({ level: 'A1', lessonId: 1, pathId: 'invalid' }), null);
});
test('sesiunea respectă nivelul, permite ezitările și include contextul real al direcției', () => {
  const a1 = buildVoiceSession(getVoiceLesson({ level: 'A1', lessonId: 1, pathId: 'healthcare' }));
  const b2 = buildVoiceSession(getVoiceLesson({ level: 'B2', lessonId: 4, pathId: 'transport' }));
  assert.ok(a1.audio.output.speed < b2.audio.output.speed);
  assert.equal(a1.audio.input.turn_detection.eagerness, 'low');
  assert.match(a1.instructions, /Salutări și prezentări/);
  assert.match(a1.instructions, /Sănătate și îngrijire/);
  assert.match(b2.instructions, /Transport și logistică/);
  assert.match(a1.instructions, /Nu răspunde în locul cursantului/);
  assert.match(a1.instructions, /nu atribui scoruri exacte de pronunție/);
});
