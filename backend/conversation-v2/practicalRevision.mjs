import {limits,courseCurrency,lifeRegister} from './practicalLife1.mjs';
import {expansionTasks} from './practicalExpansion.mjs';
import {batch60Tasks} from './practicalBatch60Source.mjs';
import {formalOpenings,interviewTasks} from './revision/openings.mjs';
import en from './revision/en.mjs';
import ro from './revision/ro.mjs';
import de from './revision/de.mjs';
import es from './revision/es.mjs';
import pl from './revision/pl.mjs';
import uk from './revision/uk.mjs';
import lt from './revision/lt.mjs';
import ar from './revision/ar.mjs';

// One revision of the earlier catalogue (base, expansion, batch60): CEFR turn limits,
// local currency for Nordic courses, a consistent address form and learner text
// with a real situation. Each revised scenario gets a new version; the previous
// version stays published so sessions in progress can still resume.
const learnerText={en,ro,de,es,pl,uk,lt,ar};
const revisedIds=[...expansionTasks.map(t=>t.id),...batch60Tasks.map(t=>t.id)];
const factors={NOK:10,SEK:10,DKK:7};
const names={NOK:'Norwegian kroner',SEK:'Swedish kronor',DKK:'Danish kroner'};
const words={'one hundred':100,'three hundred':300,'thirty-six':36,'fifty-four':54,fifteen:15,twenty:20,fifty:50,sixty:60,eighty:80,ninety:90,ten:10,eight:8,six:6,five:5,two:2,one:1};
const number=`(\\d+|${Object.keys(words).sort((a,b)=>b.length-a.length).join('|')})`;
const amount=value=>/^\d+$/.test(value)?Number(value):words[value];

// Nora's English facts and the evaluator rubric use the course country's currency.
export function localizeEuros(text,currency){
 if(currency==='EUR')return text;
 const f=factors[currency],name=names[currency],money=n=>`${Math.round(n*f)} ${name}`;
 const result=text
  .replace(/two one-euro coins/g,()=>`coins worth ${money(2)}`)
  .replace(/one euro each/g,()=>`${money(1)} each`)
  .replace(/fifty cents/g,()=>money(0.5))
  .replace(new RegExp(`\\b${number}-euro\\b`,'g'),(_,n)=>money(amount(n)))
  .replace(new RegExp(`\\b${number} euros?\\b`,'g'),(_,n)=>money(amount(n)));
 if(/euro|\bcents?\b/i.test(result))throw new Error('Unconverted euro amount: '+result);
 return result;
}
// {{€N}} in learner text becomes a short local price.
export function learnerMoney(text,currency){
 return text.replace(/\{\{€(\d+)\}\}/g,(_,n)=>currency==='EUR'?`${n} €`:`${Number(n)*factors[currency]} kr`);
}
const baseEuro=/80\s*(?:de\s+)?(?:euros?|eurų|євро|يورو|Euro)/g;

export function reviseScenario(s){
 const id=s.id.replace(`practice-${s.learningLanguage}-`,''),currency=courseCurrency(s.learningLanguage);
 const formal=formalOpenings[id],task={register:formal?'formal':'informal'},register=lifeRegister(task,s.learningLanguage);
 const index=revisedIds.indexOf(id);
 return {...s,version:s.version+1,maxTurns:limits[s.level],...(interviewTasks.includes(id)?{interaction:'interview'}:{}),
  criteria:s.criteria.map(c=>({...c,meaning:localizeEuros(c.meaning,currency)})),
  variants:s.variants.map(v=>({...v,opening:formal?.[s.learningLanguage]||v.opening,
   facts:v.facts.map(f=>({...f,text:localizeEuros(f.text,currency)+register}))})),
  locales:Object.fromEntries(Object.entries(s.locales).map(([support,locale])=>{
   if(index<0){
    if(id!=='b1'||currency==='EUR')return [support,locale];
    const local=text=>text.replace(baseEuro,`${80*factors[currency]} kr`);
    return [support,{...locale,brief:local(locale.brief),hint:local(locale.hint),criteria:Object.fromEntries(Object.entries(locale.criteria).map(([k,v])=>[k,local(v)]))}];
   }
   const [brief,g1,g2,g3]=learnerText[support][index].map(text=>learnerMoney(text,currency));
   return [support,{...locale,brief,hint:brief,criteria:{'goal-1':g1,'goal-2':g2,'goal-3':g3}}];
  }))};
}
