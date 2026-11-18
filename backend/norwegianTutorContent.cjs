const catalog=require('./voiceCatalog.json');
const localized = {...require('./norwegianTutorContent.json'), ...require('./additionalNorwegianTutorContent.json')};
const {currentLanguages}=require('./languageContext');
function tutorLesson(level, id, activityId) {
  if(require('./localTutorContent.cjs').active())return require('./localTutorContent.cjs').lesson(level,id,activityId);
 const support=currentLanguages().supportLanguage;
 return localized[support]?.lessons?.[level]?.[id] || (support==='ro'?catalog[level]?.[id]:null);
}
function helpText(text,values={},support=currentLanguages().supportLanguage){
 const translated=localized[support]?.messages?.[text] || text;
 return translated.replace(/\[\[([^\]]+)\]\]/g,(_,key)=>String(values[key]??''));
}
module.exports={tutorLesson,helpText};
