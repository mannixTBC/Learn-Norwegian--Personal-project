/**
 * Entitlements — stratul care decide cine are acces Premium.
 *
 * Concept cheie: "dev bypass". Dacă VITE_PREMIUM_DEV_BYPASS === 'true',
 * TOȚI utilizatorii (inclusiv vizitatorii) sunt considerați Premium.
 * Astfel putem testa toate funcționalitățile în dezvoltare fără să fie nevoie
 * de un abonament real. În producție, setează VITE_PREMIUM_DEV_BYPASS=false
 * (sau șterge variabila) pentru a activa gating-ul real pe baza bazei de date.
 *
 * Sursa adevărului în producție: tabela `profiles` (coloanele `plan` și `premium_until`),
 * populată de webhook-ul Stripe. Frontend-ul doar citește (RLS permite SELECT pe propriul rând).
 */

import { supabase } from './supabaseClient';

const DEV_BYPASS = String(import.meta.env.VITE_PREMIUM_DEV_BYPASS || '').toLowerCase() === 'true';

/** Entitlements returnate când dev bypass-ul e activ (toți = premium). */
const DEV_BYPASS_ENTITLEMENTS = Object.freeze({
  plan: 'premium',
  isPremium: true,
  premiumUntil: null,
  source: 'dev-bypass',
});

/** Entitlement default pentru utilizatori neautentificați / fără rând în DB. */
const FREE_ENTITLEMENTS = Object.freeze({
  plan: 'free',
  isPremium: false,
  premiumUntil: null,
  source: 'db',
});

/**
 * Returnează entitlement-urile pentru un utilizator.
 * @param {{ id: string, isGuest?: boolean } | null} user
 */
export async function fetchEntitlements(user) {
  if (DEV_BYPASS) return DEV_BYPASS_ENTITLEMENTS;
  if (!user || user.isGuest || !supabase) return FREE_ENTITLEMENTS;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('plan, premium_until')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data) return FREE_ENTITLEMENTS;

    const plan = data.plan === 'premium' ? 'premium' : 'free';
    const premiumUntil = data.premium_until || null;
    const expired = premiumUntil ? new Date(premiumUntil).getTime() < Date.now() : false;

    return Object.freeze({
      plan: plan === 'premium' && !expired ? 'premium' : 'free',
      isPremium: plan === 'premium' && !expired,
      premiumUntil,
      source: 'db',
    });
  } catch {
    return FREE_ENTITLEMENTS;
  }
}

/**
 * Verifică dintr-un singur apel dacă un feature este deblocat.
 * În dev bypass returnează mereu true.
 * @param {string} _featureKey cheia feature-ului (rezervat pentru viitor, ex. 'chat-gpt')
 */
export async function hasFeature(_featureKey) {
  if (DEV_BYPASS) return true;
  // Pentru moment toate feature-urile premium sunt sub același umbrella "isPremium".
  // Când vom diferenția (ex. ChatGPT vs pronunție), extindem aici.
  return false;
}

/** True dacă dev bypass-ul e activ (pentru afișare în UI: badge „dev"). */
export const isDevBypassActive = () => DEV_BYPASS;
