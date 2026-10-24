import {build} from 'vite';
import {mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'node_modules/.cache/vocabulary-feedback');
await mkdir(out,{recursive:true});const abs=p=>JSON.stringify(resolve(root,p).replaceAll('\\','/'));
await writeFile(resolve(out,'entry.jsx'),`
import React,{useState} from 'react';import{createRoot}from'react-dom/client';
import V from ${abs('src/modules/exercises/VocabularyNotebook.js')};
const root=createRoot(document.getElementById('root'));let run=0;window.nextCount=0;
function Harness({stage}){const[checked,setChecked]=useState(false),[answer,setAnswer]=useState(''),[correct,setCorrect]=useState(false);
const question={id:'fixture-'+stage,type:stage==='recall'?'text':'choice',stage,word:'kaffe',translation:'cafea',prompt:'Jeg drikker ___ om morgenen.',example:'Jeg drikker kaffe om morgenen.',answer:stage==='recall'?'kaffe':'cafea',options:['cafea','ceai','lapte','apă']};
return <div className="App"><main className="App__main"><V level="A1" question={question} current={0} total={9} answer={answer} setAnswer={setAnswer} checked={checked} correct={correct} completeAnswer={answer.length>0} onExit={()=>{}} onVerify={value=>{setCorrect((value===undefined?answer:value)===question.answer);setChecked(true)}} onNext={()=>{window.nextCount++;setChecked(false);setAnswer('')}}/></main></div>}
window.mount=stage=>root.render(<Harness key={++run} stage={stage}/>);window.mount('recognize');
`);
await build({configFile:resolve(root,'vite.config.js'),publicDir:false,logLevel:'error',define:{'process.env.NODE_ENV':JSON.stringify('production')},plugins:[{name:'feedback-audio',enforce:'pre',resolveId(id){if(id.endsWith('/norwegianSpeech'))return '\0audio';},load(id){if(id==='\0audio')return 'export const speakNorwegian=async()=>({ok:true});';}}],build:{outDir:out,emptyOutDir:false,lib:{entry:resolve(out,'entry.jsx'),formats:['iife'],name:'VocabularyQa',fileName:()=> 'client.js'}}});
const assets=resolve(root,'dist/assets');const css=(await Promise.all((await readdir(assets)).filter(f=>f.endsWith('.css')).map(f=>readFile(resolve(assets,f),'utf8')))).join('\n');const js=await readFile(resolve(out,'client.js'),'utf8');
const {chromium}=await import(pathToFileURL(resolve(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')));
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}:{})});let checks=0;
try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.setContent('<meta charset="utf-8"><style>'+css+'</style><div id="root"></div>');await page.addScriptTag({content:js});
for(const installed of [false,true])for(const [width,height]of [[360,640],[390,844],[1366,900]]){
await page.setViewportSize({width,height});await page.evaluate(v=>document.documentElement.classList.toggle('is-installed-app',v),installed);
for(const stage of ['recognize','context','recall'])for(const correct of [false,true]){
await page.evaluate(stage=>window.mount(stage),stage);await page.waitForSelector('.vn-word');
const before=await page.evaluate(()=>({height:document.documentElement.scrollHeight,scrollY,logo:getComputedStyle(document.querySelector('.vn-header .game-brand-logo')).backgroundColor,border:getComputedStyle(document.querySelector('.vn-header .game-brand-logo')).borderTopWidth}));
assert.equal(before.logo,'rgba(0, 0, 0, 0)','Original logo has no colored circle');assert.equal(before.border,'0px','Logo has no outline');
assert.ok((await page.locator('.game-brand-logo img').getAttribute('src')).endsWith('nordlingo-selected-color.png'));
if(stage==='recall'){await page.locator('input').fill(correct?'kaffe':'te');await page.locator('.vn-answer').evaluate(form=>form.requestSubmit());}else await page.locator('.vn-choices>button').nth(correct?0:1).click();
await page.waitForSelector('.vn-feedback-popup[open]');
const state=await page.evaluate(()=>({height:document.documentElement.scrollHeight,y:scrollY,modal:document.querySelector('.vn-feedback-popup').matches(':modal'),focus:document.querySelector('.vn-feedback-popup').contains(document.activeElement)}));
assert.ok(state.height<=before.height+1,stage+': feedback does not grow document');assert.equal(state.y,before.scrollY,'Feedback never scrolls the exercise');assert.equal(state.modal,true);assert.equal(state.focus,true,'Focus enters feedback');
await page.locator('.vn-feedback-popup .vn-continue').click();await page.waitForSelector('.vn-feedback-popup',{state:'detached'});checks++;
}
}
await page.evaluate(()=>window.mount('recognize'));await page.locator('.vn-choices>button').first().click();await page.waitForSelector('.vn-feedback-popup[open]');const next=await page.evaluate(()=>window.nextCount);await page.keyboard.press('Escape');await page.waitForSelector('.vn-feedback-popup',{state:'detached'});assert.equal(await page.evaluate(()=>window.nextCount),next+1,'Escape safely continues');assert.deepEqual(errors,[]);
console.log('PASS: '+checks+' vocabulary feedback layouts; original logo, modal focus, continue and Escape.');
}finally{await browser.close();}
