begin;
create or replace function public.nl_conversation_v2_store(p_operation text,p_owner uuid,p_session uuid,p_data jsonb default '{}')
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
  s public.nl_conversation_v2_sessions%rowtype;
  v jsonb;
  previous jsonb;
  receipt jsonb;
  lease uuid;
  expiry timestamptz;
begin
  if p_owner is null or p_session is null or p_data is null or jsonb_typeof(p_data) <> 'object' then
    raise exception 'INVALID_COMMAND' using errcode='22023';
  end if;
  if p_operation='insert' then
    v := p_data->'snapshot';
    if v is null or v->>'schemaVersion' is distinct from '2' or v->>'id' is distinct from p_session::text
      or v->>'ownerId' is distinct from p_owner::text or v->>'revision' is distinct from '0'
      or v->>'status' is distinct from 'active' or v->>'turnCount' is distinct from '0'
      or v->'receipts' is distinct from '[]'::jsonb then
      raise exception 'INVALID_SESSION' using errcode='22023';
    end if;
    expiry := to_timestamp((v->>'expiresAt')::double precision/1000);
    if expiry is null or expiry <= clock_timestamp() or expiry > clock_timestamp()+interval '24 hours' then
      raise exception 'INVALID_SESSION' using errcode='22023';
    end if;
    insert into public.nl_conversation_v2_sessions(id,owner_id,revision,snapshot,expires_at)
      values(p_session,p_owner,0,v,expiry);
    return v;
  end if;

  -- Lock consent before the session, the same order used by withdrawal.
  -- Checking the incoming payload also prevents command receipts retaining speech.
  if (p_operation='reserve' and p_data->'command'->>'type'='liveTranscript')
    or (p_operation='commit' and p_data->'snapshot'->>'mode'='live'
        and jsonb_array_length(p_data->'snapshot'->'messages')>0) then
    perform 1 from public.voice_transcript_preferences where user_id=p_owner and improvement_consent=true for share;
    if not found then raise exception 'UNSUPPORTED_TRANSCRIPT_STORAGE' using errcode='P0001'; end if;
  end if;
  select * into s from public.nl_conversation_v2_sessions where id=p_session and owner_id=p_owner for update;
  if not found then
    if p_operation='read' then return null; end if;
    raise exception 'SESSION_NOT_FOUND' using errcode='P0001';
  end if;
  -- Deletion is available even after expiry; account deletion also cascades.
  if p_operation='delete' then
    delete from public.nl_conversation_v2_sessions where id=s.id;
    return '{"deleted":true}'::jsonb;
  end if;
  if s.expires_at <= clock_timestamp() then raise exception 'SESSION_EXPIRED' using errcode='P0001'; end if;
  if p_operation='read' then return s.snapshot; end if;

  if p_operation='reserve' then
    v := p_data->'command';
    if v is null or length(coalesce(v->>'commandId','')) not between 1 and 100 then
      raise exception 'INVALID_COMMAND' using errcode='22023';
    end if;
    select payload into previous from public.nl_conversation_v2_commands where session_id=s.id and command_id=v->>'commandId';
    if found and previous <> v then raise exception 'IDEMPOTENCY_CONFLICT' using errcode='P0001'; end if;
    select r into receipt from jsonb_array_elements(s.snapshot->'receipts') r where r->>'commandId'=v->>'commandId';
    if found then return jsonb_build_object('replay',true,'snapshot',s.snapshot); end if;
    if s.snapshot->>'status' <> 'active' then raise exception 'SESSION_ENDED' using errcode='P0001'; end if;
    if (v->>'expectedRevision')::integer is distinct from s.revision then raise exception 'REVISION_CONFLICT' using errcode='P0001'; end if;
    if s.lease_until > clock_timestamp() then raise exception 'SESSION_BUSY' using errcode='P0001'; end if;
    if (select count(*) from public.nl_conversation_v2_commands where session_id=s.id) >= 100
      and previous is null then raise exception 'SESSION_COMMAND_LIMIT' using errcode='P0001'; end if;
    insert into public.nl_conversation_v2_commands(session_id,command_id,payload) values(s.id,v->>'commandId',v) on conflict do nothing;
    lease := gen_random_uuid();
    update public.nl_conversation_v2_sessions set lease_token=lease,lease_until=clock_timestamp()+interval '45 seconds',
      lease_command=v->>'commandId' where id=s.id;
    return jsonb_build_object('token',lease,'snapshot',s.snapshot);
  end if;

  if p_operation='release' then
    update public.nl_conversation_v2_sessions set lease_token=null,lease_until=null,lease_command=null
      where id=s.id and lease_token=(p_data->>'token')::uuid;
    return '{}'::jsonb;
  end if;
  if p_operation='commit' then
    if s.lease_token is null or s.lease_token is distinct from (p_data->>'token')::uuid
      or s.lease_until <= clock_timestamp() then raise exception 'LEASE_LOST' using errcode='P0001'; end if;
    v := p_data->'snapshot';
    if v is null or (p_data->>'revision')::integer is distinct from s.revision
      or v->>'id' is distinct from s.id::text or v->>'ownerId' is distinct from s.owner_id::text
      or (v->>'revision')::integer is distinct from s.revision+1
      or (v->>'schemaVersion') is distinct from '2'
      or v->'expiresAt' is distinct from s.snapshot->'expiresAt'
      or v->'scenarioId' is distinct from s.snapshot->'scenarioId'
      or v->'scenarioVersion' is distinct from s.snapshot->'scenarioVersion'
      or v->'variantId' is distinct from s.snapshot->'variantId'
      or v->'learningLanguage' is distinct from s.snapshot->'learningLanguage'
      or v->'supportLanguage' is distinct from s.snapshot->'supportLanguage'
      or v->'mode' is distinct from s.snapshot->'mode' then
      raise exception 'INVALID_SESSION' using errcode='22023';
    end if;
    select payload into previous from public.nl_conversation_v2_commands where session_id=s.id and command_id=s.lease_command;
    select r into receipt from jsonb_array_elements(v->'receipts') r where r->>'commandId'=s.lease_command;
    if receipt is null or (receipt->>'payload')::jsonb is distinct from previous then
      raise exception 'INVALID_SESSION' using errcode='22023';
    end if;
    update public.nl_conversation_v2_sessions set snapshot=v,revision=s.revision+1,updated_at=clock_timestamp(),
      lease_token=null,lease_until=null,lease_command=null where id=s.id;
    return v;
  end if;
  raise exception 'INVALID_OPERATION' using errcode='22023';
