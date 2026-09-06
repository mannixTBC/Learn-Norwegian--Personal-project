/**
 * Webhook Stripe — sincronizează starea abonamentului în Supabase.
 *
 * NECESITĂ o Netlify function separată (nu trece prin Express) deoarece Stripe
 * verifică semnătura webhook-ului pe corpul RAW al cererii, iar `express.json()`
 * l-ar altera. Acest handler primește raw body-ul intact.
 *
 * Folosește SUPABASE_SERVICE_ROLE_KEY (server-side only) pentru a scrie în
 * tabelele `customers`, `subscriptions` și `profiles` ocolind RLS.
 *
 * Redirect în netlify.toml: /api/stripe-webhook → /.netlify/functions/stripe-webhook
 *
 * Evenimente gestionate:
 *  - checkout.session.completed        → înregistrează customer + plan premium
 *  - customer.subscription.created     → upsert subscription
 *  - customer.subscription.updated     → upsert subscription + plan
 *  - customer.subscription.deleted     → marchează free + subscription canceled
 */
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const stripe = STRIPE_SECRET_KEY ? Stripe(STRIPE_SECRET_KEY) : null;

/** True dacă webhook-ul are toate dependențele configurate. */
const isConfigured = () => Boolean(stripe && STRIPE_WEBHOOK_SECRET && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

/** Stări de abonament Stripe care înseamnă „Premium activ”. */
const ACTIVE_STATUSES = new Set(['active', 'trialing']);

/**
 * Sincronizează un obiect subscription Stripe în Supabase.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {object} subscription Obiectul Subscription de la Stripe.
 */
const syncSubscription = async (supabase, subscription) => {
  const userId = subscription.metadata && subscription.metadata.userId;
  const customerId = subscription.customer;

  // Rezolvă userId din customer dacă nu e în metadata subscription.
  let resolvedUserId = userId;
  if (!resolvedUserId) {
    const { data } = await supabase
      .from('customers')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();
    resolvedUserId = data && data.user_id;
  }
  if (!resolvedUserId) return;

  // Upsert customers (legate de userId).
  await supabase
    .from('customers')
    .upsert({ user_id: resolvedUserId, stripe_customer_id: customerId }, { onConflict: 'user_id' });

  // Upsert subscriptions.
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: resolvedUserId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: (subscription.items && subscription.items.data && subscription.items.data[0] && subscription.items.data[0].price && subscription.items.data[0].price.id) || null,
      status: subscription.status,
      current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    }, { onConflict: 'stripe_subscription_id' });

  // Actualizează plan pe profiles.
  const isActive = ACTIVE_STATUSES.has(subscription.status);
  await supabase
    .from('profiles')
    .update({ plan: isActive ? 'premium' : 'free' })
    .eq('id', resolvedUserId);
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  if (!isConfigured()) {
    console.warn('[stripe-webhook] Lipsește configurarea (STRIPE_SECRET_KEY/WEBHOOK_SECRET/SUPABASE_SERVICE_ROLE_KEY).');
    return { statusCode: 503, body: 'Webhook neconfigurat.' };
  }

  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  let received;
  try {
    // Stripe verifică semnătura pe raw body; Netlify îl pune în event.body (string).
    received = stripe.webhooks.constructEvent(event.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.warn('[stripe-webhook] Semnătură invalidă:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    switch (received.type) {
      case 'checkout.session.completed': {
        const session = received.data.object;
        const customerId = session.customer;
        const userId = session.client_reference_id || (session.metadata && session.metadata.userId);
        if (userId && customerId) {
          await supabase
            .from('customers')
            .upsert({ user_id: userId, stripe_customer_id: customerId }, { onConflict: 'user_id' });
          // Dacă există deja un subscription asociat, îl sincronizăm; altfel marcăm premium.
          if (session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            await syncSubscription(supabase, subscription);
          } else {
            await supabase.from('profiles').update({ plan: 'premium' }).eq('id', userId);
          }
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await syncSubscription(supabase, received.data.object);
        break;
      }
      default:
        // Eveniment negestionat — confirmăm primirea fără acțiune.
        break;
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('[stripe-webhook] Eroare procesare:', err.message);
    return { statusCode: 500, body: 'Eroare internă.' };
  }
};
