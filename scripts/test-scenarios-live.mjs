// Bounded provider checks of expert-authored dialogues. Never print credentials.
// 32 assessment calls + at most 3 actor calls, zero retries. Stops on provider failure.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const tutor = require('../backend/scenarioTutor');
const assessment = require('../backend/scenarioAssessment');
const { cases } = require('../backend/testFixtures/scenarioDialogues');
const OpenAI = require('openai').default;
if (!process.env.OPENAI_API_KEY) {
  console.error('Test blocat: OPENAI_API_KEY nu este configurată local.');
  process.exit(2);
}
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 0, timeout: 20000 });
// Optional case name allows a focused rerun after a diagnosed failure.
const selected = process.argv[2] ? cases.filter(c => c.name === process.argv[2]) : cases;
assert.ok(selected.length, 'Unknown scenario test case');
let passed = 0, failed = 0, calls = 0;
async function request(body) {
  assert.ok(++calls <= 35, 'Live test call budget exceeded');
  try { return await client.chat.completions.create(body, { timeout: 20000, maxRetries: 0 }); }
  catch (error) {
    console.error(JSON.stringify({ status: 'blocked', code: error.cause?.code || error.code || error.status || error.name, passed, failed, calls }));
    process.exit(2);
  }
}
for (const fixture of selected) {
  const { scenario, difficulty } = tutor.context('bus-delay', fixture.level);
  const session = { history: fixture.history, turn: fixture.history.filter(t => t.role === 'user').length,
    achieved: fixture.contradicted ? scenario.goals.map((_, i) => i) : [], done: false };
  let evaluated;
  try {
    const parsed = assessment.parseCompletion(await request(assessment.assessmentRequest(scenario, difficulty, session, fixture.message)));
    evaluated = assessment.assess(parsed, scenario, session, fixture.message);
    if (fixture.expected) assert.deepEqual(evaluated.achieved, fixture.expected, 'Unexpected achieved objectives');
    for (const index of fixture.absent || []) assert.ok(!evaluated.achieved.includes(index), 'Contradicted objective remained complete: ' + index);
    for (const index of fixture.contradicted || []) assert.equal(evaluated.objectives[index].status, 'contradicted');
    passed++;
    console.log(JSON.stringify({ status: 'passed', case: fixture.name, achieved: evaluated.achieved, feedback: evaluated.feedback }));
  } catch (error) {
    failed++;
    console.error(JSON.stringify({ status: 'failed', case: fixture.name, check: error.message,
      objectives: evaluated?.objectives, feedback: evaluated?.feedback }));
    continue;
  }
  if (['A1-partial', 'A2-premature-confirmation', 'C2-self-correction'].includes(fixture.name)) {
    try {
      const reply = assessment.partnerReply(assessment.parseCompletion(await request(
        assessment.partnerRequest(scenario, difficulty, session, fixture.message, evaluated))));
      assert.ok((reply.match(/\?/g) || []).length <= 1, 'Too many questions');
      assert.doesNotMatch(reply, /report-delay|priorPartnerCriteria|"criteria"|"knownTo"/);
      if (fixture.name === 'A1-partial') assert.doesNotMatch(reply, /\bti minutter\b|\b10\b|\btrafikk\b|\bkø\b/i, 'Learner-only fact disclosed too early');
      console.log(JSON.stringify({ status: 'actor-review', case: fixture.name, reply }));
    } catch (error) {
      failed++;
      console.error(JSON.stringify({ status: 'failed', case: fixture.name + '-actor', check: error.message }));
    }
  }
}
console.log(JSON.stringify({ passed, failed, calls, model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
  note: 'Provider samples verify these dialogues only; they do not prove all possible semantic judgments.' }));
process.exitCode = failed ? 1 : 0;
