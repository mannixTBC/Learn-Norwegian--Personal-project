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
  const catalog=await response.json();assert.equal(catalog.scenarios.length,9);assert.equal(catalog.scenarios.filter(s=>s.kind==='free').length,6);
  assert.ok(!JSON.stringify(catalog).includes('35 NOK'));
  for(let i=0;i<11;i++){
   const result=await fetch(url+'/sessions',{method:'POST',headers:{Authorization:'test','Content-Type':'application/json'},body:'{}'});
   assert.equal(result.status,i===10?429:400);
  }
  assert.equal(cleanup,1);
 }finally{await new Promise(r=>server.close(r));}
});
