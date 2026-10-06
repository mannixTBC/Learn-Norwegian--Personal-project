/**
 * Middleware de autentificare pentru rutele de billing.
 *
 * Extrage JWT-ul din antetul `Authorization: Bearer <token>`, îl verifică
 * prin `supabase.auth.getUser(token)`, și atașează `req.userId` + `req.userEmail`.
 * Respinge cu 401 dacă token-ul lipsește sau este invalid.
 *
 * Folosește o instanță Supabase separată (server-side) cu anon key — nu are
 * nevoie de service_role doar pentru a citi identitatea utilizatorului.
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabaseAdmin = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Returnează clientul Supabase server-side sau null dacă nu e configurat. */
const getSupabase = () => supabaseAdmin;

/** True dacă Supabase este configurat pentru verificarea pe server. */
const isSupabaseServerConfigured = () => Boolean(supabaseAdmin);

/**
 * Middleware Express: verifică identitatea utilizatorului.
 * Atașează `req.userId` și `req.userEmail` la cerere.
 */
const requireAuth = async (req, res, next) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Autentificarea nu este configurată pe server.' });
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Lipsește token-ul de autentificare.' });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Token invalid sau expirat.' });
    }
    req.userId = data.user.id;
    req.userEmail = data.user.email || null;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Nu am putut verifica identitatea.' });
  }
};

module.exports = { requireAuth, getSupabase, isSupabaseServerConfigured };
