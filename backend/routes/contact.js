/**
 * Formularul de contact din aplicație.
 *
 * Primește mesajul utilizatorului și îl trimite pe e-mail echipei prin
 * API-ul HTTPS Resend (SMTP-ul este blocat pe planul Hobby Railway).
 * `reply_to` este adresa utilizatorului, deci un simplu „Reply” îi răspunde.
 */
const express = require('express');
const { getSupabase } = require('../middleware/authSupabaseUser');

const router = express.Router();
const fetchImpl = (...args) => globalThis.fetch(...args);

const CATEGORIES = ['technical', 'lessons', 'account', 'other'];
const CATEGORY_LABELS = { technical: 'Problemă tehnică', lessons: 'Lecții și exerciții', account: 'Cont și abonament', other: 'Altă problemă' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map();

function clean(value, max) {
  return typeof value === 'string' ? value.replace(/\r\n?/g, '\n').trim().slice(0, max) : '';
}

/** Validează corpul cererii; aruncă o eroare cu mesaj pentru utilizator. */
function normalizeContact(body) {
  const email = clean(body?.email, 254);
  const message = clean(body?.message, 2000);
  const category = CATEGORIES.includes(body?.category) ? body.category : 'other';
  if (!EMAIL_PATTERN.test(email)) throw new Error('Introdu o adresă de e-mail validă.');
  if (message.length < 10) throw new Error('Descrie problema în cel puțin 10 caractere.');
  return { email, message, category, platform: clean(body?.platform, 20), appVersion: clean(body?.appVersion, 40) };
}

/** Limită simplă în memorie: câteva mesaje pe oră pentru fiecare IP și e-mail. */
function allowContact(keys, now = Date.now()) {
  for (const [key, times] of recent) {
    const fresh = times.filter((time) => now - time < WINDOW_MS);
    if (fresh.length) recent.set(key, fresh); else recent.delete(key);
  }
  if (keys.some((key) => (recent.get(key) || []).length >= MAX_PER_WINDOW)) return false;
  for (const key of keys) recent.set(key, [...(recent.get(key) || []), now]);
  return true;
}

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket?.remoteAddress || 'unknown';
}

async function verifiedUserId(req) {
  const header = req.headers.authorization || '';
  const supabase = getSupabase();
  if (!supabase || !header.startsWith('Bearer ')) return null;
  try {
    const { data } = await supabase.auth.getUser(header.slice(7));
    return data?.user?.id || null;
  } catch {
    return null;
  }
}

function buildEmail(contact, userId) {
  const label = CATEGORY_LABELS[contact.category];
  const details = [
    `E-mail: ${contact.email}`,
    `Categorie: ${label}`,
    contact.platform && `Platformă: ${contact.platform}`,
    contact.appVersion && `Versiune: ${contact.appVersion}`,
    `Utilizator: ${userId || 'neautentificat'}`,
  ].filter(Boolean).join('\n');
  return {
    from: process.env.CONTACT_FROM_EMAIL || 'NordLingo <onboarding@resend.dev>',
    to: [process.env.SUPPORT_EMAIL],
    reply_to: contact.email,
    subject: `[NordLingo] ${label}`,
    text: `${contact.message}\n\n---\n${details}`,
  };
}

router.post('/', async (req, res) => {
  let contact;
  try {
    contact = normalizeContact(req.body);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  if (!process.env.RESEND_API_KEY || !process.env.SUPPORT_EMAIL) {
    return res.status(503).json({ error: 'Formularul de contact nu este disponibil momentan.' });
  }
  if (!allowContact([`ip:${clientIp(req)}`, `email:${contact.email.toLowerCase()}`])) {
    return res.status(429).json({ error: 'Ai trimis prea multe mesaje. Încearcă din nou mai târziu.' });
  }
  try {
    const response = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(buildEmail(contact, await verifiedUserId(req))),
    });
    if (!response.ok) {
      console.error('Contact e-mail failed', response.status, await response.text().catch(() => ''));
      return res.status(502).json({ error: 'Mesajul nu a putut fi trimis. Încearcă din nou.' });
    }
    return res.json({ ok: true });
  } catch (error) {
    console.error('Contact e-mail failed', error?.message);
    return res.status(502).json({ error: 'Mesajul nu a putut fi trimis. Încearcă din nou.' });
  }
});

module.exports = router;
module.exports.normalizeContact = normalizeContact;
module.exports.allowContact = allowContact;
module.exports.buildEmail = buildEmail;
