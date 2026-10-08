const express = require('express');
const crypto = require('node:crypto');
const { requireAuth } = require('../middleware/authSupabaseUser');
const { getVoiceLesson, buildVoiceSession } = require('../voiceTutor');
const router = express.Router();
const attempts = new Map();

const isLocalBypass = (req) => process.env.VITE_PREMIUM_DEV_BYPASS === 'true'
  && process.env.NODE_ENV !== 'production' && !process.env.NETLIFY
  && ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);

router.get('/status', (req, res) => res.json({ configured: Boolean(process.env.OPENAI_API_KEY) }));

router.post('/session', async (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'Dialogul vocal nu este disponibil momentan.' });
  if (isLocalBypass(req)) { req.userId = 'local-development'; return next(); }
  return requireAuth(req, res, next);
}, async (req, res) => {
  try {
    const { level, lessonId, pathId = 'general' } = req.body || {};
    if (!['A1', 'A2', 'B1', 'B2'].includes(level) || !Number.isInteger(lessonId)) {
      return res.status(400).json({ error: 'Lecția selectată nu este validă.' });
    }
    const context = getVoiceLesson({ level, lessonId, pathId });
    if (!context) return res.status(400).json({ error: 'Lecția sau direcția selectată nu există.' });
    const now = Date.now();
    for (const [key, time] of attempts) if (now - time > 60_000) attempts.delete(key);
    if (attempts.has(req.userId)) return res.status(429).json({ error: 'Așteaptă un minut înainte de a porni alt dialog.' });
    attempts.set(req.userId, now);
    const upstream = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST', signal: AbortSignal.timeout(20_000),
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json',
        'OpenAI-Safety-Identifier': crypto.createHash('sha256').update(req.userId).digest('hex') },
      body: JSON.stringify({ expires_after: { anchor: 'created_at', seconds: 60 }, session: buildVoiceSession(context) }),
    });
    const data = await upstream.json();
    if (!upstream.ok || !data.value) return res.status(502).json({ error: 'Nu am putut porni partenerul vocal. Încearcă din nou.' });
    return res.json({ value: data.value, expiresAt: data.expires_at });
  } catch (_) {
    return res.status(502).json({ error: 'Serviciul vocal nu răspunde momentan. Încearcă din nou.' });
  }
});
module.exports = router;
