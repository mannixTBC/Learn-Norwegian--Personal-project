import {build} from 'vite';
import {resolve} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {readFile,readdir,mkdir} from 'node:fs/promises';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'node_modules/.cache/practice-design-check');
await mkdir(out,{recursive:true});
await build({configFile:resolve(root,'vite.config.js'),logLevel:'error',build:{ssr:true,outDir:out,emptyOutDir:false,rollupOptions:{input:resolve(root,'src/modules/exercises/GamesMosaic.js'),output:{entryFileNames:'practice.mjs'}}}});
const {default:Practice}=await import(pathToFileURL(resolve(out,'practice.mjs')));
const css=(await Promise.all((await readdir(resolve(root,'dist/assets'))).filter(n=>n.endsWith('.css')).map(n=>readFile(resolve(root,'dist/assets',n),'utf8')))).join('\n');
const {chromium}=await import(pathToFileURL(resolve(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')));
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const page=await browser.newPage();
 await page.route('http://practice.test/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(!path.startsWith('/images/')&&!path.startsWith('/branding/'))return route.fulfill({contentType:'text/html',body:'<html></html>'});
  try{return route.fulfill({contentType:'image/png',body:await readFile(resolve(root,'public','.'+path))})}catch{return route.fulfill({status:404,body:''})}
 });
 await page.goto('http://practice.test/');
 const markup=renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:['/jocuri?nivel=B1']},React.createElement(Practice,{level:'B1',cards:[],activities:[{id:'listen',to:'/asculta-si-alege?source=practice&nivel=A1'}]})));
 let count=0;
 for(const installed of [false,true])for(const [width,height] of [[320,568],[360,640],[390,844],[424,1000],[1366,900]]){
  await page.setViewportSize({width,height});
  await page.setContent('<html class="'+(installed?'is-installed-app':'')+'"><head><base href="http://practice.test/"><style>'+css+'</style></head><body><div id="root"><div class="App"><nav class="navbar">Web navigation</nav><main class="App__main">'+markup+'</main><footer class="footer">Footer</footer></div></div></body></html>');
  await page.evaluate(async()=>{await Promise.all([...document.images].map(im=>im.decode()));await document.fonts.ready});
  const layout=await page.evaluate(()=>({width:document.documentElement.scrollWidth,canvas:[document.documentElement,document.body,document.querySelector('.App')].map(el=>getComputedStyle(el).backgroundColor),nav:getComputedStyle(document.querySelector('.mobile-app-nav')).position,footer:getComputedStyle(document.querySelector('.footer')).display,header:getComputedStyle(document.querySelector('.navbar')).display}));
  assert.ok(layout.width<=width+1,'no horizontal overflow '+JSON.stringify({width,installed,layout}));
  assert.ok(layout.canvas.every(c=>c==='rgb(254, 252, 247)'));
  assert.equal(layout.nav,width<=680?'fixed':'static');
  assert.equal(layout.footer,'none');assert.equal(layout.header,'none');
  assert.equal(await page.locator('.practice-row').count(),4);
  assert.equal(await page.locator('.mobile-app-nav a[aria-current="page"]').getAttribute('href'),'/jocuri?nivel=B1');
  for(const link of await page.locator('.practice-row, .practice-studio-action, .practice-studio-entry').all()){
   const href=await link.getAttribute('href');assert.equal(new URL(href,'http://practice.test').searchParams.get('nivel'),'B1');
  }
  assert.equal(await page.locator('[data-game="listen"]').getAttribute('href'),'/asculta-si-alege?source=practice&nivel=B1');
  assert.equal(await page.locator('.exercise-level-select select').inputValue(),'B1');
  assert.equal(await page.locator('.practice-row').evaluateAll(els=>els.some(el=>/[\uFFFD?]/.test(el.textContent))),false,'Romanian copy is intact');
  for(const link of await page.locator('.practice-row, .practice-studio-action').all()){
   await link.evaluate(el=>el.scrollIntoView({block:'center'}));
   const hit=await link.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))});
   if(!hit)await page.screenshot({path:resolve(out,'failure.png'),fullPage:true}); assert.ok(hit,'reachable '+JSON.stringify({width,height,installed,href:await link.getAttribute('href')}));
  }
  if(width===390&&!installed){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:resolve(out,'practice.png'),fullPage:true});}
  // Larger text must grow the document and remain reachable rather than clip.
  await page.addStyleTag({content:'.practice-row strong{font-size:26px}.practice-row small{font-size:20px}.practice-studio p{font-size:22px}'});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('.practice-studio-action--free').evaluate(el=>el.scrollIntoView({block:'center'}));
  const last=await page.locator('.practice-studio-action--free').boundingBox();
  const nav=await page.locator('.mobile-app-nav').boundingBox();
  if(width<=680)assert.ok(last.y+last.height<=nav.y,'last action clears fixed navigation '+JSON.stringify({width,height,installed,last,nav}));
  await page.evaluate(()=>{document.querySelector('.App__main').innerHTML='<p>Home</p>'});
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--exercise-canvas').trim()),'');
  count++;
 }
 console.log('PASS: '+count+' practice layouts, assets, level-aware destinations, navigation, larger text and canvas cleanup. Screenshot: '+resolve(out,'practice.png'));
}finally{await browser.close()}
