import {practicalConversations as previous} from './practicalCatalog20261118.mjs';
import {editorial} from './practicalEditorial.mjs';
import {expandedPracticalConversations} from './practicalExpansion.mjs';
import {batch60Conversations} from './practicalBatch60.mjs';
import {life1Conversations,life2Conversations} from './practicalLife1.mjs';
import {reviseScenario} from './practicalRevision.mjs';
import {reviseAgain} from './practicalComplications.mjs';
const levels=['A1','A2','B1','B2','C1','C2'];
const topics=['travel','appointments','travel','work','community','argumentation'];
const paths=[['transport','studies'],['office','studies','family'],['hospitality','family'],['office'],['studies','family'],['office','studies']];
const alternatives=[
 [
  'One single ticket to the city centre for today costs 4 euros. Initially ask whether the learner wants a return ticket; after clarification offer the correct single ticket. Accept short beginner phrases. Never mark a return ticket as the requested single ticket.',
  'One single ticket to the city centre for today costs 3 euros. Initially repeat the quantity as two tickets and ask for confirmation. When corrected, offer one ticket and ask for confirmation. Do not repeat the misunderstanding after the learner corrects it.',
 ],[
  'The original meeting is Tuesday. Available alternatives: Wednesday at 09:00 or Thursday at 16:00. Offer only these slots. Do not introduce a third day.',
  'The original meeting is Tuesday. Available alternatives: Wednesday at 11:00 or Thursday at 15:00. Ask which part of the week suits the learner, then offer these slots. Do not add a new objective.',
 ],[
  'The museum costs 75 euros for two including transport. The nature park costs 65 euros for two including transport. Both are open and reachable today. Weather is unknown. Invite a comparison before agreeing.',
  'The museum costs 50 euros for two including transport. The nature park costs 70 euros for two including transport. Both are open and reachable today. Weather is unknown. Do not assume the cheaper choice is automatically better.',
 ],[
  'The manager can approve a four-week trial of two remote days weekly. Tuesday meetings require attendance. Initially prefer Monday and Wednesday for predictability, but negotiate other days except Tuesday if coordination is addressed. No permanent change is approved.',
  'The manager can approve a four-week trial of two remote days weekly. Tuesday meetings require attendance. Initially prefer flexible days notified at the start of each week. Accept fixed days if justified and coordinated. No permanent change is approved.',
 ],[
  'Quiet study and community access are both responsibilities. A quiet zone plus scheduled activities can be trialled for six weeks. Initially raise the concern that daytime-only activities exclude working visitors. Seek a reversible arrangement and feedback from both groups. No statistics or budget figures are available.',
  'Quiet study and community access are both responsibilities. A quiet zone plus scheduled activities can be trialled for two weeks. Initially raise the concern that scheduled activities could make quiet study unreliable. Seek a reversible arrangement and feedback from both groups. No statistics or budget figures are available.',
 ],[
  'The only verified statement is: We may revise access arrangements after consultation. One group interprets this as a promised restriction; another as a promised expansion. Neither is confirmed. Initially present the restriction interpretation as a concern, not a fact; accept a fair reformulation. Consultation has not happened and no decision or intent is known.',
  'The only verified statement is: We may revise access arrangements after consultation. One group interprets this as a promised restriction; another as a promised expansion. Neither is confirmed. Initially present the expansion interpretation as a hope, not a fact; accept a fair reformulation. Consultation has not happened and no decision or intent is known.',
 ],
];
const earlierConversations=[...previous.map(base=>{
 const i=levels.indexOf(base.level);
 return {...base,version:2,topics:[topics[i]],paths:paths[i],artworkId:['bus-ticket','general-hair-appointment','transport-introduction','general-introduction','general-introduction','general-introduction'][i],
  variants:[base.variants[0],...alternatives[i].map((text,n)=>({id:n===0?'alternative':'clarification',opening:base.variants[0].opening,facts:[{id:'constraints',audience:'partner',text}]}))].map((v,n)=>({...v,challenge:n})),
  locales:Object.fromEntries(Object.entries(base.locales).map(([language,locale])=>{
   const e=editorial[language];return [language,{...locale,learnerRole:e.roles[i][0],partnerRole:e.roles[i][1],
    criteria:Object.fromEntries(e.goals[i].map((label,n)=>['goal-'+(n+1),label])),
    variantTitles:Object.fromEntries(['reference','alternative','clarification'].map((id,n)=>[id,e.variants[n]]))}];
  }))};
}),...expandedPracticalConversations,...batch60Conversations];
// The revised catalogue is current; earlier versions stay resolvable for sessions in progress.
const firstRevision=[...earlierConversations.map(reviseScenario),...life1Conversations,...life2Conversations];
export const practicalConversations=firstRevision.map(reviseAgain);
export const previousPracticalConversations=[...previous,...earlierConversations,...firstRevision.filter(s=>!practicalConversations.includes(s))];
