const express = require('express');
const { Readable } = require('node:stream');
const { verifyVoiceStreamTicket } = require('../voiceStreamTicket');
const { cartesiaSpeechStream } = require('../cartesiaSpeech');

const router = express.Router();

router.get('/', async (req, res) => {
  res.set('Cache-Control', 'private, no-store, max-age=0');
  try {
    const payload = verifyVoiceStreamTicket(req.query.ticket);
    const abort = new AbortController();
    req.once('aborted', () => abort.abort());
    const upstream = await cartesiaSpeechStream(payload.text, abort.signal);
    res.status(200);
    res.set('Content-Type', upstream.headers.get('content-type') || 'audio/mpeg');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Audio-Provider', 'cartesia');
    Readable.fromWeb(upstream.body).on('error', () => {
      if (!res.headersSent) res.status(502);
      res.end();
    }).pipe(res);
  } catch (error) {
    console.warn('cartesia-stream-failure', { kind: error.name, status: error.status || 502, providerStatus: error.providerStatus });
    if (!res.headersSent) res.status(error.status || 502).type('text/plain').send(error.status === 401 ? error.message : 'Vocea nu poate fi redată momentan.');
  }
});

module.exports = router;
