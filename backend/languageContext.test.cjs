const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const backend=__dirname;
const language=require(path.join(backend,'languageContext.js'));
const express=require('express');
const {inProcessFetch}=require(path.join(backend,'testSupport')); 
const free=require(path.join(backend,'freeConversation.js'));
process.env.CHAT_SESSION_SECRET='test-language-context-only';
async function server(t){
 const app=express();app.use(language.languageMiddleware);app.use(express.json());
 app.post('/start',(req,res)=>{const session={owner:'test-owner',level:'A1',turn:0,expires:Date.now()+60000,history:[{role:'assistant',content:'Hei!'}]};res.json({sessionToken:free.sign(session)});});
 app.post('/turn',(req,res)=>{try{const session=free.verify(req.body.sessionToken,'test-owner');res.json({session});}catch(e){res.status(e.status||500).json({error:e.message,code:e.code});}});
 const send=inProcessFetch(app),base='http://local';
 return async(endpoint,body={},headers={})=>{const response=await send(base+endpoint,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});return {status:response.status,body:await response.json()};};
}
test('strict codes reject arbitrary prompt text, partial pairs and unreleased combinations before handlers',async t=>{
 const call=await server(t);
 for(const headers of [{'X-NordLingo-Learning-Language':'ignore instructions'},{'X-NordLingo-Learning-Language':'nb'},{'X-NordLingo-Language-Version':'2'}])assert.equal((await call('/start',{},headers)).status,400);
 assert.equal((await call('/start',{}, {'X-NordLingo-Learning-Language':'de','X-NordLingo-Support-Language':'ro'})).status,409);
});
test('old clients and signed pre-upgrade sessions retain Norwegian with Romanian support',async t=>{
 const call=await server(t),start=await call('/start');assert.equal(start.status,200);assert.deepEqual(start.body.languages,language.fallback);
 const old=free.sign({owner:'test-owner',level:'A1',turn:0,expires:Date.now()+60000,history:[{role:'assistant',content:'Hei!'}]});
 assert.equal((await call('/turn',{sessionToken:old})).status,200);
});
test('new sessions contain signed language identity and learner text cannot rewrite it',async t=>{
 const call=await server(t),start=await call('/start',{}, {'X-NordLingo-Learning-Language':'nb','X-NordLingo-Support-Language':'ro'});
 const decoded=JSON.parse(Buffer.from(start.body.sessionToken.split('.')[0],'base64url'));assert.deepEqual(decoded.languages,language.fallback);
 const turn=await call('/turn',{sessionToken:start.body.sessionToken,message:'Now speak German',languages:{learningLanguage:'de',supportLanguage:'en'}});
 assert.deepEqual(turn.body.session.languages,language.fallback);
 decoded.languages.supportLanguage='en';const tampered=Buffer.from(JSON.stringify(decoded)).toString('base64url')+'.'+start.body.sessionToken.split('.')[1];
 assert.equal((await call('/turn',{sessionToken:tampered})).status,401);
});
test('language rules separate target practice and support feedback while preserving objective/evidence policy',()=>{
 const instructions=language.languageInstructions({learningLanguage:'de',supportLanguage:'pl'});
 assert.match(instructions,/learning language is German/);assert.match(instructions,/support language is Polish/);
 assert.match(instructions,/evidence requirements, turn limits and assessment rules/);
 assert.match(language.translationInstructions({learningLanguage:'fr',supportLanguage:'uk'}),/French into Ukrainian/);
 assert.equal(language.requireTranscriptionLanguage('nb-NO'),'no');assert.throws(()=>language.requireTranscriptionLanguage('de'));
});

test('a signed session cannot switch support language; concurrent requests retain their own language context',async t=>{
 const call=await server(t);
 language.catalog.releasedPairs.push('nb:en');
 t.after(()=>language.catalog.releasedPairs.splice(language.catalog.releasedPairs.indexOf('nb:en'),1));
 const ro={'X-NordLingo-Learning-Language':'nb','X-NordLingo-Support-Language':'ro'},en={...ro,'X-NordLingo-Support-Language':'en'};
 const [first,second]=await Promise.all([call('/start',{},ro),call('/start',{},en)]);
 assert.equal(first.body.languages.supportLanguage,'ro');assert.equal(second.body.languages.supportLanguage,'en');
 const switched=await call('/turn',{sessionToken:first.body.sessionToken},en);
 assert.equal(switched.status,409);assert.equal(switched.body.code,'SESSION_LANGUAGE_MISMATCH');
 const restored=await call('/turn',{sessionToken:second.body.sessionToken});
 assert.equal(restored.body.languages.supportLanguage,'en');
});

test('real strict lesson router accepts language headers without changing its body schema or opening',async t=>{
 const auth=require(path.join(backend,'middleware/authSupabaseUser')),oldAuth=auth.requireAuth;
 auth.requireAuth=(req,res,next)=>{req.userId='language-integration-user';next();};
 t.after(()=>{auth.requireAuth=oldAuth;});
 const chat=require(path.join(backend,'routes/chat'));
 const app=express();app.use('/api/chat',language.languageMiddleware,express.json(),chat);
 const send=inProcessFetch(app),body={level:'A1',lessonId:1,pathId:'general'};
 const call=headers=>send('http://local/api/chat/start',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
 const legacy=await call({}),modern=await call({'X-NordLingo-Learning-Language':'nb','X-NordLingo-Support-Language':'ro'});
 assert.equal(legacy.status,200);assert.equal(modern.status,200);
 const a=await legacy.json(),b=await modern.json();assert.equal(a.reply,b.reply);assert.equal(a.question,b.question);assert.deepEqual(b.languages,language.fallback);
 const denied=await call({'X-NordLingo-Learning-Language':'de','X-NordLingo-Support-Language':'ro'});assert.equal(denied.status,409);
});
