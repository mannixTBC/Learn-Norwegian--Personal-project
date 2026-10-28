import {verbPracticeContent} from './verbPracticeContent';
import {pastForms} from './verbFormChoices';
import {getVerbSessions} from './verbsForLevel';
import {courseCatalog} from '../../lessons/norwegian-program/lessonContent';
import {readCourseProgress} from '../../../services/curriculumProgress';
import {participles,verbFrames,passiveFrames,supplementalHeads,commonVerbTranslations} from './verbNotebookLexicon';
import {basicVerbExamples} from './verbNotebookExamples';

export const levelOrder=['A1','A2','B1','B2','C1','C2'];
export const tenseLabels={present:'Prezent',past:'Trecut · Preteritum',future:'Viitor',perfect:'Perfect compus',pastPerfect:'Mai-mult-ca-perfect',conditional:'Condițional',passive:'Pasiv · Prezent',futurePerfect:'Viitor perfect',pastConditional:'Condițional trecut'};
const levelTenses={A1:['present','past','future'],A2:['present','past','future','perfect'],B1:['present','past','future','perfect','pastPerfect'],B2:['present','past','future','perfect','pastPerfect','conditional','passive'],C1:['present','past','future','perfect','pastPerfect','conditional','passive','futurePerfect'],C2:['present','past','future','perfect','pastPerfect','conditional','passive','futurePerfect','pastConditional']};
export const normalizeVerb=value=>String(value||'').normalize('NFC').toLocaleLowerCase('nb-NO').replace(/^å\s+/u,'').replace(/[.!?]+$/u,'').trim().replace(/\s+/gu,' ');
const contentCatalog={...verbPracticeContent};
for(const [id,romanian]of Object.entries(commonVerbTranslations)){const frame=verbFrames[id];contentCatalog['å '+id]={form:supplementalHeads[id].present,romanian,context:{sentence:frame.sentence,translation:null},recall:{sentence:frame.sentence,translation:null}};}

