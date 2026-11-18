'use strict';
const {currentLanguages} = require('./languageContext');
const localCourses = require('./localTutorContent.cjs');
const tutors = {
  lesson: () => require('./chatTutor'),
  scenario: () => require('./scenarioTutor'),
  free: () => require('./freeConversationLevels'),
  voice: () => require('./voiceTutor'),
};
function published(language) {
  return language === 'nb' || localCourses.has(language);
}
function getTutor(feature) {
  if (!published(currentLanguages().learningLanguage) || !Object.hasOwn(tutors,feature)) {
    throw Object.assign(new Error('Conținutul AI pentru această limbă este în pregătire.'), {status:409, code:'LANGUAGE_CONTENT_UNAVAILABLE'});
  }
  return tutors[feature]();
}
function facade(feature) {
  return new Proxy({}, {get(_, name) {
    const value = getTutor(feature)[name];
    return typeof value === 'function' ? (...args) => getTutor(feature)[name](...args) : value;
  }});
}
function apiRoute(languages) {
  if (published(languages.learningLanguage))return null;
  throw Object.assign(new Error('Modulul AI pentru această combinație de limbi este în pregătire.'),{status:409,code:'LANGUAGE_CONTENT_UNAVAILABLE'});
}
module.exports = {getTutor, apiRoute, lesson:facade('lesson'), scenario:facade('scenario'), free:facade('free'), voice:facade('voice')};
