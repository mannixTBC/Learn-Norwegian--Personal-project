// Final level evaluation as a dialogue: one scenario per course and level (A1–C2).
// It replaces the written final test. levelCheck keeps it out of the practical
// library; the app opens it from the level's final test card.
// Each level is one connected situation whose goals cover the level's sections.
// goals are evaluator rubrics; learner-facing text lives in levelChecksText.mjs.
// partner: indexes of goals that accept a concrete proposal from Nora (the
// evaluator's requiresPartnerContext); questions, replies to objections and
// learner proposals stay off it, or correct answers could be refused.
import {learningLanguages,supportLanguages,supportedPair} from './languages.mjs';
import {lifeMoney} from './practicalLife1.mjs';
import {levelOpenings,levelLocales} from './levelChecksText.mjs';

const pace=level=>({
 A1:'Use only short, simple A1 sentences.',A2:'Use clear, simple A2 sentences.',B1:'Use natural B1 language: connected sentences and everyday vocabulary.',
 B2:'Use formal, precise B2 language.',C1:'Use formal, nuanced C1 language, with implicit meaning where natural.',C2:'Use precise, idiomatic C2 language; irony and implication are allowed.',
}[level]+' Ask one question at a time. Accept small mistakes when the meaning is clear. If the learner seems stuck, rephrase once, then move on to the next topic.');
// Nora keeps the address form of her opening line (pt is the Brazilian course).
const address={de:['Sie','du'],fr:['vous','tu'],nl:['u','je'],it:['Lei','tu'],es:['usted','tú'],pt:['o senhor/a senhora','você']};
const register=(task,language)=>{const forms=address[language];return forms?` Address the learner ${task.register==='formal'?'formally':'informally'} with ${forms[task.register==='formal'?0:1]} throughout.`:'';};

