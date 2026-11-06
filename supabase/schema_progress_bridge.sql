-- Apply AFTER schema_relational.sql and generated/seed.sql.
BEGIN;
create schema if not exists nl_private;
revoke all on schema nl_private from public,anon;
grant usage on schema nl_private to authenticated,service_role;

-- Catalog-aware merging keeps the current semantics without a 24-lesson ceiling.
create or replace function public.merge_curriculum_state(p_existing jsonb,p_patch jsonb)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare result jsonb:=coalesce(p_existing,'{}'); entry record; old_value jsonb; next_value jsonb;
  parts text[]; language_code text; ids integer[]; total integer; completed jsonb;
begin
  for entry in select key,value from jsonb_each(p_patch) loop
    old_value:=result->entry.key; next_value:=entry.value;
    if entry.key ~ '_[abc][12]_progress$' then
      parts:=regexp_match(entry.key,'^(?:course:([a-z]{2,3}):)?curriculum_([0-9]+[.][0-9]+)_[0-9a-f-]{36}_([abc][12])_progress$');
      language_code:=coalesce(parts[1],'nb');
      select array_agg(i.legacy_id),count(*)::integer into ids,total
        from public.nl_content_items i join public.nl_courses c using(course_id)
        where c.learning_language=language_code and i.version=parts[2] and i.level=upper(parts[3]) and i.kind='lesson';
      select coalesce(jsonb_agg(n order by n),'[]'::jsonb) into completed from (
        select distinct value::text::integer as n from jsonb_array_elements(
          (case when jsonb_typeof(old_value->'completed')='array' then old_value->'completed' else '[]'::jsonb end)||
          (case when jsonb_typeof(next_value->'completed')='array' then next_value->'completed' else '[]'::jsonb end))
        where jsonb_typeof(value)='number' and value::text ~ '^[1-9][0-9]{0,5}$'
      ) valid where ids is null or n=any(ids);
      next_value:=jsonb_build_object('completed',completed,'unlocked',least(case when total>0 then total else 1000000 end,greatest(1,
        case when old_value->>'unlocked' ~ '^[1-9][0-9]{0,5}$' then (old_value->>'unlocked')::integer else 1 end,
        case when next_value->>'unlocked' ~ '^[1-9][0-9]{0,5}$' then (next_value->>'unlocked')::integer else 1 end)));
    elsif entry.key ~ '_final_best$' then
      next_value:=to_jsonb(greatest(
        case when old_value::text ~ '^(100|[0-9]{1,2})$' then old_value::text::integer else 0 end,
        case when next_value::text ~ '^(100|[0-9]{1,2})$' then next_value::text::integer else 0 end));
    elsif entry.key ~ '(_final_passed|_voice_complete)$' then
      next_value:=to_jsonb(coalesce(old_value='true'::jsonb,false) or coalesce(next_value='true'::jsonb,false));
    end if;
    result:=jsonb_set(result,array[entry.key],coalesce(next_value,'null'::jsonb),true);
  end loop;
  return result;
end $$;

