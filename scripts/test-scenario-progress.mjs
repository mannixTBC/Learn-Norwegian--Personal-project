import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { resolvePublicScenario } from '../src/modules/exercises/scenarioDifficulty.mjs';
import { saveScenarioResult, readScenarioProgress } from '../src/modules/exercises/scenarioProgress.mjs';
const catalog = createRequire(import.meta.url)('../src/modules/exercises/conversationScenarios.json');
const fixture = () => {
  const values = new Map();
  const storage = { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,v),
    key: i => [...values.keys()][i], get length() { return values.size; } };
  const userId = '11111111-1111-4111-8111-111111111111';
  const resolved = resolvePublicScenario(catalog.scenarios[0], catalog.levels, 'A1');
  const scenario = { ...resolved.scenario, difficulty: resolved.difficulty };
  let n = 0;
  const save = (achieved, overrides = {}) => saveScenarioResult({ storage, userId, level: 'A1', scenario,
    result: { done: true, achieved, turn: scenario.difficulty.turns, endReason: 'turn_limit', sessionToken: 'result-' + ++n, ...overrides } });
  const read = (id = userId, level = 'A1', selected = scenario) => readScenarioProgress(storage, id, level, [selected]);
  return { values, storage, userId, scenario, save, read };
};
test('best is a single attempt, partial goals never combine into completion, retry does not erase best', async () => {
  const f = fixture();
  await f.save([0,1]); await f.save([2]);
  assert.equal(f.read()[f.scenario.id].attempts, 2);
  assert.equal(f.read()[f.scenario.id].best.endReason, 'turn_limit');
  assert.equal(f.read()[f.scenario.id].best.achieved.length, 2);
  await f.save([0,1,2], { endReason: 'success', turn: 2 });
  await f.save([]);
  assert.equal(f.read()[f.scenario.id].best.endReason, 'success');
  assert.equal(f.read()[f.scenario.id].latest.achieved.length, 0);
});
test('terminal resume is idempotent, same ID and original date; tokens and dialogues are absent', async () => {
  const f = fixture();
  const a = await f.save([0], { sessionToken: 'same-terminal-token' });
  const b = await f.save([0], { sessionToken: 'same-terminal-token' });
  assert.equal(a.key,b.key); assert.deepEqual(a.value,b.value);
  assert.equal(f.read()[f.scenario.id].attempts, 1);
  assert.doesNotMatch(JSON.stringify([...f.values]), /same-terminal-token|sessionToken|messages|feedback/);
});
test('account, level and definition changes cannot inherit completion, malformed and ambiguous legacy records are excluded', async () => {
  const f=fixture(); await f.save([0,1,2], { endReason:'success', turn:1 });
  assert.deepEqual(f.read('other'),{}); assert.deepEqual(f.read(f.userId,'C2'),{});
  assert.deepEqual(f.read(f.userId,'A1',{...f.scenario,revision:999})[f.scenario.id],{legacy:true});
  assert.deepEqual(f.read(f.userId,'A1',{...f.scenario,goals:[...f.scenario.goals].reverse()})[f.scenario.id],{legacy:true});
  f.storage.setItem(`conversation-studio:${f.userId}:C2`,JSON.stringify({[f.scenario.id]:{achieved:[0,1,2]}}));
  assert.deepEqual(f.read(f.userId,'C2')[f.scenario.id],{legacy:true});
  for(const k of f.values.keys()) if(k.startsWith('scenario_result')) f.values.set(k,'{corrupt');
  assert.deepEqual(f.read(),{});
});
test('unfinished, inconsistent or late results are never saved; blocked storage is non-fatal on read', async () => {
  const f=fixture();
  assert.equal((await f.save([], {done:false})).saved,false);
  await assert.rejects(f.save([0],{endReason:'success'}),/Invalid/);
  await assert.rejects(f.save([0,0]),/Invalid/);
  const late = await saveScenarioResult({storage:f.storage,userId:f.userId,level:'A1',scenario:f.scenario,
    result:{done:true,sessionToken:'late'},isCurrent:()=>false});
  assert.equal(late.saved,false); assert.equal(f.values.size,0);
  assert.deepEqual(readScenarioProgress({get length(){throw Error('blocked');}},f.userId,'A1',[f.scenario]),{});
});
test('all ten scenarios and six levels can save results without sharing objective identities', async () => {
  for(const level of Object.keys(catalog.levels)) for(const source of catalog.scenarios) {
    const f=fixture(), r=resolvePublicScenario(source,catalog.levels,level), scenario={...r.scenario,difficulty:r.difficulty};
    await saveScenarioResult({storage:f.storage,userId:f.userId,level,scenario,result:{done:true,sessionToken:level+source.id,
      achieved:scenario.goals.map((_,i)=>i),endReason:'success',turn:1}});
    assert.equal(readScenarioProgress(f.storage,f.userId,level,[scenario])[source.id].best.endReason,'success');
  }
});
