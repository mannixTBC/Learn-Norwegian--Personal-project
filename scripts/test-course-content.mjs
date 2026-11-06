import fs from 'node:fs';
import assert from 'node:assert/strict';
import {build} from 'vite';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {decodeCourseLevel,createCourseRepository} from '../src/data/courseRepository.js';
import {bundledCourses,progressLessonIds} from '../src/data/courseIdentity.js';
const root=resolve(import.meta.dirname,'..');
const data=JSON.parse(fs.readFileSync(resolve(root,'supabase/generated/content.json'),'utf8'));
const outDir=resolve(root,'node_modules/.cache/database-parity');
await build({configFile:false,logLevel:'error',build:{ssr:resolve(root,'src/modules/lessons/norwegian-program/lessonContent.js'),outDir,rollupOptions:{output:{entryFileNames:'courses.mjs'}}}});
const {courseCatalog}=await import(pathToFileURL(resolve(outDir,'courses.mjs')));
const manifest=bundledCourses[0];
for(const [level,bundled] of Object.entries(courseCatalog)){
 const document={formatVersion:1,courseId:manifest.courseId,version:manifest.version,level,supportLanguage:'ro',
  items:data.items.filter(item=>item.level===level&&['lesson','level'].includes(item.kind)).map(item=>({
   itemId:item.item_id,kind:item.kind,position:item.position,legacyId:item.legacy_id,payload:item.payload,
   strings:data.translations.find(t=>t.item_id===item.item_id).strings}))};
 const decoded=decodeCourseLevel(document,manifest,level,'ro');
 assert.deepEqual(JSON.parse(JSON.stringify(decoded)),JSON.parse(JSON.stringify(bundled)),`Desktop content changed: ${level}`);
 const values=new Map();const storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
 const repository=createCourseRepository({manifest,storage,fetchLevel:async()=>document});
 assert.equal(repository.level(level,{learningLanguage:'nb',supportLanguage:'ro'},bundled),bundled);
 await repository.refresh(level,'ro');
 assert.equal(repository.level(level,{learningLanguage:'nb',supportLanguage:'ro'},bundled),bundled,'An open lesson must stay pinned');
 assert.throws(()=>decodeCourseLevel({...document,version:'2099.1'},manifest,level,'ro'));
 assert.throws(()=>decodeCourseLevel({...document,items:document.items.slice(1)},manifest,level,'ro'));
}
assert.equal(data.items.filter(i=>i.kind==='lesson').length,144);
assert.equal(data.items.filter(i=>i.kind==='scenario').length,1200);
assert.equal(data.links.length,2318);
const user='11111111-1111-4111-8111-111111111111';
assert.equal(progressLessonIds(`curriculum_2026.2_${user}_a1_progress`).length,24);
assert.equal(progressLessonIds(`curriculum_2099.1_${user}_a1_progress`),null);
console.log('Course content: all 144 desktop lessons unchanged; 1200 scenarios, 2318 links; cache pinning and identity checks passed.');
