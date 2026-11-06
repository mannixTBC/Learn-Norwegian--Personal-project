const {test}=require('node:test');
const assert=require('node:assert/strict');
const {transcribeDeepgram,validateAudio,deepgramEnabled,languageCode,normalizeTranscript,createTranscriptionGuard}=require('./deepgramTranscription');
const payload=(text='Jeg heter Ana.')=>({results:{channels:[{alternatives:[{transcript:text,confidence:.94,words:[{word:'jeg',punctuated_word:'Jeg',start:0,end:.4,confidence:.98}]}]}]}});
function env(t,values={}){
 const before={};for(const [key,value]of Object.entries({DEEPGRAM_API_KEY:'test-only-key',DEEPGRAM_REGION:'eu',VOICE_STT_PROVIDER:'deepgram',...values})){
  before[key]=process.env[key];if(value===undefined)delete process.env[key];else process.env[key]=value;
 }t.after(()=>{for(const[key,value]of Object.entries(before)){if(value===undefined)delete process.env[key];else process.env[key]=value;}});
}
test('sends the raw M4A bytes to EU Nova-3 with a server-only key and Norwegian language',async t=>{
 env(t);const audio=Buffer.alloc(120,1);let calls=0;
 const result=await transcribeDeepgram({audio,mimeType:'audio/mp4',language:'nb-NO'},async(raw,options)=>{
  calls++;const url=new URL(raw);assert.equal(url.origin,'https://api.eu.deepgram.com');assert.equal(url.pathname,'/v1/listen');
  assert.equal(url.searchParams.get('model'),'nova-3');assert.equal(url.searchParams.get('language'),'no');assert.equal(url.searchParams.has('keyterm'),false);
  assert.equal(options.headers.Authorization,'Token test-only-key');assert.equal(options.headers['Content-Type'],'audio/mp4');assert.equal(options.body,audio);
  return {ok:true,json:async()=>payload()};
 });
 assert.equal(calls,1);assert.equal(result.text,'Jeg heter Ana.');assert.equal(result.provider,'deepgram-nova-3');
 assert.deepEqual(result.languages,[],'forced Norwegian is not claimed as detected Norwegian');
 assert.equal(result.words[0].text,'Jeg');assert.equal(JSON.stringify(result).includes('test-only-key'),false);
});
test('lesson transcription preserves independently detected Romanian/Norwegian signals',async t=>{
 env(t);
 const result=await transcribeDeepgram({audio:Buffer.alloc(120),mimeType:'audio/webm',detectLanguages:['nb','ro']},async(raw)=>{
  const url=new URL(raw);assert.deepEqual(url.searchParams.getAll('detect_language'),['no','ro']);assert.equal(url.searchParams.has('language'),false);
  const data=payload('Mă numesc Ana.');data.results.channels[0].detected_language='ro';return {ok:true,json:async()=>data};
 });assert.deepEqual(result.languages,[{code:'ro'}]);
});
test('missing key fails before making a paid request; provider selection is explicit',async t=>{
 env(t,{DEEPGRAM_API_KEY:undefined});let calls=0;
 await assert.rejects(transcribeDeepgram({audio:Buffer.alloc(120),mimeType:'audio/mp4'},async()=>{calls++;}),{code:'STT_NOT_CONFIGURED'});
 assert.equal(calls,0);assert.equal(deepgramEnabled(),true);
 delete process.env.VOICE_STT_PROVIDER;assert.equal(deepgramEnabled(),false);
});
test('provider access, quota, malformed results and network failures return safe errors',async t=>{
 env(t);
 for(const[status,code]of [[401,'STT_PROVIDER_ACCESS'],[402,'STT_PROVIDER_ACCESS'],[403,'STT_PROVIDER_ACCESS'],[429,'STT_RATE_LIMIT'],[500,'STT_PROVIDER_ERROR']]){
  await assert.rejects(transcribeDeepgram({audio:Buffer.alloc(120),mimeType:'audio/mp4'},async()=>({ok:false,status,json:async()=>({secret:'test-only-key'})})),error=>error.code===code&&!error.message.includes('test-only-key'));
 }
 await assert.rejects(transcribeDeepgram({audio:Buffer.alloc(120),mimeType:'audio/mp4'},async()=>({ok:true,json:async()=>({})})),{code:'STT_RESPONSE_INVALID'});
 await assert.rejects(transcribeDeepgram({audio:Buffer.alloc(120),mimeType:'audio/mp4'},async()=>{throw new Error('Secret provider diagnostics');}),{code:'STT_NETWORK'});
 assert.equal(normalizeTranscript(payload(''),'no').text,'');
});
test('language/region allowlists cannot turn the server into an arbitrary proxy',async t=>{
 env(t,{DEEPGRAM_REGION:'https://example.com'});let calls=0;
 await assert.rejects(transcribeDeepgram({audio:Buffer.alloc(120),mimeType:'audio/mp4'},async()=>{calls++;}),{code:'STT_CONFIGURATION'});
 assert.equal(calls,0);assert.throws(()=>languageCode('xx'),{code:'STT_LANGUAGE'});assert.throws(()=>languageCode({}),{code:'STT_LANGUAGE'});
});
test('audio checks reject malformed base64, excess bytes, bad duration and unsupported MIME',()=>{
 const good={audioBase64:Buffer.alloc(120,1).toString('base64'),mimeType:'audio/mp4',duration:2};
 assert.equal(validateAudio(good).audio.length,120);
 for(const change of [{audioBase64:'data:audio/mp4;base64,AA=='},{audioBase64:'!!!!'},{audioBase64:''},{duration:0},{duration:61},{duration:'2'},{mimeType:{}},{mimeType:'text/html'},{audioBase64:Buffer.alloc(1_000_001).toString('base64')}])assert.throws(()=>validateAudio({...good,...change}));
});
test('concurrency and minute limits are per authenticated actor and release on failure',()=>{
 let time=0;const reserve=createTranscriptionGuard(()=>time),release=reserve('a');
 assert.throws(()=>reserve('a'),{status:429});reserve('b')();release();
 for(let i=0;i<5;i++)reserve('a')();assert.throws(()=>reserve('a'),{status:429});
 time=60_001;reserve('a')();
});
