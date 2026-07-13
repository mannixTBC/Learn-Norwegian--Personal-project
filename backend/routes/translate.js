const express = require('express');
const router = express.Router();
const fetch = typeof globalThis.fetch === 'function' ? globalThis.fetch : require('node-fetch');

const MYMEMORY_EMAIL = process.env.MYMEMORY_EMAIL;

function getMyMemoryUrl(text, fromLang, toLang) {
  const base = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=' + fromLang + '|' + toLang;
  return MYMEMORY_EMAIL ? base + '&de=' + encodeURIComponent(MYMEMORY_EMAIL) : base;
}

router.post('/', async (req, res, next) => {
  const body = req.body || {};
  const text = body.text;
  const fromLang = body.fromLang || 'no';
  const toLang = body.toLang || 'ro';
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Lipseste "text" in body' });
  }
  try {
    const url = getMyMemoryUrl(text.trim(), fromLang, toLang);
    const response = await fetch(url);
    const data = await response.json();
    if (data.quotaFinished) {
      return res.status(429).json({ error: 'Cota traducere epuizata', quotaFinished: true });
    }
    const translated = (data.responseData && data.responseData.translatedText) ? data.responseData.translatedText : text;
    res.json({ translated: translated, original: text });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
