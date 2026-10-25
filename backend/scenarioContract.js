// Explicit imports keep every private contract in the server bundle only.
const contracts = [
  [require('./scenarios/bus-delay.json'), require('./scenarios/bus-delay.levels.json')],
  [require('./scenarios/hotel-booking.json'), require('./scenarios/hotel-booking.levels.json')],
  [require('./scenarios/team-plan.json'), require('./scenarios/team-plan.levels.json')],
  [require('./scenarios/cafe-order.json'), require('./scenarios/cafe-order.levels.json')],
  [require('./scenarios/site-materials.json'), require('./scenarios/site-materials.levels.json')],
  [require('./scenarios/care-comfort.json'), require('./scenarios/care-comfort.levels.json')],
  [require('./scenarios/cleaning-plan.json'), require('./scenarios/cleaning-plan.levels.json')],
  [require('./scenarios/shop-exchange.json'), require('./scenarios/shop-exchange.levels.json')],
  [require('./scenarios/study-meeting.json'), require('./scenarios/study-meeting.levels.json')],
  [require('./scenarios/kindergarten-plan.json'), require('./scenarios/kindergarten-plan.levels.json')],
];
const definitions = new Map(contracts.map(([base]) => [base.scenarioId, base]));
const levelDefinitions = new Map(contracts.map(([base, levels]) => [base.scenarioId, levels]));

const assert = (condition, message) => {
  if (!condition) throw new Error('Invalid scenario contract: ' + message);
};
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const identifier = value => typeof value === 'string' && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value);
const textList = value => Array.isArray(value) && value.length > 0 && Array.from(value).every(text);

function validateDefinition(definition, scenario) {
  assert(record(scenario) && identifier(scenario.id) && textList(scenario.goals), 'invalid public scenario');
  assert(record(definition), 'definition must be an object');
  assert(definition.schemaVersion === 1, 'unsupported schema version');
  assert(definition.scenarioId === scenario.id, 'scenario ID mismatch');
  assert(record(definition.roles) && text(definition.roles.learner) && text(definition.roles.partner), 'both roles are required');
  assert(text(definition.outcome), 'communicative outcome is required');
  assert(Array.isArray(definition.facts) && definition.facts.length > 0, 'facts are required');
  const factIds = new Set();
  for (const fact of definition.facts) {
    assert(record(fact), 'each fact must be an object');
    assert(identifier(fact.id) && !factIds.has(fact.id), 'fact IDs must be valid and unique');
    factIds.add(fact.id);
    assert(text(fact.value), 'missing fact value: ' + fact.id);
    assert(['shared', 'learner', 'partner'].includes(fact.knownTo), 'invalid fact audience: ' + fact.id);
    assert(text(fact.disclosure), 'missing disclosure rule: ' + fact.id);
  }
  assert(Array.isArray(definition.objectives) && definition.objectives.length === scenario.goals.length, 'objectives must match public goals');
  const objectiveIds = new Set();
  for (const [index, objective] of definition.objectives.entries()) {
    assert(record(objective), 'each objective must be an object');
    assert(identifier(objective.id) && !objectiveIds.has(objective.id), 'objective IDs must be valid and unique');
    objectiveIds.add(objective.id);
    assert(objective.label === scenario.goals[index], 'public label mismatch: ' + objective.id);
    assert(textList(objective.criteria), 'missing criteria: ' + objective.id);
    if (objective.priorPartnerCriteria !== undefined) {
      assert(Array.isArray(objective.priorPartnerCriteria)
        && objective.priorPartnerCriteria.length > 0
        && new Set(objective.priorPartnerCriteria).size === objective.priorPartnerCriteria.length
        && objective.priorPartnerCriteria.every(id => Number.isInteger(id) && id >= 0 && id < objective.criteria.length),
        'invalid prior partner criterion: ' + objective.id);
    }
    assert(textList(objective.factIds) && objective.factIds.every(id => factIds.has(id)), 'unknown fact reference: ' + objective.id);
    assert(new Set(objective.factIds).size === objective.factIds.length, 'duplicate fact reference: ' + objective.id);
    for (const field of ['accept', 'reject']) {
      assert(textList(objective[field]), 'missing ' + field + ' examples: ' + objective.id);
    }
  }
  for (const field of ['allowedResolutions', 'boundaries']) {
    assert(textList(definition[field]), 'missing ' + field);
  }
  assert(record(definition.completion) && text(definition.completion.success) && text(definition.completion.incomplete), 'completion rules are required');
  if (definition.completion.successReply !== undefined) assert(text(definition.completion.successReply) && definition.completion.successReply.length <= 1800, 'invalid success reply');
  return definition;
}

