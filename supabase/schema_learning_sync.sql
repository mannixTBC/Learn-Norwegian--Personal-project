-- Run after schema.sql. Atomic, user-owned curriculum patches; RLS stays active.
-- A full unique index permits PostgREST ON CONFLICT without a predicate.
create unique index if not exists study_activity_user_client_event_all_key
  on public.study_activity (user_id, client_event_id);

create or replace function public.merge_curriculum_state(p_existing jsonb, p_patch jsonb)
returns jsonb
language plpgsql immutable security invoker set search_path = ''
as $$
declare
  result jsonb := coalesce(p_existing, '{}'::jsonb);
  item record;
  old_value jsonb;
  next_value jsonb;
  completed jsonb;
begin
  for item in select key, value from jsonb_each(p_patch) loop
    old_value := result -> item.key;
    next_value := item.value;
    if item.key ~ '_[abc][12]_progress$' then
      select coalesce(jsonb_agg(n order by n), '[]'::jsonb) into completed
      from (
        select distinct value::integer as n
        from jsonb_array_elements_text(
          (case when jsonb_typeof(old_value->'completed') = 'array' then old_value->'completed' else '[]'::jsonb end) ||
          (case when jsonb_typeof(next_value->'completed') = 'array' then next_value->'completed' else '[]'::jsonb end)
        ) where value ~ '^([1-9]|1[0-9]|2[0-4])$'
      ) ids;
      next_value := jsonb_build_object('completed', completed, 'unlocked', greatest(
        case when old_value->>'unlocked' ~ '^([1-9]|1[0-9]|2[0-4])$' then (old_value->>'unlocked')::integer else 1 end,
        case when next_value->>'unlocked' ~ '^([1-9]|1[0-9]|2[0-4])$' then (next_value->>'unlocked')::integer else 1 end
      ));
    elsif item.key ~ '_final_best$' then
      next_value := to_jsonb(greatest(
        case when old_value::text ~ '^(100|[0-9]{1,2})$' then old_value::text::integer else 0 end,
        case when next_value::text ~ '^(100|[0-9]{1,2})$' then next_value::text::integer else 0 end
      ));
    elsif item.key ~ '(_final_passed|_voice_complete)$' then
      next_value := to_jsonb(old_value = 'true'::jsonb or next_value = 'true'::jsonb);
      next_value := coalesce(next_value, 'false'::jsonb);
    end if;
    result := jsonb_set(result, array[item.key], coalesce(next_value, 'null'::jsonb), true);
  end loop;
  return result;
end;
$$;

create or replace function public.patch_learning_progress(p_patch jsonb)
returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  result jsonb;
begin
  if owner_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_patch is null or jsonb_typeof(p_patch) <> 'object' or octet_length(p_patch::text) > 1048576 then
    raise exception 'invalid curriculum patch' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_object_keys(p_patch) as k where
    k !~ ('^curriculum_[0-9]+[.][0-9]+_' || owner_id::text || '_([abc][12]_(progress|final_(best|passed)|[0-9]+_resume.*)|current_lesson)$')) then
    raise exception 'invalid curriculum owner or key' using errcode = '42501';
  end if;
  insert into public.learning_progress as progress (user_id, state)
  values (owner_id, public.merge_curriculum_state('{}'::jsonb, p_patch))
  on conflict (user_id) do update
    set state = public.merge_curriculum_state(progress.state, p_patch)
  returning state into result;
  return result;
end;
$$;

revoke all on function public.merge_curriculum_state(jsonb,jsonb) from public, anon;
revoke all on function public.patch_learning_progress(jsonb) from public, anon;
grant execute on function public.merge_curriculum_state(jsonb,jsonb) to authenticated, service_role;
grant execute on function public.patch_learning_progress(jsonb) to authenticated, service_role;
grant select, insert, update on public.learning_progress to authenticated;

-- Trigger functions are internal; callers cannot invoke them through RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.purge_expired_voice_conversations() from public, anon, authenticated;
-- Subscription checks respect profiles RLS, including when passed another UUID.
alter function public.is_premium(uuid) security invoker;
revoke execute on function public.is_premium(uuid) from public, anon;
grant execute on function public.is_premium(uuid) to authenticated, service_role;

-- These privileges are unnecessary for application clients and bypass row-level protections.
revoke truncate, references, trigger on public.profiles, public.learning_progress,
  public.study_activity, public.customers, public.subscriptions,
  public.voice_transcript_preferences, public.voice_conversations from anon, authenticated;
