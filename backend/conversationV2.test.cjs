const test=require('node:test');
const assert=require('node:assert/strict');
const express=require('express');
const {mount,createLiveQuota}=require('./conversationV2');
test('live quota releases the text lease on success and failure without recording audio as text',async()=>{
 for(const fail of [false,true]){
  const events=[],req={};const quota=createLiveQuota(async value=>{assert.equal(value,req);events.push('reserve');if(fail)throw Error('denied');},async(value,usage)=>{assert.equal(value,req);assert.equal(usage,null);events.push('release');});
  if(fail)await assert.rejects(quota(req),/denied/);else await quota(req);
  assert.deepEqual(events,['reserve','release']);
 }
});
test('production mount exposes only the V2 catalog, requires auth and bounds session creation',async()=>{
 process.env.CONVERSATION_V2_ENABLED='true';process.env.VITE_SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SERVICE_ROLE_KEY='test-server-key';
 const app=express();let cleanup=0;
 const client={rpc:()=>{throw Error('Unexpected database write');},from:table=>{assert.equal(table,'nl_conversation_v2_sessions');return {delete:()=>({lt:(column,cutoff)=>{assert.equal(column,'expires_at');assert.ok(Date.parse(cutoff)<Date.now()-29*86400000);return {abortSignal:async()=>{cleanup++;return {error:null};}};}})};}};
 const authenticate=(req,res,next)=>{if(!req.headers.authorization)return res.status(401).json({code:'AUTH_REQUIRED'});req.userId='11111111-1111-4111-8111-111111111111';next();};
 assert.equal(mount(app,express,{client,authenticate}),true);
 const server=app.listen(0);await new Promise(r=>server.once('listening',r));const url=`http://127.0.0.1:${server.address().port}/api/conversations/v2`;
 try{
  assert.equal((await fetch(url+'/catalog?supportLanguage=ro')).status,401);
  const response=await fetch(url+'/catalog?supportLanguage=ro',{headers:{Authorization:'test'}});assert.equal(response.status,200);
  const catalog=await response.json();assert.equal(catalog.scenarios.length,247);assert.equal(catalog.scenarios.filter(s=>s.kind==='free').length,6);
  // Every practical family is published with a reference variant and at least one harder one.
  const practical=catalog.scenarios.filter(s=>s.kind==='scenario'&&s.id.startsWith('practice-'));
  for(const id of new Set(practical.map(s=>s.id)))assert.ok(practical.filter(s=>s.id===id).length>=2,id);
  const updated=catalog.scenarios.find(s=>s.version>1);assert.ok(updated);
  assert.ok(catalog.scenarios.filter(s=>s.id===updated.id).every(s=>s.version===updated.version));
  // A session started on the replaced version can still resolve its definition.
  const previous=await fetch(url+`/catalog?supportLanguage=ro&scenarioId=${updated.id}&scenarioVersion=${updated.version-1}`,{headers:{Authorization:'test'}});
  assert.equal(previous.status,200);const pinned=await previous.json();assert.ok(pinned.scenarios.length>=1);assert.ok(pinned.scenarios.every(s=>s.version===updated.version-1));
  // One level on request; an unknown level is rejected.
  const one=await (await fetch(url+'/catalog?supportLanguage=ro&level=B1',{headers:{Authorization:'test'}})).json();
  assert.ok(one.scenarios.length>0&&one.scenarios.length<catalog.scenarios.length&&one.scenarios.every(s=>s.level==='B1'));
  assert.equal((await fetch(url+'/catalog?supportLanguage=ro&level=Z9',{headers:{Authorization:'test'}})).status,400);
  assert.equal((await fetch(url+'/catalog?supportLanguage=ro&scenarioVersion=wrong',{headers:{Authorization:'test'}})).status,400);
  assert.ok(!JSON.stringify(catalog).includes('35 NOK'));
  const {learningLanguages,supportLanguages,supportedPair}=await import('./conversation-v2/languages.mjs');
  for(const learning of Object.keys(learningLanguages))for(const support of Object.keys(supportLanguages)){
   if(!supportedPair(learning,support))continue;
   const result=await fetch(url+`/catalog?learningLanguage=${learning}&supportLanguage=${support}`,{headers:{Authorization:'test'}});
   assert.equal(result.status,200);const rows=(await result.json()).scenarios;
   for(const level of ['A1','A2','B1','B2','C1','C2']){
    const practical=rows.filter(s=>s.kind==='scenario'&&s.level===level);
    assert.ok(new Set(practical.map(s=>s.familyId)).size>=13,`${learning}:${support}/${level}`);
    assert.ok(practical.every(s=>s.learningLanguage===learning&&s.supportLanguage===support));
   }
  }
  for(let i=0;i<11;i++){
   const result=await fetch(url+'/sessions',{method:'POST',headers:{Authorization:'test','Content-Type':'application/json'},body:'{}'});
   assert.equal(result.status,i===10?429:400);
  }
  assert.equal(cleanup,1);
 }finally{await new Promise(r=>server.close(r));}
});
