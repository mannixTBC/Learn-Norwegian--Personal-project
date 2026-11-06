-- Additive schema. Apply after the existing language/progress schemas.
-- Existing learning_progress is retained as the compatibility write boundary.
BEGIN;
create table public.nl_courses (
  course_id text primary key check (course_id ~ '^[a-z][a-z0-9-]{1,79}$'),
  learning_language text not null check (learning_language ~ '^[a-z]{2,3}$'),
  status text not null default 'draft' check (status in ('draft','published','retired'))
);
create unique index nl_courses_language on public.nl_courses(learning_language) where status='published';
create table public.nl_course_releases (
  course_id text not null references public.nl_courses,
  version text not null check (version ~ '^[0-9]+[.][0-9]+$'),
  status text not null default 'draft' check (status in ('draft','published','retired')),
  format_version integer not null default 1 check (format_version=1),
  created_at timestamptz not null default now(),
  primary key (course_id,version)
);
create table public.nl_content_items (
  course_id text not null, version text not null, item_id text not null,
  kind text not null check (kind in ('level','lesson','scenario','grammar')),
  level text not null check (level in ('A1','A2','B1','B2','C1','C2')),
  position integer not null check(position>0),
  legacy_id integer check(legacy_id>0),
  payload jsonb not null check(jsonb_typeof(payload)='object'),
  content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'),
  primary key(course_id,version,item_id),
  foreign key(course_id,version) references public.nl_course_releases,
  check ((kind='lesson') = (legacy_id is not null))
);
create unique index nl_lessons_legacy on public.nl_content_items(course_id,version,level,legacy_id) where kind='lesson';
create index nl_content_order on public.nl_content_items(course_id,version,kind,level,position);
create table public.nl_content_translations (
  course_id text not null, version text not null, item_id text not null,
  support_language text not null check(support_language ~ '^[a-z]{2,3}$'),
  status text not null default 'draft' check(status in ('draft','published')),
  strings jsonb not null check(jsonb_typeof(strings)='object'),
  primary key(course_id,version,item_id,support_language),
  foreign key(course_id,version,item_id) references public.nl_content_items
);
create table public.nl_scenario_lessons (
  course_id text not null, version text not null, scenario_id text not null, lesson_id text not null,
  relation text not null,
  primary key(course_id,version,scenario_id,lesson_id),
  foreign key(course_id,version,scenario_id) references public.nl_content_items,
  foreign key(course_id,version,lesson_id) references public.nl_content_items
);
create index nl_scenario_lessons_reverse on public.nl_scenario_lessons(course_id,version,lesson_id);
create table public.nl_ai_profiles (
  course_id text not null, version text not null,
  purpose text not null check(purpose in ('information','free_dialogue','scenario')),
  policy_version text not null, retrieval_enabled boolean not null default false,
  rules jsonb not null check(jsonb_typeof(rules)='object'),
  primary key(course_id,version,purpose,policy_version),
  foreign key(course_id,version) references public.nl_course_releases
);
create table public.nl_enrollments (
  user_id uuid not null references auth.users on delete cascade,
  course_id text not null references public.nl_courses,
  last_version text not null, current_lesson jsonb,
  updated_at timestamptz not null default now(),
  primary key(user_id,course_id),
  foreign key(course_id,last_version) references public.nl_course_releases
);
create table public.nl_level_progress (
  user_id uuid not null references auth.users on delete cascade,
  course_id text not null, version text not null,
  level text not null check(level in ('A1','A2','B1','B2','C1','C2')),
  unlocked_position integer not null default 1 check(unlocked_position>0),
  final_best integer not null default 0 check(final_best between 0 and 100),
  final_passed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key(user_id,course_id,version,level),
  foreign key(course_id,version) references public.nl_course_releases
);
create table public.nl_lesson_progress (
  user_id uuid not null references auth.users on delete cascade,
  course_id text not null, item_id text not null, last_version text not null,
  completed boolean not null default false,
  resume jsonb not null default '{}' check(jsonb_typeof(resume)='object'),
  updated_at timestamptz not null default now(),
  primary key(user_id,course_id,item_id),
  foreign key(course_id,last_version,item_id) references public.nl_content_items
);
create table public.nl_scenario_attempts (
  user_id uuid not null references auth.users on delete cascade,
  course_id text not null, version text not null, item_id text not null,
  attempt_id text not null check(attempt_id ~ '^[a-f0-9]{64}$'),
  result jsonb not null check(jsonb_typeof(result)='object'),
  primary key(user_id,course_id,item_id,attempt_id),
  foreign key(course_id,version,item_id) references public.nl_content_items
);
create index nl_enrollments_release on public.nl_enrollments(course_id,last_version);
create index nl_level_progress_release on public.nl_level_progress(course_id,version);
create index nl_lesson_progress_content on public.nl_lesson_progress(course_id,last_version,item_id);
create index nl_attempts_content on public.nl_scenario_attempts(course_id,version,item_id);

