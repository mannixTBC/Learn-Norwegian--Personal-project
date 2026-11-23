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
