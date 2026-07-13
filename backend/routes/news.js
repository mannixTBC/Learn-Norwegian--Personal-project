const express = require('express');
const router = express.Router();
const fetch = typeof globalThis.fetch === 'function' ? globalThis.fetch : require('node-fetch');

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

router.get('/headlines', async (req, res, next) => {
  if (!GNEWS_API_KEY) {
    return res.status(503).json({
      error: 'Lipseste GNEWS_API_KEY in .env',
    });
  }
  try {
    const url = 'https://gnews.io/api/v4/top-headlines?country=no&max=10&token=' + encodeURIComponent(GNEWS_API_KEY);
    const response = await fetch(url);
    const data = await response.json();
    if (data.errors && data.errors.length > 0) {
      return res.status(400).json({ errors: data.errors });
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
