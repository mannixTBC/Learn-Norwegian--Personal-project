'use strict';
const express = require('express');
const {pipeline} = require('node:stream/promises');
const {lessonSpeech} = require('./lessonSpeech');
const {lessonVoiceSelection} = require('./lessonVoiceSelection');
const router = express.Router();

// Lesson audio has its own validated course catalog. It does not publish or
// unlock AI tutors for language pairs whose tutoring adapters are not released.
router.get('/', async (req, res, next) => {
  const controller = new AbortController();
  res.once('close', () => controller.abort());
  try {
    const {text, voice, learningLanguage} = req.query;
    const selection = lessonVoiceSelection(learningLanguage, voice);
    const result = await lessonSpeech({text, voice, ...selection,
      stream: req.query.stream === '1', signal: controller.signal});
    res.set(result.headers);
    if (result.stream) await pipeline(result.stream, res);
    else res.send(result.audio);
  } catch (error) {
    if (!res.headersSent) next(error);
    else res.destroy();
  }
});
module.exports = router;
