import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

// Run after build:client: use the complete production cascade, not isolated CSS.
const root=resolve(import.meta.dirname,'..');
const assets=resolve(root,'dist/assets');
const cssFiles=(await readdir(assets)).filter(name=>name.endsWith('.css'));
assert.ok(cssFiles.length,'Run npm run build:client before the canvas check.');
const css=(await Promise.all(cssFiles.map(name=>readFile(resolve(assets,name),'utf8')))).join('\n');
const {chromium}=await import(pathToFileURL(resolve(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')));
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}:{})});
const fixtures=[
 ['exercise-screen verb-notebook','verb notebook'],
 ['exercise-screen recap-page recap-hub','ivory practice hub'],
 ['exercise-screen recap-page recap-summary','ivory practice hub'],
 ['conversation-studio studio-design studio-home','reference studio'],
 ['conversation-studio studio-design mobile-conversation mobile-conversation--catalog','reference studio'],
 ['conversation-studio studio-design airy-conversation natural-conversation','reference studio'],
 ['practice-hub','ivory practice hub'],['desktop-games-hub','practice hub'],
 ['conversation-studio airy-conversation','airy scenario'],
 ['exercise-screen','generic exercise'],['exercise-screen nordic-exercise','Nordic exercise'],
 ['vocabulary-notebook','vocabulary'],['sentence-workshop','sentences'],
 ['listening-expedition','listening'],['word-discovery word-discovery--web','word discovery'],
 ['verb-practice verb-practice--app','verbs'],['pronunciation-cathedral pronunciation-nordic','pronunciation'],
 ['review-page recall-sheet','review'],['conversation-studio mobile-conversation','scenarios'],
 ['exercise-screen final-test','final test'],
 ['conversation-studio mobile-conversation mobile-conversation--catalog','scenario catalog'],
 ['conversation-studio desktop-conversation desktop-conversation--catalog','scenario catalog'],
];
let checks=0;
try {
 const page=await browser.newPage();
 await page.setContent('<!doctype html><html><head><meta charset="utf-8"><style>'+css+'</style></head><body><div id="root"></div></body></html>');
 for(const installed of [false,true]) for(const [width,height] of [[360,640],[390,844],[1366,900]]) {
  await page.setViewportSize({width,height});
  await page.evaluate(installed=>document.documentElement.classList.toggle('is-installed-app',installed),installed);
  for(const [classes,label] of fixtures) {
   // A deliberately short card reproduces the original gap beneath an exercise.
   await page.evaluate(classes=>{document.getElementById('root').innerHTML='<div class="App"><main class="App__main"><section class="'+classes+'" style="height:280px!important;min-height:0!important;max-height:none!important;margin:0!important;padding:12px!important"><article>Short exercise / empty / result state</article></section></main><footer class="footer">Site footer</footer></div>';},classes);
   const actual=await page.evaluate(()=>{
    const app=document.querySelector('.App'), main=document.querySelector('.App__main');
    const expected=getComputedStyle(app).backgroundColor;
    return {expected,surfaces:[document.documentElement,document.body,document.getElementById('root'),main].map(el=>getComputedStyle(el).backgroundColor),appBottom:app.getBoundingClientRect().bottom,height:innerHeight,scrollHeight:document.documentElement.scrollHeight,footer:getComputedStyle(document.querySelector('.footer')).display};
   });
   const context=`${label}, ${installed?'installed':'web'}, ${width}x${height}`;
   const installedColors={'Nordic exercise':'rgb(6, 45, 61)',vocabulary:'rgb(245, 234, 214)',sentences:'rgb(255, 250, 240)',listening:'rgb(243, 232, 212)','word discovery':'rgb(8, 47, 63)',verbs:'rgb(255, 250, 240)',pronunciation:'rgb(250, 249, 244)',review:'rgb(243, 237, 223)',scenarios:'rgb(250, 248, 239)'};
   const theme=['sentences','listening','verb notebook'].includes(label)?'rgb(254, 252, 247)':label==='reference studio'?'rgb(253, 253, 249)':label==='ivory practice hub'?'rgb(254, 252, 247)':label==='practice hub'?'rgb(248, 246, 238)':label==='airy scenario'?'rgb(255, 252, 242)':label==='scenario catalog'?'rgb(247, 241, 226)':installed?(installedColors[label]||'rgb(244, 249, 250)'):(label==='pronunciation'?'rgb(250, 249, 244)':label==='review'?'rgb(243, 237, 223)':'rgb(247, 249, 251)');
   assert.equal(actual.expected,theme,context+': correct theme surface');
   assert.notEqual(actual.expected,'rgb(255, 255, 255)',context+': explicit exercise surface');
   assert.notEqual(actual.expected,'rgba(0, 0, 0, 0)',context+': opaque canvas');
   for(const surface of actual.surfaces)assert.equal(surface,actual.expected,context+': no white document/main strip');
   assert.ok(actual.appBottom>=actual.height-1,context+': App covers viewport');
   assert.ok(actual.scrollHeight<=actual.height+1,context+': short content does not add scroll');
   assert.equal(actual.footer,'none',context+': no reserved footer');
   checks++;
  }
 }
 // Long ordinary exercises remain reachable; the shared fix must not clip them.
 await page.evaluate(()=>{document.documentElement.classList.remove('is-installed-app');document.getElementById('root').innerHTML='<div class="App"><main class="App__main"><section class="exercise-screen" style="height:1500px"><button id="last">Last action</button></section></main></div>';});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight>=1500),'Long exercise content stays scrollable');
 // Leaving an exercise restores normal page styles automatically.
 await page.evaluate(()=>{document.getElementById('root').innerHTML='<div class="App"><main class="App__main"><div>Home</div></main></div>';});
 assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--exercise-canvas').trim()),'','No exercise canvas leaks onto other pages');
 console.log(`PASS: ${checks} exercise canvas checks; long content and navigation cleanup.`);
} finally {await browser.close();}
