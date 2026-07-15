-- Rulează acest fișier o singură dată în Supabase > SQL Editor.
-- Toate tabelele sunt protejate prin Row Level Security.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Cursant',
  learning_level text not null default 'A1' check (learning_level in ('A1', 'A2', 'B1', 'B2')),
  career_path text,
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
