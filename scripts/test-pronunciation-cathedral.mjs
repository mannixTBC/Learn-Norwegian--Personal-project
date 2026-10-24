import { build } from 'vite';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { isAbsolute, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'node_modules/.cache/pronunciation-cathedral');
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
 const mount=async(level='A1',id=1)=>{await page.evaluate(level=>window.voiceQa.mount(level),level);await page.waitForSelector('.cathedral-record');await page.locator('.cathedral-lesson select').selectOption(String(id));await page.waitForTimeout(25);};
 const record=async()=>{await page.locator('.cathedral-record').click();await page.waitForSelector('.is-recording');await page.locator('.cathedral-record').click();};
 const releaseHeld=async()=>{for(let i=0;i<100&&!held.length;i++)await page.waitForTimeout(10);assert.ok(held.length,'Evaluation request is pending');await evaluate(held.shift(),'good');};
 const result=()=>page.waitForSelector('.cathedral-result');
 const check=async(label)=>{
  const measurement=await page.evaluate(()=>{
   const dialog=document.querySelector('dialog[open]');const screen=document.querySelector('.pronunciation-cathedral');const root=dialog||screen;
   const boundary=root.getBoundingClientRect();
   const targets=dialog?[...root.querySelectorAll('button,blockquote,p,.cathedral-library>div,.cathedral-word-feedback')]:[...root.querySelectorAll('button,select,.cathedral-quote blockquote,.cathedral-quote__text>p,.cathedral-recorder__copy,.cathedral-result')];
   const errors=targets.filter(el=>el.getClientRects().length).flatMap(el=>{const r=el.getBoundingClientRect();const issue=r.left<boundary.left-1||r.right>boundary.right+1||r.top<boundary.top-1||r.bottom>boundary.bottom+1;return issue?[{class:el.className,text:el.textContent.slice(0,60),rect:{left:r.left,right:r.right,top:r.top,bottom:r.bottom}}]:[];});
   const quote=document.querySelector('.cathedral-quote'),text=document.querySelector('.cathedral-quote__text'),actions=document.querySelector('.cathedral-model-actions');
   const overlap=!dialog&&text&&[...text.children].filter(el=>el.getClientRects().length).some(el=>el.getBoundingClientRect().bottom>actions.getBoundingClientRect().top+1);
   const workspace=document.querySelector('.cathedral-workspace');
   return {errors,overlap,pageHeight:document.documentElement.scrollHeight,viewport:innerHeight,dialogScroll:dialog&&dialog.scrollHeight>dialog.clientHeight+1,quoteScroll:quote&&quote.scrollHeight>quote.clientHeight+1,workspaceScroll:!dialog&&workspace.scrollHeight>workspace.clientHeight+1};
  });
  assert.deepEqual(measurement.errors,[],label+': elements fit');assert.equal(measurement.overlap,false,label+': phrase does not overlap audio');assert.ok(measurement.pageHeight<=measurement.viewport+1,label+': no page scrolling');assert.ok(!measurement.dialogScroll,label+': no dialog scrolling');assert.ok(!measurement.quoteScroll,label+': no quote scrolling');assert.ok(!measurement.workspaceScroll,label+': recording/result fits its space');report.states++;
 };
 const close=async()=>{await page.getByRole('button',{name:'Închide',exact:true}).click();};
 const openDetails=async()=>{await page.locator('.cathedral-result__heading').click();};
 const sizes=[[320,480],[320,568],[360,640],[390,844],[412,915],[768,1024],[1280,800],[568,320],[1024,600],[844,390]];
 for(const [width,height]of sizes){
  console.log('Checking viewport '+width+'x'+height);
  await page.setViewportSize({width,height});await mount();await check(width+' ready');
  if(width===390)await page.screenshot({path:resolve(output,'nordic-ready.png')});
  await page.getByRole('button',{name:'Ascultă modelul',exact:true}).click();await page.getByRole('button',{name:'Ascultă mai lent',exact:true}).click();
  await page.locator('.cathedral-record').click();await page.waitForSelector('.is-recording');await check(width+' recording');
  mode='hold';await page.locator('.cathedral-record').click();await page.waitForSelector('.cathedral-lab--analyzing');await check(width+' analyzing');
  await releaseHeld();await result();await check(width+' result');
  await openDetails();await check(width+' score details');
  await page.getByRole('button',{name:'Cuvinte',exact:true}).click();await check(width+' word details');
  await page.getByRole('button',{name:'Transcriere',exact:true}).click();await check(width+' transcript');await close();
  await page.getByRole('button',{name:'Despre exercițiu și cel mai bun scor'}).click();await check(width+' about');await close();
  await page.locator('.cathedral-navigation__library').click();await check(width+' library');await close();
  await page.evaluate(()=>window.voiceQa.hardware.permission='deny');await page.getByRole('button',{name:'Repetă',exact:true}).click();await page.locator('.cathedral-record').click();await page.waitForSelector('.cathedral-lab--error');await check(width+' denied');
  await page.getByRole('button',{name:'Detalii și ajutor →',exact:true}).click();await check(width+' error details');await close();await page.evaluate(()=>window.voiceQa.hardware.permission='allow');mode='good';
  if(width===390)await page.screenshot({path:resolve(output,'permission-error.png')});
 }
 assert.equal(await page.evaluate(()=>window.voiceModels.some(item=>item.slow===true)),true);report.logic.push('Normal and slow models receive the original phrase');
 await page.setViewportSize({width:320,height:480});
 const samples=await page.evaluate(()=>window.voiceQa.samples);
 for(const sample of samples){
  await mount(sample.level,sample.id);await check(sample.level+'/'+sample.id+' ready');
  await page.locator('.cathedral-navigation__library').click();await page.getByRole('button',{name:'Pagina următoare'}).click();
  await page.locator('.cathedral-library>div').last().locator('button').first().click();
  assert.equal(await page.getByRole('button',{name:'Expresia următoare',exact:true}).count(),0,'Last phrase has no forward arrow');
  await check(sample.level+'/'+sample.id+' final phrase');mode='partial';await record();await result();await check(sample.level+'/'+sample.id+' partial result');
  await openDetails();await page.getByRole('button',{name:'Cuvinte',exact:true}).click();await check(sample.level+'/'+sample.id+' alignment');await close();
 }
 report.logic.push('All six phrases remain reachable, including the final phrase, across 20 lessons');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>localStorage.clear());await mount();mode='good';
 await record();await result();let activity=await page.evaluate(()=>JSON.parse(localStorage.getItem('norwegian_learning_activity')));
 assert.equal(activity.length,1);assert.equal(activity[0].score,92);assert.equal(activity[0].retry,false);
 await page.getByRole('button',{name:'Vocea mea',exact:true}).click();assert.ok(await page.evaluate(()=>window.voicePlayback>0));
 const paused=await page.evaluate(()=>window.voicePaused||0);
 await page.getByRole('button',{name:'Repetă',exact:true}).click();assert.ok(await page.evaluate(()=>window.voicePaused)>paused);await record();await result();activity=await page.evaluate(()=>JSON.parse(localStorage.getItem('norwegian_learning_activity')));
 assert.equal(activity.length,2);assert.equal(activity[1].retry,true);
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('pronunciation_attempts_a1')).length),2);report.logic.push('Actual assessment, saved attempts, playback and repeat reward guard preserved');
 await page.screenshot({path:resolve(output,'result.png')});
 await page.evaluate(()=>window.failPlayback=true);await page.getByRole('button',{name:'Vocea mea',exact:true}).click();await page.waitForSelector('.cathedral-dialog[open]');await check('Playback error dialog');
 await page.keyboard.press('Escape');await page.waitForSelector('.cathedral-dialog',{state:'detached'});
 assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'Vocea mea');await page.evaluate(()=>window.failPlayback=false);
 report.logic.push('Retry stops playback; playback errors stay in a dialog and Escape restores focus');
 await page.locator('.cathedral-navigation__library').click();await page.getByRole('button',{name:'Pagina următoare'}).click();await page.locator('.cathedral-library>div').last().locator('button').first().click();
 await page.setViewportSize({width:568,height:320});await page.locator('.cathedral-navigation__library').click();await page.locator('.cathedral-library>.is-active').waitFor({state:'visible'});await check('Active phrase remains visible after rotation');await close();
 await page.setViewportSize({width:390,height:844});
 await mount();await page.evaluate(()=>window.voiceQa.hardware.permission='pending');
 await page.locator('.cathedral-record').evaluate(button=>{button.click();button.click();});await page.waitForSelector('.cathedral-lab--requesting');await check('Pending microphone permission');
 const started=await page.evaluate(()=>window.voiceQa.hardware.started);const stopped=await page.evaluate(()=>window.voiceQa.hardware.stopped);
 await page.getByRole('button',{name:'Expresia următoare',exact:true}).click();await page.evaluate(()=>window.voiceQa.hardware.release());await page.waitForTimeout(30);
 assert.equal(await page.evaluate(()=>window.voiceQa.hardware.started),started);assert.ok(await page.evaluate(()=>window.voiceQa.hardware.stopped)>stopped);report.logic.push('Changing phrase safely disposes a late microphone permission');
 await page.evaluate(()=>window.voiceQa.hardware.permission='allow');mode='hold';await record();await page.waitForSelector('.cathedral-lab--analyzing');
 const attempts=await page.evaluate(()=>JSON.parse(localStorage.getItem('pronunciation_attempts_a1')).length);
 await page.getByRole('button',{name:'Expresia următoare',exact:true}).click();await releaseHeld();await page.waitForTimeout(50);
 assert.equal(await page.locator('.cathedral-result').count(),0);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('pronunciation_attempts_a1')).length),attempts);report.logic.push('A late assessment cannot overwrite a newly selected phrase');
 mode='error';await record();await page.waitForSelector('.cathedral-lab--error');await check('Evaluation unavailable');
 await page.getByRole('button',{name:'Detalii și ajutor →',exact:true}).click();await check('Evaluation error details');await close();
 await mount();await page.screenshot({path:resolve(output,'ready.png')});
 assert.deepEqual(report.browserErrors,[]);assert.ok(evaluations.every(item=>item.referenceText&&item.audioBase64&&item.mimeType));
 await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}catch(error){
 const page=browser.contexts()[0]?.pages()[0];
 if(page){await page.screenshot({path:resolve(output,'failure.png')});await writeFile(resolve(output,'failure.txt'),await page.locator('body').innerText());}
 console.error(JSON.stringify(report));throw error;
}finally{await browser.close();}
