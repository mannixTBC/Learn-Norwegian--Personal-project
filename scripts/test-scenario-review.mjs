import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { saveScenarioResult } from '../src/modules/exercises/scenarioProgress.mjs';
import { getScenarioReviewItems } from '../src/modules/exercises/scenarioReviewItems.mjs';
import { resolvePublicScenario } from '../src/modules/exercises/scenarioDifficulty.mjs';
const catalog=JSON.parse(await readFile(new URL('../src/modules/exercises/conversationScenarios.json',import.meta.url),'utf8'));
const data=new Map();
const storage={get length(){return data.size;},key:i=>[...data.keys()][i],getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
test('scenario recap tracks only latest missing goals, isolates accounts/levels and never changes mastery',async()=>{
 for(const level of Object.keys(catalog.levels)){
  const scenarios=catalog.scenarios.map(s=>{const r=resolvePublicScenario(s,catalog.levels,level);return {...r.scenario,difficulty:r.difficulty};});
  for(const scenario of scenarios){
   const success={done:true,endReason:'success',turn:2,sessionToken:scenario.id+level+'success',achieved:scenario.goals.map((_,i)=>i)};
   await saveScenarioResult({storage,userId:'one',level,scenario,result:success});
   assert.ok(!getScenarioReviewItems(storage,'one',level,scenarios).some(s=>s.id===scenario.id));
   const failed={done:true,endReason:'turn_limit',turn:scenario.difficulty.turns,sessionToken:scenario.id+level+'failed',achieved:[0]};
   const saved=await saveScenarioResult({storage,userId:'one',level,scenario,result:failed});
   const value=JSON.parse(data.get(saved.key));value.date=new Date(Date.now()+1000).toISOString();data.set(saved.key,JSON.stringify(value));
   const snapshot=JSON.stringify([...data]);
   const item=getScenarioReviewItems(storage,'one',level,scenarios).find(s=>s.id===scenario.id);
   assert.deepEqual(item.missing,scenario.goals.slice(1));
   assert.equal(item.previouslyCompleted,true);
   assert.equal(item.attempts,2);
   assert.equal(JSON.stringify([...data]),snapshot,'reading recap cannot award goals or modify progress');
   assert.deepEqual(getScenarioReviewItems(storage,'other',level,scenarios),[]);
   assert.ok(!getScenarioReviewItems(storage,'one',level,[{...scenario,revision:999}]).length,'outdated definitions cannot generate current review');
  }
 }
 assert.deepEqual(getScenarioReviewItems({get length(){throw Error('blocked');}},'one','A1',[]),[]);
});
