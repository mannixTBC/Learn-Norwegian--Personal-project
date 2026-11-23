# V2 persistence and authenticated routes

Implemented locally; not deployed. No existing backend checkout or hosted database was modified. The mobile app now has a separate ConversationV2 route; see docs/V2_INTERFATA.md in the mobile repository.

## Storage

Migration: `integrations/database/supabase/migrations/20261117191413_conversation_v2_sessions.sql` in the mobile repository. Creates only `nl_conversation_v2_sessions`, `nl_conversation_v2_commands`, and `nl_conversation_v2_store`. No V1 table is read or changed.

The RPC is SECURITY INVOKER and executable only by service_role. Both tables have RLS and no grants to anon/authenticated. The backend supplies owner from verified authentication. A browser cannot forge progress through direct RPC calls. Keep the service-role key exclusively on the backend.

Sessions store a versioned snapshot. Commands bind an ID to a payload even across failed evaluations. The RPC reserves a 45-second lease before provider work, with a row lock held only for the database operation. Evaluator deadline is at most 30 seconds. Commit requires matching revision and lease token; stale workers cannot commit or unlock replacement leases. Sequential retries do not invoke the evaluator again. A crash after a provider response but before commit can require another paid call; this is not exactly-once billing.

Deleting a session cascades its command records; deleting an auth account cascades its sessions. Expiry blocks further use but does not delete data automatically. Decide retention and configure cleanup before public activation.

## HTTP

Base path `/api/conversations/v2`; all enabled routes require verified account authentication. Disabled routes are not mounted by `mountConversationV2`.

The mount now includes `freeCatalog.mjs` (A1–C2) alongside the supplied scenario catalog. Copy the entire directory, including this file, when publishing. Free definitions require `mode: free`; practical definitions reject that mode. Free sessions use the existing V2 tables without a new migration. Their `task` outcome is `not_applicable`, and validated language notes are exposed during the conversation and retained up to the latest 12 for final feedback. The AI adapter selects the free-conversation policy automatically; quota and leases remain shared with V2 scenarios. No V1 memory is loaded.

Live V2 is a separate opt-in `live` adapter on the same mount. Free definitions also accept `mode: live`, with empty initial transcript and no text evaluator. See `docs/V2_LIVE.md` in the app repository for the token/transcript routes, required quota adapter and deployment limitations. Include `live.mjs` when copying the backend directory. No new SQL migration is required.

| Method | Path | Input |
|---|---|---|
| GET | /catalog | query supportLanguage=ro |
| POST | /sessions | scenarioId, scenarioVersion, supportLanguage, mode, variantId |
| GET | /sessions/:id | none |
| POST | /sessions/:id/turns | commandId, expectedRevision, text, source: text/voice |
| POST | /sessions/:id/help | commandId, expectedRevision, kind: hint/example/translation |
| POST | /sessions/:id/finish | commandId, expectedRevision |
| DELETE | /sessions/:id | none; owned expired sessions can be deleted |

Owner, session ID, type overrides and assessments cannot be supplied by the caller. Duplicate accepted commands return the latest snapshot. Different payload with the same command ID returns 409. SESSION_BUSY returns 409 while another worker holds the lease; clients should resume and retry the same command, not generate new IDs automatically. Responses are no-store and errors redact internals. The JSON parser limit is 16kb.

## Opt-in composition

Apply the new migration in a test environment first. Copy this directory to `backend/conversation-v2`; copy `content-authoring/conversations/pilot.mjs` as `backend/conversation-v2/pilot.mjs`. Mount before the broad JSON parser in app.js:

```js
if (process.env.CONVERSATION_V2_ENABLED === 'true') {
  const {createClient} = require('@supabase/supabase-js');
  const {mountConversationV2} = require('./conversation-v2/mount.mjs');
  const {pilotScenarios} = require('./conversation-v2/pilot.mjs');
  if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('V2 database configuration missing');
  }
  mountConversationV2(app, {
    enabled: true, express,
    requireAuth: require('./middleware/authSupabaseUser').requireAuth,
    client: createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY,
      {auth:{persistSession:false,autoRefreshToken:false}}),
    catalog: pilotScenarios,
  });
}
```

With the configuration above, model turns remain disabled and return EVALUATOR_UNAVAILABLE without advancing the snapshot. The implemented AI adapter can be enabled separately by adding this `ai` property to the same mount options:

```js
ai: {
  enabled: process.env.CONVERSATION_V2_AI_ENABLED === 'true',
  getClient: require('./openai').getOpenAI,
  getSettings: () => require('./textModel').textModelSettings('chat'),
  consumeQuota: require('./chatUsage').consumeChatQuota,
  recordUsage: require('./chatUsage').recordChatUsage,
  // Optional. When present, a turn that fails after the reservation returns the learner's unit.
  // refundQuota: require('./chatUsage').refundChatQuota,
  onAccountingError: event => console.warn('conversation-v2-accounting', event.code),
},
```

These dependencies reuse the backend SDK, configured model and quota implementation without changing V1 code or model settings. `getSettings` may instead return a dedicated validated V2 model configuration. No hard-coded provider model is introduced. `evaluateForRequest` remains available for custom adapters but cannot be supplied together with enabled `ai`.

The service obtains the durable lease before the adapter reserves quota. Each new turn reserves quota once; an optional assessment retry and actor call aggregate into that turn's recorded usage. Provider failures are not reported as learner quota failures. Usage accounting runs on success and failure and is best-effort; deadline is bounded. Model calls use the existing SDK's Chat Completions structured JSON schema, explicit timeout, cancellation signal and zero SDK retries. Assessment may retry malformed/evidence-invalid output once, and a rejected partner reply (unknown fact ID, more than one question) is retried once; provider errors and refusals do not trigger a retry. A second reply that only asks too many questions is accepted rather than failing the turn. Unusable language notes are dropped individually and never fail a turn. The explanation rewrite runs in parallel with the partner reply. Maximum: five model calls per learner turn (two assessment, two partner, one rewrite), within a 25-second provider budget and 30-second service deadline. `help` with kind `example` makes one model call under the same lease, quota and accounting as a turn.

Assessment covers every criterion and validates exact learner evidence plus earlier partner context. The actor receives accepted statuses and only the pinned variant's facts. Completion is computed by the engine. A completed task gets one in-role closing line from the actor, with no question allowed; if that call fails, and whenever the turn limit ends an incomplete task, the neutral fixed closing is used. An objective already met is revoked only by a quoted contradiction, not by the model omitting it. Sessions expire twelve hours after they start.

Free conversation has an implicit memory held by the phone, not by the backend. `POST /sessions` accepts an optional `memory` (`{notes:[{text,updatedAt}],level}`, at most eight notes of 240 characters, notes older than 90 days dropped) for `free` and `live` modes only. Each free turn may add up to two short notes and replace the level note; the session view returns the merged memory for the phone to keep. It is passed to the model as silent background and is never added to the transcript. A live call reads the memory but does not extend it. The copy inside the session snapshot expires with the session. Corrections include a learner quotation, Norwegian suggestion and support-language explanation. Objective achievements and remaining objectives are assembled from catalog labels, not model prose.

Finished session responses and resume include `feedback: {language, achieved, remaining, languageNotes}`. Active sessions keep feedback hidden until completion. The stored snapshot records model and evaluator policy version for diagnosis but does not expose internal prompts or facts. `outcome.language` remains `not_assessed`: qualitative suggestions are not a CEFR score or pronunciation assessment. Manual finish returns retained validated suggestions (up to 12, deduplicated by message and quotation) and current objectives without an extra provider call. This retention applies to both scenarios and free dialogue.

Configure request rate limits and cleanup, then run live-model acceptance tests before public activation. No simulated response is represented as AI at runtime. The shipped tests inject simulated completions; they validate contracts, ordering, evidence and accounting, not the linguistic accuracy of the real model.

No package version change is necessary. The mobile V2 client explicitly selects the voice API origin and validates the Norwegian/Romanian session identity. Studio uses the existing visual components with V2 data only; it does not fall back to V1 scenarios.

## Tests

`node scripts/check-conversation-v2.mjs` checks the pure engine.

Set `NORDLINGO_BACKEND_ROOT` to the existing checkout with Express installed, then run `node scripts/test-conversation-v2-persistence.mjs`. It uses bundled PGlite (or `NORDLINGO_SQL_TOOLS`) to execute actual PostgreSQL DDL/functions in a temporary disk database under `.test-output`, closes/reopens that database, and exercises real Express HTTP routes. No hosted database or model is called. Authentication is injected for route tests; token validation itself remains the existing requireAuth middleware.


Session views include helpCommandIds for recovery of delivered translation commands. The optional ai.onTiming callback receives provider stage, durationMs and success, without message content. Current application routing requires V2 to be deployed: missing routes show an availability error, never a legacy scenario.
