const express = require('express');

const { getOpenAI, isOpenAIConfigured } = require('../openai');
const { buildLessonContext } = require('../lessonContext');

const router = express.Router();

const MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
/** Număr maxim de mesaje din istoric trimise către AI (control cost/tokeni). */
const MAX_HISTORY = 12;

/**
 * Construieste system prompt-ul complet: rolul asistentului + contextul lecției.
 */
const buildSystemPrompt = (level, lessonId) => {
  const context = buildLessonContext(level, lessonId);
  return [
    'Ești un partener de conversație prietenos care îl ajută pe utilizator să practice norvegiana (Bokmål).',
    'Reguli:',
    '- Răspunde ÎNTOTDEAUNA scurt (maxim 1-2 propoziții) în norvegiană.',
    '- Folosește cu prioritate vocabularul și gramatica din lecția curentă și anterioare (vezi mai jos).',
    '- Păstrează un ton natural, ca într-o conversație reală.',
    '- Dacă utilizatorul scrie în română sau greșește vizibil în norvegiană, răspunde totuși în norvegiană, dar adaugă la final, între paranteze drepte, o scurtă corectare sau explicație în română. Ex: [În norvegiană spunem „Hva heter du?”].',
    '- Nu folosi cuvinte sau structuri mult peste nivelul utilizatorului.',
    '',
    context,
  ].join('\n');
};

/**
 * Normalizează istoricul mesajelor primit de la frontend.
 * Acceptă formatul OpenAI [{role, content}] și îl limitează la MAX_HISTORY.
 */
const sanitizeMessages = (messages) => {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((message) => message && (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string')
    .map(({ role, content }) => ({ role, content: content.slice(0, 500) })) // limităm lungimea per mesaj
    .slice(-MAX_HISTORY);
};

/**
 * POST /api/chat
 * Body: { messages: [{role, content}], level: 'A1', lessonId: 1 }
 * Response: { reply: string }
 */
router.post('/', async (req, res) => {
  if (!isOpenAIConfigured()) {
    return res.status(503).json({ error: 'Asistentul virtual nu este configurat (lipsește OPENAI_API_KEY).' });
  }

  const { messages = [], level = 'A1', lessonId = 1 } = req.body || {};
  const history = sanitizeMessages(messages);

  if (!history.length) {
    return res.status(400).json({ error: 'Trimite cel puțin un mesaj.' });
  }

  const openai = getOpenAI();
  const systemPrompt = buildSystemPrompt(level, lessonId);

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const reply = completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content;
    if (!reply) {
      return res.status(502).json({ error: 'Asistentul nu a returnat niciun răspuns.' });
    }

    return res.json({ reply: reply.trim() });
  } catch (err) {
    console.warn('[chat] OpenAI a eșuat:', err.message);
    return res.status(502).json({ error: 'Nu am putut contacta asistentul virtual. Încearcă din nou.' });
  }
});

module.exports = router;
