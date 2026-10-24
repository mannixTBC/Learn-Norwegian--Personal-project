const express = require('express');
const { requireAuth } = require('../middleware/authSupabaseUser');
const { getOpenAI, isOpenAIConfigured } = require('../openai');
const { consumeChatQuota, recordChatUsage } = require('../chatUsage');
const tutor = require('../scenarioTutor');
const { runScenarioTurn, addUsage } = require('../scenarioTurn');
const { cartesiaSpeechBuffer } = require('../cartesiaSpeech');
const router = express.Router();
router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
router.use(requireAuth);
const fail = (message, status, code) => Object.assign(new Error(message), { status, code });
const wrap = fn => async (req, res) => {
  try { await fn(req, res); } catch (error) {
    const status = error.status || 502;
    res.status(status).json({
      error: status < 500 ? error.message : 'Conversația nu este disponibilă momentan. Încearcă din nou.',
      code: error.code || (error.isChatQuotaError ? 'SCENARIO_QUOTA' : status >= 500 ? 'SCENARIO_UNAVAILABLE' : 'SCENARIO_REQUEST_INVALID'),
    });
  }
};
function currentSession(token, userId) {
  const session = tutor.verify(token, userId);
  const { scenario, difficulty } = tutor.context(session.scenarioId, session.level);
  if (scenario.revision && session.scenarioRevision !== scenario.revision) {
    throw fail('Scenariul a fost actualizat. Începe o conversație nouă.', 409, 'SCENARIO_UPDATED');
  }
  if (session.turn > difficulty.turns || session.achieved.some(id => id >= scenario.goals.length)) {
    throw fail('Sesiunea nu mai poate fi folosită. Începe o conversație nouă.', 409, 'SCENARIO_SESSION_INVALID');
  }
  return { session, scenario, difficulty };
}
function response(session, scenario, difficulty) {
  return {
    sessionToken: tutor.sign(session), reply: session.history.at(-1).content,
    feedback: session.feedback || '', achieved: session.achieved,
    turn: session.turn, done: session.done, maxTurns: difficulty.turns,
    expiresAt: session.expires,
    endReason: session.done ? (session.achieved.length === scenario.goals.length ? 'success' : 'turn_limit') : null,
  };
}
router.post('/start', wrap(async (req, res) => {
  const { scenarioId, level } = req.body || {};
  const { scenario, difficulty } = tutor.context(scenarioId, level);
  const session = { userId: req.userId, scenarioId, level, turn: 0, done: false, achieved: [], feedback: '',
    expires: Date.now() + 3600000, history: [{ role: 'assistant', content: scenario.opening }] };
  if (scenario.revision) session.scenarioRevision = scenario.revision;
  res.json(response(session, scenario, difficulty));
}));
router.post('/resume', wrap(async (req, res) => {
  const { session, scenario, difficulty } = currentSession(req.body?.sessionToken, req.userId);
  // Restoring a signed checkpoint neither calls the model nor consumes chat quota.
  res.json({ ...response(session, scenario, difficulty), scenarioId: session.scenarioId, level: session.level,
    messages: session.history.map(entry => ({ role: entry.role, text: entry.content })) });
}));
// Read only the server-signed reply; callers cannot submit arbitrary TTS text.
router.post('/speech', wrap(async (req, res) => {
  const { session } = currentSession(req.body?.sessionToken, req.userId);
  const text = session.history.at(-1).content;
  const audio = await cartesiaSpeechBuffer(text, undefined,
    req.body?.slow === true ? { speed: 0.65 } : {});
  res.set('Content-Type', 'audio/mpeg');
  res.set('X-Audio-Provider', 'cartesia');
  res.send(audio);
}));
router.post('/turn', wrap(async (req, res) => {
  const { sessionToken, message } = req.body || {};
  if (typeof message !== 'string' || !message.trim() || message.length > 1200) {
    throw fail('Scrie între 1 și 1200 de caractere.', 400, 'SCENARIO_MESSAGE_INVALID');
  }
  const { session, scenario, difficulty } = currentSession(sessionToken, req.userId);
  if (session.done || session.turn >= difficulty.turns) {
    throw fail('Conversația s-a încheiat. Poți începe o sesiune nouă.', 409, 'SCENARIO_ENDED');
  }
  if (!isOpenAIConfigured()) throw fail('Asistentul nu este configurat.', 503, 'SCENARIO_UNAVAILABLE');
  await consumeChatQuota(req);
  let usage = null;
  try {
    let result;
    try {
      result = await runScenarioTurn({
        client: getOpenAI(), scenario, difficulty, session, message: message.trim(),
        onUsage: value => { usage = addUsage(usage, value); },
      });
    } catch (_) {
      // A provider 401/429 is a service error, not a learner authentication/quota error.
      throw fail('Răspunsul nu a putut fi pregătit.', 502, 'SCENARIO_UNAVAILABLE');
    }
    res.json(response(result.session, scenario, difficulty));
  } finally {
    try { await recordChatUsage(req, usage); } catch {}
  }
}));
module.exports = router;
