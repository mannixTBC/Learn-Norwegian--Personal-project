create or replace function public.consume_session_chat_quota()
returns table(allowed boolean, remaining integer, daily_limit integer, plan text)
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (
    select 1 from auth.sessions s join auth.users u on u.id = s.user_id
    where s.id = (auth.jwt()->>'session_id')::uuid and s.user_id = auth.uid()
      and (s.not_after is null or s.not_after > now())
      and (u.banned_until is null or u.banned_until <= now())
  ) then
    raise exception using errcode = 'PT401', message = 'Session inactive';
  end if;
  return query select q.allowed,q.remaining,q.daily_limit,q.plan from public.consume_chat_quota() q;
end;
$$;
revoke all on function public.consume_session_chat_quota() from public,anon;
grant execute on function public.consume_session_chat_quota() to authenticated;

