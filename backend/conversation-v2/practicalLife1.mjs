import {learningLanguages,supportLanguages,supportedPair} from './languages.mjs';
import {life1Tasks} from './practicalLife1Source.mjs';
import {life1Openings} from './practicalLife1Openings.mjs';
import {life1Locales,life1VariantTitles} from './practicalLife1Locales.mjs';
import {life2Tasks} from './practicalLife2Source.mjs';
import {life2Openings} from './practicalLife2Openings.mjs';
import {life2Locales} from './practicalLife2Locales.mjs';

// Life batches: new task identities with a reference variant and a complication.
export const limits={A1:10,A2:12,B1:16,B2:18,C1:22,C2:24};
// Prices follow the country of the course language.
const currencies={nb:'NOK',sv:'SEK',da:'DKK'};
const currencyNames={EUR:'euros',NOK:'Norwegian kroner',SEK:'Swedish kronor',DKK:'Danish kroner'};
export const courseCurrency=learningLanguage=>currencies[learningLanguage]||'EUR';
export const shortMoney=(amount,currency)=>currency==='EUR'?`${amount} €`:`${amount} kr`;
export function lifeMoney(task,learningLanguage){
 const currency=courseCurrency(learningLanguage);
 return key=>{const amount=task.prices?.[key]?.[currency];if(!Number.isFinite(amount))throw new Error(`Missing ${currency} price ${key} for ${task.id}`);return `${amount} ${currencyNames[currency]}`;};
}
// {{key}} in learner-facing text becomes a short local price.
export function lifeText(text,task,learningLanguage){
 const currency=courseCurrency(learningLanguage);
 return text.replace(/\{\{(\w+)\}\}/g,(_,key)=>{const amount=task.prices?.[key]?.[currency];if(!Number.isFinite(amount))throw new Error(`Missing ${currency} price ${key} for ${task.id}`);return shortMoney(amount,currency);});
}
// Keep Nora in the address form of her opening line.
const address={de:['Sie','du'],fr:['vous','tu'],nl:['u','je'],it:['Lei','tu'],es:['usted','tú'],pt:['the formal third person (o senhor/a senhora)','tu']};
export function lifeRegister(task,learningLanguage){
 const forms=address[learningLanguage];if(!forms)return '';
 return task.register==='formal'?` Address the learner formally with ${forms[0]} throughout.`:` Address the learner informally with ${forms[1]} throughout.`;
}
export function buildLifeBatch(tasks,openings,locales,variantTitles=life1VariantTitles){
 return Object.keys(learningLanguages).flatMap(learningLanguage=>tasks.map((task,index)=>{
  const money=lifeMoney(task,learningLanguage),register=lifeRegister(task,learningLanguage),opening=openings[learningLanguage][index];
  return {
   schemaVersion:2,id:`practice-${learningLanguage}-${task.id}`,familyId:`v2-${task.id}`,version:1,kind:'scenario',learningLanguage,level:task.level,
   maxTurns:limits[task.level],topics:task.topics,paths:task.paths,...(task.interaction?{interaction:task.interaction}:{}),
   states:['discussion','agreed'],initialState:'discussion',
   criteria:task.goals.map((meaning,n)=>({id:`goal-${n+1}`,meaning,requiresPartnerContext:n===2})),
   transitions:[{from:'discussion',to:'agreed',requires:['goal-1','goal-2','goal-3'],terminal:true}],
   variants:[
    {id:'reference',challenge:0,opening,facts:[{id:'constraints',audience:'partner',text:task.facts(money)+register}]},
    {id:'complication',challenge:1,opening,facts:[{id:'constraints',audience:'partner',text:task.complication(money)+register}]},
   ],
   locales:Object.fromEntries(Object.keys(supportLanguages).filter(support=>supportedPair(learningLanguage,support)).map(support=>{
    const [title,learnerRole,partnerRole,g1,g2,g3,rawBrief]=locales[support][index],brief=lifeText(rawBrief,task,learningLanguage);
    return [support,{title,learnerRole,partnerRole,brief,hint:brief,criteria:{'goal-1':g1,'goal-2':g2,'goal-3':g3},variantTitles:{complication:variantTitles[support]}}];
   })),
  };
 }));
}
export const life1Conversations=buildLifeBatch(life1Tasks,life1Openings,life1Locales);
export const life2Conversations=buildLifeBatch(life2Tasks,life2Openings,life2Locales);
