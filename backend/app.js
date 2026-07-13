require('dotenv').config();
const express = require('express');
const cors = require('cors');
const newsRouter = require('./routes/news');
const translateRouter = require('./routes/translate');
const speechRouter = require('./routes/speech');
const pronunciationRouter = require('./routes/pronunciation');

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: '6mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'NorvegiaTa API' });
});

app.use('/api/news', newsRouter);
app.use('/api/translate', translateRouter);
app.use('/api/speech', speechRouter);
app.use('/api/pronunciation', pronunciationRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Eroare server' });
});

module.exports = app;
