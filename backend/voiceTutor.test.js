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
  assert.equal(a1.audio.input.turn_detection.eagerness, 'medium');
  assert.equal(a1.audio.input.turn_detection.create_response, false);
  assert.equal(a1.audio.input.turn_detection.interrupt_response, false);
  assert.match(a1.audio.input.transcription.prompt, /Salutări și prezentări/);
  assert.ok(a1.audio.input.transcription.keywords.length > 0);
  assert.equal(a1.max_output_tokens, 1024);
  assert.match(a1.instructions, /maximum opt răspunsuri/);
  assert.match(a1.instructions, /A opta și ultima replică evaluată trebuie să fie răspunsul cursantului/);
  assert.match(a1.instructions, /nu mai pune nicio întrebare/);
  assert.match(a1.instructions, /25 de cuvinte/);
  assert.doesNotMatch(a1.instructions, /6–10|80 de cuvinte|35 de cuvinte/);
  assert.match(a1.instructions, /Salutări și prezentări/);
  assert.match(a1.instructions, /Sănătate și îngrijire/);
  assert.match(b2.instructions, /Transport și logistică/);
  assert.match(a1.instructions, /Nu răspunde în locul cursantului/);
  assert.match(a1.instructions, /nu atribui scoruri exacte de pronunție/);
});

test('vocea și chatul primesc lectura C1, expresiile reactivate și sarcina orală, fără răspunsul-reper', () => {
  const [id, lesson] = Object.entries(catalog.C1).find(([, item]) => item.reading?.text && item.recycledVocabulary?.length);
  const context = getVoiceLesson({ level: 'C1', lessonId: Number(id), pathId: 'general' });
  assert.ok(context.reading.text.length > 200, 'the actual extended text is available, not only its title');
  assert.deepEqual(Object.keys(context.reading).sort(), ['text', 'title'], 'the generated catalog only contains the reading source');
  const hiddenAnswer = 'PRIVATE_READING_MODEL_ANSWER_NOT_FOR_CONVERSATION_CONTEXT';
  const reading = { ...context.reading, answer: hiddenAnswer, explanation: 'PRIVATE_READING_EXPLANATION' };
  const instructions = buildVoiceSession({ ...context, reading }).instructions;
  const voiceContext = JSON.parse(instructions.split('# Context curricular\n')[1]);
  assert.equal(voiceContext.sectionTitle, lesson.sectionTitle);
  assert.equal(voiceContext.reading.title, lesson.reading.title);
  assert.equal(voiceContext.reading.text, lesson.reading.text);
  assert.deepEqual(voiceContext.recycledVocabulary[0], lesson.recycledVocabulary[0].entry.slice(0, 2));
  assert.equal(voiceContext.production.speakingPrompt, lesson.production.speakingPrompt);
  assert.equal(instructions.includes(hiddenAnswer), false);
  assert.equal(instructions.includes('PRIVATE_READING_EXPLANATION'), false);

  const tutor = require('./chatTutor');
  const chatLesson = tutor.lessonFor({ level: 'C1', lessonId: Number(id), pathId: 'general' });
  const question = lesson.conversationPrompts[0][0];
  const request = tutor.buildCompletionRequest({ ...chatLesson, lesson: { ...chatLesson.lesson, reading } }, {
    turn: 0, lastQuestion: question, askedQuestions: [question], memory: [], history: [],
  }, 'Jeg vil undersøke forutsetningen i teksten.');
  const prompt = request.messages[0].content;
  const chatContext = JSON.parse(prompt.split('Folosește prioritar acest context curricular compact: ')[1]);
  assert.equal(chatContext.sectionTitle, lesson.sectionTitle);
  assert.equal(chatContext.reading.text, lesson.reading.text);
  assert.deepEqual(chatContext.recycledVocabulary[0], lesson.recycledVocabulary[0].entry.slice(0, 2));
  assert.equal(chatContext.production.speakingPrompt, lesson.production.speakingPrompt);
  assert.deepEqual(Object.keys(chatContext.reading).sort(), ['text', 'title']);
  assert.equal(prompt.includes(hiddenAnswer), false);
  assert.equal(prompt.includes('PRIVATE_READING_EXPLANATION'), false);
});
