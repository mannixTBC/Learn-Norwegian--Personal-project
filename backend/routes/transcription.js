// nordlingo-language-context-v1
const {requireTranscriptionLanguage} = require('../languageContext');
const express = require('express');
const { requireAuth } = require('../middleware/authSupabaseUser');
const { deepgramEnabled, languageCode, validateAudio, transcribeDeepgram, createTranscriptionGuard } = require('../deepgramTranscription');
const router = express.Router();
const reserve = createTranscriptionGuard();
router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
router.use(requireAuth);

router.post('/', async (req, res) => {
  let release;
  const controller = new AbortController();
  const disconnected = () => { if (!res.writableEnded) controller.abort(); };
  res.on('close', disconnected);
  try {
    const audio = validateAudio(req.body);
    const language = languageCode(requireTranscriptionLanguage(req.body.language));
    if (!deepgramEnabled()) return res.status(503).json({ error: 'Transcrierea Deepgram nu este încă activată.', code: 'STT_NOT_CONFIGURED' });
    release = reserve(req.userId);
    const result = await transcribeDeepgram({ ...audio, language, signal: controller.signal });
    if (!controller.signal.aborted) res.json(result);
  } catch (error) {
    if (!controller.signal.aborted) res.status(error.status || 502).json({
      error: error.status ? error.message : 'Transcrierea nu este disponibilă momentan.',
      code: error.code || 'STT_UNAVAILABLE',
    });
  } finally {
    release?.(); res.off('close', disconnected);
  }
});
module.exports = router;
