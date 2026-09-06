# Configurare abonament Premium (Stripe)

Acest ghid descrie pașii pentru activarea contului Premium în aplicația NorvegiaTa.

> **Important:** infrastructura este completă și poate rula și fără Stripe configurat.
> În dezvoltare, variabila `VITE_PREMIUM_DEV_BYPASS=true` face ca TOATE
> funcționalitățile să fie deblocate (toți utilizatorii sunt considerați Premium),
> astfel încât să poți testa fără un abonament real.

---

## Cum funcționează (pe scurt)

1. Utilizatorul apasă „Treci la Premium" pe pagina `/premium`.
2. Frontend-ul apelează `POST /api/billing/checkout` (cu JWT-ul său Supabase).
3. Backend-ul creează o sesiune **Stripe Checkout** (abonament recurent) și returnează un URL.
4. După plată, Stripe trimite un **webhook** la `/api/stripe-webhook`.
5. Webhook-ul (cu service_role) scrie în tabelele `customers`, `subscriptions` și setează `profiles.plan = 'premium'`.
6. Frontend-ul citește `profiles.plan` și deblochează funcționalitățile Premium.

Pentru gestionare (anulare, facturi, schimbare card), se folosește **Stripe Customer Portal**.

---

## Pasul 1 — Creează produsul și prețul în Stripe

1. Intră în [Stripe Dashboard](https://dashboard.stripe.com/) (mod **Test** pentru început).
2. Mergi la **Products** → **Add product**.
3. Nume: „NorvegiaTa Premium". Descriere opțională.
4. Pricing model: **Standard pricing**, Recurring → **Monthly** (lunar).
5. Setează prețul (ex. 49 RON sau echivalentul dorit).
6. Salvează și copiază **Price ID** (are formatul `price_...`).
7. Pune-l în variabila `STRIPE_PREMIUM_PRICE_ID`.

---

## Pasul 2 — Configurează webhook-ul Stripe

Webhook-ul sincronizează starea abonamentului în Supabase.

1. În Stripe Dashboard mergi la **Developers** → **Webhooks** → **Add endpoint**.
2. **Endpoint URL:** `https://siteul-tau.ro/api/stripe-webhook`
   - Pentru testare locală folosește **Stripe CLI** (vezi mai jos).
3. **Events to send** (selectează exact acestea):
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. După creare, la **Signing secret** copiază valoarea (`whsec_...`).
5. Pune-o în variabila `STRIPE_WEBHOOK_SECRET`.

### Testare locală cu Stripe CLI

```bash
# Instalează Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to http://localhost:5000/api/stripe-webhook
# Va afișa: Ready! Your webhook signing secret is whsec_... (^C to quit)
```

Copiază acel `whsec_...` în `STRIPE_WEBHOOK_SECRET` pentru dezvoltare locală.

---

## Pasul 3 — Activează Customer Portal

Customer Portal este pagina gata de la Stripe unde utilizatorii își gestionează abonamentul.

1. În Stripe Dashboard mergi la **Settings** → **Billing** → **Customer portal**.
2. Activează portalul.
3. Configurare recomandată:
   - Permite anularea abonamentului.
   - Permite actualizarea cardului de plată.
   - Permite vizualizarea istoricului de facturi și chitanțelor.
4. Salvează.

---

## Pasul 4 — Rulează schema premium în Supabase

În Supabase Dashboard mergi la **SQL Editor** și rulează fișierul `supabase/schema_premium.sql`
(conținutul lui, copy-paste). Este idempotent — poate fi rulat de mai multe ori.

Acesta creează:
- Coloanele `plan` și `premium_until` pe tabela `profiles`.
- Tabela `customers` (legătura user ↔ Stripe customer).
- Tabela `subscriptions` (starea curentă a abonamentului).
- RLS: fiecare utilizator își vede doar propriile rânduri (citire).
- Funcția `is_premium(user_id)`.

> Dacă ai folosit deja `schema.sql` inițial și acum rulezi și `schema_premium.sql`,
> nu există conflict — ambele sunt idempotente.

---

## Pasul 5 — Obține Service Role Key din Supabase

Webhook-ul are nevoie de ea ca să scrie în tabele ocolind RLS (doar server-side).

1. În Supabase Dashboard mergi la **Settings** → **API**.
2. La **Project API keys** copiază **service_role** secret key (`eyJ...`).
3. Pune-o în variabila `SUPABASE_SERVICE_ROLE_KEY`.

> ⚠️ **Niciodată** să nu expui service_role în frontend (nu folosi prefix `VITE_` pentru ea).
> Este folosită exclusiv de webhook-ul Stripe, pe server.

---

## Pasul 6 — Completează variabilele de mediu

### Pentru dezvoltare locală (`.env`)

Copiază `.env.example` în `.env` și completează secțiunea Premium:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...service_role...

# true = toți utilizatorii sunt Premium (pentru testare). false = gating real.
VITE_PREMIUM_DEV_BYPASS=true
```

### Pentru producție (Netlify)

În **Site configuration** → **Environment variables** adaug aceleași variabile.
În producție setează `VITE_PREMIUM_DEV_BYPASS=false` (sau șterge variabila).

> `URL` este setată automat de Netlify (nu o adaugi manual).
> Este folosită de backend pentru a construi URL-urile de succes/anulare Checkout.

---

## Cum testezi

### În dezvoltare (fără Stripe real)

Cu `VITE_PREMIUM_DEV_BYPASS=true`:
- Toate funcționalitățile sunt deblocate.
- În Navbar apare badge-ul „★ Premium (dev)".
- Pagina `/premium` arată starea „Premium activ (mod dezvoltare)".
- Nu se fac apeluri la Stripe și nici la DB pentru entitlements.

### Cu Stripe în mod Test

1. Setează `VITE_PREMIUM_DEV_BYPASS=false`.
2. Configurează toate variabilele Stripe + `SUPABASE_SERVICE_ROLE_KEY`.
3. Deschide `/premium` ca utilizator autentificat.
4. Apasă „Treci la Premium" → folosește un card de test Stripe:
   - Card: `4242 4242 4242 4242`, dată viitoare, CVC arbitrar.
5. După redirect, contul tău ar trebui să devină Premium (verifică în Supabase `profiles.plan`).

---

## Structura tabelelor (rezumat)

| Tabelă | Rol | Cine scrie |
|---|---|---|
| `profiles` | `plan` (free/premium), `premium_until` | webhook Stripe (service_role) |
| `customers` | `user_id` ↔ `stripe_customer_id` | webhook Stripe (service_role) |
| `subscriptions` | starea curentă (status, period_end, etc.) | webhook Stripe (service_role) |

Frontend-ul și backend-ul de billing **citesc** doar (RLS permite SELECT pe propriul rând).

---

## Fișiere relevante

| Ce | Fișier |
|---|---|
| Schema DB premium | `supabase/schema_premium.sql` |
| Schema DB completă | `supabase/schema.sql` |
| Entitlements frontend | `src/services/entitlements.js` |
| Wrappers billing frontend | `src/services/billing.js` |
| Componente gating | `src/modules/premium/` |
| Instanță Stripe | `backend/stripe.js` |
| Middleware auth backend | `backend/middleware/authSupabaseUser.js` |
| Rute billing backend | `backend/routes/billing.js` |
| Webhook Stripe | `netlify/functions/stripe-webhook.js` |
