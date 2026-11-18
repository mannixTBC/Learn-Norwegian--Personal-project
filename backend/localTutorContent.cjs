'use strict';
const {currentLanguages}=require('./languageContext');
const phrases=require('./localTutorPhrases.json');
const sources={
  da:()=>require('./localCourse-da.json'), de:()=>require('./localCourse-de.json'), en:()=>require('./localCourse-en.json'),
  es:()=>require('./localCourse-es.json'), fr:()=>require('./localCourse-fr.json'), it:()=>require('./localCourse-it.json'),
  nl:()=>require('./localCourse-nl.json'), pt:()=>require('./localCourse-pt.json'), sv:()=>require('./localCourse-sv.json'),
};
const has=language=>Object.hasOwn(sources,language);
const course=language=>has(language)?sources[language]():null;
const active=()=>has(currentLanguages().learningLanguage);
const phrase=text=>phrases[text][currentLanguages().learningLanguage];
const meaning=text=>phrases[text][currentLanguages().supportLanguage];

function lesson(level,id,activityId){
  const {learningLanguage,supportLanguage:s}=currentLanguages();
  const data=course(learningLanguage)?.levels[level];
  if(!Number.isInteger(id)||id<1||!data?.lessons)return null;
  const raw=data.lessons[id-1];
  if(!raw)return null;
  const section=data.sections.find(item=>item.id===raw.sectionId);
  const alternate=s!=='ro'&&raw.alternate;
  const question=alternate||raw.question, translation=(alternate?raw.alternateTranslations:raw.translated)[s];
  const vocabulary=raw.forms.map(form=>[form.model,learningLanguage===s?form.model:form.meaning[s]]);
  const prompts=[[question,translation],...['Could you give an example?','What would you say next?'].map(text=>[phrase(text),meaning(text)])];
  const direction={title:section.title[s],phrases:vocabulary,scenario:question};
  const directions=Object.fromEntries(['general','transport','hospitality','construction','healthcare','cleaning','retail','office','studies','family'].map(key=>[key,direction]));
  if(activityId&&activityId!==raw.uid){
    const mission=data.sections.find(item=>item.mission===activityId&&item.goals.includes(raw.uid));
    if(!mission)return null;
    const opening=(s!=='ro'&&mission.alternate)||mission.opening;
    return {uid:activityId,title:mission.missionTitle[s],sectionTitle:mission.title[s],objectives:[opening],
      vocabulary:[],conversationPrompts:[[opening,mission.missionTitle[s]]],dialogue:[['Nora',opening,mission.missionTitle[s]]],
      grammar:{title:'',rule:''},production:{speakingPrompt:opening,criteria:[]},directions};
  }
  return {uid:raw.uid,title:raw.title[s],sectionTitle:section.title[s],objectives:raw.forms.map(form=>form.rule[s]),
    vocabulary,conversationPrompts:prompts,dialogue:[['Nora',question,translation],['Alex',...vocabulary[0]]],
    grammar:{title:raw.forms[0].rule[s],rule:raw.forms[0].note[s]},production:{speakingPrompt:translation,criteria:[]},directions};
}
function openingFor(level){
  const first=lesson(level,1);
  if(!first)throw Object.assign(new Error('Nivel invalid.'),{status:400});
  const [[reply,translation]]=first.conversationPrompts;
  return {reply,translation,hint:first.grammar.rule,examples:[{answer:first.vocabulary[0][0],translation:first.vocabulary[0][1]}],correction:null,simplified:false};
}
function scenarioContext(id,level){
  const {learningLanguage,supportLanguage:s}=currentLanguages();
  const data=course(learningLanguage)?.levels[level];
  const section=data?.sections?.find(item=>item.mission===id||item.id===id);
  if(!section)throw Object.assign(new Error('Scenariu sau nivel invalid.'),{status:400});
  const goals=section.goals.map(uid=>data.lessons.find(item=>item.uid===uid).forms[0].rule[s]);
  return {scenario:{id,title:section.title[s],opening:(s!=='ro'&&section.alternate)||section.opening,goals},difficulty:{level,turns:8}};
}
module.exports={has,active,course,phrase,lesson,openingFor,scenarioContext};
