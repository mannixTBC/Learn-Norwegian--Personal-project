const test = require('node:test');
const assert = require('node:assert/strict');
const catalog = require('../src/modules/exercises/conversationScenarios.json');
const { resolvePublicScenario } = require('../src/modules/exercises/scenarioDifficulty.mjs');
const { getScenarioDefinition, composeLevelDefinition } = require('./scenarioContract');
const variants = require('./scenarios/bus-delay.levels.json');
const tutor = require('./scenarioTutor');
const assessment = require('./scenarioAssessment');
const source = catalog.scenarios.find(s => s.id === 'bus-delay');

test('public objectives and private criteria agree for all six tailored variants', () => {
  const expected = { A1: [3, 7], A2: [4, 8], B1: [4, 9], B2: [4, 10], C1: [4, 10], C2: [5, 10] };
  for (const [level, [goalCount, turns]] of Object.entries(expected)) {
    const browser = resolvePublicScenario(source, catalog.levels, level);
    const server = tutor.context(source.id, level);
    const { definition, ...publicPart } = server.scenario;
    assert.deepEqual(publicPart, browser.scenario);
    assert.deepEqual(server.difficulty, browser.difficulty);
    assert.equal(browser.scenario.goals.length, goalCount);
    assert.equal(browser.difficulty.turns, turns);
    assert.deepEqual(definition.objectives.map(o => o.label), browser.scenario.goals);
    assert.deepEqual(definition.objectives.map(o => o.id), browser.scenario.objectiveIds);
    assert.equal(Object.hasOwn(browser.difficulty, 'instruction'), false, 'generic level instructions must not conflict');
    assert.equal(Object.hasOwn(browser.difficulty, 'goal'), false, 'no extra generic objective');
    assert.equal(Object.hasOwn(publicPart, 'variants'), false, 'only the selected level is sent');
    assert.equal(Object.hasOwn(publicPart, 'definition'), false);
    assert.equal(definition.level, level);
  }
});

test('advanced complications do not bleed into beginner prompts or other levels', () => {
  for (const level of ['A1', 'A2']) {
    const resolved = tutor.context(source.id, level);
    assert.equal(resolved.scenario.definition.interaction.challenge, null);
    const prompt = assessment.assessmentRequest(resolved.scenario, resolved.difficulty, { history: [] }, 'Hei').messages[0].content;
    assert.doesNotMatch(prompt, /timing-ambiguity|exact-time-request|information-options|update-pressure/);
  }
  assert.equal(tutor.context(source.id, 'B1').scenario.definition.facts.some(f => f.id === 'information-options'), true);
  assert.equal(tutor.context(source.id, 'B1').scenario.definition.facts.some(f => f.id === 'timing-ambiguity'), false);
  assert.equal(tutor.context(source.id, 'C2').scenario.definition.facts.some(f => f.id === 'timing-ambiguity'), true);
});

test('missing or mismatched level definitions fail instead of falling back silently', () => {
  const cases = [
    s => { delete s.variants.C2; },
    s => { s.variants.C2 = null; },
    s => { s.variants.C2.turns = 30; },
    s => { s.variants.C2.goals.pop(); },
    s => { s.variants.C2.objectiveIds[1] = s.variants.C2.objectiveIds[0]; },
    s => { delete s.revision; },
  ];
  for (const mutate of cases) {
    const copy = structuredClone(source);
    mutate(copy);
    assert.throws(() => resolvePublicScenario(copy, catalog.levels, 'C2'));
  }
  const base = getScenarioDefinition(source);
  const publicScenario = resolvePublicScenario(source, catalog.levels, 'C2').scenario;
  const privateCases = [
    v => { v.extraObjectives.pop(); },
    v => { v.extraObjectives[0].label = 'Wrong public wording'; },
    v => { v.extraObjectives[0].id = 'wrong-id'; },
    v => { v.facts.push(v.facts[0]); },
    v => { v.interaction.challenge.factIds = ['invented-fact']; },
    v => { v.interaction.challenge = undefined; },
    v => { v.language.partnerMaxSentences = 0; },
    v => { v.language.tolerance = ''; },
  ];
  for (const mutate of privateCases) {
    const copy = structuredClone(variants.C2);
    mutate(copy);
    assert.throws(() => composeLevelDefinition(base, copy, publicScenario, 'C2'), /Invalid scenario contract/);
  }
});

test('all ten scenarios resolve the same tailored goals on server and client', () => {
  for (const s of catalog.scenarios) for (const level of Object.keys(catalog.levels)) {
    const browser = resolvePublicScenario(s, catalog.levels, level);
    const server = tutor.context(s.id, level);
    const { definition, ...publicPart } = server.scenario;
    assert.deepEqual(publicPart, browser.scenario);
    assert.deepEqual(definition.objectives.map(o => o.label), browser.scenario.goals);
    assert.deepEqual(definition.objectives.map(o => o.id), browser.scenario.objectiveIds);
    assert.equal(Object.hasOwn(publicPart, 'facts'), false);
    assert.equal(Object.hasOwn(browser.difficulty, 'instruction'), false);
    assert.equal(browser.difficulty.turns, s.variants[level].turns);
    assert.ok(s.revision >= 2);
    if (['A1','A2'].includes(level)) assert.equal(definition.interaction.challenge, null);
    else assert.ok(definition.interaction.challenge.prompt);
    const untouched = tutor.context(s.id, 'A1');
    definition.facts.pop();
    assert.deepEqual(tutor.context(s.id, 'A1'), untouched);
  }
});

test('switching or mutating one variant cannot alter later resolved contexts', () => {
  const expected = tutor.context(source.id, 'C2');
  const changed = tutor.context(source.id, 'C2');
  changed.scenario.definition.interaction.challenge.prompt = 'Mutated';
  changed.scenario.definition.facts.pop();
  changed.scenario.goals.pop();
  changed.difficulty.turns = 1;
  assert.deepEqual(tutor.context(source.id, 'C2'), expected);
  assert.equal(tutor.context(source.id, 'A1').scenario.goals.length, 3);
});


test('level-specific shared knowledge does not change the base scenario', () => {
  const a1 = tutor.context(source.id, 'A1').scenario.definition;
  const b1 = tutor.context(source.id, 'B1').scenario.definition;
  assert.equal(a1.facts.find(f => f.id === 'dispatch-help').knownTo, 'partner');
  assert.equal(b1.facts.find(f => f.id === 'dispatch-help').knownTo, 'shared');
  const copy = structuredClone(variants.B1);
  copy.factOverrides = [{ ...copy.factOverrides[0], id: 'unknown-base-fact' }];
  assert.throws(() => composeLevelDefinition(getScenarioDefinition(source), copy,
    resolvePublicScenario(source, catalog.levels, 'B1').scenario, 'B1'), /Invalid scenario contract/);
});

