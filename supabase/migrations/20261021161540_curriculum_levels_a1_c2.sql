-- Existing installations: run once in the Supabase SQL Editor.
-- Expands accepted CEFR labels without changing any profile, activity or
-- conversation. Optional tables are skipped; rerunning the migration is safe.
begin;

do $migration$
begin
  if to_regclass('public.profiles') is not null then
    alter table public.profiles drop constraint if exists profiles_learning_level_check;
    alter table public.profiles add constraint profiles_learning_level_check
      check (learning_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')) not valid;
    alter table public.profiles validate constraint profiles_learning_level_check;
  end if;

  if to_regclass('public.study_activity') is not null then
    alter table public.study_activity drop constraint if exists study_activity_level_check;
    alter table public.study_activity add constraint study_activity_level_check
      check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')) not valid;
    alter table public.study_activity validate constraint study_activity_level_check;
  end if;

  if to_regclass('public.voice_conversations') is not null then
    alter table public.voice_conversations drop constraint if exists voice_conversations_level_check;
    alter table public.voice_conversations add constraint voice_conversations_level_check
      check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')) not valid;
    alter table public.voice_conversations validate constraint voice_conversations_level_check;
  end if;
end;
$migration$;

commit;
