const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const express=require('express');
const root=path.resolve(__dirname, '..');
const {inProcessFetch}=require(path.join(root,'testSupport'));
const auth=require(path.join(root,'middleware/authSupabaseUser'));
const originalAuth=auth.requireAuth;
auth.requireAuth=(req,res,next)=>{
 if(req.headers.authorization!=='Bearer stt-test')return res.status(401).json({error:'Authentication required'});
 req.userId='stt-test-user';next();
};
const transcription=require(path.join(root,'routes/transcription'));
const practice=require(path.join(root,'routes/voicePractice'));
auth.requireAuth=originalAuth;

test('authenticated mobile M4A reaches Deepgram; rejected requests never call a provider',async t=>{
 const before={key:process.env.DEEPGRAM_API_KEY,provider:process.env.VOICE_STT_PROVIDER,region:process.env.DEEPGRAM_REGION},realFetch=global.fetch;
 t.after(()=>{global.fetch=realFetch;for(const[name,key]of [['DEEPGRAM_API_KEY','key'],['VOICE_STT_PROVIDER','provider'],['DEEPGRAM_REGION','region']]){if(before[key]===undefined)delete process.env[name];else process.env[name]=before[key];}});
 process.env.DEEPGRAM_API_KEY='synthetic-deepgram-key';process.env.VOICE_STT_PROVIDER='deepgram';process.env.DEEPGRAM_REGION='eu';
 const app=express();app.use('/api/transcription',express.json({limit:'1400kb'}),transcription);
 const send=inProcessFetch(app),audio={audioBase64:Buffer.alloc(200,1).toString('base64'),mimeType:'audio/mp4',duration:2,language:'nb-NO'};
 const request=(body=audio,token='stt-test')=>send('http://local/api/transcription',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)});
 let calls=0;global.fetch=async(url,options)=>{calls++;assert.match(url,/^https:\/\/api\.eu\.deepgram\.com\/v1\/listen/);assert.equal(options.body.length,200);return {ok:true,json:async()=>({results:{channels:[{alternatives:[{transcript:'Hvor er bussen?',words:[]}]}]}})};};
 assert.equal((await request(audio,null)).status,401);assert.equal((await request({...audio,duration:80})).status,400);assert.equal(calls,0);
 const result=await request();assert.equal(result.status,200);assert.equal(result.headers.get('Cache-Control'),'no-store');
 assert.equal((await result.json()).text,'Hvor er bussen?');assert.equal(calls,1);
 delete process.env.DEEPGRAM_API_KEY;assert.equal((await request()).status,503);assert.equal(calls,1);
});

test('existing lesson route uses Deepgram while retaining signed-session and confirmation checks',async t=>{
 const before={...process.env},realFetch=global.fetch;
 t.after(()=>{global.fetch=realFetch;for(const key of ['DEEPGRAM_API_KEY','VOICE_STT_PROVIDER','OPENAI_API_KEY','NODE_ENV','DEEPGRAM_REGION']){if(before[key]===undefined)delete process.env[key];else process.env[key]=before[key];}});
 Object.assign(process.env,{DEEPGRAM_API_KEY:'synthetic-deepgram-key',VOICE_STT_PROVIDER:'deepgram',OPENAI_API_KEY:'synthetic-signing-key',NODE_ENV:'production',DEEPGRAM_REGION:'eu'});
 const app=express();app.use('/practice',express.json({limit:'6mb'}),practice);const send=inProcessFetch(app);
 const request=(operation,body)=>send('http://local/practice/'+operation,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer stt-test'},body:JSON.stringify(body)});
 const lesson={level:'A1',lessonId:1,pathId:'general'},chat=require(path.join(root,'chatTutor'));
 const started=await request('start',lesson);assert.equal(started.status,200);const voice=await started.json();
 const session=chat.newSession(chat.lessonFor(lesson),'stt-test-user').session,dialogToken=chat.signSession(session);
 let calls=0;global.fetch=async url=>{calls++;assert.match(url,/api\.eu\.deepgram\.com/);return {ok:true,json:async()=>({results:{channels:[{detected_language:'no',alternatives:[{transcript:'Jeg heter Ana.',words:[]}]}]}})};};
 const body={sessionToken:voice.sessionToken,dialogToken,index:session.turn,audioBase64:Buffer.alloc(200,2).toString('base64'),mimeType:'audio/mp4',duration:2};
 assert.equal((await request('transcribe',{...body,dialogToken:'invalid'})).status,401);assert.equal(calls,0);
 const response=await request('transcribe',body);assert.equal(response.status,200);const transcript=await response.json();
 assert.equal(transcript.decision,'accept');assert.equal(transcript.text,'Jeg heter Ana.');assert.ok(transcript.proof);
 await request('transcribe',body);assert.equal(calls,1,'a repeated upload for the same signed turn reuses the result');
});
