-- Rulează o singură dată în Supabase > SQL Editor.
-- Păstrează numai textul conversațiilor pentru care utilizatorul și-a dat acordul.

create extension if not exists pgcrypto;

create table if not exists public.voice_transcript_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  improvement_consent boolean not null default false,
  consent_version text,
  consented_at timestamptz,
  withdrawn_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.voice_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  level text not null check (level in ('A1', 'A2', 'B1', 'B2')),
  lesson_id integer not null check (lesson_id > 0),
  path_id text not null default 'general',
  mode text not null check (mode in ('realtime', 'batch')),
  transcript jsonb not null check (jsonb_typeof(transcript) = 'array'),
  feedback text,
  turn_count integer not null default 0 check (turn_count between 0 and 8),
  consent_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days')
);

create index if not exists voice_conversations_user_created_idx
  on public.voice_conversations (user_id, created_at desc);
create index if not exists voice_conversations_expires_idx
  on public.voice_conversations (expires_at);

alter table public.voice_transcript_preferences enable row level security;
alter table public.voice_conversations enable row level security;

grant select, insert, update on table public.voice_transcript_preferences to authenticated;
grant select, insert, update, delete on table public.voice_conversations to authenticated;

drop policy if exists "Users read own voice preference" on public.voice_transcript_preferences;
create policy "Users read own voice preference" on public.voice_transcript_preferences
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users create own voice preference" on public.voice_transcript_preferences;
create policy "Users create own voice preference" on public.voice_transcript_preferences
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users update own voice preference" on public.voice_transcript_preferences;
create policy "Users update own voice preference" on public.voice_transcript_preferences
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Users read own voice conversations" on public.voice_conversations;
create policy "Users read own voice conversations" on public.voice_conversations
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users create own voice conversations" on public.voice_conversations;
create policy "Users create own voice conversations" on public.voice_conversations
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users update own voice conversations" on public.voice_conversations;
create policy "Users update own voice conversations" on public.voice_conversations
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users delete own voice conversations" on public.voice_conversations;
create policy "Users delete own voice conversations" on public.voice_conversations
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Curățare oportunistă: fiecare conversație nouă elimină automat datele expirate.
create or replace function public.purge_expired_voice_conversations()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.voice_conversations where expires_at <= now();
  return new;
end;
$$;

drop trigger if exists voice_conversations_purge_expired on public.voice_conversations;
create trigger voice_conversations_purge_expired
  before insert on public.voice_conversations
  for each statement execute procedure public.purge_expired_voice_conversations();

-- Supabase Cron șterge zilnic orice transcript ajuns la limita de 90 de zile.
create extension if not exists pg_cron;
select cron.schedule(
  'nordlingo-purge-expired-voice-conversations',
  '17 3 * * *',
  $$ delete from public.voice_conversations where expires_at <= now() $$
);

