import { build } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const root=resolve(import.meta.dirname,'..');
const outDir=resolve(root,'node_modules/.cache/studio-curriculum');
await build({configFile:false,logLevel:'error',build:{ssr:resolve(root,'src/modules/lessons/norwegian-program/lessonContent.js'),outDir,emptyOutDir:true,rollupOptions:{output:{entryFileNames:'curriculum.mjs'}}}});
const {courseCatalog}=await import(pathToFileURL(resolve(outDir,'curriculum.mjs')));
const catalog=JSON.parse(readFileSync(resolve(root,'src/modules/exercises/conversationScenarios.json'),'utf8'));
const stop=new Set('jeg du han hun vi dere de det den dette disse en ei et og eller men er har kan vil skal må i på til fra med for av om som at ikke nå da der her denne neste først bare også noe noen hva hvem hvor når hvordan ja nei takk gjerne meg deg oss min mitt din ditt sin sitt våre deres være blir ble var seg seg selv trenger ønsker hjelp spørre be gå gjøre gjøre få komme se sier si'.split(' '));
const words=text=>new Set((text.toLocaleLowerCase('nb-NO').match(/[\p{L}]{3,}/gu)||[]).filter(w=>!stop.has(w)));
const maps={version:1,curriculumVersion:courseCatalog.A1.lessons[0].curriculumVersion,levels:{},links:{}};
for(const [level,course] of Object.entries(courseCatalog)) {
  maps.levels[level]=course.lessons.map(l=>({id:l.id,uid:l.uid,title:l.title,sectionId:l.sectionId}));
  const vocabulary=course.lessons.map(l=>({id:l.id,words:words(l.vocabulary.map(e=>e[0]+' '+e[2]).join(' '))}));
  for(const s of catalog.scenarios) {
    const query=words((s.practicePhrases||[]).join(' ')+' '+s.variants[level].hint+' '+s.variants[level].opening);
    // Map by actual Norwegian vocabulary. Stage anchors remain explicit fallbacks.
    const ranked=vocabulary.map(l=>({id:l.id,score:[...query].filter(w=>l.words.has(w)).length}))
      .sort((a,b)=>b.score-a.score||Math.abs(a.id-s.stage*6)-Math.abs(b.id-s.stage*6)||a.id-b.id);
    const matched=ranked.filter(l=>l.score>0).slice(0,2);
    const anchor=course.lessons.slice((s.stage-1)*6,s.stage*6).filter(l=>l.kind!=='consolidation').slice(0,2);
    maps.links[s.id]??={};
    maps.links[s.id][level]={lessonIds:(matched.length?matched:anchor).map(l=>l.id),basis:matched.length?'vocabulary':'stage'};
  }
}
writeFileSync(resolve(root,'src/modules/exercises/scenarioLessonMap.json'),JSON.stringify(maps,null,2)+'\n');
console.log('Linked 1200 variants to current curriculum lessons ('+maps.curriculumVersion+').');

