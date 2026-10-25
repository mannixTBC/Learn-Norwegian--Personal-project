import { build } from 'vite';
import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { resolvePublicScenario } from '../src/modules/exercises/scenarioDifficulty.mjs';
const root = resolve(import.meta.dirname, '..');
const catalog = JSON.parse(await readFile(resolve(root, 'src/modules/exercises/conversationScenarios.json'), 'utf8'));
const scenarios = catalog.scenarios.map(s => { const r=resolvePublicScenario(s,catalog.levels,'A1'); return {...r.scenario,difficulty:r.difficulty}; });
const outDir=resolve(root,'node_modules/.cache/scenario-catalog-tests');
await build({configFile:resolve(root,'vite.config.js'),logLevel:'error',build:{ssr:true,outDir,emptyOutDir:true,rollupOptions:{input:{mobile:resolve(root,'src/modules/exercises/MobileConversationStudio.js'),desktop:resolve(root,'src/modules/exercises/DesktopConversationStudio.js')},output:{entryFileNames:'[name].mjs'}}}});
const {default:Mobile}=await import(pathToFileURL(resolve(outDir,'mobile.mjs')));
const {default:Desktop}=await import(pathToFileURL(resolve(outDir,'desktop.mjs')));
const props={level:'A1',path:{id:'transport'},scenarios,flow:{progress:{},choose(){}}};
const wrap=(View,p=props)=>React.createElement(MemoryRouter,null,React.createElement(View,p));
const classes=(r,c)=>r.root.findAll(n=>typeof n.type==='string'&&n.props.className?.split(' ').includes(c));
for(const View of [Mobile,Desktop]){
 let r,chosen;
 await act(async()=>{r=TestRenderer.create(wrap(View,{...props,flow:{progress:{},choose:id=>chosen=id}}));});
 assert.equal(classes(r,'sc-card').length,4);
 assert.ok(classes(r,'sc-card')[0].findAllByType('h2')[0].children.join('').includes(scenarios.find(s=>s.path==='transport').title));
 const first=classes(r,'sc-card')[0];
 await act(async()=>first.props.onClick());
 assert.equal(chosen,scenarios.find(s=>s.path==='transport').id);
 const next=()=>r.root.findByProps({'aria-label':'Pagina următoare'});
 const previous=()=>r.root.findByProps({'aria-label':'Pagina anterioară'});
 assert.equal(previous().props.disabled,true);
 await act(async()=>next().props.onClick());
 assert.equal(previous().props.disabled,false);
 const filter=r.root.findAllByType('select').find(n=>n.props.value==='all');
 await act(async()=>filter.props.onChange({target:{value:'transport'}}));
 assert.equal(classes(r,'sc-card').length,scenarios.filter(s=>s.path==='transport').length);
 assert.equal(previous().props.disabled,true);
 await act(async()=>filter.props.onChange({target:{value:'all'}}));
 await act(async()=>r.root.findAllByType('button').find(n=>n.children.join('')==='Toate').props.onClick());
 assert.equal(classes(r,'sc-card')[0].findByType('h2').children.join(''),[...scenarios].sort((a,b)=>a.title.localeCompare(b.title,'ro'))[0].title);
 while(!next().props.disabled)await act(async()=>next().props.onClick());
 assert.ok(classes(r,'sc-card').length<=4);
 await act(async()=>r.update(wrap(View,{...props,level:'B1'})));
 assert.equal(previous().props.disabled,true);
 await act(async()=>r.update(wrap(View,{...props,scenarios:[]})));
 assert.equal(classes(r,'sc-card').length,0);
 assert.ok(r.root.findByProps({role:'status'}));
 await act(async()=>r.unmount());
}
const assets=resolve(root,'dist/assets');
const css=(await Promise.all((await readdir(assets)).filter(n=>n.endsWith('.css')).map(n=>readFile(resolve(assets,n),'utf8')))).join('\n');
const {chromium}=await import(pathToFileURL(resolve(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')));
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}:{})});
try{
 const page=await browser.newPage();
 await page.route('http://scenario.test/**',async route=>{
   try {
    const pathname=new URL(route.request().url()).pathname;
    if(!pathname.startsWith('/branding/')&&!pathname.startsWith('/images/'))return route.fulfill({contentType:'text/html',body:'<html></html>'});
    const body=await readFile(resolve(root,'public','.'+pathname));
    return route.fulfill({contentType:pathname.endsWith('.webp')?'image/webp':'image/png',body});
   }catch{return route.fulfill({status:404,body:''});}
  });
 await page.goto('http://scenario.test/');
 for(const installed of [false,true]) for(const [width,height] of [[360,640],[390,844],[1366,900],[740,360]]){
  await page.setViewportSize({width,height});
  for(const kind of ['normal','long','empty']){
   const data=kind==='empty'?[]:kind==='long'?scenarios.map(s=>({...s,title:s.title+' — o situație cu mai multe detalii de discutat',place:s.place+' și detalii suplimentare pentru această conversație'})):scenarios;
   const html=renderToStaticMarkup(wrap(installed?Mobile:Desktop,{...props,scenarios:data}));
   await page.setContent('<html class="'+(installed?'is-installed-app':'')+'"><head><base href="http://scenario.test/"><style>'+css+'</style></head><body><div id="root"><div class="App"><main class="App__main">'+html+'</main></div></div></body></html>');
   await page.locator('.sc-brand img').evaluate(im=>im.decode());
   assert.ok(await page.locator('.sc-brand img').evaluate(im=>im.naturalWidth>0),'real brand image must decode');
   const result=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:innerHeight,scrollHeight:document.documentElement.scrollHeight,canvas:[document.documentElement,document.body,document.getElementById('root'),document.querySelector('.App'),document.querySelector('.App__main')].map(e=>getComputedStyle(e).backgroundColor)}));
   assert.ok(result.scrollWidth<=width+1,JSON.stringify({installed,width,height,kind,result}));
   assert.ok(result.canvas.every(c=>c==='rgb(247, 241, 226)'),JSON.stringify(result));
   if(kind==='empty'||(kind==='normal'&&height>=640))assert.ok(result.scrollHeight<=height+1,JSON.stringify({installed,width,height,kind,result}));
   for(const card of await page.locator('.sc-card').all()){
    const overflow=await card.evaluate(e=>({h:e.clientHeight,sh:e.scrollHeight,w:e.clientWidth,sw:e.scrollWidth}));
    assert.ok(overflow.sh<=overflow.h+1&&overflow.sw<=overflow.w+1,JSON.stringify(overflow));
   }
   await page.locator('.sc-pagination button').last().scrollIntoViewIfNeeded();
  }
  await page.evaluate(()=>document.querySelector('.App__main').innerHTML='<div>Jocuri</div>');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--exercise-canvas').trim()),'');
 }
}finally{await browser.close();}
console.log('PASS: catalog filtering, ordering, paging, selection, context reset, empty states; responsive web/app layouts, long content and navigation cleanup.');
