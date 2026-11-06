import fs from 'node:fs';
import path from 'node:path';
import {stripTypeScriptTypes} from 'node:module';
const source=process.argv[2];
if(!source)throw Error('Pass the read-only Android checkout path.');
const root=path.resolve(import.meta.dirname,'..');
if(fs.existsSync(path.join(root,'src/languages/config.js')))throw Error('The web language foundation already exists. Review updates manually; do not overwrite web adaptations.');
for(const directory of ['src/languages/messages','src/content','backend'])fs.mkdirSync(path.join(root,directory),{recursive:true});
for(const name of ['config','runtime','apiContext','messages']){
 const input=fs.readFileSync(path.join(source,`src/languages/${name}.ts`),'utf8');
 fs.writeFileSync(path.join(root,`src/languages/${name}.js`),stripTypeScriptTypes(input,{mode:'transform'}));
}
for(const file of ['catalog.json','messages/ro.json'])fs.copyFileSync(path.join(source,'src/languages',file),path.join(root,'src/languages',file));
for(const name of ['packRegistry','contentValue'])fs.writeFileSync(path.join(root,`src/content/${name}.js`),stripTypeScriptTypes(fs.readFileSync(path.join(source,`src/content/${name}.ts`),'utf8'),{mode:'transform'}));
let test=fs.readFileSync(path.join(source,'integrations/languages/tests/context.test.cjs'),'utf8');
test=test.replace('const backend=process.env.NORDLINGO_STAGED_BACKEND;','const backend=__dirname;');
fs.writeFileSync(path.join(root,'backend/languageContext.test.cjs'),test);
console.log('Imported language contracts and backend tests; Android remains read-only.');
