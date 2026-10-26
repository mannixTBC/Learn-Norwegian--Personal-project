import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {learningStage,selectScenarioRecommendations as pick,progressFingerprint,recommendationScope,readRecommendationRound} from '../src/modules/exercises/scenarioRecommendations.mjs';
const require=createRequire(import.meta.url);
const catalog=require('../src/modules/exercises/conversationScenarios.json');
const map=require('../src/modules/exercises/scenarioLessonMap.json');
const scenes=catalog.scenarios.filter(s=>s.path==='transport');
const ids=items=>items.map(i=>i.scenario.id);
test('lesson completion changes stages at 6/12/18 of 24; duplicates, browsing and other-level IDs do not',()=>{
 const lessons=map.levels.A1;
 for(const [count,stage] of [[0,1],[5,1],[6,2],[11,2],[12,3],[17,3],[18,4],[24,4]]){
   assert.equal(learningStage(lessons,lessons.slice(0,count).map(l=>l.id)).stage,stage);
 }
 assert.equal(learningStage(lessons,[1,1,999,'1']).stage,1);
 assert.equal(learningStage(lessons,[],true).stage,4);
 assert.equal(learningStage([],[]).stage,1);
});
test('every stage returns four unique scenarios within progress; refresh is stable and explicit rotation changes the set',()=>{
 for(const path of new Set(catalog.scenarios.map(s=>s.path))) for(let stage=1;stage<=4;stage++){
   const scenarios=catalog.scenarios.filter(s=>s.path===path);
   const args={scenarios,stage,seed:path+stage};
   const first=pick(args);
   assert.equal(first.length,4);
   assert.equal(new Set(ids(first)).size,4);
   assert.ok(first.every(i=>i.scenario.stage<=stage));
   assert.deepEqual(pick(args),first);
   const next=pick({...args,seed:path+stage+'next',previous:ids(first)});
   assert.notDeepEqual([...ids(next)].sort(),[...ids(first)].sort());
 }
});
test('mix contains two unseen current-stage scenarios, one retry and one consolidation when available',()=>{
 const current=scenes.filter(s=>s.stage===3), old=scenes.filter(s=>s.stage===1);
 const progress={
  [old[0].id]:{latest:{date:'2026-10-25T12:00:00.000Z',endReason:'turn_limit',achieved:[0]}},
  [old[1].id]:{latest:{date:'2026-10-24T12:00:00.000Z',endReason:'success',achieved:[0,1,2]}}
 };
 const before=JSON.stringify(progress);
 const result=pick({scenarios:scenes,stage:3,progress,seed:'mixed'});
 assert.equal(result.filter(i=>i.reason==='new'&&current.some(s=>s.id===i.scenario.id)).length,2);
 assert.equal(result.find(i=>i.reason==='review').scenario.id,old[0].id);
 assert.ok(result.some(i=>i.reason==='consolidation'));
 assert.equal(JSON.stringify(progress),before,'recommendations must not mutate mastery');
 assert.notEqual(progressFingerprint(progress),progressFingerprint({}));
});
test('lesson links prefer practiced vocabulary among unseen candidates; explore permits later stages without unlocking lessons',()=>{
 const current=scenes.filter(s=>s.stage===1);
 const links=Object.fromEntries(current.slice(0,2).map(s=>[s.id,{lessonIds:[1]}]));
 const result=pick({scenarios:scenes,stage:1,completed:[1],links,seed:'lesson-match'});
 assert.ok(current.slice(0,2).every(s=>ids(result).includes(s.id)));
 const reachable=new Set();
 for(let round=0;round<80;round++) pick({scenarios:scenes,stage:1,explore:true,seed:'explore'+round}).forEach(i=>reachable.add(i.scenario.id));
 assert.equal(reachable.size,20);
 assert.equal(learningStage(map.levels.A1,[]).stage,1);
});
test('accounts, levels, directions and stage have separate selection state; blocked and corrupt storage are harmless',()=>{
 const keys=['u1','u2'].flatMap(u=>['A1','A2'].flatMap(l=>['transport','retail'].map(p=>recommendationScope(u,l,p,'recommended',1))));
 assert.equal(new Set(keys).size,8);
 assert.deepEqual(readRecommendationRound({getItem(){throw Error();}},'k'),{round:0,previous:[]});
 assert.deepEqual(readRecommendationRound({getItem:()=>'{bad'},'k'),{round:0,previous:[]});
 assert.deepEqual(readRecommendationRound({getItem:()=>JSON.stringify({round:-1,previous:[]})},'k'),{round:0,previous:[]});
});
test('all 1200 lesson mappings refer to real lessons of the selected level and preserve the curriculum version',()=>{
 assert.equal(map.curriculumVersion,'2026.2');
 let count=0;
 for(const s of catalog.scenarios) for(const level of Object.keys(catalog.levels)){
   const link=map.links[s.id][level];
   assert.ok(link.lessonIds.length>=1&&link.lessonIds.length<=2);
   assert.ok(link.lessonIds.every(id=>map.levels[level].some(l=>l.id===id)));
   assert.ok(['vocabulary','stage'].includes(link.basis));
   count++;
 }
 assert.equal(count,1200);
});

