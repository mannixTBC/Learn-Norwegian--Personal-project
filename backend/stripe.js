/**
 * Instanța Stripe (singleton, server-side).
 *
 * Este creată lazy: dacă STRIPE_SECRET_KEY lipsește (de ex. în dev fără cont Stripe),
 * `getStripe()` returnează null, iar rutele de billing răspund cu o eroare clară
 * în loc să crape procesul. Acest lucru permite rularea aplicației fără Stripe configurat.
 */
const Stripe = require('stripe');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

let stripeInstance = null;
if (STRIPE_SECRET_KEY) {
  stripeInstance = Stripe(STRIPE_SECRET_KEY, {
    appInfo: { name: 'NorvegiaTa', version: '1.0.0' },
  });
}

/** Returnează instanța Stripe sau null dacă nu e configurată. */
const getStripe = () => stripeInstance;

/** True dacă Stripe este configurat (cheia secretă prezentă). */
const isStripeConfigured = () => Boolean(stripeInstance);

module.exports = { getStripe, isStripeConfigured };
