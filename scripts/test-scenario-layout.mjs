import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {homedir} from 'node:os';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {resolvePublicScenario} from '../src/modules/exercises/scenarioDifficulty.mjs';
const root=resolve(import.meta.dirname,'..');
const catalog=JSON.parse(await readFile(resolve(root,'src/modules/exercises/conversationScenarios.json'),'utf8'));
const {default:Desktop}=await import(pathToFileURL(resolve(root,'node_modules/.cache/scenario-catalog-tests/desktop.mjs')));
const {default:Mobile}=await import(pathToFileURL(resolve(root,'node_modules/.cache/scenario-catalog-tests/mobile.mjs')));
const assets=resolve(root,'dist/assets');
const css=(await Promise.all((await readdir(assets)).filter(n=>n.endsWith('.css')).map(n=>readFile(resolve(assets,n),'utf8')))).join('\n');
const {chromium}=await import(pathToFileURL(resolve(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')));
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}:{})});
let checks=0;
try{
 const page=await browser.newPage();
 const atlas=await readFile(resolve(root,'public/images/voice/scenario-illustrations.png'));
 await page.route('http://scenario.test/**',async route=>{
   try {
    const pathname=new URL(route.request().url()).pathname;
    if(!pathname.startsWith('/branding/')&&!pathname.startsWith('/images/'))return route.fulfill({contentType:'text/html',body:'<html></html>'});
    const body=await readFile(resolve(root,'public','.'+pathname));
    return route.fulfill({contentType:pathname.endsWith('.webp')?'image/webp':'image/png',body});
   }catch{return route.fulfill({status:404,body:''});}
  });
 await page.goto('http://scenario.test/');
 for(const installed of [false,true])for(const [width,height] of [[360,640],[390,844],[1366,900],[740,360]])for(const kind of ['ready','long','active','result']){
  await page.setViewportSize({width,height});
  const r=resolvePublicScenario(catalog.scenarios.find(s=>s.id==='cafe-order'),catalog.levels,'C2');
  const selected={...r.scenario,difficulty:r.difficulty};
  if(kind==='long')selected.brief+=' '+selected.brief.repeat(4);
  const session=kind==='result'?{done:true,achieved:[0],turn:10,maxTurns:10,endReason:'turn_limit',feedback:'Mai ai de exersat. '.repeat(30)}:kind==='active'?{done:false,achieved:[0],turn:1,maxTurns:10,sessionToken:'fixture'}:null;
  const flow={session,messages:kind==='active'?[{role:'assistant',text:'Hei! Hva vil du bestille?'},{role:'user',text:'En kaffe, takk.'},{role:'assistant',text:'Vil du ha en liten eller stor kaffe?'}]:[],draft:'',busy:false,progress:{},reset(){},start(){},again(){}};
  globalThis.window={SpeechRecognition:class {}};
  const html=renderToStaticMarkup(React.createElement(MemoryRouter,null,React.createElement(installed?Mobile:Desktop,{level:'C2',path:{id:'transport'},scenarios:[selected],selected,flow})));
  delete globalThis.window;
  await page.setContent('<html class="'+(installed?'is-installed-app':'')+'"><head><style>'+css+'</style></head><body><div id="root"><div class="App"><main class="App__main">'+html+'</main></div></div></body></html>');

  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),JSON.stringify({installed,width,height,kind}));
  const background=await page.evaluate(()=>[document.documentElement,document.body,document.querySelector('#root'),document.querySelector('.App'),document.querySelector('.App__main')].map(e=>getComputedStyle(e).backgroundColor));
  assert.ok(background.every(c=>c===background[0]),'uniform outer canvas');
  const image=page.locator(kind==='result'?'.studio-result-art':'.studio-heading-art');
  const box=await image.boundingBox();assert.ok(box.width>100&&box.height>100,'scene must not inherit icon size');
  const controls=kind==='result'?page.getByRole('link',{name:'Vezi recapitularea'}):page.locator('.scenario-voice__mic');
  await controls.scrollIntoViewIfNeeded();assert.ok(await controls.isVisible());
  if(kind==='result')assert.equal(await controls.getAttribute('href'),'/recapitulare?nivel=C2');
  if(kind==='active'&&width===390&&installed){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:resolve(root,'node_modules/.cache/scenario-active.png'),fullPage:true});}
  await page.evaluate(()=>document.querySelector('.App__main').innerHTML='<p>Jocuri</p>');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--exercise-canvas').trim()),'');
  assert.equal(await page.locator('textarea,input[type=text]').count(),0);
  checks++;
 }
 await page.evaluate(async()=>{const im=new Image();im.src='/images/voice/scenario-illustrations.png';await im.decode();if(im.naturalWidth!==1536)throw Error('Invalid atlas');});
}finally{await browser.close();}
console.log('PASS: '+checks+' browser layouts: web/app, preparation, long content, result, accessible controls, artwork and navigation cleanup.');
