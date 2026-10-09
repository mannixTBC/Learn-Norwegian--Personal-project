const express = require('express');

const { getOpenAI, isOpenAIConfigured } = require('../openai');
const { requireAuth } = require('../middleware/authSupabaseUser');
const { consumeChatQuota, recordChatUsage } = require('../chatUsage');
const {
  MAX_TURNS,
  MAX_MESSAGE_CHARS,
  fail,
  lessonFor,
  newSession,
  signSession,
  verifySession,
  commandFor,
  localTurn,
  buildCompletionRequest,
  parseCompletion,
  finalizeTurn,
  nextSession,
  publicUsage,
} = require('../chatTutor');

const router = express.Router();

const isLocalDevelopment = (req) => process.env.VITE_PREMIUM_DEV_BYPASS === 'true'
  && process.env.NODE_ENV !== 'production'
  && !process.env.NETLIFY
  && ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);

const wrap = (handler) => async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    await handler(req, res);
  } catch (error) {
    const status = Number.isInteger(error.status) ? error.status : 502;
    if (status >= 500) console.warn('lesson-chat-failure', { operation: req.path, kind: error.name, status });
    res.status(status).json({ error: status < 500 ? error.message : 'Asistentul nu răspunde momentan. Încearcă din nou.' });
  }
};

const validateKeys = (body, allowed, required = allowed) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw fail('Cererea nu este validă.');
  const keys = Object.keys(body);
  if (keys.some((key) => !allowed.includes(key)) || required.some((key) => !keys.includes(key))) throw fail('Cererea nu este validă.');
};

const commonResponse = ({ session, reply, question, correction = null, quotaRemaining, usage = null }) => ({
  sessionToken: signSession(session),
  reply,
  question,
  correction,
  done: session.done,
  turn: session.turn,
  maxTurns: MAX_TURNS,
  remainingTurns: session.done ? 0 : Math.max(0, MAX_TURNS - session.turn),
  ...(Number.isFinite(quotaRemaining) ? { quotaRemaining } : {}),
  usage,
});

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (isLocalDevelopment(req)) {
    req.userId = 'local-development';
    return next();
  }
  return requireAuth(req, res, next);
});

/** Starts a signed, short-lived lesson conversation without contacting OpenAI. */
router.post('/start', wrap(async (req, res) => {
  validateKeys(req.body, ['level', 'lessonId', 'pathId'], ['level', 'lessonId']);
  const { level, lessonId, pathId = 'general' } = req.body;
  const context = lessonFor({ level, lessonId, pathId });
  if (!context) throw fail('Lecția sau direcția selectată nu este validă.');

  const { session, opening } = newSession(context, req.userId);
  res.json(commonResponse({
    session,
    reply: opening.reply,
    question: opening.question,
  }));
}));

/** Continues a signed lesson conversation. The client cannot submit or rewrite history. */
router.post('/turn', wrap(async (req, res) => {
  validateKeys(req.body, ['sessionToken', 'message']);
  const { sessionToken } = req.body;
  if (typeof req.body.message !== 'string') throw fail('Mesajul nu este valid.');
  const message = req.body.message.trim();
  if (!message || message.length > MAX_MESSAGE_CHARS || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(message)) {
    throw fail(`Mesajul trebuie să conțină între 1 și ${MAX_MESSAGE_CHARS} de caractere.`);
  }

  const { session, context } = verifySession(sessionToken, req.userId);
  if (session.done || session.turn >= MAX_TURNS) throw fail('Conversația s-a încheiat. Pornește o sesiune nouă.', 409);

  const command = commandFor(message);
  if (command) {
    const result = localTurn(session, context, command);
    return res.json(commonResponse({
      session: result.session,
      reply: result.reply,
      question: result.question,
      correction: result.correction,
    }));
  }

  if (!isOpenAIConfigured()) throw fail('Asistentul virtual nu este configurat.', 503);

  const quota = await consumeChatQuota(req);
  let completion = null;
  let result;
  try {
    completion = await getOpenAI().chat.completions.create(
      buildCompletionRequest(context, session, message),
      { timeout: 15_000 },
    );
    result = finalizeTurn(parseCompletion(completion), session, context);
  } catch (error) {
    throw fail('Asistentul nu răspunde momentan. Încearcă din nou.', 502);
  } finally {
    try {
      await recordChatUsage(req, completion?.usage || null);
    } catch (error) {
      console.warn('lesson-chat-usage-failure', { kind: error.name });
    }
  }

  const updated = nextSession(session, message, result);
  res.json(commonResponse({
    session: updated,
    reply: result.reply,
    question: updated.lastQuestion,
    correction: result.correction,
    quotaRemaining: quota?.remaining,
    usage: publicUsage(completion?.usage),
  }));
}));

module.exports = router;
