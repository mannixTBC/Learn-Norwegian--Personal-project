-- Optional, backend-only retrieval. No recap purpose, client grants or learner text storage.
BEGIN;
create schema if not exists extensions;
create extension if not exists vector with schema extensions;
grant usage on schema extensions to service_role;
create table public.nl_knowledge_chunks (
  course_id text not null, version text not null, item_id text not null, chunk_id text not null,
  support_language text not null,
  level text not null check(level in ('A1','A2','B1','B2','C1','C2')),
  purpose text not null check(purpose in ('information','free_dialogue','scenario')),
  model_id text not null check(length(model_id) between 1 and 160),
  content_hash text not null check(content_hash ~ '^[a-f0-9]{64}$'),
  body text not null check(length(body) between 1 and 12000),
  embedding extensions.vector(1536) not null,
  primary key(course_id,version,chunk_id,support_language,purpose,model_id),
  foreign key(course_id,version,item_id,support_language) references public.nl_content_translations
);
create index nl_knowledge_filter on public.nl_knowledge_chunks(course_id,version,support_language,purpose,model_id,level);
create index nl_knowledge_source on public.nl_knowledge_chunks(course_id,version,item_id,support_language);
-- Exact cosine search after filtering is appropriate for the initial 144 fragments.
-- Add a measured HNSW index when the corpus grows; filtering must still be retained.
alter table public.nl_knowledge_chunks enable row level security;
revoke all on public.nl_knowledge_chunks from public,anon,authenticated;
grant all on public.nl_knowledge_chunks to service_role;
create function public.nl_match_knowledge(p_course_id text,p_version text,p_support_language text,p_level text,
  p_purpose text,p_model_id text,p_embedding extensions.vector(1536),p_allowed_item_ids text[],p_limit integer default 4)
returns table(item_id text,chunk_id text,body text,content_hash text,similarity double precision)
language plpgsql stable security invoker set search_path='' as $$
begin
  if p_purpose not in ('information','free_dialogue','scenario') or p_purpose is null then
    raise exception 'unsupported retrieval purpose' using errcode='22023';
  end if;
  -- An empty scope yields no matches, never an unfiltered search.
  return query select k.item_id,k.chunk_id,k.body,k.content_hash,1-(k.embedding operator(extensions.<=>) p_embedding)
    from public.nl_knowledge_chunks k
    join public.nl_content_translations t on (t.course_id,t.version,t.item_id,t.support_language)=(k.course_id,k.version,k.item_id,k.support_language)
    join public.nl_course_releases r on (r.course_id,r.version)=(k.course_id,k.version)
    join public.nl_courses c on c.course_id=k.course_id
    where k.course_id=p_course_id and k.version=p_version and k.support_language=p_support_language
      and k.level=p_level and k.purpose=p_purpose and k.model_id=p_model_id
      and k.item_id=any(coalesce(p_allowed_item_ids,array[]::text[]))
      and t.status='published' and r.status='published' and c.status='published'
    order by k.embedding operator(extensions.<=>) p_embedding limit greatest(1,least(coalesce(p_limit,4),6));
end $$;
revoke all on function public.nl_match_knowledge(text,text,text,text,text,text,extensions.vector,text[],integer) from public,anon,authenticated;
grant execute on function public.nl_match_knowledge(text,text,text,text,text,text,extensions.vector,text[],integer) to service_role;
COMMIT;
