const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const auth = require('../middleware/authSupabaseUser');
const realAuth = auth.requireAuth;
auth.requireAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (token === 'Bearer modular-free-user' || token === 'Bearer other-user') { req.userId = token; return next(); }
  return res.status(401).json({ error: 'Autentificare necesară' });
};
const router = require('./voicePractice');
auth.requireAuth = realAuth;
const { getPreparedQuestions, getPreparedQuestionTranslation } = require('../voiceQuestions');
const chatTutor = require('../chatTutor');
const { verifyVoiceStreamTicket } = require('../voiceStreamTicket');
const catalog = require('../voiceCatalog.json');

test('toate lecțiile au trei întrebări scurte pregătite în Bokmål', () => {
  assert.deepEqual(getPreparedQuestions('A1', 1), [
    'Hva heter du?',
    'Hvordan har du det?',
    'Hva sier du når du møter noen?',
  ]);
  for (const [level, lessons] of Object.entries(catalog)) for (const id of Object.keys(lessons)) {
    const questions = getPreparedQuestions(level, Number(id));
    assert.equal(questions.length, 3);
    assert.equal(new Set(questions).size, 3);
    questions.forEach((question) => {
      assert.ok(question.split(/\s+/).length <= 12);
      assert.ok(getPreparedQuestionTranslation(level, Number(id), question));
    });
  }
});
test('flux modular: dialog de opt replici, voce securizată și feedback final unic', async () => {
  const saved = {
    key: process.env.OPENAI_API_KEY, env: process.env.NODE_ENV, netlify: process.env.NETLIFY,
    tts: process.env.OPENAI_VOICE_TTS_MODEL, stt: process.env.OPENAI_VOICE_STT_MODEL,
    elevenKey: process.env.ELEVENLABS_API_KEY, elevenVoice: process.env.ELEVENLABS_FEMALE_VOICE_ID,
    elevenModel: process.env.ELEVENLABS_MODEL_ID,
    cartesiaKey: process.env.CARTESIA_API_KEY, cartesiaVoice: process.env.CARTESIA_VOICE_ID,
    cartesiaSecret: process.env.CARTESIA_STREAM_SECRET,
  };
  const realFetch = global.fetch;
  const calls = { speech: 0, elevenSpeech: 0, transcription: 0, feedback: 0 };
  const speechRequests = [];
  const elevenSpeechRequests = [];
  const transcriptionRequests = [];
  process.env.OPENAI_API_KEY = 'test-key-not-exposed';
  process.env.NODE_ENV = 'production'; delete process.env.NETLIFY;
  delete process.env.OPENAI_VOICE_STT_MODEL;
  delete process.env.ELEVENLABS_API_KEY;
  delete process.env.ELEVENLABS_FEMALE_VOICE_ID;
  delete process.env.ELEVENLABS_MODEL_ID;
  delete process.env.CARTESIA_API_KEY;
  delete process.env.CARTESIA_VOICE_ID;
  process.env.CARTESIA_STREAM_SECRET = 'test-secret-that-is-long-enough-for-streaming';
  // Unique cache version for this test, never sent to a real provider.
  process.env.OPENAI_VOICE_TTS_MODEL = `test-tts-${Date.now()}`;
  let analysis;
  let failFeedbackAudio = false;
  const transcriptionResponses = [];
  global.fetch = async (url, options) => {
    if (url.includes('api.elevenlabs.io/v1/text-to-speech/')) {
      calls.elevenSpeech += 1;
      assert.equal(options.headers['xi-api-key'], 'test-elevenlabs-key');
      const data = JSON.parse(options.body);
      elevenSpeechRequests.push(data);
      return { ok: true, arrayBuffer: async () => new Uint8Array([4, 5, 6]).buffer };
    }
    assert.ok(options.headers.Authorization.endsWith('test-key-not-exposed'));
    if (url.endsWith('/audio/speech')) {
      calls.speech += 1;
      const data = JSON.parse(options.body);
      speechRequests.push(data);
      if (failFeedbackAudio && data.input.includes('repetă')) return { ok: false, status: 503, json: async () => ({}) };
      return { ok: true, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer };
    }
    if (url.endsWith('/audio/transcriptions')) {
      calls.transcription += 1;
      assert.ok(options.body.get('file') instanceof Blob);
      assert.equal(options.body.get('model'), 'gpt-transcribe');
      assert.equal(options.body.get('language'), null);
      assert.equal(options.body.get('temperature'), '0');
      assert.equal(options.body.get('include[]'), null);
      assert.match(options.body.get('prompt'), /Kort muntlig svar på norsk bokmål/);
      const languageHints = options.body.getAll('languages[]');
      const keywords = options.body.getAll('keywords[]');
      assert.ok(languageHints.length === 0 || languageHints.join(',') === 'no,ro');
      transcriptionRequests.push({ languageHints, keywords, prompt: options.body.get('prompt') });
      const scripted = transcriptionResponses.shift();
      if (scripted) return { ok: true, json: async () => scripted };
      return { ok: true, json: async () => ({ text: `Jeg heter Anna ${calls.transcription}.`, languages: [{ code: 'no' }] }) };
    }
    assert.ok(url.endsWith('/chat/completions'));
    calls.feedback += 1; analysis = JSON.parse(options.body);
    return { ok: true, json: async () => ({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ feedback: 'Ai răspuns clar; repetă expresia „Jeg heter”.' }) } }] }) };
  };
  const app = express(); app.use(express.json({ limit: '6mb' })); app.use('/practice', router);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const request = (route, body, token = 'modular-free-user') => realFetch(`http://127.0.0.1:${server.address().port}/practice/${route}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body),
  });
  try {
    const lesson = { level: 'A1', lessonId: 1, pathId: 'studies' };
    assert.equal((await request('start', lesson, null)).status, 401);
    assert.equal((await request('start', { ...lesson, lessonId: 999 })).status, 400);
    const started = await request('start', lesson);
    assert.equal(started.status, 200);
    const session = await started.json();
    assert.equal(session.questions.length, 3);
    assert.equal(JSON.stringify(session).includes('test-key-not-exposed'), false);
    assert.deepEqual(calls, { speech: 0, elevenSpeech: 0, transcription: 0, feedback: 0 });
    assert.equal((await request('start', lesson)).status, 429);
    assert.equal((await request('question', { sessionToken: session.sessionToken, index: 0 }, 'other-user')).status, 401);
    const questionBody = { sessionToken: session.sessionToken, index: 0 };
    const audio = await (await request('question', questionBody)).json();
    assert.ok(audio.audioBase64);
    await request('question', questionBody);
    assert.equal(calls.speech, 1, 'Question replay uses persistent audio cache');
    const chatContext = chatTutor.lessonFor(lesson);
    const chatSession = chatTutor.newSession(chatContext, 'Bearer modular-free-user').session;
    const dialogToken = chatTutor.signSession(chatSession);
    assert.equal((await request('stream-ticket', { sessionToken: session.sessionToken, dialogToken })).status, 503);
    process.env.CARTESIA_API_KEY = 'cartesia-test-key';
    process.env.CARTESIA_VOICE_ID = 'cartesia-anna-test';
    const ticketResponse = await request('stream-ticket', { sessionToken: session.sessionToken, dialogToken });
    assert.equal(ticketResponse.status, 200);
    const stream = await ticketResponse.json();
    assert.equal(stream.provider, 'cartesia');
    const ticket = new URL(stream.streamUrl, 'https://nordlingo.net').searchParams.get('ticket');
    assert.equal(ticket.includes('Hva'), false);
    assert.equal(verifyVoiceStreamTicket(ticket).text, 'Hei! La oss øve sammen. Hva heter du?');
    delete process.env.CARTESIA_API_KEY;
    delete process.env.CARTESIA_VOICE_ID;
    const spoken = await (await request('speak', { sessionToken: session.sessionToken, dialogToken })).json();
    assert.ok(spoken.audioBase64);
    assert.equal(spoken.provider, 'openai');
    assert.equal(speechRequests.at(-1).input, 'Hei! La oss øve sammen. Hva heter du?');
    assert.match(speechRequests.at(-1).instructions, /speak both parts/i);
    assert.match(speechRequests.at(-1).instructions, /do not omit the final question/i);
    await request('speak', { sessionToken: session.sessionToken, dialogToken });
    assert.equal(calls.speech, 2, 'Dialog replay does not synthesize the same turn twice');
    const helped = chatTutor.localTurn(chatSession, chatContext, 'help');
    const helpedToken = chatTutor.signSession(helped.session);
    const helpedSpoken = await (await request('speak', { sessionToken: session.sessionToken, dialogToken: helpedToken })).json();
    assert.ok(helpedSpoken.audioBase64);
    assert.equal(calls.speech, 3, 'A new same-turn assistant reply gets its own audio');
    assert.equal(speechRequests.at(-1).input, `${helped.reply} ${helped.question}`);
    await request('speak', { sessionToken: session.sessionToken, dialogToken: helpedToken });
    assert.equal(calls.speech, 3, 'The new same-turn reply is still deduplicated');
    process.env.ELEVENLABS_API_KEY = 'test-elevenlabs-key';
    process.env.ELEVENLABS_FEMALE_VOICE_ID = 'anna-test-voice';
    process.env.ELEVENLABS_MODEL_ID = 'eleven_flash_v2_5';
    const annaChatSession = chatTutor.newSession(chatContext, 'Bearer modular-free-user').session;
    const annaDialogToken = chatTutor.signSession(annaChatSession);
    const annaSpoken = await (await request('speak', { sessionToken: session.sessionToken, dialogToken: annaDialogToken })).json();
    assert.equal(annaSpoken.provider, 'elevenlabs');
    assert.equal(calls.elevenSpeech, 1);
    assert.equal(elevenSpeechRequests[0].text, 'Hei! La oss øve sammen. Hva heter du?');
    assert.equal(elevenSpeechRequests[0].model_id, 'eleven_flash_v2_5');
    assert.equal(elevenSpeechRequests[0].language_code, 'no');
    assert.equal(elevenSpeechRequests[0].voice_settings.speed, 0.82);
    delete process.env.ELEVENLABS_API_KEY;
    delete process.env.ELEVENLABS_FEMALE_VOICE_ID;
    delete process.env.ELEVENLABS_MODEL_ID;
    assert.equal((await request('question', { ...questionBody, index: 4 })).status, 400);
    assert.equal((await request('transcribe', { ...questionBody, audioBase64: 'invalid', mimeType: 'text/plain', duration: 20 })).status, 400);
    assert.equal((await request('transcribe', { ...questionBody, audioBase64: Buffer.alloc(120, 9).toString('base64'), mimeType: 'audio/webm', duration: 31.1 })).status, 400);
    assert.equal((await request('transcribe', {
      sessionToken: session.sessionToken,
      index: 0,
      audioBase64: Buffer.alloc(120, 9).toString('base64'),
      mimeType: 'audio/webm',
      duration: 5,
    })).status, 401, 'A valid dialogue token is required before transcription');
    const answers = [];
    let currentChatSession = chatSession;
    for (let index = 0; index < 8; index += 1) {
      const body = {
        sessionToken: session.sessionToken,
        dialogToken: chatTutor.signSession(currentChatSession),
        index,
        audioBase64: Buffer.alloc(120, index + 1).toString('base64'),
        mimeType: 'audio/webm;codecs=opus',
        duration: index === 0 ? 30 : 5,
      };
      const response = await request('transcribe', body);
      assert.equal(response.status, 200);
      const answer = await response.json();
      assert.equal(answer.decision, 'accept');
      assert.ok(answer.proof);
      answers.push(answer);
      await request('transcribe', body);
      if (index < 7) currentChatSession = chatTutor.nextSession(currentChatSession, answer.text, {
        reply: 'Bra.',
        question: `Hva svarer du nå ${index + 2}?`,
        memory: null,
      });
    }
    assert.equal(calls.transcription, 8, 'Network replay does not retranscribe');
    assert.ok(transcriptionRequests.every(({ languageHints }) => languageHints.join(',') === 'no,ro'));
    assert.ok(transcriptionRequests[0].keywords.includes('Jeg heter'));
    assert.match(transcriptionRequests[0].prompt, /Hva heter du/);
    assert.equal(calls.feedback, 0, 'No evaluation between answers');
    assert.equal((await request('feedback', { sessionToken: session.sessionToken, answers: [{ ...answers[0], text: 'tampered' }, answers[1]] })).status, 400);
    let forkedChatSession = chatTutor.newSession(chatContext, 'Bearer modular-free-user').session;
    forkedChatSession = chatTutor.nextSession(forkedChatSession, 'Jeg heter Anna.', {
      reply: 'Hyggelig å møte deg!', question: 'Hvordan har du det?', memory: null,
    });
    const forkedAnswer = await (await request('transcribe', {
      sessionToken: session.sessionToken,
      dialogToken: chatTutor.signSession(forkedChatSession),
      index: 1,
      audioBase64: Buffer.alloc(120, 50).toString('base64'),
      mimeType: 'audio/webm',
      duration: 5,
    })).json();
    assert.equal((await request('feedback', {
      sessionToken: session.sessionToken,
      answers: [answers[0], forkedAnswer],
    })).status, 400, 'Answers from forked dialogues cannot be mixed');
    const result = await (await request('feedback', { sessionToken: session.sessionToken, answers })).json();
    assert.ok(result.text.split(/\s+/).length <= 25); assert.ok(result.audioBase64);
    assert.equal(JSON.parse(analysis.messages[1].content).length, 8);
    assert.equal(analysis.store, false);
    await request('feedback', { sessionToken: session.sessionToken, answers });
    assert.equal(calls.feedback, 1); assert.equal(calls.speech, 4);
    // A second learner can finish after two answers and still see text if TTS fails.
    const second = await (await request('start', lesson, 'other-user')).json();
    const secondAnswers = [];
    let secondChatSession = chatTutor.newSession(chatContext, 'Bearer other-user').session;
    assert.equal((await request('transcribe', {
      sessionToken: second.sessionToken,
      dialogToken,
      index: 0,
      audioBase64: Buffer.alloc(120, 70).toString('base64'),
      mimeType: 'audio/mp4',
      duration: 5,
    }, 'other-user')).status, 401, 'A dialogue owned by another learner is rejected');

    transcriptionResponses.push({ text: 'Mă cheamă Mihai.', languages: [{ code: 'ro' }] });
    const romanianBody = {
      sessionToken: second.sessionToken,
      dialogToken: chatTutor.signSession(secondChatSession),
      index: 0,
      audioBase64: Buffer.alloc(120, 71).toString('base64'),
      mimeType: 'audio/mp4',
      duration: 5,
    };
    const romanian = await request('transcribe', romanianBody, 'other-user');
    assert.equal(romanian.status, 200);
    const retryResult = await romanian.json();
    assert.equal(retryResult.decision, 'retry');
    assert.equal(retryResult.proof, undefined);
    const afterRomanian = calls.transcription;
    await request('transcribe', romanianBody, 'other-user');
    assert.equal(calls.transcription, afterRomanian, 'The same rejected audio is served from the digest cache');

    transcriptionResponses.push(
      { text: 'Mihai', languages: [] },
      { text: 'Mihai', languages: [] },
    );
    const nameResponse = await request('transcribe', {
      sessionToken: second.sessionToken,
      dialogToken: chatTutor.signSession(secondChatSession),
      index: 0,
      audioBase64: Buffer.alloc(120, 72).toString('base64'),
      mimeType: 'audio/mp4',
      duration: 5,
    }, 'other-user');
    const nameAnswer = await nameResponse.json();
    assert.equal(nameAnswer.decision, 'accept', 'A stable name is valid after “Hva heter du?”');
    secondAnswers.push(nameAnswer);
    secondChatSession = chatTutor.nextSession(secondChatSession, nameAnswer.text, {
      reply: 'Hyggelig å møte deg!',
      question: 'Hvordan har du det?',
      memory: null,
    });

    transcriptionResponses.push({ text: 'repetă', languages: [{ code: 'ro' }] });
    const command = await (await request('transcribe', {
      sessionToken: second.sessionToken,
      dialogToken: chatTutor.signSession(secondChatSession),
      index: 1,
      audioBase64: Buffer.alloc(120, 73).toString('base64'),
      mimeType: 'audio/mp4',
      duration: 5,
    }, 'other-user')).json();
    assert.equal(command.decision, 'accept');
    assert.equal(command.consumeTurn, false);
    assert.equal(command.proof, undefined, 'A local command is not counted as a lesson answer');

    transcriptionResponses.push(
      { text: 'Kanskje', languages: [] },
      { text: 'Kanskje', languages: [] },
    );
    const uncertain = await (await request('transcribe', {
      sessionToken: second.sessionToken,
      dialogToken: chatTutor.signSession(secondChatSession),
      index: 1,
      audioBase64: Buffer.alloc(120, 74).toString('base64'),
      mimeType: 'audio/mp4',
      duration: 5,
    }, 'other-user')).json();
    assert.equal(uncertain.decision, 'confirm');
    assert.equal(uncertain.proof, undefined);
    assert.ok(uncertain.confirmationToken);
    const confirmed = await (await request('confirm', {
      sessionToken: second.sessionToken,
      dialogToken: chatTutor.signSession(secondChatSession),
      confirmationToken: uncertain.confirmationToken,
    }, 'other-user')).json();
    assert.equal(confirmed.decision, 'accept');
    assert.ok(confirmed.proof);
    secondAnswers.push(confirmed);
    assert.ok(transcriptionRequests.some(({ languageHints }) => languageHints.length === 0), 'Ambiguous audio receives a neutral second pass');
    for (let value = 75; value <= 78; value += 1) {
      assert.equal((await request('transcribe', {
        sessionToken: second.sessionToken,
        dialogToken: chatTutor.signSession(secondChatSession),
        index: 1,
        audioBase64: Buffer.alloc(120, value).toString('base64'),
        mimeType: 'audio/mp4',
        duration: 5,
      }, 'other-user')).status, 200);
    }
    assert.equal((await request('transcribe', {
      sessionToken: second.sessionToken,
      dialogToken: chatTutor.signSession(secondChatSession),
      index: 1,
      audioBase64: Buffer.alloc(120, 79).toString('base64'),
      mimeType: 'audio/mp4',
      duration: 5,
    }, 'other-user')).status, 429, 'Distinct recordings are capped per turn');
    failFeedbackAudio = true;
    const textOnly = await (await request('feedback', { sessionToken: second.sessionToken, answers: secondAnswers }, 'other-user')).json();
    assert.ok(textOnly.text); assert.equal(textOnly.audioBase64, null);
    assert.equal(JSON.parse(analysis.messages[1].content).length, 2);
    await request('feedback', { sessionToken: second.sessionToken, answers: secondAnswers }, 'other-user');
    assert.equal(calls.feedback, 2, 'Audio failure does not repeat evaluation');
  } finally {
    global.fetch = realFetch;
    for (const [key, value] of Object.entries({
      OPENAI_API_KEY: saved.key, NODE_ENV: saved.env, NETLIFY: saved.netlify,
      OPENAI_VOICE_TTS_MODEL: saved.tts, OPENAI_VOICE_STT_MODEL: saved.stt,
      ELEVENLABS_API_KEY: saved.elevenKey, ELEVENLABS_FEMALE_VOICE_ID: saved.elevenVoice,
      ELEVENLABS_MODEL_ID: saved.elevenModel,
      CARTESIA_API_KEY: saved.cartesiaKey, CARTESIA_VOICE_ID: saved.cartesiaVoice,
      CARTESIA_STREAM_SECRET: saved.cartesiaSecret,
    })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    await new Promise((resolve) => server.close(resolve));
  }
});
