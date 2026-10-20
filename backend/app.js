require('dotenv').config();
if (process.env.NODE_ENV !== 'production' && !process.env.NETLIFY) require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const newsRouter = require('./routes/news');
const translateRouter = require('./routes/translate');
const speechRouter = require('./routes/speech');
const pronunciationRouter = require('./routes/pronunciation');
const billingRouter = require('./routes/billing');
const chatRouter = require('./routes/chat');
const voiceRouter = require('./routes/voice');
const voicePracticeRouter = require('./routes/voicePractice');
const voiceStreamRouter = require('./routes/voiceStream');
const voiceTranscriptsRouter = require('./routes/voiceTranscripts');
const accountRouter = require('./routes/account');

const app = express();

app.use(cors({ origin: true }));
// Text chat never needs the multi-megabyte body allowance used by voice uploads.
// Mount it first with a deliberately small parser so oversized requests are
// rejected before they consume memory or reach the OpenAI integration.
app.use('/api/chat', express.json({ limit: '56kb' }), chatRouter);
app.use(express.json({ limit: '6mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'NorvegiaTa API' });
});

app.use('/api/news', newsRouter);
app.use('/api/translate', translateRouter);
app.use('/api/speech', speechRouter);
app.use('/api/pronunciation', pronunciationRouter);
app.use('/api/billing', billingRouter);
app.use('/api/voice/stream', voiceStreamRouter);
app.use('/api/voice/practice', voicePracticeRouter);
app.use('/api/voice/transcripts', voiceTranscriptsRouter);
app.use('/api/voice', voiceRouter);
app.use('/api/account', accountRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = Number.isInteger(err.status) ? err.status : 500;
  const message = err.type === 'entity.too.large'
    ? 'Mesajul trimis este prea mare.'
    : err.message || 'Eroare server';
  res.status(status).json({ error: message });
});

module.exports = app;
