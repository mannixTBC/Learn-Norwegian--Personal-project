const {test}=require('node:test');
const assert=require('node:assert/strict');
test('lesson audio selects roles, caches audio, validates input and preserves provider errors',async()=>{
  process.env.CARTESIA_API_KEY='test-key';process.env.CARTESIA_VOICE_ID='anna-test';
  const original=global.fetch;const calls=[];
  global.fetch=async(url,options)=>{calls.push(JSON.parse(options.body));return new Response(Buffer.from('audio'));};
  try{
    const {handler}=require('../netlify/functions/speech');
    const request=(body)=>handler({httpMethod:'POST',body:JSON.stringify(body)});
    const a=await request({provider:'cartesia',text:'Hei!',voice:'female'});
    assert.equal(a.statusCode,200);assert.equal(a.headers['X-Audio-Provider'],'cartesia');
    assert.equal(calls[0].voice,'anna-test');assert.equal(calls[0].locale,'no-NO');
    assert.equal(Buffer.from(a.body,'base64').toString(),'audio');
    const cached=await request({provider:'cartesia',text:'Hei!',voice:'female'});
    assert.equal(cached.headers['X-Audio-Provider'],'cartesia-cache');assert.equal(calls.length,1);
    await request({provider:'cartesia',text:'Hei!',voice:'male'});
    assert.notEqual(calls[1].voice,calls[0].voice);
    assert.equal((await request({provider:'cartesia',text:' '})).statusCode,400);
    assert.equal((await request({provider:'cartesia',text:'x'.repeat(3001)})).statusCode,413);
    assert.equal((await request({provider:'cartesia',text:'Hei',learningLanguage:'xx',supportLanguage:'ro'})).statusCode,400);
    global.fetch=async()=>new Response('private upstream details',{status:401});
    const failed=await request({provider:'cartesia',text:'Different text'});
    assert.equal(failed.statusCode,502);assert.ok(!failed.body.includes('private upstream'));
  }finally{global.fetch=original;delete process.env.CARTESIA_API_KEY;delete process.env.CARTESIA_VOICE_ID;}
});