-- Projection is inside the same transaction as the old patch. No client dual-write race.
create function nl_private.project_progress(p_owner uuid,p_state jsonb,p_previous jsonb default '{}')
returns void language plpgsql security invoker set search_path='' as $$
declare entry record; parts text[]; lang text; cid text; ver text; lvl text; suffix text; item text; lesson record; n integer;
begin
  if current_user not in ('postgres','service_role','supabase_admin') and auth.uid() is distinct from p_owner then
    raise exception 'invalid progress owner' using errcode='42501';
  end if;
  for entry in select key,value from jsonb_each(p_state) where p_previous->key is distinct from value loop
    parts:=regexp_match(entry.key,'^(?:course:([a-z]{2,3}):)?curriculum_([0-9]+[.][0-9]+)_([0-9a-f-]{36})_(.+)$');
    if parts is not null then
      if parts[3]<>p_owner::text then continue; end if;
      lang:=coalesce(parts[1],'nb'); ver:=parts[2]; suffix:=parts[4];
      select c.course_id into cid from public.nl_courses c join public.nl_course_releases r using(course_id)
        where c.learning_language=lang and r.version=ver and c.status='published';
      if cid is null then continue; end if;
      insert into public.nl_enrollments(user_id,course_id,last_version) values(p_owner,cid,ver)
        on conflict(user_id,course_id) do update set last_version=excluded.last_version,updated_at=now();
      if suffix='current_lesson' then
        update public.nl_enrollments set current_lesson=entry.value where user_id=p_owner and course_id=cid;
        continue;
      end if;
      lvl:=upper(left(suffix,2));
      if lvl not in ('A1','A2','B1','B2','C1','C2') then continue; end if;
      insert into public.nl_level_progress(user_id,course_id,version,level) values(p_owner,cid,ver,lvl) on conflict do nothing;
      if suffix ~ '_progress$' and jsonb_typeof(entry.value)='object' then
        if entry.value->>'unlocked' ~ '^[1-9][0-9]{0,5}$' then
          select greatest(1,count(*))::integer into n from public.nl_content_items where course_id=cid and version=ver and level=lvl and kind='lesson';
          update public.nl_level_progress set unlocked_position=greatest(unlocked_position,least(n,(entry.value->>'unlocked')::integer)),updated_at=now()
            where user_id=p_owner and course_id=cid and version=ver and level=lvl;
        end if;
        for lesson in select i.item_id from public.nl_content_items i where i.course_id=cid and i.version=ver and i.level=lvl and i.kind='lesson'
          and coalesce(entry.value->'completed','[]'::jsonb) @> to_jsonb(array[i.legacy_id]) loop
          insert into public.nl_lesson_progress(user_id,course_id,item_id,last_version,completed) values(p_owner,cid,lesson.item_id,ver,true)
            on conflict(user_id,course_id,item_id) do update set completed=true,last_version=excluded.last_version,updated_at=now();
        end loop;
      elsif suffix ~ '_final_best$' and entry.value::text ~ '^(100|[0-9]{1,2})$' then
        update public.nl_level_progress set final_best=greatest(final_best,entry.value::text::integer),updated_at=now()
          where user_id=p_owner and course_id=cid and version=ver and level=lvl;
      elsif suffix ~ '_final_passed$' then
        update public.nl_level_progress set final_passed=final_passed or entry.value='true'::jsonb,updated_at=now()
          where user_id=p_owner and course_id=cid and version=ver and level=lvl;
      else
        parts:=regexp_match(suffix,'^[abc][12]_([0-9]{1,6})_(resume.*)$');
        if parts is null then continue; end if;
        select item_id into item from public.nl_content_items where course_id=cid and version=ver and level=lvl and kind='lesson' and legacy_id=parts[1]::integer;
        if item is null then continue; end if;
        insert into public.nl_lesson_progress as p(user_id,course_id,item_id,last_version,resume)
          values(p_owner,cid,item,ver,jsonb_build_object(parts[2],entry.value))
          on conflict(user_id,course_id,item_id) do update set resume=p.resume||excluded.resume,last_version=excluded.last_version,updated_at=now();
      end if;
    else
      parts:=regexp_match(entry.key,'^(?:course:([a-z]{2,3}):)?scenario_result_v1_([0-9a-f-]{36})_([ABC][12])_([a-z0-9-]{1,80})_([a-f0-9]{64})$');
      if parts is null or parts[2]<>p_owner::text or jsonb_typeof(entry.value)<>'object' then continue; end if;
      -- Legacy attempts had no release. Pin to the imported release, never to latest.
      lang:=coalesce(parts[1],'nb'); ver:=coalesce(entry.value->'course'->>'version','2026.2'); item:='scenario:'||parts[3]||':'||parts[4];
      select c.course_id into cid from public.nl_courses c join public.nl_content_items i using(course_id)
        where c.learning_language=lang and c.status='published' and i.version=ver and i.item_id=item
          and (entry.value->'course'->>'courseId' is null or entry.value->'course'->>'courseId'=c.course_id);
      if cid is null then continue; end if;
      insert into public.nl_scenario_attempts(user_id,course_id,version,item_id,attempt_id,result)
        values(p_owner,cid,ver,item,parts[5],entry.value) on conflict do nothing;
    end if;
  end loop;
end $$;
revoke all on function nl_private.project_progress(uuid,jsonb,jsonb) from public,anon;
grant execute on function nl_private.project_progress(uuid,jsonb,jsonb) to authenticated,service_role;

create function nl_private.progress_changed() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  perform nl_private.project_progress(new.user_id,new.state,case when TG_OP='UPDATE' then old.state else '{}'::jsonb end);
  return new;
end $$;
revoke all on function nl_private.progress_changed() from public,anon,authenticated;
create trigger nl_progress_projection after insert or update of state on public.learning_progress
  for each row execute function nl_private.progress_changed();

create function nl_private.activity_course() returns trigger language plpgsql security invoker set search_path='' as $$
declare lang text:=coalesce(new.metadata->>'learningLanguage','nb');
begin
  -- Client metadata is a label, never authorization or AI policy input.
  select c.course_id,r.version into new.course_id,new.course_version
    from public.nl_courses c join public.nl_course_releases r using(course_id)
    where c.learning_language=lang and c.status='published' and r.version=coalesce(new.metadata->>'courseVersion','2026.2');
  return new;
end $$;
revoke all on function nl_private.activity_course() from public,anon,authenticated;
create trigger nl_activity_course before insert or update of metadata on public.study_activity for each row execute function nl_private.activity_course();

-- Backfill is repeatable and leaves the complete legacy JSON untouched.
do $$ declare row record; begin
  for row in select user_id,state from public.learning_progress loop
    perform nl_private.project_progress(row.user_id,row.state);
  end loop;
end $$;
update public.study_activity set metadata=metadata where course_id is null;
COMMIT;
