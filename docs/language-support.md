# Language support in the web app

Only `nb:ro` is released. The registry describes future German, French and English
courses and Romanian, English, Polish and Ukrainian support, without claiming
that those translations or curricula already exist.

- `src/languages/catalog.json` and `backend/languageCatalog.json` share the same
  contract, enforced by `npm run test:languages`.
- `src/languages/messages/ro.json` contains the Romanian UI copy. `ui()` resolves
  it without changing markup, styles or exercise answers. Message catalogs are
  separate from authored lesson content and explanations.
- `src/content/norwegianPack.js` registers the existing curriculum and algorithms.
  Feature facades resolve the active pack. New courses must supply authored
  content and feature implementations, rather than translating Norwegian answer
  validators or copying its conjugation rules.
- Browser progress uses `src/languages/storage.js`. Existing Norwegian keys stay
  unchanged; another learning language uses `course:<code>:`. Conversation
  checkpoints additionally include the support language. Sync queues retain
  their original account ownership checks and carry each course's actual key.
- AI requests carry an explicit language pair. Signed sessions and audio tickets
  bind it; learner messages cannot change it. A stale client response is rejected
  after a language switch. Old clients/tokens remain compatible with `nb:ro`.
- The backend registry requires an authored route adapter for every newly enabled
  pair. Changing `releasedPairs` alone cannot send another course through the
  Norwegian tutor, pronunciation evaluator or voice configuration.

## Adding a released pair

Add its message catalog, content pack, locale/provider voice configuration and
backend tutor/route adapters, then verify content availability, session isolation,
progress, speech and exercise behavior before enabling the pair in both catalogs.
Existing module-level labels assume a full page reload when switching a released
support language. Do not offer live language switching until those labels and all
active exercise state have been remounted for the new pair.

## Database rollout

`supabase/schema_language_progress.sql` was applied to the hosted NordLingo
database on 2026-11-06 as `language_scoped_learning_progress`. It extends the two
existing progress RPCs to accept language prefixes, retains `SECURITY INVOKER`,
`auth.uid()` ownership checks and existing RLS, and grants execution only to
authenticated users (existing service-role access is retained). On a new database,
apply it after `schema_learning_sync.sql` and `schema_scenario_progress.sql`.
Hosted verification under the authenticated role passed: legacy keys, language
isolation, progress merging, scenario idempotence, invalid input rejection,
ownership checks and RLS. All verification writes were rolled back; existing
user data was preserved. This migration does not enable additional courses.

The import/extraction scripts are one-time migration helpers. Android is a
read-only source; existing web adaptations must be reviewed rather than overwritten.

The subsequent relational catalog, course/version sessions and optional Nora
retrieval integration are documented in [desktop-database.md](desktop-database.md).
