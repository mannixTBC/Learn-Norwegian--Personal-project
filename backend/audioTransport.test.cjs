const {test}=require('node:test');
const assert=require('node:assert/strict');
test('deployed API preserves MP3 bytes and keeps JSON textual',async()=>{
 const express=require('express'),app=express();
 const mp3=Buffer.from([0x49,0x44,0x33,0xff,0xfb,0x90,0x00,0x80,0xc0]);
 app.get('/audio',(_,res)=>res.type('audio/mpeg').send(mp3));
 app.get('/json',(_,res)=>res.json({ok:true}));
 const path=require.resolve('./app'),previous=require.cache[path];
 require.cache[path]={id:path,filename:path,loaded:true,exports:app};
 try{
  const {handler}=require('../netlify/functions/api');
  const invoke=path=>handler({httpMethod:'GET',path,headers:{},requestContext:{},body:null},{});
  const audio=await invoke('/audio');
  assert.equal(audio.statusCode,200);assert.equal(audio.isBase64Encoded,true);
  assert.deepEqual(Buffer.from(audio.body,'base64'),mp3);
  const json=await invoke('/json');assert.equal(json.isBase64Encoded,false);
  assert.deepEqual(JSON.parse(json.body),{ok:true});
 }finally{if(previous)require.cache[path]=previous;else delete require.cache[path];}
});
