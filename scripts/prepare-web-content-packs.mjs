import fs from 'node:fs';
import path from 'node:path';
import {stripTypeScriptTypes} from 'node:module';
const android=process.argv[2],root=path.resolve(import.meta.dirname,'..');
if(!android)throw Error('Pass the read-only Android checkout.');
if(fs.existsSync(path.join(root,'src/content/norwegianPack.js')))throw Error('Web content packs already exist. Review updates manually to preserve web adaptations.');
const features={
 games:'src/modules/exercises/practiceGameData.js',practice:'src/modules/exercises/practiceActivities.js',
 words:'src/modules/exercises/wordDiscoveryCatalog.js',spelling:'src/modules/exercises/wordSpelling.js',
 sentences:'src/modules/exercises/sentencePractice.js',verbs:'src/modules/exercises/challenge30/verbNotebookData.js',
 verbPractice:'src/modules/exercises/challenge30/verbPracticeData.js',recall:'src/modules/lessons/activeRecall.js',
};
const modules={...features,courses:'src/modules/lessons/norwegian-program/lessonContent.js',
 grammar:'src/modules/lessons/grammar/nbContent.js',ruleGuides:'src/modules/lessons/grammar/ruleGuideContent.js',
 basicGuides:'src/modules/lessons/grammar/basicGuides.js',summary:'src/modules/lessons/lessonSummaryData.js',
 scenarios:'src/modules/exercises/conversationScenarios.json',career:'src/services/careerProfile.js'};
const relative=(from,to)=>{const r=path.relative(path.dirname(from),to).replaceAll('\\','/');return r.startsWith('.')?r:'./'+r;};
fs.mkdirSync(path.join(root,'src/content/features'),{recursive:true});
const packPath='src/content/norwegianPack.js';
let pack='// Authored Norwegian content and rules are preserved without rewriting exercises.\n';
for(const [feature,file]of Object.entries(modules))pack+=`import ${file.endsWith('.json')?'':'* as '}${feature} from '${relative(packPath,file)}';\n`;
pack+=`export const norwegianPack={learningLanguage:'nb',supportLanguage:'ro',version:'2026.2',features:{\n`;
for(const [feature,file]of Object.entries(modules))pack+=` ${feature}:()=>${feature},\n`;
pack+=" keyboardRows:()=>['QWERTYUIOP','ASDFGHJKL','ZXCVBNM','ÆØÅ'],\n}};\n";
fs.writeFileSync(path.join(root,packPath),pack);
fs.writeFileSync(path.join(root,'src/content/activeContent.js'),`import {getLanguages} from '../languages/runtime.js';
import {createPackRegistry} from './packRegistry.js';
import {norwegianPack} from './norwegianPack.js';
const registry=createPackRegistry([norwegianPack]);
export const getContent=(feature)=>registry.get(getLanguages(),feature);
export const courseCatalog={};
for(const level of ['A1','A2','B1','B2','C1','C2'])Object.defineProperty(courseCatalog,level,{enumerable:true,get:()=>getContent('courses').courseCatalog[level]});
export const courseLessons=new Proxy([],{get:(_,key)=>Reflect.get(getContent('courses').courseLessons,key),has:(_,key)=>key in getContent('courses').courseLessons});
`);
const destinations=new Map();
for(const [feature,file]of Object.entries(features)){
 const output=`src/content/features/${feature}.js`;
 fs.writeFileSync(path.join(root,output),stripTypeScriptTypes(fs.readFileSync(path.join(android,`src/content/features/${feature}.ts`),'utf8'),{mode:'transform'}));
 destinations.set(path.resolve(root,file),output);
}
destinations.set(path.resolve(root,modules.courses),'src/content/activeContent.js');
for(const [feature,name]of [['grammar','norwegianGrammar'],['ruleGuides','norwegianRuleGuides'],['basicGuides','basicGuides']]){
 const output=`src/content/features/${feature}.js`;
 fs.writeFileSync(path.join(root,output),`import {contentValue} from '../contentValue';\nexport const ${name}=contentValue('${feature}','${name}');\n`);
 destinations.set(path.resolve(root,modules[feature]),output);
}
fs.writeFileSync(path.join(root,'src/content/features/summary.js'),"import {getContent} from '../activeContent';\nexport const buildLessonSummary=(...args)=>getContent('summary').buildLessonSummary(...args);\n");
destinations.set(path.resolve(root,modules.summary),'src/content/features/summary.js');
fs.writeFileSync(path.join(root,'src/content/features/scenarios.js'),"import {getContent} from '../activeContent';\nexport default new Proxy({},{get:(_,key)=>getContent('scenarios')[key]});\n");
destinations.set(path.resolve(root,modules.scenarios),'src/content/features/scenarios.js');
// Preserve the complete dependency graph of authored course algorithms. Only
// their UI consumers switch to the registry, avoiding import cycles and changes
// to the existing answer, hint, score and progression implementations.
const resolveImport=(file,spec)=>{
 if(!spec.startsWith('.'))return null;
 const p=path.resolve(path.dirname(file),spec);
 return [p,p+'.js',p+'.mjs',p+'.json'].find(f=>fs.existsSync(f)&&fs.statSync(f).isFile());
};
const imports=/\bfrom\s+['"]([^'"]+)['"]/g,authored=new Set();
function protect(file){if(authored.has(file))return;authored.add(file);if(file.endsWith('.json'))return;
 for(const m of fs.readFileSync(file,'utf8').matchAll(imports)){const dep=resolveImport(file,m[1]);if(dep)protect(dep);}}
for(const file of Object.values(modules))protect(path.resolve(root,file));
let count=0;
function visit(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
 const file=path.join(directory,entry.name);if(entry.isDirectory()){if(!['content','languages'].includes(entry.name))visit(file);continue;}
 if(!/\.(js|mjs)$/.test(file)||authored.has(file)||file.includes('.test.'))continue;
 const before=fs.readFileSync(file,'utf8');const after=before.replace(imports,(whole,spec)=>{const dest=destinations.get(resolveImport(file,spec));return dest?whole.replace(spec,relative(file,path.join(root,dest))):whole;});
 if(after!==before){fs.writeFileSync(file,after);count++;}
}}
visit(path.join(root,'src'));console.log(`Connected ${count} web consumers to authored content packs.`);
