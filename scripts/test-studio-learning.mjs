import assert from 'node:assert/strict';
import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { stageFromLearning, getScenarioStage } from '../src/modules/exercises/scenarioStages.mjs';
const out = resolve('node_modules/.cache/studio-learning-tests');
await build({configFile:resolve('vite.config.js'),logLevel:'error',build:{ssr:true,outDir:out,emptyOutDir:true,rollupOptions:{input:{learning:resolve('src/modules/exercises/studioLearning.js'),progress:resolve('src/services/curriculumProgress.js'),catalog:resolve('src/modules/lessons/norwegian-program/lessonContent.js')},output:{entryFileNames:'[name].mjs'}}}});
const {readStudioLearning}=await import(pathToFileURL(resolve(out,'learning.mjs')));
const {courseProgressKey,finalTestKey}=await import(pathToFileURL(resolve(out,'progress.mjs')));
const {courseCatalog}=await import(pathToFileURL(resolve(out,'catalog.mjs')));
const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)??null};
const alice={id:'alice'},bob={id:'bob'};
for(const [count,stage] of [[0,1],[5,1],[6,2],[11,2],[12,3],[17,3],[18,4],[24,4]]){
 values.set(courseProgressKey('A1',alice),JSON.stringify({unlocked:24,completed:courseCatalog.A1.lessons.slice(0,count).map(l=>l.id)}));
 assert.equal(readStudioLearning('A1',alice).stage,stage);
 assert.equal(readStudioLearning('A1',bob).stage,1);
 assert.equal(readStudioLearning('A2',alice).stage,1);
}
values.set(courseProgressKey('A1',alice),JSON.stringify({unlocked:24,completed:[courseCatalog.A1.lessons[0].id,courseCatalog.A1.lessons[0].id,'unknown']}));
assert.equal(readStudioLearning('A1',alice).completed.length,1);
assert.equal(readStudioLearning('A1',alice).stage,1);
values.set(finalTestKey('A1','passed',alice),'true');assert.equal(readStudioLearning('A1',alice).stage,4);assert.equal(readStudioLearning('A1',bob).stage,1);
values.set(courseProgressKey('A2',alice),'invalid JSON');assert.equal(readStudioLearning('A2',alice).stage,1);
globalThis.localStorage={getItem(){throw Error('Storage unavailable');}};
assert.equal(readStudioLearning('A1',alice).stage,1);
for(const value of [undefined,NaN,-1,Infinity])assert.equal(stageFromLearning(value),1);
assert.equal(getScenarioStage(undefined).label,'Introducere');assert.equal(getScenarioStage(4).label,'Autonomie');
console.log('PASS: stage boundaries, account/level isolation, valid lesson IDs, final-test progression and unavailable storage.');