export const levelCheckTasks=[
 {level:'A1',maxTurns:18,register:'informal',topics:['community'],paths:['studies'],partner:[5],
  prices:{coffee:{EUR:3,NOK:40,SEK:40,DKK:30},tea:{EUR:3,NOK:35,SEK:35,DKK:25},sandwich:{EUR:6,NOK:60,SEK:65,DKK:45}},
  goals:[
   'Introduce yourself: your name and where you come from or where you live.',
   'Say something about your family or your home.',
   'Describe your day or your free time with at least one time or day.',
   'Order something at the café, or ask what something costs.',
   'Ask how to get to a place, or repeat directions Nora gives to confirm them.',
   'Agree with Nora on a day and time to meet again.',
  ],
  facts:m=>`You are Nora, a friendly new neighbour. You meet the learner in the café on the ground floor of your building; the waiter is busy, so you take the order for both of you at the counter (coffee ${m('coffee')}, tea ${m('tea')}, a sandwich ${m('sandwich')}). This is the learner's final A1 evaluation. Lead the conversation naturally through these topics, one at a time and in this order: names and where you come from; family or home; what the learner does during the day or in their free time; ordering at the café; how to get to the library (it is in the centre: bus number two, then left at the school); and meeting again (you are free on Saturday at eleven or on Sunday at four).`},
 {level:'A2',maxTurns:20,register:'informal',topics:['work'],paths:['office'],partner:[4,5],
  prices:{ticket:{EUR:25,NOK:300,SEK:300,DKK:200}},
  goals:[
   'Tell Nora what you did last weekend, using past tenses.',
   'Describe a problem with your home or with something you bought, and say what you will do.',
   'Ask about an unclear step in the task Nora gives you and confirm you understood.',
   'Explain that you have a doctor\'s appointment on Thursday and agree when you leave.',
   'Compare the two options for Saturday and choose one, with a reason.',
   'Agree on the time and meeting place for Saturday.',
  ],
  facts:m=>`You are Nora, the learner's friendly colleague, on a coffee break at work. This is the learner's final A2 evaluation. Lead naturally through these topics, one at a time and in this order: (1) ask what the learner did last weekend; (2) ask how their new flat is going; the learner's washing machine does not work, so help them decide what to do (call the landlord or the shop); (3) give a small task: send the weekly report to the manager by Thursday. Say quickly "save it in the shared folder first" without naming the folder, so the learner has a reason to ask; the folder is called "Reports"; (4) ask whether they can come to the team meeting on Thursday at 14:00; the learner has a doctor's appointment then: accept that they leave at 13:30 if they send the report first; (5) offer two options for Saturday: a concert in the park at 19:00 (ticket ${m('ticket')}) or a free walk by the lake at 14:00; ask which they prefer and why; (6) agree on a time and meeting place for the chosen option (the main entrance of the park, or the bus stop by the lake).`},
 {level:'B1',maxTurns:22,register:'informal',topics:['community'],paths:['studies','family'],partner:[1,5],
  goals:[
   'Tell Nora about a recent trip where the plan changed, linking the events clearly.',
   'Give an opinion on the two options for the conversation café and accept a compromise, with a reason.',
   'Propose a clear solution to the problem from last time.',
   'Describe your strengths and what you want to learn as a volunteer.',
   'Check an unclear piece of information by asking a question.',
   'Agree on the next steps: who does what, and by when.',
  ],
  facts:()=>`You are Nora, coordinator of the Linden community centre, meeting a new volunteer for the conversation café. This is the learner's final B1 evaluation. Lead naturally through these topics, one at a time and in this order: (1) ask about the trip the learner has just come back from; show interest in what changed and why; (2) the café meets every other Wednesday at 18:00 in room 2. Offer two options for next season: Tuesdays at 18:00 in the library (more space, but it closes at 20:00) or Thursdays at 17:00 in room 2 (smaller, free coffee). You slightly prefer Thursday; ask the learner's opinion and be open to a compromise; (3) explain last time's problem: room 2 was double-booked and twenty people waited in the corridor; ask what the learner would do so that it does not happen again; (4) ask what the learner is good at and what they want to learn as a volunteer; (5) mention quickly and vaguely that "volunteers have a short meeting first"; only when asked, say it is on Monday at 17:00 in the office and takes about thirty minutes; (6) agree on next steps: someone must make a poster by Friday and someone must confirm the room booking with reception.`},
 {level:'B2',maxTurns:24,register:'formal',topics:['community','argumentation'],paths:['studies','office'],partner:[4,5],
  goals:[
   'Present the proposal and support it with at least two arguments.',
   'Separate what the available survey data shows from what it does not show.',
   'Respond to Nora\'s objection with a counter-argument or a concession.',
   'Take into account the perspective of another affected group.',
   'Negotiate the conditions of a trial period.',
   'Summarise the agreement, including how it will be evaluated.',
  ],
  facts:()=>`You are Nora, director of the municipal library. A representative of a user group proposes longer evening opening hours. This is the learner's final B2 evaluation. Facts: the library closes at 18:00 on weekdays. A user survey had 312 responses; 58% want longer evening hours, but most respondents were students and few were older users, so it is not representative. Longer hours need two staff members on extra shifts. The budget allows at most an eight-week trial of two evenings a week until 21:00. You are initially sceptical because of the cost and because regular quiet users might lose their calm evenings; raise at least one strong objection. If the learner overstates what the survey shows, question it politely. Accept a trial only with clear evaluation criteria (visitor numbers, feedback from different groups) and if the quiet zone remains. Lead the conversation so that, in this order, the learner presents the proposal, discusses the survey, answers your objection, considers another group (quiet users or staff), negotiates trial conditions and summarises the agreement.`},
 {level:'C1',maxTurns:26,register:'formal',topics:['work'],paths:['office'],partner:[2,5],
  goals:[
   'Explain the project delay diplomatically, in an appropriate register.',
   'Separate facts, interpretations and uncertainties in the information presented.',
   'Negotiate a change of deadline or scope, with conditions and responsibilities.',
   'Respond to Nora\'s strongest counter-argument without giving up the position.',
   'Mediate the team disagreement by presenting both perspectives fairly.',
   'Summarise the agreement precisely, including what remains open.',
  ],
  facts:()=>`You are Nora, head of department. The learner leads the project for a new online booking system for customers. This is the learner's final C1 evaluation. Facts: launch is planned for 1 March. Testing found problems integrating with the payroll system. The supplier estimates three more weeks but cannot guarantee it. Options: delay the launch by four weeks, or launch on time without the mobile version. You initially prefer launching on time because the board was promised this date; your strongest counter-argument is that another delay will damage the department's credibility. There is also tension in the team: colleagues at the second office say decisions are taken in informal meetings they cannot attend, while the main office thinks they do not read the written updates. Probe whether the learner separates facts from assumptions (for instance the supplier's estimate). At some point ask how they would handle the team conflict. Accept a well-argued solution with clear conditions and responsibilities, and close by asking for a precise summary.`},
 {level:'C2',maxTurns:28,register:'formal',topics:['argumentation'],paths:['office','studies'],partner:[],
  goals:[
   'State the recommendation precisely, showing what it commits to and what it cannot promise.',
   'Show how sources of different kinds were compared and where they cannot be compared.',
   'Notice the irony or implied criticism in one of Nora\'s questions and respond to it.',
   'Present fairly a position the learner disagrees with.',
   'Rephrase a key point for a different audience when Nora asks.',
   'Revise or defend the recommendation after criticism, justifying the choice.',
  ],
  facts:()=>`You chair a review panel. The learner defends their report recommending that two in-person service offices for residents be merged into one, keeping a telephone line and a weekly mobile service for rural areas. This is the learner's final C2 evaluation. Sources in the report: a user survey (540 responses, mostly collected online, so people who rarely use digital services are under-represented); an expert cost report (18% savings, assuming 70% of residents use digital services within two years, which other experts dispute); interviews with twelve elderly residents (qualitative, not representative). Management wants savings; user organisations fear exclusion. In this order: ask what exactly is recommended and what is not promised; question how the different sources were weighed; at one point ask ironically "So the digital solution will surely suit everyone perfectly?" and see whether the learner picks up the irony; ask the learner to present the user organisations' position as fairly as possible; ask them to explain the key point in plain language for a residents' newsletter; finally challenge the recommendation with the survey bias and see whether they revise it or defend it with justification.`},
];