-- Explicit privileges and RLS: curriculum is read-only, learner rows are owned.
do $$ declare t text; begin
  foreach t in array array['nl_courses','nl_course_releases','nl_content_items','nl_content_translations','nl_scenario_lessons','nl_ai_profiles',
    'nl_enrollments','nl_level_progress','nl_lesson_progress','nl_scenario_attempts'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on table public.%I from public,anon,authenticated',t);
    execute format('grant all on table public.%I to service_role',t);
  end loop;
  foreach t in array array['nl_courses','nl_course_releases','nl_content_items','nl_content_translations','nl_scenario_lessons'] loop
    execute format('grant select on table public.%I to authenticated',t);
  end loop;
  foreach t in array array['nl_enrollments','nl_level_progress','nl_lesson_progress','nl_scenario_attempts'] loop
    execute format('grant select,insert,update on table public.%I to authenticated',t);
    execute format('create policy own_read on public.%I for select to authenticated using ((select auth.uid())=user_id)',t);
    execute format('create policy own_insert on public.%I for insert to authenticated with check ((select auth.uid())=user_id)',t);
    if t <> 'nl_scenario_attempts' then
      execute format('create policy own_update on public.%I for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id)',t);
    else
      execute format('revoke update on table public.%I from authenticated',t);
    end if;
  end loop;
end $$;
create policy published on public.nl_courses for select to authenticated using(status='published');
create policy published on public.nl_course_releases for select to authenticated using(status='published' and exists
  (select 1 from public.nl_courses c where c.course_id=nl_course_releases.course_id and c.status='published'));
create policy published on public.nl_content_items for select to authenticated using(exists
  (select 1 from public.nl_course_releases r where r.course_id=nl_content_items.course_id and r.version=nl_content_items.version and r.status='published'));
create policy published on public.nl_content_translations for select to authenticated using(status='published' and exists
  (select 1 from public.nl_content_items i where i.course_id=nl_content_translations.course_id and i.version=nl_content_translations.version and i.item_id=nl_content_translations.item_id));
create policy published on public.nl_scenario_lessons for select to authenticated using(exists
  (select 1 from public.nl_course_releases r where r.course_id=nl_scenario_lessons.course_id and r.version=nl_scenario_lessons.version and r.status='published'));

-- Keep study activity's existing shape accepted by old mobile/web clients.
alter table public.study_activity add column course_id text references public.nl_courses;
alter table public.study_activity add column course_version text;
alter table public.study_activity add constraint study_activity_course_release foreign key(course_id,course_version)
  references public.nl_course_releases;
create index study_activity_course_date on public.study_activity(user_id,course_id,occurred_at desc);
create index study_activity_course_release on public.study_activity(course_id,course_version);

-- A single read retrieves a pinned level with its translations. No per-exercise network call.
create function public.nl_course_level(p_course_id text,p_version text,p_level text,p_support_language text)
returns jsonb language sql stable security invoker set search_path='' as $$
  select jsonb_build_object('formatVersion',1,'courseId',p_course_id,'version',p_version,'level',p_level,
    'expectedLessonCount',count(*) filter(where i.kind='lesson'),
    'supportLanguage',p_support_language,'items',coalesce(jsonb_agg(jsonb_build_object(
      'itemId',i.item_id,'kind',i.kind,'position',i.position,'legacyId',i.legacy_id,'payload',i.payload,'strings',t.strings)
      order by i.position) filter(where t.item_id is not null),'[]'::jsonb))
  from public.nl_content_items i left join public.nl_content_translations t
    on (t.course_id,t.version,t.item_id)=(i.course_id,i.version,i.item_id) and t.support_language=p_support_language and t.status='published'
  where i.course_id=p_course_id and i.version=p_version and i.level=p_level and i.kind in ('level','lesson');
$$;
revoke all on function public.nl_course_level(text,text,text,text) from public,anon;
grant execute on function public.nl_course_level(text,text,text,text) to authenticated,service_role;
COMMIT;
