const express = require('express');
const { requireAuth, getSupabaseForAccessToken } = require('../middleware/authSupabaseUser');

const router = express.Router();
const CONSENT_VERSION = 'voice-improvement-v1';
const RETENTION_DAYS = 90;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const pathPattern = /^[a-z0-9-]{1,50}$/;

const fail = (message, status = 400) => Object.assign(new Error(message), { status });

const normalizeTranscriptMessages = (messages) => {
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 24) {
    throw fail('Transcriptul conversației nu este valid.');
  }

  return messages.map((message) => {
    const role = message?.role;
    const content = typeof message?.content === 'string' ? message.content.trim().slice(0, 2_000) : '';
    const turn = Number.isInteger(message?.turn) ? Math.max(0, Math.min(message.turn, 8)) : 0;
    if (!['user', 'assistant'].includes(role) || !content) throw fail('O replică din transcript nu este validă.');
    return { role, content, turn };
  });
};

const databaseFor = (req) => {
  const database = getSupabaseForAccessToken(req.accessToken);
  if (!database) throw fail('Salvarea transcriptelor nu este configurată momentan.', 503);
  return database;
};

const sendError = (res, error) => {
  const missingSchema = error?.code === '42P01';
  const status = missingSchema ? 503 : error?.status || 502;
  const message = missingSchema
    ? 'Salvarea transcriptelor va fi disponibilă după actualizarea bazei de date.'
    : error?.status ? error.message : 'Preferința de confidențialitate nu a putut fi salvată.';
  return res.status(status).json({ error: message });
};

router.use(requireAuth);

router.get('/preference', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const { data, error } = await databaseFor(req)
      .from('voice_transcript_preferences')
      .select('improvement_consent, updated_at')
      .eq('user_id', req.userId)
      .maybeSingle();
    if (error) throw error;
    return res.json({ enabled: data?.improvement_consent === true, updatedAt: data?.updated_at || null });
  } catch (error) {
    return sendError(res, error);
  }
});

router.put('/preference', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    if (typeof req.body?.enabled !== 'boolean') throw fail('Alege dacă dorești salvarea transcriptelor.');
    const enabled = req.body.enabled;
    const database = databaseFor(req);
    const now = new Date().toISOString();
    const { error } = await database.from('voice_transcript_preferences').upsert({
      user_id: req.userId,
      improvement_consent: enabled,
      consent_version: enabled ? CONSENT_VERSION : null,
      consented_at: enabled ? now : null,
      withdrawn_at: enabled ? null : now,
      updated_at: now,
    }, { onConflict: 'user_id' });
    if (error) throw error;

    // Retragerea acordului șterge și transcriptele deja păstrate.
    if (!enabled) {
      const { error: deleteError } = await database
        .from('voice_conversations')
        .delete()
        .eq('user_id', req.userId);
      if (deleteError) throw deleteError;
    }

    return res.json({ enabled, updatedAt: now });
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const { conversationId, level, lessonId, pathId = 'general', mode, messages, feedback = '' } = req.body || {};
    if (!uuidPattern.test(conversationId || '') || !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level)
      || !Number.isInteger(lessonId) || lessonId < 1 || lessonId > 999
      || !pathPattern.test(pathId) || !['realtime', 'batch'].includes(mode)) {
      throw fail('Datele conversației nu sunt valide.');
    }

    const transcript = normalizeTranscriptMessages(messages);
    if (!transcript.some((message) => message.role === 'user')) throw fail('Conversația nu conține un răspuns al cursantului.');
    const database = databaseFor(req);
    const { data: preference, error: preferenceError } = await database
      .from('voice_transcript_preferences')
      .select('improvement_consent, consent_version')
      .eq('user_id', req.userId)
      .maybeSingle();
    if (preferenceError) throw preferenceError;
    if (preference?.improvement_consent !== true) return res.status(204).end();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1_000).toISOString();
    const { error } = await database.from('voice_conversations').upsert({
      id: conversationId,
      user_id: req.userId,
      level,
      lesson_id: lessonId,
      path_id: pathId,
      mode,
      transcript,
      feedback: typeof feedback === 'string' ? feedback.trim().slice(0, 1_000) || null : null,
      turn_count: transcript.filter((message) => message.role === 'user').length,
      consent_version: preference.consent_version || CONSENT_VERSION,
      updated_at: now.toISOString(),
      expires_at: expiresAt,
    }, { onConflict: 'id' });
    if (error) throw error;
    return res.status(204).end();
  } catch (error) {
    return sendError(res, error);
  }
});

module.exports = router;
module.exports.normalizeTranscriptMessages = normalizeTranscriptMessages;

