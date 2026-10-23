const test = require('node:test');
const assert = require('node:assert/strict');
const tutor = require('./scenarioTutor');
const assessment = require('./scenarioAssessment');
const { runScenarioTurn, addUsage } = require('./scenarioTurn');
const { completeCases, levels } = require('./testFixtures/scenarioDialogues');
const missingReport = scenario => ({ feedback: 'Mai este nevoie de o clarificare.',
  objectives: scenario.definition.objectives.map(objective => ({ id: objective.id,
    criteria: objective.criteria.map((_, id) => ({ id, status: 'missing', evidence: [], context: [] })) })) });
const met = (report, objective, criterion, turn, quote, context = []) => {
  report.objectives[objective].criteria[criterion] = { id: criterion, status: 'met', evidence: [{ turn, quote }], context };
};
const completion = data => ({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(data) } }],
  usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15, prompt_tokens_details: { cached_tokens: 3 } } });
const clientWith = fn => ({ chat: { completions: { create: fn } } });

for (const level of levels) {
  test(level + ': all criteria are required, progress is recomputed, and self-correction can restore it', () => {
    const { scenario } = tutor.context('bus-delay', level);
    const session = { history: [{ role: 'assistant', content: scenario.opening }], achieved: [0, 1, 2] };
    const message = 'Jeg er omtrent ti minutter forsinket på grunn av mye trafikk.';
    const report = missingReport(scenario);
    met(report, 0, 0, 1, 'forsinket');
    assert.deepEqual(assessment.assess(report, scenario, session, message).achieved, []);
    met(report, 0, 1, 1, 'ti minutter forsinket');
    assert.deepEqual(assessment.assess(report, scenario, session, message).achieved, [0]);
    const old = { ...session, history: [...session.history, { role: 'user', content: message },
      { role: 'assistant', content: 'Er du sikker?' }] };
    const contradictory = structuredClone(report);
    contradictory.objectives[0].criteria[1] = { id: 1, status: 'contradicted', evidence: [{ turn: 3, quote: 'tjue minutter' }], context: [] };
    const rejected = assessment.assess(contradictory, scenario, old, 'Nei, tjue minutter.');
    assert.deepEqual(rejected.achieved, []);
    assert.equal(rejected.objectives[0].status, 'contradicted');
    const corrected = { ...old, history: [...old.history, { role: 'user', content: 'Nei, tjue minutter.' },
      { role: 'assistant', content: 'Hva mener du?' }] };
    met(report, 0, 1, 5, 'ti minutter');
    assert.deepEqual(assessment.assess(report, scenario, corrected, 'Beklager, jeg mente ti minutter.').achieved, [0]);
  });
}

test('only exact quotes from the specified learner turn count; malformed coverage fails closed', () => {
  const { scenario } = tutor.context('bus-delay', 'A1');
  const session = { history: [{ role: 'assistant', content: 'Ti minutter forsinket.' }] };
  const message = 'Jeg er forsinket.';
  const report = missingReport(scenario);
  const mutations = [
    r => met(r, 0, 0, 0, 'Ti minutter'),
    r => met(r, 0, 0, 1, 'Ti minutter'),
    r => met(r, 0, 0, 3, 'Jeg er forsinket.'),
    r => met(r, 0, 0, -1, 'Jeg er forsinket.'),
    r => met(r, 0, 0, 1, ' '),
    r => { r.objectives[0].criteria[0].status = 'met'; },
    r => { r.objectives[0].criteria[0].status = 'probably'; },
    r => { r.objectives[0].criteria.pop(); },
    r => { r.objectives.pop(); },
    r => { r.objectives[1].id = r.objectives[0].id; },
    r => { r.objectives[0].criteria[1].id = 0; },
    r => { r.feedback = null; },
  ];
  for (const mutate of mutations) {
    const copy = structuredClone(report); mutate(copy);
    assert.throws(() => assessment.assess(copy, scenario, session, message), error => error.status === 502);
  }
});

test('agreement requires earlier partner context and subsequent learner confirmation, including a short Ja', () => {
  const { scenario } = tutor.context('bus-delay', 'A1');
  const report = missingReport(scenario);
  const session = { history: [{ role: 'assistant', content: 'Jeg informerer passasjerene. Fortsett ruten trygt.' }] };
  for (let id = 0; id < 3; id++) met(report, 2, id, 1, 'Ja', id ? [{ turn: 0, quote: 'Fortsett ruten trygt.' }] : []);
  assert.deepEqual(assessment.assess(report, scenario, session, 'Ja.').achieved, [2]);
  const noContext = structuredClone(report); noContext.objectives[2].criteria[1].context = [];
  assert.throws(() => assessment.assess(noContext, scenario, session, 'Ja.'), /Evaluare invalid/);
  const future = structuredClone(report); future.objectives[2].criteria[1].context[0].turn = 2;
  assert.throws(() => assessment.assess(future, scenario, session, 'Ja.'), /Evaluare invalid/);
  const earlierConfirmation = { history: [{ role: 'assistant', content: 'Hei' },
    { role: 'user', content: 'Ja' }, session.history[0]] };
  const laterPlan = structuredClone(report);
  for (const c of laterPlan.objectives[2].criteria) c.context = [{ turn: 2, quote: 'Fortsett ruten trygt.' }];
  assert.throws(() => assessment.assess(laterPlan, scenario, earlierConfirmation, 'Hei'), /Evaluare invalid/);
});

