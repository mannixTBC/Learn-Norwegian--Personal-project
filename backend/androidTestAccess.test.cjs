const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {createRequire}=require('node:module');
const path=require('node:path');
const {isAndroidTestUser}=require('./androidTestAccess');
const {consumeChatQuota}=require('./chatUsage');
const {createTranscriptionGuard}=require('./deepgramTranscription');
const account=()=>({headers:{'x-nordlingo-client':'android'},userId:'test-account',verifiedUser:{id:'test-account',is_anonymous:false}});

test('test access requires the flag, Android and an authoritative non-anonymous account',async t=>{
 const prior=process.env.ANDROID_TEST_UNLIMITED;t.after(()=>{if(prior===undefined)delete process.env.ANDROID_TEST_UNLIMITED;else process.env.ANDROID_TEST_UNLIMITED=prior;});
 process.env.ANDROID_TEST_UNLIMITED='true';assert.equal(isAndroidTestUser(account()),true);
 for(const req of [{headers:account().headers}, {...account(),verifiedUser:undefined},{...account(),verifiedUser:{id:'test-account',is_anonymous:true}},{...account(),verifiedUser:{id:'other',is_anonymous:false}},{...account(),headers:{'x-nordlingo-client':'ios'}},{...account(),headers:{}}])assert.equal(!!isAndroidTestUser(req),false);
 for(let i=0;i<150;i++)assert.equal((await consumeChatQuota(account())).source,'android-test');
 process.env.ANDROID_TEST_UNLIMITED='false';assert.equal(isAndroidTestUser(account()),false);
});
test('Android transcription testing removes frequency caps but not overlapping recordings',()=>{
 const reserve=createTranscriptionGuard(()=>1000);
 for(let i=0;i<50;i++)reserve('test-account',true)();
 const release=reserve('test-account',true);assert.throws(()=>reserve('test-account',true),e=>e.status===429);release();
 for(let i=0;i<6;i++)reserve('web-account')();assert.throws(()=>reserve('web-account'),e=>e.status===429);
});
test('Android auth rejects anonymous, expired and revoked sessions, including turn requests',async()=>{
 const filename=path.join(__dirname,'middleware/authSupabaseUser.js'),realRequire=createRequire(filename);
 let user={id:'account',is_anonymous:false},error=null,claimCalls=0,userCalls=0;
 const mock={auth:{getUser:async()=>{userCalls++;return {data:{user},error};},getClaims:async()=>{claimCalls++;throw Error('cached claims should not replace the live check');}}};
 const box={module:{exports:{}},process:{env:{VITE_SUPABASE_URL:'https://example.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:'public'}},require:id=>id==='@supabase/supabase-js'?{createClient:()=>mock}:realRequire(id)};
 vm.runInNewContext(fs.readFileSync(filename,'utf8'),box,{filename});
 const {requireAuth,requireTurnClaims}=box.module.exports;
 async function check(handler,headers){const req={headers},res={status(n){this.code=n;return this},json(body){this.body=body;return this}};let accepted=false;await handler(req,res,()=>{accepted=true;});return {req,res,accepted};}
 const headers={authorization:'Bearer test-token','x-nordlingo-client':'android'};
 assert.equal((await check(requireAuth,{})).res.code,401);
 assert.equal((await check(requireAuth,headers)).accepted,true);
 user={id:'anonymous',is_anonymous:true};assert.equal((await check(requireAuth,headers)).res.code,403);assert.equal((await check(requireTurnClaims,headers)).res.code,403);assert.equal((await check(requireAuth,{authorization:'Bearer test-token'})).res.code,403);
 user=null;error={message:'revoked'};assert.equal((await check(requireTurnClaims,headers)).res.code,401);assert.equal(claimCalls,0);assert.ok(userCalls>=3);
});

test('free-dialogue session verification supports later turns only for Android test access',()=>{
 const prior=process.env.CHAT_SESSION_SECRET;process.env.CHAT_SESSION_SECRET='android-session-test-secret';
 try{
  const {sign,verify}=require('./freeConversation');
  const token=sign({owner:'test-account',level:'A1',turn:31,expires:Date.now()+60000,history:[{role:'assistant',content:'Hei'}]});
  assert.throws(()=>verify(token,'test-account'));assert.equal(verify(token,'test-account',true).turn,31);assert.throws(()=>verify(token,'other',true));
 }finally{if(prior===undefined)delete process.env.CHAT_SESSION_SECRET;else process.env.CHAT_SESSION_SECRET=prior;}
});
