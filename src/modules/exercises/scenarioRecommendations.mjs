// Pure recommendation policy: no network, no mutations of lesson mastery.
export function learningStage(lessons, completed = [], finalPassed = false) {
  const valid = new Set(lessons.map(l => l.id));
  const done = [...new Set(completed)].filter(id => valid.has(id));
  return { stage: finalPassed && lessons.length ? 4 : Math.min(4, 1 + Math.floor(done.length * 4 / Math.max(1, lessons.length))),
    completed: done, total: lessons.length };
}
export function hashSeed(value) {
  let hash = 2166136261;
  for (const char of String(value)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}
function shuffled(items, seed) {
  let state = hashSeed(seed);
  const next = [...items];
  for (let i=next.length-1; i>0; i--) {
    state = (Math.imul(state,1664525)+1013904223)>>>0;
    const j=state%(i+1); [next[i],next[j]]=[next[j],next[i]];
  }
  return next;
}
export function progressFingerprint(progress = {}) {
  return Object.keys(progress).sort().map(id => {
    const p=progress[id]?.latest;
    return p ? [id,p.date,p.endReason,p.achieved?.join('.')].join(':') : '';
  }).filter(Boolean).join('|');
}
export function selectScenarioRecommendations({ scenarios, stage=1, progress={}, completed=[], links={}, seed='', explore=false, previous=[] }) {
  const eligible=scenarios.filter(s=>explore||(s.stage||1)<=stage);
  const done=new Set(completed), used=new Set(), selected=[];
  const mastered=s=>progress[s.id]?.latest?.endReason==='success';
  const review=s=>progress[s.id]?.latest?.endReason==='turn_limit';
  const affinity=s=>(links[s.id]?.lessonIds||[]).filter(id=>done.has(id)).length;
  const ordered=shuffled(eligible,seed).sort((a,b)=>Number(previous.includes(a.id))-Number(previous.includes(b.id))||affinity(b)-affinity(a));
  const take=(pool,count,reason)=>{
    for(const scenario of pool) {
      if(count<=0) break;
      if(used.has(scenario.id)) continue;
      used.add(scenario.id); selected.push({scenario,reason}); count--;
    }
  };
  if(explore) take(ordered,4,'explore');
  else {
    const current=ordered.filter(s=>(s.stage||1)===stage);
    take(current.filter(s=>!progress[s.id]?.latest),2,'new');
    take(ordered.filter(review),1,'review');
    take(ordered.filter(s=>(s.stage||1)<stage||mastered(s)),1,'consolidation');
    take(current.filter(s=>!mastered(s)&&!review(s)),4-selected.length,'new');
    take(ordered.filter(s=>!progress[s.id]?.latest),4-selected.length,'new');
    take(ordered,4-selected.length,'practice');
  }
  return selected;
}
export const recommendationScope = (userId,level,pathId,mode,stage) =>
  ['studio_recommendations_v1',userId||'guest',level,pathId,mode,stage].map(encodeURIComponent).join(':');
export function readRecommendationRound(storage,key) {
  try {
    const value=JSON.parse(storage?.getItem(key));
    return value&&Number.isSafeInteger(value.round)&&value.round>=0&&Array.isArray(value.previous)&&value.previous.every(id=>typeof id==='string')
      ? value : {round:0,previous:[]};
  } catch { return {round:0,previous:[]}; }
}