export const levelCheckConversations=Object.keys(learningLanguages).flatMap(learningLanguage=>levelCheckTasks.map(task=>{
 const ids=task.goals.map((_,n)=>`goal-${n+1}`),money=lifeMoney(task,learningLanguage),level=task.level.toLowerCase();
 return {
  schemaVersion:2,id:`level-${learningLanguage}-${level}`,familyId:`level-${level}`,version:1,kind:'scenario',levelCheck:true,
  learningLanguage,level:task.level,maxTurns:task.maxTurns,topics:task.topics,paths:task.paths,
  states:['discussion','agreed'],initialState:'discussion',
  criteria:task.goals.map((meaning,n)=>({id:ids[n],meaning,requiresPartnerContext:task.partner.includes(n)})),
  transitions:[{from:'discussion',to:'agreed',requires:ids,terminal:true}],
  variants:[{id:'reference',challenge:0,opening:levelOpenings[learningLanguage][task.level],
   facts:[{id:'constraints',audience:'partner',text:task.facts(money)+' '+pace(task.level)+register(task,learningLanguage)}]}],
  locales:Object.fromEntries(Object.keys(supportLanguages).filter(support=>supportedPair(learningLanguage,support)).map(support=>{
   const {title,levels}=levelLocales[support],[learnerRole,partnerRole,labels,brief]=levels[task.level];
   return [support,{title:`${title} ${task.level}`,learnerRole,partnerRole,brief,hint:brief,criteria:Object.fromEntries(ids.map((id,n)=>[id,labels[n]]))}];
  })),
 };
}));
