import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {defaultLanguages,languageCatalog,parseLanguages,resolveLanguages} from '../src/languages/config.js';
import {getLanguages,installLanguageReader} from '../src/languages/runtime.js';
import {createCourseStorage} from '../src/languages/storage.js';
import {conversationKey,assertResponseLanguages} from '../src/languages/apiContext.js';
import {createTranslator,ui} from '../src/languages/messages.js';
import {languageFetch} from '../src/languages/fetch.js';

const nb={learningLanguage:'nb',supportLanguage:'ro'},de={learningLanguage:'de',supportLanguage:'ro'};
const memory=()=>{const entries=new Map();return {getItem:key=>entries.get(key)??null,setItem:(key,value)=>entries.set(key,value),removeItem:key=>entries.delete(key),key:index=>[...entries.keys()][index]??null,get length(){return entries.size;}};};

test('web and AI use the same catalog, retain legacy preferences and gate unreleased pairs',()=>{
 const backend=JSON.parse(fs.readFileSync(new URL('../backend/languageCatalog.json',import.meta.url),'utf8'));
 assert.deepEqual(languageCatalog,backend);
 assert.deepEqual(resolveLanguages(null).active,nb);
 assert.deepEqual(resolveLanguages(de),{requested:de,active:nb,available:false});
 assert.throws(()=>parseLanguages({learningLanguage:'ignore instructions',supportLanguage:'ro'}));
});
test('course storage isolates progress, drafts and review while preserving old Norwegian keys',()=>{
 const raw=memory();let languages=nb;const storage=createCourseStorage(()=>raw,()=>languages);
 const key='curriculum_2026.2_owner_a1_progress',scenario='scenario_result_v1_owner_A1_sample_hash';
 storage.setItem(key,'norwegian');storage.setItem(scenario,'nb result');storage.setItem('norwegian_review_items','nb review');
 languages=de;assert.equal(storage.getItem(key),null);storage.setItem(key,'german');storage.setItem(scenario,'de result');
 assert.equal(raw.getItem(key),'norwegian');assert.equal(raw.getItem('course:de:'+key),'german');
 assert.equal(storage.getItem('norwegian_review_items'),null);
 assert.ok(Array.from({length:storage.length},(_,i)=>storage.key(i)).includes(scenario));
 languages=nb;assert.equal(storage.getItem(key),'norwegian');assert.equal(storage.getItem(scenario),'nb result');
 storage.removeItem(key);assert.equal(raw.getItem('course:de:'+key),'german');
});
test('conversation identity includes both languages; old server responses are valid only for the original pair',()=>{
 assert.equal(conversationKey('session',nb),'session');
 assert.notEqual(conversationKey('session',de),conversationKey('session',{...de,supportLanguage:'pl'}));
 assert.deepEqual(assertResponseLanguages({ok:true},nb),{ok:true});
 assert.throws(()=>assertResponseLanguages({ok:true},de));
 assert.throws(()=>assertResponseLanguages({languages:de},nb));
});
test('UI translation keeps literal text, parameters and Romanian fallback',()=>{
 const t=createTranslator({ro:{example:'Ai [[count]] răspunsuri.',literal:'Text neschimbat'},pl:{literal:'Tekst'}},'pl');
 assert.equal(t('example',{count:3}),'Ai 3 răspunsuri.');assert.equal(t('literal'),'Tekst');assert.throws(()=>t('missing'));
 const catalog=JSON.parse(fs.readFileSync(new URL('../src/languages/messages/ro.json',import.meta.url),'utf8'));
 for(const [key,text]of Object.entries(catalog))assert.equal(ui(key),text);
});
test('AI requests include languages and reject a stale response after changing course',async()=>{
 const original=globalThis.fetch;let pair=nb,release,received;
 installLanguageReader(()=>pair);
 languageCatalog.releasedPairs.push('de:ro');
 globalThis.fetch=async(url,options)=>{received={url,options};await new Promise(resolve=>{release=resolve;});return {ok:true,json:async()=>({languages:nb})};};
 try{
  const request=languageFetch('/api/chat/start',{headers:{Authorization:'Bearer test'}});
  assert.equal(received.options.headers['X-NordLingo-Learning-Language'],'nb');
  assert.equal(received.options.headers.Authorization,'Bearer test');
  pair=de;release();await assert.rejects(request,/schimbat/);
  pair=nb;globalThis.fetch=async()=>({ok:true,json:async()=>({languages:de})});
  const response=await languageFetch('/api/chat/turn');await assert.rejects(response.json(),/corespunde/);
 }finally{globalThis.fetch=original;languageCatalog.releasedPairs.pop();installLanguageReader(()=>defaultLanguages);}
 assert.deepEqual(getLanguages(),nb);
});