end $$;

-- Service-only atomic preference change. No browser grants or privileged definer.
create or replace function public.nl_set_voice_transcript_preference(p_owner uuid,p_enabled boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare changed_at timestamptz := clock_timestamp();
begin
 if p_owner is null or p_enabled is null then raise exception 'INVALID_COMMAND'; end if;
 insert into public.voice_transcript_preferences(user_id,improvement_consent,consent_version,consented_at,withdrawn_at,updated_at)
 values(p_owner,p_enabled,case when p_enabled then 'voice-improvement-v1' end,
   case when p_enabled then changed_at end,case when not p_enabled then changed_at end,changed_at)
 on conflict(user_id) do update set improvement_consent=excluded.improvement_consent,
   consent_version=excluded.consent_version,consented_at=excluded.consented_at,
   withdrawn_at=excluded.withdrawn_at,updated_at=excluded.updated_at;
 if not p_enabled then
   delete from public.voice_conversations where user_id=p_owner;
   delete from public.nl_conversation_v2_sessions where owner_id=p_owner and snapshot->>'mode'='live';
 end if;
 return jsonb_build_object('enabled',p_enabled,'updatedAt',changed_at);
end $$;
revoke all on function public.nl_set_voice_transcript_preference(uuid,boolean) from public,anon,authenticated;
grant execute on function public.nl_set_voice_transcript_preference(uuid,boolean) to service_role;

-- Remove only Live V2 transcripts stored without permission before this fix.
delete from public.nl_conversation_v2_sessions s where s.snapshot->>'mode'='live' and not exists(select 1 from public.voice_transcript_preferences p where p.user_id=s.owner_id and p.improvement_consent=true);
commit;
