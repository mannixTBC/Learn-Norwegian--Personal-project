-- Rulează acest fișier o singură dată în Supabase > SQL Editor.
-- Toate tabelele sunt protejate prin Row Level Security.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Cursant',
  learning_level text not null default 'A1' check (learning_level in ('A1', 'A2', 'B1', 'B2')),
  career_path text,
  -- Stratul de entitlements pentru abonamentul Premium (gestionat de Stripe webhook).
  plan text not null default 'free' check (plan in ('free', 'premium')),
  premium_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.study_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null,
  level text check (level in ('A1', 'A2', 'B1', 'B2')),
  minutes integer not null default 0 check (minutes >= 0),
  score integer check (score between 0 and 100),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

alter table public.study_activity
  add column if not exists client_event_id text;

create unique index if not exists study_activity_user_client_event_key
  on public.study_activity (user_id, client_event_id)
  where client_event_id is not null;

alter table public.profiles enable row level security;
alter table public.learning_progress enable row level security;
alter table public.study_activity enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Users read own progress" on public.learning_progress;
create policy "Users read own progress" on public.learning_progress
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users create own progress" on public.learning_progress;
create policy "Users create own progress" on public.learning_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users update own progress" on public.learning_progress;
create policy "Users update own progress" on public.learning_progress
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users read own activity" on public.study_activity;
create policy "Users read own activity" on public.study_activity
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users create own activity" on public.study_activity;
create policy "Users create own activity" on public.study_activity
  for insert to authenticated with check ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists learning_progress_set_updated_at on public.learning_progress;
create trigger learning_progress_set_updated_at before update on public.learning_progress
  for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, 'Vizitator'), '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.learning_progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ════════════════════════════════════════════════════════════════════
-- STRAT PREMIUM (Stripe) — vezi și schema_premium.sql pentru detalii.
-- Frontend-ul doar citește (RLS); scrierea se face din webhook-ul Stripe
-- cu service_role (server-side), care ocolește RLS.
-- ════════════════════════════════════════════════════════════════════

-- Tabela `customers`: legătura user Supabase ↔ client Stripe.
create table if not exists public.customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now()
);

-- Tabela `subscriptions`: oglindește starea abonamentului Stripe.
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

alter table public.customers enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "Users read own customer row" on public.customers;
create policy "Users read own customer row" on public.customers
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users read own subscription" on public.subscriptions;
create policy "Users read own subscription" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

-- Funcție utilitară pentru validări server-side (true = are Premium activ).
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

-- ════════════════════════════════════════════════════════════════════
-- COTĂ DURABILĂ PENTRU CONVERSAȚIILE AI
-- Pentru o bază deja creată, poate fi rulat separat schema_chat.sql.
-- ════════════════════════════════════════════════════════════════════

-- Profilul pedagogic rămâne editabil, însă planul și expirarea Premium sunt
-- gestionate numai server-side de webhook-ul Stripe (service_role).
revoke update on table public.profiles from anon, authenticated;
grant update (display_name, learning_level, career_path) on public.profiles to authenticated;

create table if not exists public.chat_daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  request_count integer not null default 0 check (request_count >= 0),
  prompt_tokens bigint not null default 0 check (prompt_tokens >= 0),
  completion_tokens bigint not null default 0 check (completion_tokens >= 0),
  cached_tokens bigint not null default 0 check (cached_tokens >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

create index if not exists chat_daily_usage_date_idx
  on public.chat_daily_usage (usage_date);

alter table public.chat_daily_usage enable row level security;
revoke all on table public.chat_daily_usage from anon, authenticated;

create or replace function public.consume_chat_quota()
returns table (
  allowed boolean,
  remaining integer,
  daily_limit integer,
  plan text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_day date := (now() at time zone 'utc')::date;
  v_plan text := 'free';
  v_limit integer;
  v_count integer;
begin
  if v_user is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select case
    when p.plan = 'premium'
      and (p.premium_until is null or p.premium_until > now()) then 'premium'
    else 'free'
  end
  into v_plan
  from public.profiles as p
  where p.id = v_user;

  v_plan := coalesce(v_plan, 'free');
  v_limit := case when v_plan = 'premium' then 120 else 24 end;

  insert into public.chat_daily_usage as usage (
    user_id,
    usage_date,
    request_count,
    updated_at
  ) values (
    v_user,
    v_day,
    1,
    now()
  )
  on conflict (user_id, usage_date) do update
    set request_count = usage.request_count + 1,
        updated_at = now()
    where usage.request_count < v_limit
  returning usage.request_count into v_count;

  if v_count is null then
    select usage.request_count
      into v_count
      from public.chat_daily_usage as usage
      where usage.user_id = v_user and usage.usage_date = v_day;
    allowed := false;
  else
    allowed := true;
  end if;

  remaining := greatest(v_limit - coalesce(v_count, 0), 0);
  daily_limit := v_limit;
  plan := v_plan;
  return next;
end;
$$;

create or replace function public.record_chat_usage(
  p_prompt_tokens integer default 0,
  p_completion_tokens integer default 0,
  p_cached_tokens integer default 0
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_day date := (now() at time zone 'utc')::date;
  v_prompt integer := least(greatest(coalesce(p_prompt_tokens, 0), 0), 5000000);
  v_completion integer := least(greatest(coalesce(p_completion_tokens, 0), 0), 5000000);
  v_cached integer := least(greatest(coalesce(p_cached_tokens, 0), 0), 5000000);
begin
  if v_user is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  insert into public.chat_daily_usage as usage (
    user_id,
    usage_date,
    prompt_tokens,
    completion_tokens,
    cached_tokens,
    updated_at
  ) values (
    v_user,
    v_day,
    v_prompt,
    v_completion,
    v_cached,
    now()
  )
  on conflict (user_id, usage_date) do update
    set prompt_tokens = usage.prompt_tokens + excluded.prompt_tokens,
        completion_tokens = usage.completion_tokens + excluded.completion_tokens,
        cached_tokens = usage.cached_tokens + excluded.cached_tokens,
        updated_at = now();

  return true;
end;
$$;

revoke all on function public.consume_chat_quota() from public, anon;
revoke all on function public.record_chat_usage(integer, integer, integer) from public, anon;
grant execute on function public.consume_chat_quota() to authenticated;
grant execute on function public.record_chat_usage(integer, integer, integer) to authenticated;
