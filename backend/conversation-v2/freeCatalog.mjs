// Fresh V2 definitions only. No legacy memory, progress or user profiles.
import {learningLanguages,supportedPair,greetings,freeLocales} from './languages.mjs';
export const freeConversations = Object.keys(learningLanguages).flatMap(learningLanguage=>['A1','A2','B1','B2','C1','C2'].map(level=>({
 schemaVersion:2,id:`free-${learningLanguage==='nb'?'':learningLanguage+'-'}${level.toLowerCase()}`,familyId:'free',kind:'free',version:1,
 learningLanguage,level,maxTurns:30,states:['discussion'],initialState:'discussion',criteria:[],transitions:[],
 variants:[{id:'reference',opening:greetings[learningLanguage],facts:[]}],
 locales:Object.fromEntries(Object.entries(freeLocales).filter(([support])=>supportedPair(learningLanguage,support)).map(([support,[title,brief,learnerRole]])=>[support,{title,brief,learnerRole,partnerRole:'Nora',hint:brief,criteria:{}}])),
})));
