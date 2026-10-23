-- Run after schema_learning_sync.sql. Scenario learning history, isolated from curriculum RPCs.
-- This does not alter existing functions, tables or RLS policies.
create or replace function public.patch_scenario_results(p_patch jsonb)
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
    raise exception 'invalid scenario results' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_each(p_patch) as entry where
    entry.key !~ ('^scenario_result_v1_' || owner_id::text || '_[ABC][12]_[a-z0-9-]{1,80}_[a-f0-9]{64}$')
    or jsonb_typeof(entry.value) <> 'object'
    or entry.value->>'version' is distinct from '1'
    or jsonb_typeof(entry.value->'achieved') is distinct from 'array'
    or length(entry.value->>'definition') > 16000
    or entry.value->>'definition' is null
    or entry.value->>'endReason' is null
    or entry.value->>'endReason' not in ('success', 'turn_limit')) then
    raise exception 'invalid scenario owner, key or result' using errcode = '42501';
  end if;
  insert into public.learning_progress as progress (user_id, state)
  values (owner_id, p_patch)
  on conflict (user_id) do update
    -- Preserve all other progress; an existing attempt wins on duplicate delivery.
    set state = excluded.state || coalesce(progress.state, '{}'::jsonb)
  returning state into result;
  return result;
end;
$$;
revoke all on function public.patch_scenario_results(jsonb) from public, anon;
grant execute on function public.patch_scenario_results(jsonb) to authenticated;
