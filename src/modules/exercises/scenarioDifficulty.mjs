// Shared by the browser and Node 24 backend. This module has no private data.
const own = (value, key) => value && typeof key === 'string' && Object.hasOwn(value, key);
const text = value => typeof value === 'string' && value.trim().length > 0;
const strings = value => Array.isArray(value) && value.length > 0 && Array.from(value).every(text);

export function resolvePublicScenario(source, levels, level) {
  if (!source || !own(levels, level)) throw new Error('Invalid scenario or level');
  const { variants, ...base } = source;
  const generic = levels[level];
  if (!variants) {
    return {
      scenario: { ...base, goals: [...base.goals, ...(generic.goal ? [generic.goal] : [])] },
      difficulty: { ...generic, code: level, expectation: generic.goal || 'Replici scurte și clare. Contează să te faci înțeles.' },
    };
  }
  if (!own(variants, level)) throw new Error('Missing scenario level variant: ' + level);
  const variant = variants[level];
  if (!variant || !Number.isInteger(base.revision) || base.revision < 1
    || !Number.isInteger(variant.turns) || variant.turns < 4 || variant.turns > 10
    || !['label', 'expectation', 'brief', 'opening', 'hint'].every(key => text(variant[key]))
    || !strings(variant.goals) || !strings(variant.objectiveIds)
    || variant.goals.length !== variant.objectiveIds.length
    || new Set(variant.objectiveIds).size !== variant.objectiveIds.length) {
    throw new Error('Invalid scenario level variant: ' + level);
  }
  return {
    scenario: {
      ...base, level, brief: variant.brief, opening: variant.opening, hint: variant.hint,
      goals: [...variant.goals], objectiveIds: [...variant.objectiveIds],
    },
    // Do not carry generic instructions or extra goals into a tailored variant.
    difficulty: { code: level, label: variant.label, turns: variant.turns, expectation: variant.expectation },
  };
}

