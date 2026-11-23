import {learningLanguages,supportLanguages,supportedPair} from './languages.mjs';
import {batch60Tasks} from './practicalBatch60Source.mjs';
import {batch60Locales,batch60Openings} from './practicalBatch60Locales.mjs';

// New task identities, not variations or replacements of existing sessions.
const limits={A1:10,A2:12,B1:16,B2:18,C1:22,C2:24};
export const batch60Conversations=Object.keys(learningLanguages).flatMap(learningLanguage=>batch60Tasks.map((task,index)=>({
 schemaVersion:2,id:`practice-${learningLanguage}-${task.id}`,familyId:`v2-${task.id}`,version:1,kind:'scenario',learningLanguage,level:task.level,
 maxTurns:limits[task.level],topics:task.topics,paths:task.paths,
 states:['discussion','agreed'],initialState:'discussion',
 criteria:task.goals.map((meaning,n)=>({id:`goal-${n+1}`,meaning,requiresPartnerContext:n===2})),
 transitions:[{from:'discussion',to:'agreed',requires:['goal-1','goal-2','goal-3'],terminal:true}],
 variants:[{id:'reference',challenge:0,opening:batch60Openings[learningLanguage][index],facts:[{id:'constraints',audience:'partner',text:task.facts}]}],
 locales:Object.fromEntries(Object.keys(supportLanguages).filter(support=>supportedPair(learningLanguage,support)).map(support=>{
  const [title,learnerRole,partnerRole,...goals]=batch60Locales[support][index];const brief=goals.join(' ');
  return [support,{title,learnerRole,partnerRole,brief,hint:brief,criteria:Object.fromEntries(goals.map((label,n)=>[`goal-${n+1}`,label]))}];
 })),
})));
