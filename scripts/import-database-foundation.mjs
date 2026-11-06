// One-time, read-only import of the reviewed Android database foundation.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const source=process.argv[2];
if(!source)throw new Error('Pass the Android source directory');
const root=path.resolve(import.meta.dirname,'..');
if(fs.existsSync(path.join(root,'src/data/courseIdentity.js')))throw new Error('Already imported; review subsequent changes manually');
const read=file=>fs.readFileSync(path.join(source,file),'utf8');
const write=(file,text)=>{fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),text);};
const ts=createRequire(path.join(source,'package.json'))('typescript');
for(const name of ['courseIdentity','courseRepository']){
 let text=ts.transpileModule(read(`src/data/${name}.ts`),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 text=text.replace("'../content/generated/course-manifest.json'","'../content/generated/course-manifest.json' with {type:'json'}")
  .replace("'../languages/runtime'","'../languages/runtime.js'");
 write(`src/data/${name}.js`,text);
}
write('src/data/contentCodec.mjs',read('src/data/contentCodec.mjs'));
write('src/content/generated/course-manifest.json',read('src/content/generated/course-manifest.json'));
for(const name of ['courseContext','knowledge'])write(`backend/${name}.cjs`,read(`integrations/database/backend/${name}.cjs`));
write('backend/knowledge.test.cjs',read('integrations/database/tests/knowledge.test.cjs').replaceAll('../backend/','./'));
for(const name of ['schema_relational.sql','schema_progress_bridge.sql','schema_knowledge.sql'])write(`supabase/${name}`,read(`integrations/database/${name}`));
for(const name of fs.readdirSync(path.join(source,'integrations/database/supabase/migrations')))write(`supabase/migrations/${name}`,read(`integrations/database/supabase/migrations/${name}`));
write('supabase/generated/content.json',read('integrations/database/generated/content.json'));
write('supabase/generated/seed.sql',read('integrations/database/generated/seed.sql'));
console.log('Imported database foundation; Android remains unchanged.');
