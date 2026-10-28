import { build } from 'vite';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { isAbsolute, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'node_modules/.cache/pronunciation-practice');
await mkdir(output, { recursive:true });
const abs = path => JSON.stringify(resolve(root,path).replaceAll('\\','/'));
const source = `
import React from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import ${abs('node_modules/bootstrap/dist/css/bootstrap.min.css')};
import ${abs('src/App.css')};
import ${abs('src/modules/exercises/GameBrand.css')};
import ${abs('src/modules/exercises/ExerciseCanvas.css')};
import Pronunciation from ${abs('src/modules/pronunciation/Pronunciation.js')};
import {courseCatalog} from ${abs('src/modules/lessons/norwegian-program/lessonContent.js')};
let run=0;
const root=createRoot(document.getElementById('root'));
const hardware={permission:'allow',requests:0,stopped:0,started:0,release:null};
const stream=()=>({getTracks:()=>[{stop:()=>hardware.stopped++}]});
Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>{hardware.requests++;if(hardware.permission==='deny')throw Object.assign(new Error('Denied'),{name:'NotAllowedError'});if(hardware.permission==='pending')return new Promise(resolve=>hardware.release=()=>resolve(stream()));return stream();}}});
window.AudioContext=undefined;window.webkitAudioContext=undefined;window.SpeechRecognition=undefined;window.webkitSpeechRecognition=undefined;
window.MediaRecorder=class{
 static isTypeSupported(){return true;}
 constructor(){this.state='inactive';this.mimeType='audio/webm';}
 start(){this.state='recording';hardware.started++;}
 stop(){if(this.state==='inactive')return;this.state='inactive';this.ondataavailable?.({data:new Blob(['voice-sample'],{type:this.mimeType})});this.onstop?.();}
};
HTMLMediaElement.prototype.play=function(){if(window.failPlayback)return Promise.reject(new Error('Playback unavailable'));window.voicePlayback=(window.voicePlayback||0)+1;return Promise.resolve();};
HTMLMediaElement.prototype.pause=function(){window.voicePaused=(window.voicePaused||0)+1;this.dispatchEvent(new Event('pause'));};
const entries=Object.entries(courseCatalog).flatMap(([level,course])=>course.lessons.map(lesson=>({level,id:lesson.id,longest:Math.max(...lesson.vocabulary.map(v=>v[2].length))})));
const samples=[...Object.keys(courseCatalog).map(level=>entries.find(e=>e.level===level)),...entries.sort((a,b)=>b.longest-a.longest)].filter((value,index,all)=>all.findIndex(e=>e.level===value.level&&e.id===value.id)===index).slice(0,20);
window.voiceQa={hardware,samples,catalog:courseCatalog,mount(level='A1'){root.render(<MemoryRouter key={++run} initialEntries={['/pronuntie?nivel='+level]}><div className="App"><nav className="navbar">Navigation</nav><main className="App__main"><Pronunciation/></main><footer className="footer">Footer</footer></div></MemoryRouter>);},unmount(){root.render(null);}};
window.voiceQa.mount();
`;
await writeFile(resolve(output,'entry.jsx'),source);
await build({configFile:resolve(root,'vite.config.js'),publicDir:false,logLevel:'error',define:{'process.env.NODE_ENV':JSON.stringify('production')},plugins:[{
 name:'pronunciation-offline-boundaries',enforce:'pre',resolveId(id){
  if(id.endsWith('/AuthContext'))return '\0voice-auth';
  if(id.endsWith('/supabaseLearning'))return '\0voice-sync';
  if(id.endsWith('/azurePronunciationSpeech'))return '\0voice-model';
 },load(id){
  if(id==='\0voice-auth')return 'export const useAuth=()=>({user:{id:"cathedral-qa"}});';
  if(id==='\0voice-sync')return 'export const syncStudyActivity=async()=>({});';
  if(id==='\0voice-model')return 'export const speakPronunciationModel=async(text,options={})=>{window.voiceModels=[...(window.voiceModels||[]),{text,...options}];return {ok:true};};';
 }
}],build:{outDir:output,emptyOutDir:false,minify:false,lib:{entry:resolve(output,'entry.jsx'),formats:['iife'],name:'CathedralQa',fileName:()=> 'client.js'}}});
const js=await readFile(resolve(output,'client.js'),'utf8');
const css=(await Promise.all((await readdir(output)).filter(file=>file.endsWith('.css')).map(file=>readFile(resolve(output,file),'utf8')))).join('\n');
const html='<!doctype html><html class="is-installed-app" lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body style="margin:0"><div id="root"></div><script>'+js.replaceAll('</script','<\\/script')+'</script></body></html>';
let chromium;
for(const candidate of [process.env.PLAYWRIGHT_MODULE,'playwright',resolve(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')].filter(Boolean)){
 try{({chromium}=await import(isAbsolute(candidate)?pathToFileURL(candidate).href:candidate));if(chromium)break;}catch{/* Try an installed runtime. */}
}
if(!chromium)throw Error('Set PLAYWRIGHT_MODULE to an installed Playwright module.');
let executablePath;
for(const candidate of [process.env.PLAYWRIGHT_CHROME_EXECUTABLE_PATH,process.platform==='win32'&&'C:/Program Files/Google/Chrome/Application/chrome.exe',chromium.executablePath()].filter(Boolean)){
 try{await access(candidate);executablePath=candidate;break;}catch{/* Try another browser. */}
}
const browser=await chromium.launch({...(executablePath?{executablePath}:{}),headless:true});
const report={states:0,lessons:20,browserErrors:[],logic:[]};
try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 page.setDefaultTimeout(10000);
 page.on('pageerror',error=>report.browserErrors.push(error.message));
 let mode='good';const held=[];const evaluations=[];
 const evaluate=async(route,currentMode)=>{
  const payload=route.request().postDataJSON();evaluations.push(payload);
  if(currentMode==='error')return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Evaluarea audio nu este disponibilă momentan. Încearcă din nou.'})});
  return route.fulfill({contentType:'application/json',body:JSON.stringify({text:currentMode==='partial'?payload.referenceText.split(' ').slice(0,2).join(' '):payload.referenceText,provider:'azure-speech',assessment:currentMode==='partial'?null:{accuracy:93,completeness:100,fluency:86,pronunciationScore:92}})});
 };
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:html});
  if(url.pathname==='/api/pronunciation/evaluate'){if(mode==='hold'){held.push(route);return;}return evaluate(route,mode);}
  const file=resolve(root,'public',decodeURIComponent(url.pathname).replace(/^\/+/,''));
  if(file.startsWith(resolve(root,'public')+sep))try{return route.fulfill({body:await readFile(file),contentType:file.endsWith('.jpg')?'image/jpeg':'image/png'});}catch{/* No outside network is needed. */}
  return route.abort();
 });
 await page.goto('http://pronunciation.test/');await page.waitForSelector('.cathedral-record');
 const mount=async(level='A1')=>{await page.evaluate(level=>window.voiceQa.mount(level),level);await page.waitForSelector('.cathedral-record');};
 const check=async()=>{assert.equal(await page.locator('.mobile-app-nav,.warm-voice-icon,.nordic-pronunciation-art').count(),0);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await page.locator('.practice-voice-cup').evaluate(el=>el.complete&&el.naturalWidth>0),true);};
 for(const installed of [false,true])for(const [width,height] of [[320,568],[360,640],[390,844],[1366,900]]){
  await page.evaluate(installed=>document.documentElement.classList.toggle('is-installed-app',installed),installed);
  await page.setViewportSize({width,height});await mount();await check();
  assert.equal(await page.locator('.practice-voice-heading').count(),0);
  if(height>=640)assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),'No scroll for initial phrase at '+width+'x'+height);
  assert.equal(await page.getByRole('button',{name:'Continuă',exact:true}).isDisabled(),true);
  await page.getByRole('button',{name:'Ascultă modelul',exact:true}).click();await page.getByRole('button',{name:'Ascultă mai lent',exact:true}).click();
  assert.equal(await page.evaluate(()=>window.voiceModels.at(-1).slow),true);
  if(width===390&&!installed){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:resolve(output,'ready.png'),fullPage:true});}
  await page.locator('.cathedral-record').scrollIntoViewIfNeeded();const box=await page.locator('.cathedral-record').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.waitForSelector('.is-recording');await page.mouse.up();await page.waitForSelector('.cathedral-result');
  assert.equal(await page.getByRole('button',{name:'Vocea mea',exact:true}).count(),0);
  assert.equal(await page.getByRole('button',{name:'Continuă',exact:true}).isEnabled(),true);
  if(width===390&&!installed)await page.screenshot({path:resolve(output,'result.png'),fullPage:true});
  await page.locator('.cathedral-result__heading').click();await page.waitForSelector('dialog[open]');await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Continuă',exact:true}).click();await page.waitForSelector('.cathedral-record');assert.match(await page.locator('.practice-voice-progress').innerText(),/^2 din/);
  await page.getByRole('button',{name:'Înapoi',exact:true}).click();assert.match(await page.locator('.practice-voice-progress').innerText(),/^1 din/);
  report.states++;
 }
 for(const level of ['A1','A2','B1','B2','C1','C2']){await mount(level);await page.locator('.practice-voice-progress').click();await page.waitForSelector('dialog[open]');await page.locator('dialog select').selectOption('2');await page.waitForSelector('.cathedral-record');await check();}
 for(const sample of await page.evaluate(()=>window.voiceQa.samples)){await mount(sample.level);await page.locator('.practice-voice-progress').click();await page.locator('dialog select').selectOption(String(sample.id));await page.waitForSelector('.cathedral-record');await page.locator('.practice-voice-progress').click();const index=await page.locator('.practice-voice-library button strong').evaluateAll(nodes=>nodes.reduce((best,node,i)=>node.textContent.length>nodes[best].textContent.length?i:best,0));await page.locator('.practice-voice-library button').nth(index).click();await check();await page.locator('.cathedral-record').scrollIntoViewIfNeeded();assert.ok(await page.locator('.cathedral-record').isVisible());}
 await mount();await page.evaluate(()=>window.voiceQa.hardware.permission='pending');await page.locator('.cathedral-record').scrollIntoViewIfNeeded();let box=await page.locator('.cathedral-record').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.waitForFunction(()=>!!window.voiceQa.hardware.release);await page.mouse.up();await page.evaluate(()=>window.voiceQa.hardware.release());await page.waitForSelector('.cathedral-result');assert.equal(await page.locator('.is-recording').count(),0,'Releasing during permission request stops late recording');
 await page.evaluate(()=>window.voiceQa.hardware.permission='deny');await mount();await page.locator('.cathedral-record').focus();await page.keyboard.press('Enter');await page.waitForSelector('.cathedral-lab--error');assert.equal(await page.locator('.cathedral-text-button').count(),0);assert.ok(await page.locator('.cathedral-recorder [role=alert]').isVisible());
 await page.evaluate(()=>window.voiceQa.hardware.permission='allow');await mount();await page.locator('.cathedral-record').focus();await page.keyboard.down('Space');await page.waitForSelector('.is-recording');await page.keyboard.up('Space');await page.waitForSelector('.cathedral-result');
 await mount();await page.evaluate(()=>window.voiceQa.unmount());assert.equal(await page.locator('.pronunciation-practice').count(),0);assert.deepEqual(report.browserErrors,[]);
 console.log('PASS: six web/app layouts, six levels, normal/slow audio, hold-to-record, permission race, denied microphone, keyboard, feedback and navigation.');
}catch(error){const page=browser.contexts()[0]?.pages()[0];if(page){await page.screenshot({path:resolve(output,'failure.png'),fullPage:true});await writeFile(resolve(output,'failure.txt'),await page.locator('body').innerText());}throw error;}finally{await browser.close();}
