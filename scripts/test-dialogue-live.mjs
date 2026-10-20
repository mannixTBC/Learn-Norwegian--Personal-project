// Bounded real-provider smoke test. Uses the local server key; never prints it.
// Stops at the first provider/network failure. At most six paid chat requests.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { createScenarioSession, scenarios } from './dialogue-live-scenarios.mjs';
const require = createRequire(import.meta.url);
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const tutor = require('../backend/chatTutor');
const catalog = require('../backend/voiceCatalog.json');
const OpenAI = require('openai').default;
if (!process.env.OPENAI_API_KEY) {
  console.error('Test blocat: OPENAI_API_KEY nu este configurată local.');
  process.exit(2);
}
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 0, timeout: 20_000 });
const lessonId = Number(Object.entries(catalog.A1).find(([, lesson]) => lesson.uid === 'a1-cafe')[0]);
const context = tutor.lessonFor({ level: 'A1', lessonId, pathId: 'general' });
let passed = 0, failed = 0;
for (const scenario of scenarios) {
  const session = createScenarioSession(context, scenario);
  const request = tutor.buildCompletionRequest(context, session, scenario.message);
  assert.equal(request.messages.at(-2).role, 'assistant');
  assert.ok(request.messages.at(-2).content.endsWith(session.lastQuestion), 'Istoricul trebuie să conțină întrebarea curentă înaintea răspunsului testat');
  let completion;
  try { completion = await client.chat.completions.create(request); }
  catch (error) {
    const code = error.cause?.code || error.code || error.status || error.name;
    console.error(JSON.stringify({ status: 'blocked', scenario: scenario.name, code, passed, failed }));
    process.exit(2);
  }
  let parsed, result;
  const decision = (value) => value ? { understood: value.understood, intent: value.intent, advanceTurn: value.advanceTurn, question: value.question, done: value.done } : null;
  try {
    parsed = tutor.parseCompletion(completion);
    assert.ok(parsed, 'Modelul trebuie să respecte schema completă');
    result = tutor.finalizeTurn(parsed, session, context, scenario.message);
    assert.equal(result.advanceTurn, scenario.advance, 'advanceTurn trebuie să reflecte relevanța răspunsului la întrebarea curentă');
    if (scenario.noSandwich) assert.doesNotMatch(result.question || '', /vil du ha (?:et )?smørbrød/i);
    if (!scenario.advance) assert.equal(Object.keys(result.progress || {}).length, 0);
    assert.equal(result.done, false);
    passed++;
    console.log(JSON.stringify({ status: 'passed', scenario: scenario.name, question: result.question,
      ...(result.question !== parsed.question ? { modelQuestion: parsed.question, questionAdjusted: true } : {}) }));
  } catch (error) {
    failed++; console.error(JSON.stringify({ status: 'failed', scenario: scenario.name, check: error.message,
      currentQuestion: session.lastQuestion, previousAssistant: request.messages.at(-2).content,
      modelDecision: decision(parsed), applicationDecision: decision(result), finishReason: completion.choices?.[0]?.finish_reason }));
  }
}
console.log(JSON.stringify({ passed, failed, note: 'Teste text reale; microfonul, pronunția și latența vocală necesită o verificare separată.' }));
process.exitCode = failed ? 1 : 0;
