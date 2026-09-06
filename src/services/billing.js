/**
 * Billing — wrapper-e pentru endpoint-urile /api/billing/*.
 *
 * Aceste apeluri necesită autentificare: trimit JWT-ul sesiunii Supabase
 * în antetul Authorization, iar backend-ul îl verifică înainte de a crea
 * sesiuni Stripe (checkout / portal).
 */

import { supabase } from './supabaseClient';

/** Rezolvă URL-ul bazei pentru API (localhost:5000 în dev, same-origin în producție). */
const apiBase = () => {
  const local = typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost';
  return local ? 'http://localhost:5000' : '';
};

/** Obține JWT-ul sesiunii curente sau aruncă dacă nu există. */
const requireAccessToken = async () => {
  if (!supabase) throw new Error('Autentificarea nu este disponibilă.');
  const { data, error } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (error || !token) throw new Error('Trebuie să fii autentificat pentru această acțiune.');
  return token;
};

const postJson = async (path, payload = {}) => {
  const token = await requireAccessToken();
  const response = await fetch(`${apiBase()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Cererea a eșuat.');
  return data;
};

const getJson = async (path) => {
  const token = await requireAccessToken();
  const response = await fetch(`${apiBase()}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Cererea a eșuat.');
  return data;
};

/**
 * Pornește fluxul de abonare Stripe Checkout.
 * @returns {Promise<{ url: string }>} URL-ul către care se face redirect.
 */
export const createCheckoutSession = () => postJson('/api/billing/checkout');

/**
 * Deschide Stripe Customer Portal (anulare, facturi, schimbare card).
 * @returns {Promise<{ url: string }>}
 */
export const createPortalSession = () => postJson('/api/billing/portal');

/**
 * Returnează starea curentă a abonamentului.
 * @returns {Promise<{ plan, premiumUntil, status, currentPeriodEnd, cancelAtPeriodEnd }>}
 */
export const getSubscriptionStatus = () => getJson('/api/billing/subscription');
