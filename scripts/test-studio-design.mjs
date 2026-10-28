import {build} from 'vite';
import {resolve} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {readFile,readdir,mkdir} from 'node:fs/promises';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'node_modules/.cache/studio-design-check');
await mkdir(out,{recursive:true});
await build({configFile:resolve(root,'vite.config.js'),logLevel:'error',build:{ssr:true,outDir:out,emptyOutDir:false,rollupOptions:{input:{home:resolve(root,'src/modules/exercises/StudioHome.js'),catalog:resolve(root,'src/modules/exercises/DesktopConversationStudio.js'),practice:resolve(root,'src/modules/exercises/PracticeOverview.js')},output:{entryFileNames:'[name].mjs'}}}});
const {default:Home}=await import(pathToFileURL(resolve(out,'home.mjs')));
const {default:Practice}=await import(pathToFileURL(resolve(out,'practice.mjs')));
const {default:Catalog}=await import(pathToFileURL(resolve(out,'catalog.mjs')));
const {resolvePublicScenario}=await import('../src/modules/exercises/scenarioDifficulty.mjs');
const data=JSON.parse(await readFile(resolve(root,'src/modules/exercises/conversationScenarios.json'),'utf8'));
const scenarios=data.scenarios.map(s=>{const r=resolvePublicScenario(s,data.levels,'A2');return {...r.scenario,difficulty:r.difficulty}});
const selected=scenarios.find(s=>s.id==='cafe-order');
const flow={session:null,messages:[],progress:{},reset(){},start(){},choose(){},again(){},setDraft(){}};
const props={level:'A2',path:{id:'general'},scenarios,flow,setHint(){}};
const active={...flow,session:{sessionToken:'test',done:false,achieved:[0],turn:1,maxTurns:selected.difficulty.turns},messages:[{role:'assistant',text:'Hei! Hva vil du bestille?'},{role:'user',text:'Jeg vil gjerne ha en kaffe.'},{role:'assistant',text:'Vil du ha melk i kaffen?'}]};
const done={...active,session:{...active.session,done:true,endReason:'success',achieved:selected.goals.map((_,i)=>i),feedback:'Ai formulat cererea și ai confirmat comanda.'}};
const css=(await Promise.all((await readdir(resolve(root,'dist/assets'))).filter(n=>n.endsWith('.css')).map(n=>readFile(resolve(root,'dist/assets',n),'utf8')))).join('\n');
const {chromium}=await import(pathToFileURL(resolve(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage();
 await page.route('http://studio.test/**',async route=>{
  const pathname=new URL(route.request().url()).pathname;
  if(!pathname.startsWith('/images/')&&!pathname.startsWith('/branding/'))return route.fulfill({contentType:'text/html',body:'<html></html>'});
  try{return route.fulfill({contentType:pathname.endsWith('.webp')?'image/webp':'image/png',body:await readFile(resolve(root,'public','.'+pathname))})}catch{return route.fulfill({status:404,body:''})}
 });
 await page.goto('http://studio.test/');
 const fixtures=[['home',Home,{}],['free',Home,{}],['catalog',Catalog,props],['active',Catalog,{...props,selected,flow:active}],['result',Catalog,{...props,selected,flow:done}],['long',Catalog,{...props,selected,flow:{...active,messages:[...active.messages,{role:'assistant',text:'Et lengre svar. '.repeat(120)}]}}]];
 let count=0;
 for(const installed of [false,true])for(const [width,height] of [[390,844],[360,640],[1366,900]])for(const [name,View,p] of fixtures){
  globalThis.localStorage={getItem(){return null}};
  globalThis.window={SpeechRecognition:class{},localStorage:globalThis.localStorage};
  const markup=renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:['/studio?nivel=A2'+(name==='free'?'&mod=liber':'')]},React.createElement(View,p)));
  delete globalThis.window;
  await page.setViewportSize({width,height});
  await page.setContent('<html class="'+(installed?'is-installed-app':'')+'"><head><base href="http://studio.test/"><style>'+css+'</style></head><body><div id="root"><div class="App"><main class="App__main">'+markup+'</main></div></div></body></html>');
  await page.evaluate(async()=>{await Promise.all([...document.images].map(im=>im.decode().catch(()=>{})));await document.fonts.ready});
  const dimensions=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,canvas:[document.documentElement,document.body,document.querySelector('.App'),document.querySelector('.App__main')].map(el=>getComputedStyle(el).backgroundColor)}));
  assert.ok(dimensions.scroll<=width+1,name+' overflows horizontally '+JSON.stringify(dimensions));
  assert.ok(dimensions.canvas.every(c=>c==='rgb(253, 253, 249)'),name+' canvas');
  assert.equal(await page.locator('.mobile-app-nav').count(),name==='home'?1:0,name+' navigation scope');
  if(name==='home'){
   assert.equal(await page.locator('.studio-hero').count(),0,'home has no Nora banner');
   const nav=await page.locator('.mobile-app-nav').evaluate(el=>({radius:getComputedStyle(el).borderRadius,active:getComputedStyle(el.querySelector('.active')).backgroundImage,weight:getComputedStyle(el.querySelector('a')).fontWeight,position:getComputedStyle(el).position}));
   assert.equal(nav.radius,'18px');assert.match(nav.active,/linear-gradient/);assert.equal(nav.weight,'850');
   assert.equal(nav.position,width<=680?'fixed':'static');
   const layout=await page.evaluate(()=>{
    const rect=selector=>document.querySelector(selector).getBoundingClientRect();
    return {height:document.documentElement.scrollHeight,viewport:innerHeight,
     titleRight:rect('.studio-heading h1').right,artLeft:rect('.studio-heading-art').left,
     artTop:rect('.studio-heading-art').top,titleTop:rect('.studio-heading h1').top,
     levelBottom:rect('.exercise-level-select').bottom,
     actionBottom:[...document.querySelectorAll('.studio-options .studio-primary')].at(-1).getBoundingClientRect().bottom,
     navTop:rect('.mobile-app-nav').top};
   });
   assert.ok(layout.height<=layout.viewport+1,'home fits viewport '+JSON.stringify({width,height,installed,layout}));
   assert.ok(layout.titleRight<=layout.artLeft,'title and illustration remain separate');
   assert.ok(layout.artTop>=layout.levelBottom,'illustration stays below level control');
   assert.ok(layout.artTop<layout.titleTop,'landscape rises beside title');
   assert.ok(layout.actionBottom<=layout.navTop,'home actions stay above navigation');
  }
  if(name==='catalog')assert.equal(await page.locator('.sc-card-art image[href="/images/studio/practical-reference.png"]').count(),4);
  const last=page.locator('button:visible,a:visible').last();await last.scrollIntoViewIfNeeded();assert.ok(await last.isVisible());
  if(name==='long')assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight),'long conversation remains scrollable');
  if(width===390&&!installed&&name!=='long'){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:resolve(out,name+'.png'),fullPage:true});}
  await page.evaluate(()=>document.querySelector('.App__main').innerHTML='<p>Home</p>');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--exercise-canvas').trim()),'');
  count++;
 }

 for(const installed of [false,true])for(const [width,height] of [[390,844],[360,640],[1366,900]]){
  await page.setViewportSize({width,height});
  const markup=renderToStaticMarkup(React.createElement(MemoryRouter,null,React.createElement(Practice,{level:'B1'})));
  for(const [selector,destination,artClick] of [
   ['.practice-studio-entry','/studio?nivel=B1',true],
   ['.practice-studio-action:not(.practice-studio-action--free)','/scenarii?nivel=B1',false],
   ['.practice-studio-action--free','/studio?nivel=B1&mod=liber',false]
  ]){
   await page.goto('http://studio.test/');
   await page.setContent('<html class="'+(installed?'is-installed-app':'')+'"><head><base href="http://studio.test/"><style>'+css+'</style></head><body><div id="root"><div class="App"><main class="App__main"><div class="practice-hub">'+markup+'</div></main></div></div></body></html>');
   const link=page.locator(selector);await link.scrollIntoViewIfNeeded();
   if(artClick){const box=await link.boundingBox();await page.mouse.click(box.x+box.width*.85,box.y+box.height*.25);}
   else await link.click();
   await page.waitForURL('http://studio.test'+destination);count++;
  }
 }
 console.log('PASS: '+count+' studio layouts, short/long content, controls, canvas and navigation cleanup. Screenshots: '+out);
}finally{await browser.close()}
