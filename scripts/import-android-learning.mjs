import fs from 'node:fs';
import path from 'node:path';
import {stripTypeScriptTypes} from 'node:module';
const android = process.argv[2];
if (!android) throw new Error('Usage: node scripts/import-android-learning.mjs <Android project>');
const target = path.resolve(import.meta.dirname, '../src/modules/lessons');
const imageTarget=path.resolve(import.meta.dirname,'../public/images/grammar');
fs.mkdirSync(imageTarget,{recursive:true});
for(const name of ['position-i.png','position-pa.png','position-under.png','conjunction-og.png','conjunction-men.png','conjunction-eller.png'])fs.copyFileSync(path.join(android,'assets/images/grammar',name),path.join(imageTarget,name));
fs.mkdirSync(path.join(target,'grammar'), {recursive:true});
for (const [source,destination] of [['grammar/nbContent.ts','grammar/nbContent.js'],['grammar/ruleGuideContent.ts','grammar/ruleGuideContent.js'],['grammar/practice.ts','grammar/practice.js'],['lessonSummary.ts','lessonSummaryData.js'],['activeRecall.ts','activeRecall.js']]) {
  const text = fs.readFileSync(path.join(android,'src/features/learning',source),'utf8');
  fs.writeFileSync(path.join(target,destination),'// Adapted from NordLingo Android; content is independent of the renderer.\n'+stripTypeScriptTypes(text,{mode:'transform'}));
}
const scenarios=fs.readFileSync(path.join(android,'src/features/studio/practicalScenarios.ts'),'utf8');
fs.writeFileSync(path.resolve(target,'../exercises/practicalScenarios.js'),stripTypeScriptTypes(scenarios.replace('../../legacy/modules/exercises/scenarioRecommendations.mjs','./scenarioRecommendations.mjs'),{mode:'transform'}));
console.log('Imported grammar content, lesson summary and scenario presentation into the web project. Android was read only.');
