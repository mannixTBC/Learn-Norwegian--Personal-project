'use strict';
const catalog = require('./cartesiaVoiceCatalog.json');
const fail = (message, status) => Object.assign(new Error(message), {status});

function lessonVoiceSelection(language, role) {
  const course = typeof language === 'string' && Object.hasOwn(catalog.courses, language) && catalog.courses[language];
  if (!course || !['female', 'male'].includes(role)) throw fail('Limba sau vocea dialogului nu este validă.', 400);
  const selected = catalog.voices[course[role === 'female' ? 'lessonFemale' : 'lessonMale']];
  if (!selected?.languages.includes(language)) throw fail('Vocea dialogului nu este disponibilă.', 503);
  // Existing Norwegian overrides are scoped to Norwegian, never reused in other courses.
  const override = language === 'nb' && (role === 'female'
    ? process.env.CARTESIA_FEMALE_VOICE_ID || process.env.CARTESIA_VOICE_ID
    : process.env.CARTESIA_MALE_VOICE_ID);
  return {voiceId: override || selected.id, locale: course.locale};
}
module.exports = {lessonVoiceSelection};
