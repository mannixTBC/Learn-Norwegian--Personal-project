const express = require('express');

const { getStripe, isStripeConfigured } = require('../stripe');
const { requireAuth, getSupabase } = require('../middleware/authSupabaseUser');

const router = express.Router();

const PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID;
const APP_ORIGIN = process.env.URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4173');

const appOrigin = () => APP_ORIGIN || (process.env.URL || '');

/** Toate rutele de billing necesită autentificare. */
router.use(requireAuth);

/** Verifică prezența dependențelor și răspunde clar dacă lipsesc. */
const ensureBillingConfigured = (res) => {
  if (!isStripeConfigured()) {
    return res.status(503).json({ error: 'Plățile nu sunt configurate încât (lipsește STRIPE_SECRET_KEY).' });
  }
  if (!PRICE_ID) {
    return res.status(503).json({ error: 'Prețul Premium nu este configurat (lipsește STRIPE_PREMIUM_PRICE_ID).' });
  }
  return null;
};

/** Returnează clientul Supabase server-side sau 503. */
const requireSupabase = (res) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(503).json({ error: 'Baza de date nu este configurată pe server.' });
    return null;
  }
  return supabase;
};

/**
 * POST /api/billing/checkout
 * Creează o sesiune Stripe Checkout (abonament recurent Premium).
 * Body opțional: { successUrl?, cancelUrl? }
 */
router.post('/checkout', async (req, res) => {
  const missing = ensureBillingConfigured(res);
  if (missing) return missing;

  const stripe = getStripe();
  const origin = appOrigin();
  const successUrl = (req.body && req.body.successUrl) || `${origin}/premium?status=success`;
  const cancelUrl = (req.body && req.body.cancelUrl) || `${origin}/premium?status=cancel`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      client_reference_id: req.userId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId: req.userId },
    });
    return res.json({ url: session.url });
  } catch (err) {
    console.warn('[billing] checkout a eșuat:', err.message);
    return res.status(502).json({ error: 'Nu am putut porni procesul de plată.' });
  }
});

/**
 * POST /api/billing/portal
 * Deschide Stripe Customer Portal (anulare, facturi, schimbare card).
 */
router.post('/portal', async (req, res) => {
  const missing = ensureBillingConfigured(res);
  if (missing) return missing;

  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const { data, error } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', req.userId)
      .maybeSingle();
    if (error || !data || !data.stripe_customer_id) {
      return res.status(404).json({ error: 'Nu există un client Stripe asociat contului.' });
    }

    const stripe = getStripe();
    const origin = appOrigin();
    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${origin}/premium`,
    });
    return res.json({ url: session.url });
  } catch (err) {
    console.warn('[billing] portal a eșuat:', err.message);
    return res.status(502).json({ error: 'Nu am putut deschide gestionarea abonamentului.' });
  }
});

/**
 * GET /api/billing/subscription
 * Returnează starea curentă a abonamentului pentru utilizatorul autentificat.
 */
router.get('/subscription', async (req, res) => {
  const supabase = requireSupabase(res);
  if (!supabase) return;

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan, premium_until')
      .eq('id', req.userId)
      .maybeSingle();
    if (profileError) throw profileError;

    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('status, current_period_end, cancel_at_period_end, stripe_price_id')
      .eq('user_id', req.userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (subError) throw subError;

    return res.json({
      plan: (profile && profile.plan) || 'free',
      premiumUntil: (profile && profile.premium_until) || null,
      status: (sub && sub.status) || null,
      currentPeriodEnd: (sub && sub.current_period_end) || null,
      cancelAtPeriodEnd: (sub && sub.cancel_at_period_end) || false,
      priceId: (sub && sub.stripe_price_id) || null,
    });
  } catch (err) {
    console.warn('[billing] subscription a eșuat:', err.message);
    return res.status(502).json({ error: 'Nu am putut încărca starea abonamentului.' });
  }
});

module.exports = router;
