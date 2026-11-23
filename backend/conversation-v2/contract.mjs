// Server-side authoring contract. Mobile consumers receive publicScenario only.
import {learningLanguages,supportedPair} from './languages.mjs';
export class ConversationError extends Error {
  constructor(code) { super(code); this.name = 'ConversationError'; this.code = code; }
}
export const check = (condition, code = 'INVALID_CONTRACT') => { if (!condition) throw new ConversationError(code); };
export const text = (value, max = 2000) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const id = value => typeof value === 'string' && /^[a-z][a-z0-9-]{0,79}$/.test(value);
const unique = values => new Set(values).size === values.length;
const list = value => Array.isArray(value) && value.length > 0;

export function validateScenario(s) {
  const free=s?.kind==='free';
  check(s?.kind===undefined || ['free','scenario'].includes(s.kind));
  check(s?.schemaVersion === 2 && id(s.id) && id(s.familyId));
  check(Number.isSafeInteger(s.version) && s.version > 0 && Object.hasOwn(learningLanguages,s.learningLanguage));
  check(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(s.level));
  check(s.interaction === undefined || (!free && ['service', 'reversed', 'interview'].includes(s.interaction)));
  check(Number.isSafeInteger(s.maxTurns) && s.maxTurns >= 3 && s.maxTurns <= 30);
  check((free?Array.isArray(s.criteria)&&s.criteria.length===0:list(s.criteria)) && s.criteria.length <= 12 && unique(s.criteria.map(c => c.id)));
  for (const c of s.criteria) check(id(c.id) && text(c.meaning) && typeof c.requiresPartnerContext === 'boolean');
  check(list(s.states) && unique(s.states) && s.states.every(id) && s.states.includes(s.initialState));
  check(free?Array.isArray(s.transitions)&&s.transitions.length===0:list(s.transitions));
  for (const t of s.transitions) {
    check(s.states.includes(t.from) && s.states.includes(t.to) && typeof t.terminal === 'boolean');
    check(list(t.requires) && unique(t.requires) && t.requires.every(key => s.criteria.some(c => c.id === key)));
    // Completion always needs all criteria, not a model-supplied success flag.
    if (t.terminal) check(s.criteria.every(c => t.requires.includes(c.id)));
  }
  check(free || s.transitions.some(t => t.terminal));
  check(list(s.variants) && unique(s.variants.map(v => v.id)));
  for (const v of s.variants) {
    check(id(v.id) && text(v.opening) && (free?Array.isArray(v.facts):list(v.facts)));
    // Optional alternatives to the opening line; one is chosen per session.
    check(v.openings === undefined || (list(v.openings) && v.openings.every(o => text(o))));
    check(unique(v.facts.map(f => f.id)));
    for (const f of v.facts) check(id(f.id) && text(f.text) && ['shared', 'partner'].includes(f.audience));
  }
  check(s.locales && Object.keys(s.locales).length > 0);
  for (const [language, locale] of Object.entries(s.locales)) {
    check(supportedPair(s.learningLanguage,language) && ['title', 'brief', 'learnerRole', 'partnerRole', 'hint'].every(k => text(locale[k])));
    check(locale.criteria && Object.keys(locale.criteria).length === s.criteria.length);
    check(s.criteria.every(c => text(locale.criteria[c.id])));
  }
  return s;
}

// Allowlist: future authoring fields cannot accidentally leak to the phone.
export function publicScenario(s, supportLanguage,variantId=s.variants[0].id) {
  validateScenario(s);
  const locale = s.locales[supportLanguage];
  check(locale, 'UNSUPPORTED_LANGUAGE_PAIR');
  const variant=s.variants.find(v=>v.id===variantId);check(variant,'UNKNOWN_VARIANT');
  return structuredClone({schemaVersion: 2, id: s.id, familyId: s.familyId, version: s.version,
    kind:s.kind||'scenario',
    learningLanguage: s.learningLanguage, supportLanguage, level: s.level, defaultVariantId: variant.id,
    maxTurns:s.maxTurns,estimatedMinutes:Math.max(3,Math.ceil(s.maxTurns*.45)),
    topics:s.topics||[],paths:s.paths||[],artworkId:s.artworkId,challenge:variant.challenge||0,
    title: locale.title+(locale.variantTitles?.[variant.id]?' · '+locale.variantTitles[variant.id]:''), brief: locale.brief, learnerRole: locale.learnerRole, partnerRole: locale.partnerRole,
    criteria: s.criteria.map(c => ({id: c.id, label: locale.criteria[c.id]}))});
}