const pastCatalog={...pastForms,...Object.fromEntries(Object.entries(supplementalHeads).map(([id,v])=>[id,v.past]))};
const participleCatalog={...participles,...Object.fromEntries(Object.entries(supplementalHeads).map(([id,v])=>[id,v.participle]))};
for(const level of levelOrder)for(const lesson of courseCatalog[level]?.lessons||[])for(const [word,romanian] of lesson.vocabulary||[]){
 if(!/^å\s/iu.test(word))continue;
 const id=normalizeVerb(word),key='å '+id;if(contentCatalog[key])continue;
 const [head,...tail]=id.split(' '),present=supplementalHeads[head]?.present||verbPracticeContent['å '+head]?.form,frame=verbFrames[id];
 if(!present||!frame)throw new Error('Missing curriculum verb: '+id);
 contentCatalog[key]={form:[present,...tail].join(' '),romanian,context:{sentence:frame.sentence,translation:null},recall:{sentence:frame.sentence,translation:null}};
}
const ranks=new Map(Object.keys(commonVerbTranslations).map(id=>[id,'A1']));
for(const level of levelOrder)for(const entry of getVerbSessions(level).flat()){const id=normalizeVerb(entry.norwegian);if(!ranks.has(id))ranks.set(id,level);}
// Match whole authored phrases, not arbitrary substrings. Lessons also teach
// verbs through phrases such as "Jeg bor i", not only entries headed "Å bo".
const sources=new Map();
const contentEntries=Object.entries(contentCatalog).map(([word,content])=>({id:normalizeVerb(word),form:content.form.toLocaleLowerCase('nb-NO')})).sort((a,b)=>b.form.length-a.form.length);
const knownIds=new Set(contentEntries.map(v=>v.id));
function lessonVerbIds(lesson){
 const ids=new Set();
 for(const [word,,example] of lesson.vocabulary||[]){
  const normalized=String(word).normalize('NFC').toLocaleLowerCase('nb-NO');
  if(/^å\s/u.test(normalized)){const id=normalizeVerb(word);if(knownIds.has(id))ids.add(id);else if(knownIds.has(id.split(' ')[0]))ids.add(id.split(' ')[0]);}
  for(const text of [word,example].filter(Boolean)){
   const value=text.normalize('NFC').toLocaleLowerCase('nb-NO');
   for(const match of value.matchAll(/(?:^|[\s.!?])(?:jeg|du|han|hun|vi|dere|de|det)\s+([^.!?]+)/gu)){
    const phrase=match[1];
    const found=contentEntries.find(v=>phrase===v.form||phrase.startsWith(v.form+' ')||phrase.startsWith(v.form+','));
    if(found)ids.add(found.id);
    const modal=phrase.match(/^(?:skal|vil|kan|må|bør)\s+(.+)/u);
    if(modal){const first=modal[1].split(' ')[0];if(knownIds.has(first))ids.add(first);}
   }
  }
 }
 return ids;
}
for(const level of levelOrder)for(const lesson of courseCatalog[level]?.lessons||[])for(const id of lessonVerbIds(lesson)){const list=sources.get(id)||[];list.push({level,id:lesson.id,title:lesson.title});sources.set(id,list);}
const sourceRank=id=>{const levels=[ranks.get(id),...(sources.get(id)||[]).map(s=>s.level)].filter(Boolean);return levels.sort((a,b)=>levelOrder.indexOf(a)-levelOrder.indexOf(b))[0]||'C2';};
export const verbNotebookCatalog=Object.entries(contentCatalog).map(([infinitive,content])=>{
 const id=normalizeVerb(infinitive),[head,...tail]=id.split(' '),frame=verbFrames[id];
 if(!pastCatalog[head]||!participleCatalog[head]||!frame)throw new Error('Missing authored verb record: '+id);
 const join=form=>[form,...tail].join(' '),past=join(pastCatalog[head]),participle=join(participleCatalog[head]);
 const future=frame.futureMode==='plan'?'skal '+id:'kommer til å '+id;
 const forms={present:content.form,past,future,perfect:'har '+participle,pastPerfect:'hadde '+participle,conditional:'ville '+id,futurePerfect:'vil ha '+participle,pastConditional:'ville ha '+participle,...(passiveFrames[id]?{passive:'blir '+participle}:{})};
 const regularPresent=content.form===join(head+'r');
 const rules={
 present:regularPresent?`Pentru acțiuni prezente sau obișnuite: ${head} → ${head}r, adăugăm -r.`:`Forma de prezent se învață separat. Verbul nu se schimbă după persoană.`,
 past:`Pentru o situație trecută încheiată: ${head} → ${pastCatalog[head]}. ${pastCatalog[head]===head.replace(/e$/,'')+'te'?'Acest verb are terminația -te.':pastCatalog[head]===head.replace(/e$/,'')+'et'?'Acest verb are terminația -et.':'Învață forma de trecut a acestui verb.'}`,
 future:frame.futureMode==='plan'?`Pentru un plan sau o intenție: skal + infinitiv, fără å.`:`Pentru o predicție: kommer til å + infinitiv.`,
 perfect:`har + participiu. Acțiunea trecută are legătură cu prezentul; nu indicăm un moment trecut încheiat.`,
 pastPerfect:`hadde + participiu. Acțiunea s-a petrecut înaintea altei situații din trecut.`,
 conditional:`ville + infinitiv. Exprimă un rezultat ipotetic, dependent de o condiție.`,
 passive:`blir + participiu. Subiectul primește acțiunea; agentul poate fi introdus prin av.`,
 futurePerfect:`vil ha + participiu. Acțiunea va fi încheiată până la un reper viitor.`,
 pastConditional:`ville ha + participiu. Un rezultat ipotetic care nu s-a realizat în trecut.`};
 return {id,infinitive,translation:content.romanian,level:sourceRank(id),forms,rules,frame,reflexive:/\bseg\b/u.test(id),impersonal:['måtte antas','skje'].includes(id),sources:sources.get(id)||[],presentExamples:[content.context,content.recall],basicExamples:basicVerbExamples[id]||{}};
});
const byId=new Map(verbNotebookCatalog.map(v=>[v.id,v]));
export function tensesForVerb(verb,level){return (levelTenses[level]||levelTenses.A1).filter(t=>verb.forms[t]&&(!['conditional','pastConditional','futurePerfect'].includes(t)||!['ville','måtte'].includes(verb.id.split(' ')[0])));}
const shuffle=(items,random)=>{const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;};
const pick=(items,random)=>items[Math.floor(random()*items.length)];
export const notebookMemoryKey=(userId,level)=>`verb_notebook_v1_${userId||'guest'}_${level}`;
export function readNotebookMemory(storage,userId,level){try{const value=JSON.parse(storage?.getItem(notebookMemoryKey(userId,level)));return {records:value?.records&&typeof value.records==='object'&&!Array.isArray(value.records)?value.records:{},recent:Array.isArray(value?.recent)?value.recent.filter(id=>byId.has(id)):[]};}catch{return {records:{},recent:[]};}}
export function readNotebookLearning(userId,level){const lessons=courseCatalog[level]?.lessons||[];return readCourseProgress(level,{id:userId||'guest'},lessons);}
export function selectionPools(level,memory,previous,learning={completed:[],unlocked:1}){
 const rank=Math.max(0,levelOrder.indexOf(level));
 const eligible=verbNotebookCatalog.filter(v=>levelOrder.indexOf(v.level)<=rank&&v.id!==previous);
 const recentIds=new Set(memory.recent?.slice(-8)||[]),fresh=eligible.filter(v=>!recentIds.has(v.id)),pool=fresh.length?fresh:eligible;
 const completed=new Set(learning.completed||[]),recentLessons=new Set((learning.completed||[]).slice(-3));
 const relevant=s=>s.level===level&&(recentLessons.has(s.id)||s.id===learning.unlocked);
 const studied=s=>(s.level===level&&completed.has(s.id))||levelOrder.indexOf(s.level)<rank;
 const lessons=pool.filter(v=>v.sources.some(relevant));
 const review=pool.filter(v=>tensesForVerb(v,level).some(t=>memory.records?.[v.id+':'+t]?.needsReview));
 const common=pool.filter(v=>v.level===level||v.sources.some(studied));
 const fallback=pool.filter(v=>v.level===level);
 return {eligible:pool,lessons,review,common:common.length?common:pool,fallback:fallback.length?fallback:pool};
}
const contexts={present:'O acțiune prezentă sau obișnuită.',past:'Povestești despre o situație încheiată în trecut.',future:'Exprimă viitorul folosind construcția prezentată.',perfect:'Privești din prezent o acțiune anterioară; nu precizezi când s-a încheiat.',pastPerfect:'Acțiunea era deja realizată înaintea altei situații trecute.',conditional:'Imaginează o situație posibilă numai dacă ar fi îndeplinită o condiție.',passive:'Subiectul primește acțiunea. Folosește pasivul cu blir.',futurePerfect:'Privești spre un moment viitor până la care acțiunea va fi încheiată.',pastConditional:'Imaginează ce s-ar fi întâmplat dacă o condiție trecută ar fi fost îndeplinită.'};
export function createNotebookQuestion(verb,tense,random=Math.random){
 const answer=verb.forms[tense];
 let example;
 if(verb.basicExamples[tense])example=pick(verb.basicExamples[tense],random);
 else if(tense==='present')example=pick(verb.presentExamples,random);
 else example={sentence:tense==='passive'?passiveFrames[verb.id]:verb.frame.sentence,translation:null};
 // The prompt explicitly identifies the tense/construction. Other valid tenses
 // are distractors for THAT instruction, not claimed to be ungrammatical sentences.
 const candidates=[...new Set([verb.forms.present,verb.forms.past,verb.forms.future,verb.forms.perfect,verb.forms.pastPerfect,verb.id])].filter(value=>value!==answer);
 const options=shuffle([answer,...shuffle(candidates,random).slice(0,2)],random);
 return {...example,tense,answer,options,context:contexts[tense],meaning:verb.translation};
}
export function createNotebookRound(level,memory={records:{},recent:[]},previous=null,random=Math.random,learning={completed:[],unlocked:1},requested=null){
 const pools=selectionPools(level,memory,previous,learning);
 // Renormalize only the available categories. Empty lesson/review pools never
 // silently count as those categories. Default split: lessons 60 / review 25 / common 15.
 const categories=[{source:pools.lessons.length?'lesson':'level',weight:60,pool:pools.lessons.length?pools.lessons:pools.fallback},{source:'review',weight:25,pool:pools.review},{source:'common',weight:15,pool:pools.common}].filter(c=>c.pool.length);
 let roll=random()*categories.reduce((sum,c)=>sum+c.weight,0),category=categories[categories.length-1];for(const c of categories){roll-=c.weight;if(roll<0){category=c;break;}}
 const requestedVerb=requested&&byId.get(requested.verb);
 const linked=requestedVerb?.sources.some(source=>source.level===level&&source.id===Number(requested.lesson));
 const verb=linked?requestedVerb:pick(category.pool,random),available=tensesForVerb(verb,level);
 const weak=available.filter(t=>memory.records?.[verb.id+':'+t]?.needsReview);
 const extras=available.filter(t=>!['present','past','future'].includes(t));
 // Always compare three forms. Beginners compare present/past/future; later
 // rounds introduce a harder construction and contrast it with familiar forms.
 let tenses=['present','past','future'];
 if(extras.length){const focus=pick(weak.length?weak:extras,random);const contrast=focus==='perfect'||focus==='pastPerfect'?['past','perfect'].filter(t=>t!==focus):['present','future'];tenses=[...new Set([focus,...contrast,...shuffle(available,random)])].slice(0,3);}
 const questions=shuffle(tenses,random).map(t=>createNotebookQuestion(verb,t,random));
 return {verb,tenses,questions,source:linked?'lesson':category.source};
}
export function saveNotebookRound(storage,userId,level,round,answers){
 if(answers.length!==round.questions.length)throw new Error('Cannot save an incomplete verb round');
 const memory=readNotebookMemory(storage,userId,level);
 round.questions.forEach((question,i)=>{const key=round.verb.id+':'+question.tense,answer=answers[i];memory.records[key]={attempts:(Number(memory.records[key]?.attempts)||0)+1,correct:answer.correct?1:0,total:1,needsReview:!answer.correct||!!answer.helped,updatedAt:Date.now()};});
 memory.recent=[...memory.recent.filter(id=>id!==round.verb.id),round.verb.id].slice(-8);
 storage.setItem(notebookMemoryKey(userId,level),JSON.stringify(memory));return memory;
}
export function personForm(verb,tense,person){const form=verb.forms[tense];if(!verb.reflexive)return form;const pronoun={jeg:'meg',du:'deg',vi:'oss',dere:'dere'}[person]||'seg';return form.replace(/\bseg\b/u,pronoun);}