test('refusals, truncation, empty output and invalid JSON are rejected', () => {
  for (const mutate of [c => { c.choices[0].finish_reason = 'length'; }, c => { c.choices[0].message.refusal = 'No'; },
    c => { c.choices = []; }, c => { c.choices[0].message.content = '{} trailing'; },
    c => { c.choices[0].message.content = ''; }]) {
    const c = completion({}); mutate(c);
    assert.throws(() => assessment.parseCompletion(c), error => error.status === 502);
  }
});

test('evaluation and roleplay are separate; the actor receives validated criterion statuses', async () => {
  const { scenario, difficulty } = tutor.context('bus-delay', 'C2');
  const session = { turn: 0, achieved: [0, 1, 2, 3, 4], done: false, history: [{ role: 'assistant', content: scenario.opening }] };
  const before = structuredClone(session), calls = [];
  let usage = null;
  const result = await runScenarioTurn({ scenario, difficulty, session, message: 'Hei',
    onUsage: value => { usage = addUsage(usage, value); }, client: clientWith(async (request, options) => {
      calls.push(request);
      assert.ok(options.timeout <= 20000 && options.timeout > 0);
      assert.equal(options.maxRetries, 0);
      return completion(calls.length === 1 ? missingReport(scenario) : { reply: 'Hva har skjedd?' });
    }) });
  assert.equal(calls.length, 2);
  const actual = JSON.parse(calls[0].messages[1].content).transcript;
  assert.deepEqual(actual.map(t => [t.turn, t.role]), [[0, 'assistant'], [1, 'user']]);
  assert.doesNotMatch(calls[0].messages[0].content, /completedGoals/);
  assert.match(calls[1].messages[0].content, /"assessment":\[/);
  assert.deepEqual(result.session.achieved, []);
  assert.equal(result.session.done, false);
  assert.equal(result.session.turn, 1);
  assert.equal(result.session.history.at(-1).content, 'Hva har skjedd?');
  assert.deepEqual(session, before);
  assert.deepEqual(usage, { prompt_tokens: 20, completion_tokens: 10, total_tokens: 30, prompt_tokens_details: { cached_tokens: 6 } });
});

test('failed assessment or actor leaves the input session untouched and still records billed usage', async () => {
  const { scenario, difficulty } = tutor.context('bus-delay', 'A1');
  for (const mode of ['bad-assessment', 'bad-actor', 'actor-network']) {
    const session = { turn: 0, history: [{ role: 'assistant', content: scenario.opening }], achieved: [], done: false };
    const original = structuredClone(session); let calls = 0, usage = null;
    await assert.rejects(runScenarioTurn({ scenario, difficulty, session, message: 'Hei',
      onUsage: value => { usage = addUsage(usage, value); }, client: clientWith(async () => {
        calls++;
        if (calls === 1) return completion(mode === 'bad-assessment' ? {} : missingReport(scenario));
        if (mode === 'actor-network') throw new Error('network unavailable');
        return completion({ reply: '' });
      }) }));
    assert.deepEqual(session, original);
    assert.equal(calls, mode === 'bad-assessment' ? 1 : 2);
    assert.equal(usage.prompt_tokens, mode === 'bad-actor' ? 20 : 10);
  }
});

test('complete missions and exhausted budgets close without asking another question or inventing success', async () => {
  for (const fixture of completeCases) {
    const { scenario, difficulty } = tutor.context('bus-delay', fixture.level);
    for (const success of [true, false]) {
      const report = missingReport(scenario);
      const session = { history: fixture.history, turn: success ? 2 : difficulty.turns - 1, achieved: [], done: false };
      if (success) {
        // Explicitly scripted model output: this test verifies lifecycle, not semantic judgment.
        for (const objective of report.objectives) for (const c of objective.criteria) {
          c.status = 'met'; c.evidence = [{ turn: 5, quote: fixture.message }];
          c.context = [{ turn: 4, quote: fixture.history[4].content }];
        }
      }
      let calls = 0;
      const result = await runScenarioTurn({ scenario, difficulty, session, message: fixture.message,
        client: clientWith(async () => { calls++; return completion(report); }) });
      assert.equal(calls, 1);
      assert.equal(result.session.done, true);
      assert.deepEqual(result.session.achieved, success ? fixture.expected : []);
      assert.doesNotMatch(result.reply, /\?/);
      assert.equal(result.reply.includes('planen avtalt'), success);
    }
  }
});
module.exports = { missingReport, completion };
test('two-stage calls share a deadline below the quota lease', async t => {
  const { scenario, difficulty } = tutor.context('bus-delay', 'A1');
  const realNow = Date.now;
  let now = 1000;
  Date.now = () => now;
  t.after(() => { Date.now = realNow; });
  const timeouts = [];
  await runScenarioTurn({ scenario, difficulty,
    session: { turn: 0, history: [{ role: 'assistant', content: scenario.opening }], achieved: [] }, message: 'Hei',
    client: clientWith(async (request, options) => {
      timeouts.push(options.timeout);
      if (timeouts.length === 1) { now += 19000; return completion(missingReport(scenario)); }
      return completion({ reply: 'Hva har skjedd?' });
    }) });
  assert.deepEqual(timeouts, [20000, 16000]);
});

test('contract scenarios cannot accidentally fall back to the legacy quote-only evaluator', () => {
  const { scenario } = tutor.context('bus-delay', 'A1');
  assert.throws(() => tutor.evaluate({ reply: 'Takk', feedback: '', achieved: [{ id: 2, evidence: 'Ja' }] },
    { history: [], achieved: [] }, 'Ja', scenario), error => error.status === 502);
});
