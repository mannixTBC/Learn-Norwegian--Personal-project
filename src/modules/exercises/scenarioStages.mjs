// Shared stage metadata. CEFR rules and explicit scenario objectives remain authoritative.
export const SCENARIO_STAGES = Object.freeze([
  Object.freeze({ id: 1, label: 'Introducere', support: 'Offer concrete guidance and short prompts within the selected CEFR level. Help when asked; do not add unstated objectives.' }),
  Object.freeze({ id: 2, label: 'Consolidare', support: 'Encourage recall and offer a concrete hint when needed. Stay within the selected CEFR level and the explicit objectives.' }),
  Object.freeze({ id: 3, label: 'Aplicare', support: 'Invite the learner to propose the next step, while providing help when asked. Do not introduce complications beyond the selected CEFR level.' }),
  Object.freeze({ id: 4, label: 'Autonomie', support: 'Allow more learner initiative while keeping help available. Respect the selected CEFR level; do not require rare vocabulary or hidden objectives.' }),
]);

export function getScenarioStage(stage = 1) {
  return SCENARIO_STAGES.find(item => item.id === stage) || SCENARIO_STAGES[0];
}

export function stageFromLearning(completedCount, finalTestPassed = false) {
  if (finalTestPassed === true) return 4;
  const count = Number.isFinite(completedCount) ? Math.max(0, Math.floor(completedCount)) : 0;
  return Math.min(4, 1 + Math.floor(count / 6));
}
