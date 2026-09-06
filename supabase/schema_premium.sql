-- Rulează acest fișier o singură dată în Supabase > SQL Editor.
-- Adaugă stratul de entitlements pentru abonamentul Premium (Stripe).
-- Este idempotent: poate fi rulat de mai multe ori fără efecte adverse.
-- Presupune că `public.profiles` și `public.learning_progress` există deja (vezi schema.sql).

-- ── 1. Coloane pe `profiles` pentru starea abonamentului ──────────────
alter table public.profiles
  add column if not exists plan text not null default 'free' check (plan in ('free', 'premium'));

alter table public.profiles
  add column if not exists premium_until timestamptz;

-- ── 2. Tabela `customers` (legătura user Supabase ↔ client Stripe) ────
create table if not exists public.customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now()
);

-- ── 3. Tabela `subscriptions` (oglindește starea abonamentului Stripe) ─
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_subscription_id text not null unique,
  stripe_price_id text,
  status text not null default 'incomplete',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);

-- ── 4. Row Level Security ─────────────────────────────────────────────
-- Frontend-ul (anon/authenticated) doar CITEȘTE propriile rânduri.
-- Scrierea se face exclusiv din webhook-ul Stripe, cu service_role (server-side),
-- care ocolește RLS.

alter table public.customers enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "Users read own customer row" on public.customers;
create policy "Users read own customer row" on public.customers
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users read own subscription" on public.subscriptions;
create policy "Users read own subscription" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);

-- ── 5. Funcție `is_premium` — poate fi folosită în backend/RLS ─────────
-- Returnează true dacă plan='premium' și nu a expirat (premium_until null sau viitor).
drop function if exists public.is_premium(p_user uuid);
create or replace function public.is_premium(p_user uuid)
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = p_user
      and plan = 'premium'
      and (premium_until is null or premium_until > now())
  );
$$;

-- ── 6. Trigger pentru `subscriptions.updated_at` ──────────────────────
drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at before update on public.subscriptions
  for each row execute procedure public.set_updated_at();
