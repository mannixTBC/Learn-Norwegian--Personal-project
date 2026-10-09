-- Cotă durabilă pentru conversațiile AI.
-- Rulează acest fișier în Supabase > SQL Editor după schema.sql.
-- Este idempotent și poate fi aplicat din nou în siguranță.

-- Utilizatorii își pot edita profilul pedagogic, dar niciodată planul care
-- decide cota. Service role (webhook-ul Stripe) continuă să poată actualiza
-- toate coloanele și ocolește RLS.
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

-- Nu există politici directe: utilizatorii nu pot citi sau modifica tabela.
-- Accesul se face numai prin funcțiile SECURITY DEFINER de mai jos.
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
  -- Limitele sunt intenționat server-side și nu sunt parametri RPC.
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
