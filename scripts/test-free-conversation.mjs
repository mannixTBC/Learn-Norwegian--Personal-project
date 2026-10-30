import {build} from 'vite';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer,{act} from 'react-test-renderer';
import {MemoryRouter} from 'react-router-dom';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'node_modules/.cache/free-conversation-test');
await build({configFile:resolve(root,'vite.config.js'),logLevel:'error',plugins:[{name:'free-chat-stub',enforce:'pre',resolveId(id){
  if(id.endsWith('/services/chat'))return 'virtual:free-chat';
  if(id.endsWith('/services/norwegianSpeech'))return 'virtual:speech';
},load(id){
  if(id==='virtual:free-chat')return 'export const startFreeConversation=(...args)=>globalThis.freeStart(...args);export const sendFreeConversation=(...args)=>globalThis.freeSend(...args);export const translateConversation=()=>Promise.resolve({translation:"Traducere"});';
  if(id==='virtual:speech')return 'export const speakNorwegian=(...args)=>globalThis.freeSpeak(...args);';
}}],build:{ssr:resolve(root,'src/modules/exercises/FreeConversation.js'),outDir:out,emptyOutDir:true,rollupOptions:{output:{entryFileNames:'free.mjs'}}}});
const {default:Free}=await import(pathToFileURL(resolve(out,'free.mjs')));
let r, startSignal, sendSignal, starts=0, calls=0, fail=false, recorder, audio, stoppedTracks=0;
class Recognition {
  start(){recorder=this;}
  abort(){this.aborted=true;}
}
globalThis.window={localStorage:{getItem:()=>null},SpeechRecognition:Recognition};
const oldNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{getUserMedia:async()=>({getTracks:()=>[{stop(){stoppedTracks++;}}]})}}});
globalThis.freeSpeak=(text,options)=>new Promise(resolve=>{audio={text,options,finish:()=>resolve({ok:true})};options.signal.addEventListener('abort',()=>resolve({cancelled:true}),{once:true});});
globalThis.freeStart=async(level,signal)=>{starts++;startSignal=signal;return {sessionToken:'opening',reply:'Hei!',turn:0,done:false};};
globalThis.freeSend=async(payload,signal)=>{sendSignal=signal;calls++;assert.equal(payload.sessionToken,'opening');assert.equal(payload.message,'Jeg liker kaffe.');if(fail)throw new Error('Offline');return {sessionToken:'reply',reply:'Hva liker du?',turn:1,done:false,correction:{original:'kaffe',corrected:'en kaffe',explanation:'Exemplu.'}};};
const mount=async()=>act(async()=>{r=TestRenderer.create(React.createElement(MemoryRouter,null,React.createElement(Free,{level:'A2'})));});
const text=n=>typeof n==='string'?n:n?.children?.map(text).join('')||'';
const button=label=>r.root.findAllByType('button').find(n=>text(n)===label||n.props['aria-label']===label);
const click=async label=>act(async()=>{await button(label).props.onClick();});
await mount();
assert.equal(starts,0,'no chat before user click');
assert.equal(r.root.findAllByProps({className:'airy-message assistant free-opening'}).length,1,'opening card is visible before starting');
assert.equal(stoppedTracks,0,'no microphone before user click');
assert.equal(r.root.findAllByType('textarea').length,0);
assert.equal(r.root.findAllByType('form').length,0);
assert.equal(r.root.findAllByProps({className:'studio-nora-intro'}).length,0);
assert.doesNotMatch(text(r.root),/Despre microfon/);
await click('Pornește dialogul');
assert.equal(r.root.findAllByProps({className:'airy-message assistant free-opening'}).length,0,'real reply replaces the opening card');
assert.equal(starts,1);assert.equal(stoppedTracks,1);assert.equal(audio.text,'Hei!');
assert.equal(recorder,undefined,'do not record Nora');
await act(async()=>audio.finish());
assert.equal(recorder.lang,'nb-NO');assert.match(text(r.root),/Te ascult/);
// Silence reopens listening without sending an empty turn.
const silent=recorder;
await act(async()=>{silent.onerror({error:'no-speech'});silent.onend();await new Promise(resolve=>setTimeout(resolve,550));});
assert.notEqual(recorder,silent);assert.equal(calls,0);
fail=true;
await act(async()=>{const result=[{transcript:'Jeg liker kaffe.'}];result.isFinal=true;recorder.onresult({results:[result]});recorder.onend();});
assert.equal(calls,1);assert.match(text(r.root),/Offline/);
fail=false;await click('Reîncearcă');assert.equal(calls,2);assert.equal(audio.text,'Hva liker du?');
assert.equal(r.root.findAllByProps({className:'airy-message user'}).length,1,'retry must not duplicate the user turn');
await act(async()=>audio.finish());
await click('Pune conversația în pauză');assert.equal(recorder.aborted,true);
await click('Reia conversația');assert.equal(starts,1);assert.equal(audio.text,'Hva liker du?');
await act(async()=>audio.finish());
await click('Încheie conversația');assert.equal(recorder.aborted,true);assert.match(text(r.root),/1 răspunsuri/);
await click('Începe un dialog nou');assert.equal(starts,2);assert.equal(audio.text,'Hei!');
await act(async()=>r.unmount());assert.equal(audio.options.signal.aborted,true);
// Permission denial does not start a server session.
navigator.mediaDevices.getUserMedia=async()=>{throw Error('denied');};
await mount();await click('Pornește dialogul');assert.equal(starts,2);assert.match(text(r.root),/Permite accesul/);await act(async()=>r.unmount());
// A late permission grant after navigation releases the microphone and does not start a chat.
let permit;
navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>{permit=resolve;});
await mount();let starting;await act(async()=>{starting=button('Pornește dialogul').props.onClick();});
await act(async()=>r.unmount());
await act(async()=>{permit({getTracks:()=>[{stop(){stoppedTracks++;}}]});await starting;});assert.equal(starts,2);
// Navigation during a request cancels it.
navigator.mediaDevices.getUserMedia=async()=>({getTracks:()=>[{stop(){}}]});
globalThis.freeStart=(level,signal)=>{startSignal=signal;return new Promise(()=>{});};
await mount();await click('Pornește dialogul');await act(async()=>r.unmount());assert.equal(startSignal.aborted,true);
// A blocked audio output pauses rather than opening the microphone over Nora.
globalThis.freeStart=async()=>({sessionToken:'final',reply:'Ha det!',done:true});
globalThis.freeSpeak=async()=>({ok:false});
await mount();await click('Pornește dialogul');assert.match(text(r.root),/Vocea nu a putut porni/);
globalThis.freeSpeak=async()=>({ok:true});
await click('Reîncearcă');assert.match(text(r.root),/Ai vorbit în norvegiană/);
await act(async()=>r.unmount());
// Unsupported browsers do not restore the keyboard.
delete window.SpeechRecognition;await mount();assert.equal(button('Pornește dialogul').props.disabled,true);assert.equal(r.root.findAllByType('textarea').length,0);await act(async()=>r.unmount());
if(oldNavigator)Object.defineProperty(globalThis,'navigator',oldNavigator);else delete globalThis.navigator;
delete globalThis.window;
console.log('PASS: click-only start, automatic audio/listening/send, silence, retry, pause/resume, finish/restart, permission denial, cancellation and voice-only UI.');
