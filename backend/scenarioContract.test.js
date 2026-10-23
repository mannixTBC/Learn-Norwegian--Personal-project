const test = require('node:test');
const assert = require('node:assert/strict');
const catalog = require('../src/modules/exercises/conversationScenarios.json');
const { getScenarioDefinition, validateDefinition } = require('./scenarioContract');
const tutor = require('./scenarioTutor');
const assessment = require('./scenarioAssessment');
const scenario = catalog.scenarios.find(s => s.id === 'bus-delay');
const definition = getScenarioDefinition(scenario);

test('model contract integrates at every existing level without shifting base objective indices', () => {
  for (const level of Object.keys(catalog.levels)) {
    const context = tutor.context(scenario.id, level);
    assert.deepEqual(context.scenario.goals.slice(0, 3), definition.objectives.map(o => o.label));
    assert.equal(context.scenario.goals.length, scenario.variants[level].goals.length);
    assert.deepEqual(context.scenario.definition.objectives.slice(0, 3), definition.objectives);
    assert.equal(context.scenario.definition.level, level);
    assert.ok(assessment.assessmentRequest(context.scenario, context.difficulty, { history: [] }, 'Hei').messages[0].content.includes('authoritative scenario contract'));
  }
});

test('partner knowledge is absent from the public model while the server retains it', () => {
  assert.equal(Object.hasOwn(scenario, 'facts'), false);
  assert.equal(Object.hasOwn(scenario, 'definition'), false);
  assert.equal(definition.facts.find(f => f.id === 'delay').knownTo, 'learner');
  assert.equal(definition.facts.find(f => f.id === 'dispatch-help').knownTo, 'partner');
});

test('legacy scenarios remain usable at every level', () => {
  for (const item of catalog.scenarios.filter(s => s.id !== scenario.id)) {
    assert.equal(getScenarioDefinition(item), null);
    for (const level of Object.keys(catalog.levels)) {
      assert.equal(tutor.context(item.id, level).scenario.id, item.id);
    }
  }
});

test('invalid references, ambiguous identifiers and public/server drift fail validation', () => {
  const cases = [
    d => { d.schemaVersion = 2; },
    d => { d.facts[1].id = d.facts[0].id; },
    d => { d.facts[0].knownTo = 'everyone'; },
    d => { d.objectives[0].factIds = ['missing']; },
    d => { d.objectives[1].id = d.objectives[0].id; },
    d => { d.objectives[0].label = 'Different public objective'; },
    d => { d.objectives[0].criteria = []; },
    d => { d.objectives[2].priorPartnerCriteria = [9]; },
    d => { d.objectives[2].priorPartnerCriteria = [1, 1]; },
    d => { d.objectives.pop(); },
    d => { d.completion.success = ''; },
  ];
  for (const mutate of cases) {
    const copy = structuredClone(definition);
    mutate(copy);
    assert.throws(() => validateDefinition(copy, scenario), /Invalid scenario contract/);
  }
});




test('malformed definitions fail with actionable contract errors, not property access errors', () => {
  for (const value of [null, undefined, [], 'invalid', 42]) {
    assert.throws(() => validateDefinition(value, scenario), /^Error: Invalid scenario contract:/);
    assert.throws(() => validateDefinition(definition, value), /^Error: Invalid scenario contract:/);
  }
  const cases = [
    d => { d.facts[0] = null; },
    d => { d.facts[0] = []; },
    d => { d.facts[0].id = ' delay '; },
    d => { d.facts[0].disclosure = ' '; },
    d => { d.objectives[0] = null; },
    d => { d.objectives[0].criteria = [null]; },
    d => { d.objectives[0].accept = ['']; },
    d => { d.objectives[0].reject = []; },
    d => { d.objectives[0].factIds = ['delay', 'delay']; },
    d => { d.roles = []; },
    d => { d.completion = null; },
  ];
  for (const mutate of cases) {
    const copy = structuredClone(definition);
    mutate(copy);
    assert.throws(() => validateDefinition(copy, scenario), /^Error: Invalid scenario contract:/);
  }
});

test('a session cannot mutate the contract of a later session', () => {
  const first = tutor.context('bus-delay', 'A1');
  const expected = structuredClone(first);
  first.scenario.definition.facts[0].value = 'Changed by caller';
  first.scenario.definition.objectives.pop();
  first.scenario.goals.pop();
  const second = tutor.context('bus-delay', 'A1');
  assert.deepEqual(second.scenario.definition, expected.scenario.definition);
  assert.deepEqual(second.scenario.goals, scenario.goals);
});

test('only real catalog levels can start a scenario context', () => {
  for (const level of ['toString', '__proto__', 'constructor', '', 'a1', null, {}, ['A1']]) {
    assert.throws(() => tutor.context('bus-delay', level), error => error.status === 400);
  }
});



