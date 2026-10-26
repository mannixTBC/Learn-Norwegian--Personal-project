const { getScenarioStage } = require('../src/modules/exercises/scenarioStages.mjs');
// Explicit imports keep every private contract in the server bundle only.
const contracts = [
  [require('./scenarios/family-event-followup.json'), require('./scenarios/family-event-followup.levels.json')],
  [require('./scenarios/family-cost-question.json'), require('./scenarios/family-cost-question.levels.json')],
  [require('./scenarios/family-group-disagreement.json'), require('./scenarios/family-group-disagreement.levels.json')],
  [require('./scenarios/family-pickup-change.json'), require('./scenarios/family-pickup-change.levels.json')],
  [require('./scenarios/family-wrong-bag.json'), require('./scenarios/family-wrong-bag.levels.json')],
  [require('./scenarios/family-photo-consent.json'), require('./scenarios/family-photo-consent.levels.json')],
  [require('./scenarios/family-message-unclear.json'), require('./scenarios/family-message-unclear.levels.json')],
  [require('./scenarios/family-lost-mittens.json'), require('./scenarios/family-lost-mittens.levels.json')],
  [require('./scenarios/family-shared-dinner.json'), require('./scenarios/family-shared-dinner.levels.json')],
  [require('./scenarios/family-activity-signup.json'), require('./scenarios/family-activity-signup.levels.json')],
  [require('./scenarios/family-school-meeting.json'), require('./scenarios/family-school-meeting.levels.json')],
  [require('./scenarios/family-playdate.json'), require('./scenarios/family-playdate.levels.json')],
  [require('./scenarios/family-bring-book.json'), require('./scenarios/family-bring-book.levels.json')],
  [require('./scenarios/family-name-label.json'), require('./scenarios/family-name-label.levels.json')],
  [require('./scenarios/family-playground.json'), require('./scenarios/family-playground.levels.json')],
  [require('./scenarios/family-new-neighbor.json'), require('./scenarios/family-new-neighbor.levels.json')],
  [require('./scenarios/study-project-revision.json'), require('./scenarios/study-project-revision.levels.json')],
  [require('./scenarios/study-presentation-length.json'), require('./scenarios/study-presentation-length.levels.json')],
  [require('./scenarios/study-group-absence.json'), require('./scenarios/study-group-absence.levels.json')],
  [require('./scenarios/study-source-check.json'), require('./scenarios/study-source-check.levels.json')],
  [require('./scenarios/study-submit-file.json'), require('./scenarios/study-submit-file.levels.json')],
  [require('./scenarios/study-feedback.json'), require('./scenarios/study-feedback.levels.json')],
  [require('./scenarios/study-missed-class.json'), require('./scenarios/study-missed-class.levels.json')],
  [require('./scenarios/study-platform-access.json'), require('./scenarios/study-platform-access.levels.json')],
  [require('./scenarios/study-late-arrival.json'), require('./scenarios/study-late-arrival.levels.json')],
  [require('./scenarios/study-book-room.json'), require('./scenarios/study-book-room.levels.json')],
  [require('./scenarios/study-practice-partner.json'), require('./scenarios/study-practice-partner.levels.json')],
  [require('./scenarios/study-course-time.json'), require('./scenarios/study-course-time.levels.json')],
  [require('./scenarios/study-repeat-word.json'), require('./scenarios/study-repeat-word.levels.json')],
  [require('./scenarios/study-borrow-pencil.json'), require('./scenarios/study-borrow-pencil.levels.json')],
  [require('./scenarios/study-classroom.json'), require('./scenarios/study-classroom.levels.json')],
  [require('./scenarios/study-introduction.json'), require('./scenarios/study-introduction.levels.json')],
  [require('./scenarios/shop-order-change.json'), require('./scenarios/shop-order-change.levels.json')],
  [require('./scenarios/shop-queue-help.json'), require('./scenarios/shop-queue-help.levels.json')],
  [require('./scenarios/shop-stock-promise.json'), require('./scenarios/shop-stock-promise.levels.json')],
  [require('./scenarios/shop-return-question.json'), require('./scenarios/shop-return-question.levels.json')],
  [require('./scenarios/shop-payment-status.json'), require('./scenarios/shop-payment-status.levels.json')],
  [require('./scenarios/shop-wrong-size-label.json'), require('./scenarios/shop-wrong-size-label.levels.json')],
  [require('./scenarios/shop-missing-item.json'), require('./scenarios/shop-missing-item.levels.json')],
  [require('./scenarios/shop-damaged-package.json'), require('./scenarios/shop-damaged-package.levels.json')],
  [require('./scenarios/shop-collection-time.json'), require('./scenarios/shop-collection-time.levels.json')],
  [require('./scenarios/shop-shift-plan.json'), require('./scenarios/shop-shift-plan.levels.json')],
  [require('./scenarios/shop-reserve-item.json'), require('./scenarios/shop-reserve-item.levels.json')],
  [require('./scenarios/shop-opening-time.json'), require('./scenarios/shop-opening-time.levels.json')],
  [require('./scenarios/shop-quantity.json'), require('./scenarios/shop-quantity.levels.json')],
  [require('./scenarios/shop-color.json'), require('./scenarios/shop-color.levels.json')],
  [require('./scenarios/shop-bag-request.json'), require('./scenarios/shop-bag-request.levels.json')],
  [require('./scenarios/shop-new-colleague.json'), require('./scenarios/shop-new-colleague.levels.json')],
  [require('./scenarios/cleaning-scope.json'), require('./scenarios/cleaning-scope.levels.json')],
  [require('./scenarios/cleaning-handover.json'), require('./scenarios/cleaning-handover.levels.json')],
  [require('./scenarios/cleaning-client-complaint.json'), require('./scenarios/cleaning-client-complaint.levels.json')],
  [require('./scenarios/cleaning-extra-room.json'), require('./scenarios/cleaning-extra-room.levels.json')],
  [require('./scenarios/cleaning-feedback-spot.json'), require('./scenarios/cleaning-feedback-spot.levels.json')],
  [require('./scenarios/cleaning-forgotten-item.json'), require('./scenarios/cleaning-forgotten-item.levels.json')],
  [require('./scenarios/cleaning-unmarked-bottle.json'), require('./scenarios/cleaning-unmarked-bottle.levels.json')],
  [require('./scenarios/cleaning-vacuum-report.json'), require('./scenarios/cleaning-vacuum-report.levels.json')],
  [require('./scenarios/cleaning-shift-swap.json'), require('./scenarios/cleaning-shift-swap.levels.json')],
  [require('./scenarios/cleaning-meeting-room.json'), require('./scenarios/cleaning-meeting-room.levels.json')],
  [require('./scenarios/cleaning-floor-order.json'), require('./scenarios/cleaning-floor-order.levels.json')],
  [require('./scenarios/cleaning-start-time.json'), require('./scenarios/cleaning-start-time.levels.json')],
  [require('./scenarios/cleaning-count-cloths.json'), require('./scenarios/cleaning-count-cloths.levels.json')],
  [require('./scenarios/cleaning-room-number.json'), require('./scenarios/cleaning-room-number.levels.json')],
  [require('./scenarios/cleaning-cupboard.json'), require('./scenarios/cleaning-cupboard.levels.json')],
  [require('./scenarios/cleaning-new-team.json'), require('./scenarios/cleaning-new-team.levels.json')],
  [require('./scenarios/care-activity-cancelled.json'), require('./scenarios/care-activity-cancelled.levels.json')],
  [require('./scenarios/care-support-handover.json'), require('./scenarios/care-support-handover.levels.json')],
  [require('./scenarios/care-choice-respect.json'), require('./scenarios/care-choice-respect.levels.json')],
  [require('./scenarios/care-family-update.json'), require('./scenarios/care-family-update.levels.json')],
  [require('./scenarios/care-light-request.json'), require('./scenarios/care-light-request.levels.json')],
  [require('./scenarios/care-appointment-note.json'), require('./scenarios/care-appointment-note.levels.json')],
  [require('./scenarios/care-message-repeat.json'), require('./scenarios/care-message-repeat.levels.json')],
  [require('./scenarios/care-missing-belonging.json'), require('./scenarios/care-missing-belonging.levels.json')],
  [require('./scenarios/care-room-preference.json'), require('./scenarios/care-room-preference.levels.json')],
  [require('./scenarios/care-visitor-time.json'), require('./scenarios/care-visitor-time.levels.json')],
  [require('./scenarios/care-activity-choice.json'), require('./scenarios/care-activity-choice.levels.json')],
  [require('./scenarios/care-phone-call.json'), require('./scenarios/care-phone-call.levels.json')],
  [require('./scenarios/care-common-room.json'), require('./scenarios/care-common-room.levels.json')],
  [require('./scenarios/care-blanket.json'), require('./scenarios/care-blanket.levels.json')],
  [require('./scenarios/care-reading-glasses.json'), require('./scenarios/care-reading-glasses.levels.json')],
  [require('./scenarios/care-new-colleague.json'), require('./scenarios/care-new-colleague.levels.json')],
  [require('./scenarios/site-extra-request.json'), require('./scenarios/site-extra-request.levels.json')],
  [require('./scenarios/site-two-crews.json'), require('./scenarios/site-two-crews.levels.json')],
  [require('./scenarios/site-handover-incomplete.json'), require('./scenarios/site-handover-incomplete.levels.json')],
  [require('./scenarios/site-weather-update.json'), require('./scenarios/site-weather-update.levels.json')],
  [require('./scenarios/site-access-card.json'), require('./scenarios/site-access-card.levels.json')],
  [require('./scenarios/site-damaged-tool.json'), require('./scenarios/site-damaged-tool.levels.json')],
  [require('./scenarios/site-wrong-material.json'), require('./scenarios/site-wrong-material.levels.json')],
  [require('./scenarios/site-drawing-version.json'), require('./scenarios/site-drawing-version.levels.json')],
  [require('./scenarios/site-meeting-reschedule.json'), require('./scenarios/site-meeting-reschedule.levels.json')],
  [require('./scenarios/site-work-order.json'), require('./scenarios/site-work-order.levels.json')],
  [require('./scenarios/site-delivery-arrival.json'), require('./scenarios/site-delivery-arrival.levels.json')],
  [require('./scenarios/site-start-time.json'), require('./scenarios/site-start-time.levels.json')],
  [require('./scenarios/site-clothing-size.json'), require('./scenarios/site-clothing-size.levels.json')],
  [require('./scenarios/site-marked-box.json'), require('./scenarios/site-marked-box.levels.json')],
  [require('./scenarios/site-storage-location.json'), require('./scenarios/site-storage-location.levels.json')],
  [require('./scenarios/site-new-colleague.json'), require('./scenarios/site-new-colleague.levels.json')],
  [require('./scenarios/general-service-followup.json'), require('./scenarios/general-service-followup.levels.json')],
  [require('./scenarios/general-event-change.json'), require('./scenarios/general-event-change.levels.json')],
  [require('./scenarios/general-building-work.json'), require('./scenarios/general-building-work.levels.json')],
  [require('./scenarios/general-subscription.json'), require('./scenarios/general-subscription.levels.json')],
  [require('./scenarios/general-missed-visit.json'), require('./scenarios/general-missed-visit.levels.json')],
  [require('./scenarios/general-wrong-drink.json'), require('./scenarios/general-wrong-drink.levels.json')],
  [require('./scenarios/general-home-repair.json'), require('./scenarios/general-home-repair.levels.json')],
  [require('./scenarios/general-wrong-parcel.json'), require('./scenarios/general-wrong-parcel.levels.json')],
  [require('./scenarios/general-weather-plan.json'), require('./scenarios/general-weather-plan.levels.json')],
  [require('./scenarios/general-laundry-time.json'), require('./scenarios/general-laundry-time.levels.json')],
  [require('./scenarios/general-coffee-invite.json'), require('./scenarios/general-coffee-invite.levels.json')],
  [require('./scenarios/general-gym-visit.json'), require('./scenarios/general-gym-visit.levels.json')],
  [require('./scenarios/general-phone-number.json'), require('./scenarios/general-phone-number.levels.json')],
  [require('./scenarios/general-toilet.json'), require('./scenarios/general-toilet.levels.json')],
  [require('./scenarios/general-library-card.json'), require('./scenarios/general-library-card.levels.json')],
  [require('./scenarios/general-introduction.json'), require('./scenarios/general-introduction.levels.json')],
  [require('./scenarios/office-workload.json'), require('./scenarios/office-workload.levels.json')],
  [require('./scenarios/office-status-report.json'), require('./scenarios/office-status-report.levels.json')],
  [require('./scenarios/office-scope-change.json'), require('./scenarios/office-scope-change.levels.json')],
  [require('./scenarios/office-conflicting-feedback.json'), require('./scenarios/office-conflicting-feedback.levels.json')],
  [require('./scenarios/office-deadline-risk.json'), require('./scenarios/office-deadline-risk.levels.json')],
  [require('./scenarios/office-task-question.json'), require('./scenarios/office-task-question.levels.json')],
  [require('./scenarios/office-wrong-attachment.json'), require('./scenarios/office-wrong-attachment.levels.json')],
  [require('./scenarios/office-printer.json'), require('./scenarios/office-printer.levels.json')],
  [require('./scenarios/office-training-time.json'), require('./scenarios/office-training-time.levels.json')],
  [require('./scenarios/office-online-call.json'), require('./scenarios/office-online-call.levels.json')],
  [require('./scenarios/office-room-booking.json'), require('./scenarios/office-room-booking.levels.json')],
  [require('./scenarios/office-lunch.json'), require('./scenarios/office-lunch.levels.json')],
  [require('./scenarios/office-name-check.json'), require('./scenarios/office-name-check.levels.json')],
  [require('./scenarios/office-contact.json'), require('./scenarios/office-contact.levels.json')],
  [require('./scenarios/office-desk.json'), require('./scenarios/office-desk.levels.json')],
  [require('./scenarios/office-introduction.json'), require('./scenarios/office-introduction.levels.json')],
  [require('./scenarios/hotel-service-recovery.json'), require('./scenarios/hotel-service-recovery.levels.json')],
  [require('./scenarios/hotel-shift-notes.json'), require('./scenarios/hotel-shift-notes.levels.json')],
  [require('./scenarios/hotel-group-arrival.json'), require('./scenarios/hotel-group-arrival.levels.json')],
  [require('./scenarios/hotel-food-information.json'), require('./scenarios/hotel-food-information.levels.json')],
  [require('./scenarios/hotel-bill-question.json'), require('./scenarios/hotel-bill-question.levels.json')],
  [require('./scenarios/hotel-lamp-report.json'), require('./scenarios/hotel-lamp-report.levels.json')],
  [require('./scenarios/hotel-room-key.json'), require('./scenarios/hotel-room-key.levels.json')],
  [require('./scenarios/hotel-wrong-order.json'), require('./scenarios/hotel-wrong-order.levels.json')],
  [require('./scenarios/hotel-late-arrival.json'), require('./scenarios/hotel-late-arrival.levels.json')],
  [require('./scenarios/hotel-cleaning-time.json'), require('./scenarios/hotel-cleaning-time.levels.json')],
  [require('./scenarios/hotel-table-booking.json'), require('./scenarios/hotel-table-booking.levels.json')],
  [require('./scenarios/hotel-breakfast-time.json'), require('./scenarios/hotel-breakfast-time.levels.json')],
  [require('./scenarios/hotel-extra-cup.json'), require('./scenarios/hotel-extra-cup.levels.json')],
  [require('./scenarios/hotel-breakfast-place.json'), require('./scenarios/hotel-breakfast-place.levels.json')],
  [require('./scenarios/hotel-room-direction.json'), require('./scenarios/hotel-room-direction.levels.json')],
  [require('./scenarios/hotel-first-shift.json'), require('./scenarios/hotel-first-shift.levels.json')],
  [require('./scenarios/transport-shift-summary.json'), require('./scenarios/transport-shift-summary.levels.json')],
  [require('./scenarios/transport-disputed-delivery.json'), require('./scenarios/transport-disputed-delivery.levels.json')],
  [require('./scenarios/transport-load-priority.json'), require('./scenarios/transport-load-priority.levels.json')],
  [require('./scenarios/transport-diversion-message.json'), require('./scenarios/transport-diversion-message.levels.json')],
  [require('./scenarios/transport-passenger-transfer.json'), require('./scenarios/transport-passenger-transfer.levels.json')],
  [require('./scenarios/transport-missing-label.json'), require('./scenarios/transport-missing-label.levels.json')],
  [require('./scenarios/transport-damaged-box.json'), require('./scenarios/transport-damaged-box.levels.json')],
  [require('./scenarios/transport-wrong-address.json'), require('./scenarios/transport-wrong-address.levels.json')],
  [require('./scenarios/transport-vehicle-handover.json'), require('./scenarios/transport-vehicle-handover.levels.json')],
  [require('./scenarios/transport-delivery-window.json'), require('./scenarios/transport-delivery-window.levels.json')],
  [require('./scenarios/transport-break-change.json'), require('./scenarios/transport-break-change.levels.json')],
  [require('./scenarios/transport-shift-time.json'), require('./scenarios/transport-shift-time.levels.json')],
  [require('./scenarios/transport-radio-check.json'), require('./scenarios/transport-radio-check.levels.json')],
  [require('./scenarios/transport-break-room.json'), require('./scenarios/transport-break-room.levels.json')],
  [require('./scenarios/transport-driver-card.json'), require('./scenarios/transport-driver-card.levels.json')],
  [require('./scenarios/transport-introduction.json'), require('./scenarios/transport-introduction.levels.json')],
  [require('./scenarios/family-parent-meeting.json'), require('./scenarios/family-parent-meeting.levels.json')],
  [require('./scenarios/family-spare-clothes.json'), require('./scenarios/family-spare-clothes.levels.json')],
  [require('./scenarios/family-pickup-delay.json'), require('./scenarios/family-pickup-delay.levels.json')],
  [require('./scenarios/study-group-roles.json'), require('./scenarios/study-group-roles.levels.json')],
  [require('./scenarios/study-assignment.json'), require('./scenarios/study-assignment.levels.json')],
  [require('./scenarios/study-library-book.json'), require('./scenarios/study-library-book.levels.json')],
  [require('./scenarios/shop-receipt.json'), require('./scenarios/shop-receipt.levels.json')],
  [require('./scenarios/shop-price-label.json'), require('./scenarios/shop-price-label.levels.json')],
  [require('./scenarios/shop-find-product.json'), require('./scenarios/shop-find-product.levels.json')],
  [require('./scenarios/cleaning-spill.json'), require('./scenarios/cleaning-spill.levels.json')],
  [require('./scenarios/cleaning-supplies.json'), require('./scenarios/cleaning-supplies.levels.json')],
  [require('./scenarios/cleaning-occupied-room.json'), require('./scenarios/cleaning-occupied-room.levels.json')],
  [require('./scenarios/care-room-air.json'), require('./scenarios/care-room-air.levels.json')],
  [require('./scenarios/care-water-request.json'), require('./scenarios/care-water-request.levels.json')],
  [require('./scenarios/care-visit-time.json'), require('./scenarios/care-visit-time.levels.json')],
  [require('./scenarios/site-delivery-count.json'), require('./scenarios/site-delivery-count.levels.json')],
  [require('./scenarios/site-instructions.json'), require('./scenarios/site-instructions.levels.json')],
  [require('./scenarios/site-tool-missing.json'), require('./scenarios/site-tool-missing.levels.json')],
  [require('./scenarios/general-hair-appointment.json'), require('./scenarios/general-hair-appointment.levels.json')],
  [require('./scenarios/general-neighbor-noise.json'), require('./scenarios/general-neighbor-noise.levels.json')],
  [require('./scenarios/general-parcel.json'), require('./scenarios/general-parcel.levels.json')],
  [require('./scenarios/office-handover.json'), require('./scenarios/office-handover.levels.json')],
  [require('./scenarios/office-file-access.json'), require('./scenarios/office-file-access.levels.json')],
  [require('./scenarios/office-meeting-time.json'), require('./scenarios/office-meeting-time.levels.json')],
  [require('./scenarios/hotel-luggage.json'), require('./scenarios/hotel-luggage.levels.json')],
  [require('./scenarios/hotel-room-noise.json'), require('./scenarios/hotel-room-noise.levels.json')],
  [require('./scenarios/hotel-towels.json'), require('./scenarios/hotel-towels.levels.json')],
  [require('./scenarios/bus-stop-question.json'), require('./scenarios/bus-stop-question.levels.json')],
  [require('./scenarios/bus-lost-bag.json'), require('./scenarios/bus-lost-bag.levels.json')],
  [require('./scenarios/bus-ticket.json'), require('./scenarios/bus-ticket.levels.json')],
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
    language: variant.language, stage: publicScenario.stage || 1, interaction: { ...variant.interaction,
      support: variant.interaction.support + ' ' + getScenarioStage(publicScenario.stage).support },
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

