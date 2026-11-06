# Desktop course database and Nora

The web implementation follows the database work prepared in Android, without
editing the Android project or changing desktop markup, exercise scoring, answers
or progression rules. The existing Norwegian/Romanian pair is still the only
released pair.

## Applied database changes

Applied to the verified NordLingo Supabase project on 2026-11-06:

- `relational_learning_schema`: courses/releases, authored content, translations,
  scenario links, course progress, AI profiles and the `nl_course_level` RPC.
- Catalog imported in batches while the parent course/release remained draft:
  6 levels, 144 lessons, 1,200 scenario variants, 1,350 translations, 2,318 links.
- `relational_learning_publish_and_progress`: checked import counts, published
  the imported release and installed the transactional legacy-progress bridge.
- `nora_knowledge`: private pgvector storage and filtered search, no embeddings yet.

The original complete migration snapshots are retained under `supabase/migrations`.
The hosted import was split due to the plugin's request-size limit; do not apply
the combined snapshot again to this database. Future changes need new migrations.
`learning_progress` remains the write/restore compatibility boundary. Existing
JSON is retained; its recognized entries are projected into the new tables.
New study events explicitly label course, version and learning language.
Browser merging uses catalog lesson IDs; unknown historical courses retain valid
progress above 24 rather than losing it. Exam results remain release-specific.

## Desktop and API rollout

New requests carry course/version headers and the existing language headers.
New lesson, voice-practice, free-dialogue and scenario tokens pin their course.
Tokens created before this change continue with the old policy until they end.
Private database AI rules are not serialized into client-visible tokens.

- `VITE_REMOTE_CURRICULUM=false` (default): use bundled lessons. When enabled, one
  complete level is validated and cached; refreshes take effect on the next page
  load, never during an exercise. Missing/invalid/offline data keeps the bundled
  or previously validated level. The 144 reconstructed lessons match desktop exactly.
- `NORDLINGO_COURSE_DATABASE=false` (default): sessions use the bundled course
  identity. Enable with server-only Supabase service credentials to validate the
  published release, level translation and AI profile at session creation.
- `NORDLINGO_NORA_RETRIEVAL=false` (default): no embedding calls during conversation.
  Select and evaluate a multilingual 1,536-dimensional model; set its exact ID in
  `NORDLINGO_EMBEDDING_MODEL`. Run `node scripts/index-nora-knowledge.cjs --run`
  explicitly to index the 144 source grammar fragments, then enable the reviewed
  database profile and server retrieval flag. No user transcripts are indexed.

Retrieval uses authenticated server identity and completed lessons. Scenarios
also intersect this scope with authored lesson links. Only partner replies in
scenarios receive reference text; the assessment request never receives it.
Legacy combined assessment/roleplay scenarios deliberately do not use retrieval.
Free dialogue can use references when enabled. Recap has no retrieval entry point
and is rejected by both the knowledge module and SQL. Failure to retrieve references
falls back to the existing conversation. Enabling new course languages still
requires authored content, translations and tutor adapters.

The web/backend changes are local until pushed/deployed. SQL is already online.

## Verification

- Client and SSR builds; language/session/progress tests; desktop catalog UI checks.
- `node scripts/test-course-content.mjs`: exact reconstruction of all lessons,
  cache pinning and rejection of wrong/incomplete course documents.
- `node --test backend/courseRuntime.test.cjs backend/knowledge.test.cjs`.
- `node scripts/test-database.mjs`: 34 PostgreSQL assertions including RLS, rollback,
  30-lesson courses, idempotent attempts and private vector filtering. Test tools:
  `@electric-sql/pglite@0.5.15` and `@electric-sql/pglite-pgvector@0.0.16`, with
  `NORDLINGO_SQL_TOOLS` pointing to their node_modules directory.
- Hosted authenticated RPC/projection/isolation checks passed in a transaction;
  verification writes were rolled back.

The security advisor's new `rls_enabled_no_policy` notices on `nl_ai_profiles` and
`nl_knowledge_chunks` are intentional: no client grants/policies, backend only.
Guest authenticated accounts retain access to published curriculum and their own
progress, matching the existing application. See the
[Supabase advisor reference](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