function getScenarioDefinition(scenario, level, publicScenario) {
  assert(record(scenario) && identifier(scenario.id), 'invalid public scenario');
  const definition = definitions.get(scenario.id);
  // A caller must not be able to change the definition used by later sessions.
  if (!definition) {
    assert(!scenario.variants, 'tailored scenario requires a private definition');
    return null;
  }
  const base = validateDefinition(definition, scenario);
  if (level === undefined) return structuredClone(base);
  const variants = levelDefinitions.get(scenario.id);
  assert(typeof level === 'string' && variants && Object.hasOwn(variants, level), 'missing private level variant');
  return composeLevelDefinition(base, variants[level], publicScenario, level);
}


function composeLevelDefinition(base, variant, publicScenario, level) {
  assert(record(publicScenario), 'missing resolved public scenario: ' + level);
  assert(record(variant), 'missing private level variant: ' + level);
  assert(record(variant.language), 'missing language policy: ' + level);
  for (const key of ['vocabulary', 'syntax', 'register', 'tolerance']) {
    assert(text(variant.language[key]), 'missing language policy ' + key + ': ' + level);
  }
  assert(Number.isInteger(variant.language.partnerMaxSentences)
    && variant.language.partnerMaxSentences >= 1 && variant.language.partnerMaxSentences <= 4,
    'invalid partner sentence budget: ' + level);
  assert(record(variant.interaction) && text(variant.interaction.support), 'missing support policy: ' + level);
  assert(Array.isArray(variant.facts) && Array.isArray(variant.extraObjectives), 'invalid level additions: ' + level);
  const overrides = variant.factOverrides ?? [];
  assert(Array.isArray(overrides), 'invalid fact overrides: ' + level);
  const overrideMap = new Map();
  for (const fact of overrides) {
    assert(record(fact) && base.facts.some(original => original.id === fact.id)
      && !overrideMap.has(fact.id), 'unknown or duplicate fact override: ' + level);
    overrideMap.set(fact.id, fact);
  }
  const combined = structuredClone({
    ...base, level, revision: publicScenario.revision,
    facts: [...base.facts.map(fact => overrideMap.get(fact.id) || fact), ...variant.facts],
    objectives: [...base.objectives, ...variant.extraObjectives],
    allowedResolutions: variant.allowedResolutions ?? base.allowedResolutions,
    language: variant.language, interaction: variant.interaction,
    completion: {
      ...base.completion,
      success: 'All objectives listed in this resolved definition must have learner evidence. Require partner context only where an objective explicitly calls for confirmation. There are no additional generic or hidden level goals.',
    },
  });
  validateDefinition(combined, publicScenario);
  assert(textList(publicScenario.objectiveIds)
    && publicScenario.objectiveIds.length === combined.objectives.length
    && combined.objectives.every((objective, index) => objective.id === publicScenario.objectiveIds[index]),
    'public/private objective ID mismatch: ' + level);
  const challenge = combined.interaction.challenge;
  if (challenge !== null) {
    assert(record(challenge) && text(challenge.trigger) && text(challenge.prompt), 'invalid challenge: ' + level);
    assert(textList(challenge.factIds)
      && challenge.factIds.every(id => combined.facts.some(fact => fact.id === id)),
      'unknown challenge fact: ' + level);
  }
  return combined;
}

module.exports = { getScenarioDefinition, validateDefinition, composeLevelDefinition };

