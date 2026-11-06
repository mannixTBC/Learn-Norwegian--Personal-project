import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const databaseContent=()=>JSON.parse(fs.readFileSync(path.join(root,'supabase/generated/content.json'),'utf8')); const seedSql=()=>fs.readFileSync(path.join(root,'supabase/generated/seed.sql'),'utf8');
const root=path.resolve(import.meta.dirname,'..');
// Test dependencies live outside the app bundle. Alternatively set NORDLINGO_SQL_TOOLS
// to a node_modules directory with the pinned PGlite packages in docs/DATABASE.md.
const toolRoot=process.env.NORDLINGO_SQL_TOOLS;
const archiveRoot=process.env.NORDLINGO_DATABASE_TOOL_ROOT||path.join(root,'.tools/database');
const engine=toolRoot?path.join(toolRoot,'@electric-sql/pglite/dist/index.js'):path.join(archiveRoot,'pglite/package/dist/index.js');
const vectorFile=toolRoot?path.join(toolRoot,'@electric-sql/pglite-pgvector/dist/index.js'):path.join(archiveRoot,'vector/package/dist/index.js');
const {PGlite}=await import(pathToFileURL(engine).href);
const {vector}=await import(pathToFileURL(vectorFile).href);
const db=new PGlite({extensions:{vector}});
const migrationDirectory=path.join(root,'supabase/migrations');
const migration=name=>fs.readFileSync(path.join(migrationDirectory,fs.readdirSync(migrationDirectory).find(file=>file.endsWith(`_${name}.sql`))),'utf8');
const user='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
const key=suffix=>`curriculum_2026.2_${user}_${suffix}`;
const scenarioKey=`scenario_result_v1_${user}_A1_bus-delay_${'a'.repeat(64)}`;
const legacy={
  [key('a1_progress')]:{completed:[1,2],unlocked:3},[key('a1_final_best')]:80,[key('a1_final_passed')]:true,
  [key('a1_3_resume_voice_v1_responses')]:{'0':'draft'},
  [scenarioKey]:{version:1,definition:'legacy definition',achieved:[0],endReason:'turn_limit',turn:7,date:'2026-11-06T12:00:00.000Z'},
  unknown_historical_field:{kept:true},
};
const query=async(text,params=[])=>(await db.query(text,params)).rows;
let assertions=0;
const check=(actual,expected)=>{assert.deepEqual(actual,expected);assertions++;};
async function denied(statement){await assert.rejects(()=>db.exec(statement),/permission denied|row-level security|invalid progress owner|unsupported retrieval purpose/);assertions++;}
try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth to anon,authenticated,service_role;
    grant execute on function auth.uid() to anon,authenticated,service_role;
    create table public.learning_progress(user_id uuid primary key references auth.users, state jsonb not null default '{}');
    create table public.study_activity(user_id uuid not null references auth.users,client_event_id text,metadata jsonb not null default '{}',occurred_at timestamptz default now());
    alter table public.learning_progress enable row level security;
    alter table public.study_activity enable row level security;
    create policy owner on public.learning_progress to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
    create policy owner on public.study_activity to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
    grant select,insert,update on public.learning_progress,public.study_activity to authenticated;
    grant all on public.learning_progress,public.study_activity to service_role;
    create function public.merge_curriculum_state(jsonb,jsonb) returns jsonb language sql as $$ select $1||$2 $$;
    insert into auth.users values('${user}'),('${other}');`);
  await db.exec(fs.readFileSync(path.join(root,'supabase/schema_language_progress.sql'),'utf8'));
  await query('insert into public.learning_progress(user_id,state) values($1,$2)',[user,legacy]);
  await db.exec(migration('relational_learning'));
  const data=databaseContent();await db.exec(seedSql(data));
  check((await query('select count(*)::int as n from public.nl_content_items'))[0].n,1350);
  check((await query('select state from learning_progress where user_id=$1',[user]))[0].state,legacy);
  check((await query('select count(*)::int as n from nl_lesson_progress where completed'))[0].n,2);
  check((await query('select resume from nl_lesson_progress where item_id=$1',['a1-contact-details']))[0].resume,{resume_voice_v1_responses:{'0':'draft'}});
  check((await query('select count(*)::int as n from nl_scenario_attempts'))[0].n,1);
  check((await query('select final_best,final_passed from nl_level_progress'))[0],{final_best:80,final_passed:true});

  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${user}',false);`);
  await query('select patch_learning_progress($1)',[{[key('a1_progress')]:{completed:[2,3,999],unlocked:4},[key('a1_final_best')]:70}]);
  check((await query('select state from learning_progress'))[0].state[key('a1_progress')],{completed:[1,2,3],unlocked:4});
  check((await query('select final_best from nl_level_progress'))[0].final_best,80);
  await query('select patch_scenario_results($1)',[{[scenarioKey]:{...legacy[scenarioKey],achieved:[0,1,2]}}]);
  check((await query('select result from nl_scenario_attempts'))[0].result.achieved,[0]);
  const remote=(await query("select nl_course_level('nb-general','2026.2','A1','ro') as data"))[0].data;
  check(remote.items.length,25);
  check((await query("select nl_course_level('nb-general','2026.2','A1','pl') as data"))[0].data.items,[]);
  await denied(`insert into nl_enrollments(user_id,course_id,last_version) values('${other}','nb-general','2026.2')`);
  await denied(`select nl_private.project_progress('${other}','{}')`);
  await denied(`update nl_lesson_progress set user_id='${other}'`);
  await denied(`update nl_content_items set payload='{}'`);
  await denied(`select * from nl_ai_profiles`);
  await db.exec(`select set_config('request.jwt.claim.sub','${other}',false)`);
  check((await query('select * from nl_lesson_progress')).length,0);
  check((await query('select * from learning_progress')).length,0);
  await db.exec('reset role');

  // A second support language reuses content rows and the same learner progress.
  await db.exec(`insert into nl_content_translations(course_id,version,item_id,support_language,status,strings)
    select t.course_id,t.version,t.item_id,'en','published',t.strings from nl_content_translations t join nl_content_items i
      using(course_id,version,item_id) where i.level='A1' and i.kind in ('level','lesson') and t.support_language='ro';
    set role authenticated; select set_config('request.jwt.claim.sub','${user}',false);`);
  check((await query("select nl_course_level('nb-general','2026.2','A1','en') as data"))[0].data.items.length,25);
  check((await query('select count(*)::int as n from nl_content_items'))[0].n,1350);
  check((await query('select count(*)::int as n from nl_lesson_progress where completed'))[0].n,3);
  await db.exec('reset role');

  // A 30-lesson course proves IDs and unlocking are driven by catalog data.
  await db.exec(`insert into nl_courses values('de-general','de','published');
    insert into nl_course_releases(course_id,version,status) values('de-general','2026.2','published');
    insert into nl_content_items(course_id,version,item_id,kind,level,position,legacy_id,payload,content_hash)
      select 'de-general','2026.2','de-lesson-'||n,'lesson','A1',n,n,'{}',repeat('a',64) from generate_series(1,30) n;
    set role authenticated; select set_config('request.jwt.claim.sub','${user}',false);`);
  const germanKey='course:de:'+key('a1_progress');
  await query('select patch_learning_progress($1)',[{[germanKey]:{completed:[25,30],unlocked:30}}]);
  check((await query('select state from learning_progress'))[0].state[germanKey],{completed:[25,30],unlocked:30});
  check((await query("select count(*)::int as n from nl_lesson_progress where course_id='de-general' and completed"))[0].n,2);
  check((await query("select count(*)::int as n from nl_lesson_progress where course_id='nb-general' and completed"))[0].n,3);
  await query('insert into study_activity(user_id,client_event_id,metadata) values($1,$2,$3)',[user,'new-event',{learningLanguage:'de',courseVersion:'2026.2'}]);
  check((await query('select course_id,course_version from study_activity'))[0],{course_id:'de-general',course_version:'2026.2'});
  await db.exec('reset role');

  await db.exec(migration('nora_knowledge'));
  const embedding='['+[1,...Array(1535).fill(0)].join(',')+']';
  await query(`insert into nl_knowledge_chunks(course_id,version,item_id,chunk_id,support_language,level,purpose,model_id,content_hash,body,embedding)
    values('nb-general','2026.2','a1-greetings','greetings:grammar','ro','A1','information','test-model',$1,'Reference grammar',$2)`,['a'.repeat(64),embedding]);
  const match="select * from nl_match_knowledge('nb-general','2026.2',$1,'A1',$2,'test-model',$3,$4,4)";
  await db.exec('set role service_role');
  check((await query(match,['ro','information',embedding,['a1-greetings']])).length,1);
  check((await query(match,['pl','information',embedding,['a1-greetings']])).length,0);
  check((await query(match,['ro','information',embedding,[]])).length,0);
  await assert.rejects(()=>query(match,['ro','recap',embedding,['a1-greetings']]),/unsupported retrieval purpose/);assertions++;
  await db.exec('reset role; set role authenticated');
  await denied('select * from nl_knowledge_chunks');
  await assert.rejects(()=>query(match,['ro','information',embedding,['a1-greetings']]),/permission denied/);assertions++;
  await db.exec('reset role; set role anon');
  await denied('select * from nl_lesson_progress');await denied('select * from nl_content_items');
  await db.exec('reset role');
  const unprotected=await query("select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relname like 'nl_%' and not c.relrowsecurity");
  check(unprotected,[]);
  console.log(`PASS: ${assertions} PostgreSQL assertions: additive migration, unchanged legacy state, idempotent seed, RLS, cross-course progress, 30 lessons, private vector filters and recap exclusion.`);
} catch(error) {console.error('SQL verification failed:',error.message,error.where||'');process.exitCode=1;}
finally {await db.close();}
