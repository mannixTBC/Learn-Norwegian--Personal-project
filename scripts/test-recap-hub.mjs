import {build} from 'vite';
import {resolve} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {readFile,readdir,mkdir} from 'node:fs/promises';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import TestRenderer,{act} from 'react-test-renderer';
import {MemoryRouter} from 'react-router-dom';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'node_modules/.cache/recap-hub-check');await mkdir(out,{recursive:true});
await build({configFile:resolve(root,'vite.config.js'),logLevel:'error',build:{ssr:true,outDir:out,emptyOutDir:false,rollupOptions:{input:resolve(root,'src/modules/lessons/RecapHub.js'),output:{entryFileNames:'recap.mjs'}}}});
const {default:Hub,LessonSummary}=await import(pathToFileURL(resolve(out,'recap.mjs')));
const wrap=(View,level)=>React.createElement(MemoryRouter,{initialEntries:['/recapitulare-azi?nivel='+level]},React.createElement(View));
globalThis.localStorage={getItem:()=>null,setItem(){}};globalThis.window={localStorage:globalThis.localStorage};
for(const level of ['A1','A2','B1','B2','C1','C2']){
 let r;await act(async()=>{r=TestRenderer.create(wrap(Hub,level));});
 const cards=r.root.findAllByProps({className:'recap-choice'}).filter(n=>n.type==='a');
 assert.deepEqual(cards.map(n=>n.props.href),['/sumar-lectii','/challenge30','/gramatica'].map(path=>path+'?nivel='+level));
 assert.equal(r.root.findAllByType('button').length,0,'cards have no separate arrow/button');
 await act(async()=>r.unmount());
 await act(async()=>{r=TestRenderer.create(wrap(LessonSummary,level));});
 assert.equal(r.root.findAllByProps({'aria-label':'Lecția anterioară'}).length,0);
 assert.equal(r.root.findAllByProps({className:'summary-sound'}).length,4);
 await act(async()=>r.root.findByProps({'aria-label':'Lecția următoare'}).props.onClick());
 assert.equal(r.root.findByProps({className:'summary-grammar'}).props.to,'/gramatica?nivel='+level+'&lectie=2');
 assert.equal(r.root.findByProps({className:'summary-restart'}).props.to,'/curs/'+level.toLowerCase()+'/2');
 await act(async()=>r.root.findByProps({'aria-label':'Lecția anterioară'}).props.onClick());
 assert.equal(r.root.findAllByProps({'aria-label':'Lecția anterioară'}).length,0);
 await act(async()=>r.unmount());
}
const css=(await Promise.all((await readdir(resolve(root,'dist/assets'))).filter(n=>n.endsWith('.css')).map(n=>readFile(resolve(root,'dist/assets',n),'utf8')))).join('\n');
const {chromium}=await import(pathToFileURL(resolve(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage();
 await page.route('http://recap.test/**',async route=>{const path=new URL(route.request().url()).pathname;if(!path.startsWith('/images/')&&!path.startsWith('/branding/'))return route.fulfill({contentType:'text/html',body:'<html></html>'});try{return route.fulfill({contentType:'image/png',body:await readFile(resolve(root,'public','.'+path))});}catch{return route.fulfill({status:404,body:''});}});
 for(const installed of [false,true])for(const [width,height] of [[320,568],[390,844],[1366,900]])for(const [name,View] of [['hub',Hub],['summary',LessonSummary]]){
 await page.setViewportSize({width,height});await page.goto('http://recap.test/');
 const markup=renderToStaticMarkup(wrap(View,'A2'));await page.setContent('<html class="'+(installed?'is-installed-app':'')+'"><head><base href="http://recap.test/"><style>'+css+'</style></head><body><div id="root"><div class="App"><nav class="navbar">Navigation</nav><main class="App__main">'+markup+'</main><footer class="footer">Footer</footer></div></div></body></html>');
 await page.evaluate(async()=>{await Promise.all([...document.images].map(im=>im.decode()));await document.fonts.ready;});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 assert.ok(await page.evaluate(()=>[document.documentElement,document.body,document.querySelector('.App'),document.querySelector('.App__main')].every(el=>getComputedStyle(el).backgroundColor==='rgb(254, 252, 247)')));
 assert.equal(await page.locator('.navbar').evaluate(el=>getComputedStyle(el).display),'none');
 assert.equal(await page.locator('.mobile-app-nav').count(),1);assert.equal(await page.locator('.mobile-app-nav .active').getAttribute('href'),'/jocuri?nivel=A2');
 if(name==='hub'){
 assert.equal(await page.locator('.recap-choice').count(),3);
 for(const card of await page.locator('.recap-choice').all()){await card.scrollIntoViewIfNeeded();assert.ok(await card.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}));}
 if(width===390&&!installed){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:resolve(out,'hub.png'),fullPage:true});}
 // The illustration itself is an entry point, not just the title.
 await page.locator('.recap-choice').first().locator('svg').click();await page.waitForURL('http://recap.test/sumar-lectii?nivel=A2');
 }else{await page.locator('.summary-restart').scrollIntoViewIfNeeded();assert.ok(await page.locator('.summary-restart').isVisible());}
 if(name==='summary'&&width===390&&!installed){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:resolve(out,'summary.png'),fullPage:true});}
 if(name==='summary'){await page.evaluate(()=>document.querySelector('.App__main').innerHTML='<p>Acasă</p>');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--exercise-canvas').trim()),'');}
 }
 console.log('PASS: all six levels, three direct card destinations, lesson selection, full-card clicks, original navigation and 12 web/app layouts.');
}finally{await browser.close();delete globalThis.window;delete globalThis.localStorage;}
