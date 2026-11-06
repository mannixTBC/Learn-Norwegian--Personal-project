'use strict';
const {currentLanguages, pairId} = require('./languageContext');
// Publication requires an authored adapter for every enabled mode. Provider
// language support by itself is never enough to publish a new course.
const packs = {
  'nb:ro': {
    lesson: () => require('./chatTutor'),
    scenario: () => require('./scenarioTutor'),
    free: () => require('./freeConversationLevels'),
    voice: () => require('./voiceTutor'),
  },
};
function getTutor(feature) {
  const load = packs[pairId(currentLanguages())]?.[feature];
  if (!load) throw Object.assign(new Error('Conținutul AI pentru această limbă este în pregătire.'), {status:409, code:'LANGUAGE_CONTENT_UNAVAILABLE'});
  return load();
}
function facade(feature) {
  return new Proxy({}, {get(_, name) {
    const value = getTutor(feature)[name];
    return typeof value === 'function' ? (...args) => getTutor(feature)[name](...args) : value;
  }});
}
function apiRoute(languages, mount) {
  if(pairId(languages)==='nb:ro')return null;
  const load=packs[pairId(languages)]?.api?.[mount];
  if(!load)throw Object.assign(new Error('Modulul AI pentru această combinație de limbi este în pregătire.'),{status:409,code:'LANGUAGE_CONTENT_UNAVAILABLE'});
  return load();
}
module.exports = {getTutor, apiRoute, lesson:facade('lesson'), scenario:facade('scenario'), free:facade('free'), voice:facade('voice')};
