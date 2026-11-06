import {build} from 'vite';
import {resolve} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {readFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import TestRenderer,{act} from 'react-test-renderer';
import {MemoryRouter} from 'react-router-dom';
import {resolvePublicScenario} from '../src/modules/exercises/scenarioDifficulty.mjs';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'node_modules/.cache/android-port');
await build({logLevel:'error',plugins:[{name:'port-test-auth',enforce:'pre',resolveId(id){if(id.endsWith('/auth/AuthContext'))return 'virtual:port-auth';if(id.endsWith('/norwegianSpeech'))return 'virtual:port-speech';},load(id){if(id==='virtual:port-auth')return 'export const useAuth=()=>({user:{id:"test-user"}})';if(id==='virtual:port-speech')return 'export const speakNorwegian=async()=>({ok:true})';}}],build:{ssr:true,outDir:out,emptyOutDir:true,rollupOptions:{input:{catalog:resolve(root,'src/modules/exercises/StudioCatalogView.js'),grammar:resolve(root,'src/modules/lessons/grammar/GrammarGuide.js'),summary:resolve(root,'src/modules/lessons/SummaryNotebook.js'),studio:resolve(root,'src/modules/exercises/StudioHome.js'),hub:resolve(root,'src/modules/exercises/DesktopGamesHub.js'),recall:resolve(root,'src/modules/lessons/ActiveRecallPage.js'),data:resolve(root,'src/modules/lessons/norwegian-program/lessonContent.js')},output:{entryFileNames:'[name].mjs'}}}});
const {default:Catalog}=await import(pathToFileURL(resolve(out,'catalog.mjs')));
const {default:Grammar}=await import(pathToFileURL(resolve(out,'grammar.mjs')));
const {default:Summary}=await import(pathToFileURL(resolve(out,'summary.mjs')));
const {default:Studio}=await import(pathToFileURL(resolve(out,'studio.mjs')));
const {default:Hub}=await import(pathToFileURL(resolve(out,'hub.mjs')));
const {default:Recall}=await import(pathToFileURL(resolve(out,'recall.mjs')));
const {courseCatalog}=await import(pathToFileURL(resolve(out,'data.mjs')));
const {buildActiveRecall,checkRecallOrder,checkRecallResponse}=await import('../src/modules/lessons/activeRecall.js');
for(const course of Object.values(courseCatalog))for(const lesson of course.lessons){
 const plan=buildActiveRecall(lesson);
 assert.ok(checkRecallOrder(plan,plan.order.answerText.split(/\s+/)));
 assert.equal(checkRecallResponse(plan,plan.response.model),'matched');
 assert.equal(checkRecallResponse(plan,'Un raspuns diferit'),'compare');
}
const catalog=JSON.parse(await readFile(resolve(root,'src/modules/exercises/conversationScenarios.json'),'utf8'));
const scenarios=catalog.scenarios.map(s=>{const r=resolvePublicScenario(s,catalog.levels,'A1');return {...r.scenario,difficulty:r.difficulty};});
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
const wrap=(Component,props={},url='/')=>React.createElement(MemoryRouter,{initialEntries:[url]},React.createElement(Component,props));
const text=n=>n.children.map(c=>typeof c==='string'?c:text(c)).join('');
const button=(view,label)=>view.root.findAllByType('button').find(b=>text(b).includes(label));
let chosen,started;
const props={level:'A1',path:{id:'transport',shortTitle:'Transport'},scenarios,learning:{stage:1,completed:[]},flow:{progress:{},choose:(id,auto)=>{chosen=id;started=auto;}}};
let view;await act(async()=>{view=TestRenderer.create(wrap(Catalog,props));});
assert.ok(JSON.stringify(view.toJSON()).includes('noul vecin'),'daily life is the default');
assert.equal(chosen,undefined,'preview never starts a conversation');
await act(async()=>button(view,'Începe conversația').props.onClick());
assert.equal(chosen,'general-introduction');assert.equal(started,true);
await act(async()=>button(view,'Transport').props.onClick());
await act(async()=>button(view,'Începe conversația').props.onClick());assert.equal(chosen,'transport-introduction');
const seen=new Set();
for(let i=0;i<20;i++){
 const row=view.root.findByProps({className:'practical-alternatives'});
 for(const b of row.findAllByType('button'))seen.add(text(b));
 await act(async()=>button(view,'Alte situații').props.onClick());
}
assert.equal(seen.size,scenarios.filter(s=>s.path==='transport').length-1,'rotation reaches every alternative');
await act(async()=>view.unmount());
await act(async()=>{view=TestRenderer.create(wrap(Grammar,{level:'A1'},'/gramatica?nivel=A1&capitol=sentences'));});
assert.ok(JSON.stringify(view.toJSON()).includes('Unde stă verbul?'));
await act(async()=>button(view,'Exersează regula').props.onClick());
for(let i=0;i<3;i++){
 const choices=view.root.findByProps({className:'grammar-options'}).findAllByType('button');
 await act(async()=>choices[0].props.onClick());
 await act(async()=>button(view,'Continuă').props.onClick());
}
assert.equal(store.size,1,'only a completed session is persisted');
assert.ok([...store.keys()][0].includes('test-user:nb:sentences:word-order'));
await act(async()=>view.unmount());
await act(async()=>{view=TestRenderer.create(wrap(Recall,{},'/recapitulare-activa?nivel=A1&lectie=1'));});
const plan=buildActiveRecall(courseCatalog.A1.lessons[0]);
await act(async()=>view.root.findByType('textarea').props.onChange({target:{value:plan.expression.answer}}));
await act(async()=>button(view,'Verific').props.onClick());
await act(async()=>button(view,'Continu').props.onClick());
await act(async()=>view.root.findByProps({className:'grammar-options'}).findAllByType('button')[plan.rule.answer].props.onClick());
await act(async()=>button(view,'Verific').props.onClick());
await act(async()=>button(view,'Continu').props.onClick());
for(const word of plan.order.answerText.split(/\s+/)){
 const bank=view.root.findAllByProps({className:'recall-wordbank'})[1];
 const token=bank.findAllByType('button').find(b=>!b.props.disabled&&b.children.join('')===word);
 assert.ok(token,`answer token ${word} is available`);
 await act(async()=>token.props.onClick());
}
await act(async()=>button(view,'Verific').props.onClick());
await act(async()=>button(view,'Continu').props.onClick());
await act(async()=>view.root.findByType('textarea').props.onChange({target:{value:plan.response.model}}));
await act(async()=>button(view,'Verific').props.onClick());
await act(async()=>button(view,'Continu').props.onClick());
assert.ok(view.root.findAllByType('a').some(a=>a.props.href.includes('/sumar-lectii')),'completion links back to the lesson summary');
await act(async()=>view.unmount());
const assets=resolve(root,'dist/assets'),css=(await Promise.all((await readdir(assets)).filter(n=>n.endsWith('.css')).map(n=>readFile(resolve(assets,n),'utf8')))).join('\n');
const {chromium}=await import(pathToFileURL(resolve(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')));
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}:{})});
let checks=0;
try{
 const page=await browser.newPage();
 await page.route('http://port.test/**',async route=>{
  const url=new URL(route.request().url());
  try{await route.fulfill({body:await readFile(resolve(root,'public','.'+url.pathname))});}catch{await route.abort();}
 });
 const fixtures=[['studio',()=>wrap(Studio,{},'/studio?nivel=A1')],['hub',()=>wrap(Hub,{level:'A1',reviewStats:{due:4}})],['recall',()=>wrap(Recall,{},'/recapitulare-activa?nivel=A1&lectie=1')],['catalog',()=>wrap(Catalog,props)],['grammar',()=>wrap(Grammar,{level:'A1'},'/gramatica?nivel=A1&capitol=sentences')],['nouns',()=>wrap(Grammar,{level:'A1'},'/gramatica?nivel=A1&capitol=nouns')],['summary',()=>React.createElement('section',{className:'exercise-screen recap-page recap-summary'},wrap(Summary,{level:'A1'},'/sumar-lectii?nivel=A1&lectie=1'))]];
 for(const installed of [false,true])for(const [width,height] of [[360,640],[390,844],[1366,900]])for(const [name,render] of fixtures){
  await page.setViewportSize({width,height});
  await page.setContent(`<html class="${installed?'is-installed-app':''}"><head><base href="http://port.test/"><style>${css}</style></head><body><div id="root"><div class="App"><main class="App__main">${renderToStaticMarkup(render())}</main></div></div></body></html>`);
  const actual=await page.evaluate(()=>document.documentElement.scrollWidth);
  assert.ok(actual<=width+2,`${name}: horizontal overflow ${actual} at ${width}, installed=${installed}`);
  if((width===390||width===1366)&&!installed)await page.screenshot({path:resolve(out,`nordlingo-port-${name}-${width}.png`),fullPage:true});
  if(['catalog','studio'].includes(name)&&width===1366&&!installed)assert.ok(await page.locator('.conversation-studio').evaluate(e=>e.getBoundingClientRect().width)>1000,'studio uses desktop width');
  if(name==='hub'&&width===1366&&!installed){
   assert.ok(await page.locator('.desktop-games-hub').evaluate(e=>e.getBoundingClientRect().width)>1000,'desktop hub uses website width');
   assert.equal(await page.locator('.desktop-games-hub__grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),3);
  }
  checks++;
 }
}finally{await browser.close();}
console.log(`PASS: scenario selection/rotation, grammar completion/persistence, ${checks} web/installed layout checks.`);
