require('dotenv').config();
const express = require('express');
const cors = require('cors');
const newsRouter = require('./routes/news');
const translateRouter = require('./routes/translate');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'NorvegiaTa API' });
});

app.use('/api/news', newsRouter);
app.use('/api/translate', translateRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Eroare server' });
});

app.listen(PORT, () => {
  console.log('Server ruleaza pe http://localhost:' + PORT);
});
