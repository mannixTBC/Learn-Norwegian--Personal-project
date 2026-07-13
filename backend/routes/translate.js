const express = require('express');
const router = express.Router();
const fetch = typeof globalThis.fetch === 'function' ? globalThis.fetch : require('node-fetch');

const MYMEMORY_EMAIL = process.env.MYMEMORY_EMAIL;
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_API_URL = process.env.DEEPL_API_URL || 'https://api-free.deepl.com/v2/translate';

const DEEPL_LANGUAGES = {
  no: 'NB',
  nb: 'NB',
  'nb-NO': 'NB',
  ro: 'RO',
  en: 'EN',
};

function getMyMemoryUrl(text, fromLang, toLang) {
  const base = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=' + fromLang + '|' + toLang;
  return MYMEMORY_EMAIL ? base + '&de=' + encodeURIComponent(MYMEMORY_EMAIL) : base;
}

async function translateWithDeepL(text, fromLang, toLang) {
  const params = new URLSearchParams();
  params.set('text', text);
  params.set('source_lang', DEEPL_LANGUAGES[fromLang] || fromLang.toUpperCase());
  params.set('target_lang', DEEPL_LANGUAGES[toLang] || toLang.toUpperCase());

  const response = await fetch(DEEPL_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`DeepL a răspuns cu statusul ${response.status}`);
  }

  const data = await response.json();
  return data.translations && data.translations[0] && data.translations[0].text;
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
    if (DEEPL_API_KEY) {
      try {
        const translated = await translateWithDeepL(text.trim(), fromLang, toLang);
        if (translated) {
          return res.json({ translated, original: text, provider: 'deepl' });
        }
      } catch (deepLError) {
        console.warn('DeepL indisponibil; folosim MyMemory:', deepLError.message);
      }
    }

    const url = getMyMemoryUrl(text.trim(), fromLang, toLang);
    const response = await fetch(url);
    const data = await response.json();
    if (data.quotaFinished) {
      return res.status(429).json({ error: 'Cota traducere epuizata', quotaFinished: true });
    }
    const translated = (data.responseData && data.responseData.translatedText) ? data.responseData.translatedText : text;
    res.json({ translated: translated, original: text, provider: 'mymemory' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
