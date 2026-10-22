import { build } from 'vite';
import { isAbsolute, resolve } from 'node:path';
import { access, readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';

// Reuse an existing Playwright installation; this check does not install dependencies.
const playwrightCandidates = [
 process.env.PLAYWRIGHT_MODULE, 'playwright', '@playwright/test',
 resolve(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'),
].filter(Boolean);
let chromium;
for (const candidate of playwrightCandidates) {
 try { ({ chromium } = await import(isAbsolute(candidate) ? pathToFileURL(candidate).href : candidate)); if (chromium) break; }
 catch (_) { /* Try the next configured or bundled module. */ }
}
if (!chromium) throw new Error('Playwright is unavailable. Set PLAYWRIGHT_MODULE to an existing Playwright module.');

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'node_modules/.cache/northern-pass-ui');
const artifactOption = process.argv.find(argument => argument.startsWith('--artifacts='))?.slice('--artifacts='.length);
const artifacts = resolve(artifactOption || process.env.NORTHERN_PASS_QA_ARTIFACTS || resolve(output, 'screenshots'));
await mkdir(artifacts, { recursive: true });
const abs = path => JSON.stringify(resolve(root, path).replaceAll('\\', '/'));
const source = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import ${abs('node_modules/bootstrap/dist/css/bootstrap.min.css')};
import ${abs('src/App.css')};
import Navbar from ${abs('src/modules/layout/Navbar/Navbar.js')};
import Footer from ${abs('src/modules/layout/Footer/Footer.js')};
import GamesHub from ${abs('src/modules/exercises/GamesHub.js')};
import NorthernPassMap from ${abs('src/modules/exercises/NorthernPassMap.js')};
import * as pass from ${abs('src/services/northernPassProgress.js')};
const root = createRoot(document.getElementById('root'));
let renderId = 0;
window.passQa = {
 pass,
 fixture(name, level='A1') {
  localStorage.clear();
  const base = {version:1,coins:0,earnedCoins:0,sessions:0,completedStops:[],stageSessionBaseline:0,processedIds:[]};
  const variants = {
   fresh:base,
   ready:{...base,coins:3400,earnedCoins:3400,sessions:8,completedStops:pass.NORTHERN_PASS_STOPS.slice(0,3).map(stop=>stop.id),stageSessionBaseline:3},
   progress:{...base,coins:740,earnedCoins:1240,sessions:3,completedStops:pass.NORTHERN_PASS_STOPS.slice(0,3).map(stop=>stop.id),stageSessionBaseline:3},
   completed:{...base,coins:65400,earnedCoins:83000,sessions:70,completedStops:pass.NORTHERN_PASS_STOPS.map(stop=>stop.id),stageSessionBaseline:70},
  };
  const state=variants[name]||base;
  localStorage.setItem(pass.northernPassStorageKey('northern-ui-qa'), JSON.stringify(state));
  localStorage.setItem('norwegian_active_level',level);
  root.render(React.createElement(MemoryRouter,{key:++renderId,initialEntries:['/jocuri?nivel='+level]},
   React.createElement('div',{className:'App'},React.createElement(Navbar),React.createElement('main',{className:'App__main'},
    React.createElement(Switch,null,
     React.createElement(Route,{path:'/jocuri',exact:true},React.createElement(GamesHub)),
     React.createElement(Route,null,React.createElement('p',{'data-qa-destination':true},'Destination reached'))
    )
   ),React.createElement(Footer))));
  return pass.getNorthernPassStatus(state);
 },
 status(){return pass.getNorthernPassStatus(pass.readNorthernPassProgress(localStorage,'northern-ui-qa'));},
 award(id='qa-session'){return pass.awardNorthernPassActivity(localStorage,{userId:'northern-ui-qa',type:'practice-quiz',score:100,id});},
 map(width,height,compact=false){root.render(React.createElement('div',{style:{width,height}},React.createElement(NorthernPassMap,{stops:pass.NORTHERN_PASS_STOPS,completedCount:3,compact,onSelect:id=>{window.lastStop=id;}})));},
};
window.passQa.fixture('fresh');
`;
await mkdir(output,{recursive:true});
await writeFile(resolve(output,'entry.jsx'),source);
await build({
 configFile:resolve(root,'vite.config.js'),logLevel:'error',publicDir:false,define:{'process.env.NODE_ENV':JSON.stringify('production')},
 plugins:[{name:'northern-pass-qa',enforce:'pre',resolveId(id){
  if(id==='virtual:northern-pass-qa')return '\0virtual:northern-pass-qa';
  if(id.endsWith('/AuthContext'))return '\0virtual:northern-pass-auth';
  if(id.endsWith('/supabaseLearning'))return '\0virtual:northern-pass-sync';
 },load(id){
  if(id==='\0virtual:northern-pass-qa')return source;
  if(id==='\0virtual:northern-pass-auth')return 'export const useAuth=()=>({user:{id:"northern-ui-qa",name:"QA"},logout:()=>{}});';
  if(id==='\0virtual:northern-pass-sync')return 'export const syncLearningProgress=async()=>({});export const syncStudyActivity=async()=>({});';
 }}],
 build:{outDir:output,emptyOutDir:false,minify:false,lib:{entry:resolve(output,'entry.jsx'),formats:['iife'],name:'NorthernPassQa',fileName:()=> 'client.js'}}
});
if(process.argv.includes('--compile-only')){console.log('Northern pass interactive QA harness compiled.');process.exit(0);}
const js = await readFile(resolve(output,'client.js'),'utf8');
const css = (await Promise.all((await readdir(output)).filter(name=>name.endsWith('.css')).map(name=>readFile(resolve(output,name),'utf8')))).join('\n');
const html = '<!doctype html><html class="is-installed-app" lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body style="margin:0"><div id="root"></div><script>'+js.replaceAll('</script','<\\/script')+'</script></body></html>';
const browserCandidates = [
 process.env.PLAYWRIGHT_CHROME_EXECUTABLE_PATH,
 process.platform === 'win32' && resolve(process.env.PROGRAMFILES || 'C:/Program Files', 'Google/Chrome/Application/chrome.exe'),
 process.platform === 'win32' && resolve(process.env['PROGRAMFILES(X86)'] || 'C:/Program Files (x86)', 'Microsoft/Edge/Application/msedge.exe'),
 process.platform === 'darwin' && '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
 process.platform === 'linux' && '/usr/bin/google-chrome',
 process.platform === 'linux' && '/usr/bin/chromium',
 chromium.executablePath(),
].filter(Boolean);
let executablePath;
for (const candidate of browserCandidates) { try { await access(candidate); executablePath = candidate; break; } catch (_) { /* Try another installed browser. */ } }
const browser=await chromium.launch({...(executablePath ? { executablePath } : {}),headless:true});
const report={screens:[],failures:[],browserErrors:[]};
const shortViewports=[{width:320,height:480},{width:360,height:520}];
const viewports=process.argv.includes('--short')?shortViewports:[{width:320,height:568},{width:360,height:640},{width:390,height:844},{width:412,height:915},{width:768,height:1024},{width:1280,height:800},{width:568,height:320},...shortViewports];
const mime={svg:'image/svg+xml',png:'image/png',webp:'image/webp',jpg:'image/jpeg',woff2:'font/woff2'};
try {
 const page = await browser.newPage({reducedMotion:'reduce'});
 page.on('pageerror',error=>{report.browserErrors.push(error.message);console.error('Browser error:',error.message);});
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.hostname!=='north-pass.test')return route.abort();
  if(url.pathname==='/')return route.fulfill({contentType:'text/html',body:html});
  const relative=decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const path=resolve(root,'public',relative);
  if(!path.startsWith(resolve(root,'public')+'/')&&!path.startsWith(resolve(root,'public')+'\\'))return route.abort();
  try{return route.fulfill({contentType:mime[path.split('.').at(-1)]||'application/octet-stream',body:await readFile(path)});}catch{return route.abort();}
 });
 await page.goto('http://north-pass.test/');
 await page.waitForFunction(()=>Boolean(window.passQa&&document.querySelector('.mini-games')));
 if(process.argv.includes('--map-only')){
  const failures=[];
  for(const [width,height] of [[220,150],[284,230],[320,430],[390,650],[550,150],[700,700],[1000,600]]){
   await page.setViewportSize({width:Math.max(width,320),height:Math.max(height,568)});
   await page.evaluate(([width,height])=>window.passQa.map(width,height),[width,height]);
   await page.waitForTimeout(50);
   const controls=page.locator('.npass-map button');
   if(await controls.count()!==10)failures.push(width+'x'+height+': expected10 controls');
   for(let index=0;index<10;index++){
    await controls.nth(index).click({timeout:1000});
    const selected=await page.evaluate(()=>window.lastStop);
    if(selected!==['port','far','fiord','pod','padure','cascada','trecatoare','ghetar','varf','aurora'][index])failures.push(width+'x'+height+': inaccessible node '+index);
   }
   const positions=await controls.evaluateAll(buttons=>buttons.map(button=>{const r=button.getBoundingClientRect();const parent=button.closest('.npass-map').getBoundingClientRect();return{width:r.width,height:r.height,x:r.x,y:r.y,right:r.right,bottom:r.bottom,parent:{right:parent.right,bottom:parent.bottom},text:button.getAttribute('aria-label')};}));
   for(const r of positions)if(r.width<43.5||r.height<43.5||r.x<-.5||r.y<-.5||r.right>r.parent.right+.5||r.bottom>r.parent.bottom+.5)failures.push(width+'x'+height+': bounds '+JSON.stringify(r));
   if(width===284||width===550)await page.screenshot({path:artifacts+'/northern-pass-map-isolated-'+width+'.png'});
  }
  console.log(JSON.stringify({mapSizes:7,nodesClicked:70,failures},null,2));
  process.exitCode=failures.length?1:0;
  await browser.close();process.exit(process.exitCode);
 }
 const metric=async(label)=>{
  const state=await page.evaluate(()=>{
   const visible=e=>e.checkVisibility()&&getComputedStyle(e).visibility!=='hidden';
   const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
   const dialog=document.querySelector('dialog[open],[role="dialog"]');
   const controls=[...(dialog||document).querySelectorAll('a,button,select')].filter(visible).map(e=>({text:e.getAttribute('aria-label')||e.textContent.trim(),disabled:e.disabled,tag:e.tagName,rect:rect(e)}));
   const elements=[...document.querySelectorAll('body *')].filter(e=>visible(e)&&!e.closest('svg'));
   const overflow=elements.filter(e=>e.clientHeight>0&&e.scrollHeight>e.clientHeight+2&&['auto','scroll'].includes(getComputedStyle(e).overflowY)).map(e=>({className:e.className,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight}));
   const clipped=controls.filter(e=>e.rect.width>0&&(e.rect.x<-.5||e.rect.y<-.5||e.rect.right>innerWidth+.5||e.rect.bottom>innerHeight+.5));
   const tiny=controls.filter(e=>!e.disabled&&(e.rect.width<43.5||e.rect.height<43.5));
   const links=[...document.querySelectorAll('.mini-grid a,.mini-missions,.mini-review,.mini-daily')].map(e=>e.getAttribute('href'));
   const nav=(dialog||document).querySelector('.mobile-app-nav');
   const images=[...document.querySelectorAll('img')].filter(visible).map(e=>({src:new URL(e.src).pathname,loaded:e.complete&&e.naturalWidth>0}));
   const contentBounds=[...(dialog||document).querySelectorAll('.northern-obstacle h3,.northern-obstacle__description,.northern-obstacle__note,.northern-obstacle__reward strong,.northern-requirements label,.mini-tile h3,.mini-missions h2,.mini-review h2,.northern-overview__footer strong')].filter(visible).map(e=>({text:e.textContent,rect:rect(e),horizontal:e.scrollWidth>e.clientWidth+2}));
   const mapLabels=[...(dialog||document).querySelectorAll('.npass-map__label')].filter(visible).map(e=>({text:e.textContent,rect:rect(e),parent:rect(e.closest('.npass-map'))}));
   const maps=[...(dialog||document).querySelectorAll('.npass-map')].filter(visible).map(e=>({compact:e.classList.contains('npass-map--compact'),rect:rect(e)}));
   return {width:innerWidth,height:innerHeight,pageHeight:document.documentElement.scrollHeight,pageWidth:document.documentElement.scrollWidth,overflow,clipped,tiny,links,controls,nav:nav&&visible(nav)?rect(nav):null,images,contentBounds,mapLabels,maps,bodyText:document.body.innerText};
  });
  report.screens.push({label,...state});
  if(state.pageHeight>state.height+1)report.failures.push(label+': page vertical scroll '+state.pageHeight+'/'+state.height);
  if(state.pageWidth>state.width+1)report.failures.push(label+': page horizontal scroll '+state.pageWidth+'/'+state.width);
  if(state.overflow.length)report.failures.push(label+': internal scroll '+JSON.stringify(state.overflow));
  if(state.clipped.length)report.failures.push(label+': clipped controls '+JSON.stringify(state.clipped));
  if(state.tiny.length)report.failures.push(label+': small targets '+JSON.stringify(state.tiny));
  const clippedText=state.contentBounds.filter(item=>item.horizontal||item.rect.x<-.5||item.rect.y<-.5||item.rect.right>state.width+.5||item.rect.bottom>state.height+.5);
  if(clippedText.length)report.failures.push(label+': clipped text '+JSON.stringify(clippedText));
  const clippedLabels=state.mapLabels.filter(item=>item.rect.x<item.parent.x-1||item.rect.y<item.parent.y-1||item.rect.right>item.parent.right+1||item.rect.bottom>item.parent.bottom+1);
  if(clippedLabels.length)report.failures.push(label+': clipped map label '+JSON.stringify(clippedLabels));
  for(const map of state.maps)if(map.rect.height<(map.compact?90:150)-.5)report.failures.push(label+': map too short '+map.rect.height);
  if(state.nav){
   const covered=state.controls.filter(c=>!['Acasă','Lecții','Jocuri','Cont'].includes(c.text)&&c.rect.bottom>state.nav.y+.5&&c.rect.y<state.nav.bottom-.5);
   if(covered.length)report.failures.push(label+': nav covers control '+JSON.stringify(covered));
  }
  return state;
 };
 for(const viewport of viewports){
  await page.setViewportSize(viewport);
  for(const fixture of ['fresh','ready','completed']){
   await page.evaluate(fixture=>window.passQa.fixture(fixture),fixture);
   await page.waitForTimeout(70);
   await page.evaluate(()=>Promise.all([...document.images].map(image=>image.decode().catch(()=>{}))));
   const label=fixture+'/'+viewport.width+'x'+viewport.height;
   const state=await metric(label);
   if(new Set(state.links).size!==8)report.failures.push(label+': not all eight game links accessible ('+new Set(state.links).size+')');
   if(!state.images.some(image=>image.src==='/branding/nordlingo-selected-color.png'&&image.loaded))report.failures.push(label+': original NordLingo logo absent or unloaded');
   if(state.images.some(image=>!image.loaded))report.failures.push(label+': broken images '+JSON.stringify(state.images.filter(image=>!image.loaded)));
   if(viewport.width===390||viewport.width===320||viewport.width===568||fixture==='fresh')await page.screenshot({path:artifacts+'/northern-pass-'+fixture+'-'+viewport.width+'x'+viewport.height+'.png'});
   await page.locator('[aria-haspopup="dialog"]').click();
   await page.waitForFunction(()=>document.querySelector('dialog')?.open);
   await metric(label+'/map-current');
   if(viewport.width===390||viewport.width===320||viewport.width===568||fixture==='fresh')await page.screenshot({path:artifacts+'/northern-pass-map-'+fixture+'-'+viewport.width+'x'+viewport.height+'.png'});
   for(let stopIndex=0;stopIndex<10;stopIndex++){
    await page.locator('dialog .npass-map button').nth(stopIndex).click();
    if(await page.locator('dialog .npass-map button').nth(stopIndex).getAttribute('aria-pressed')!=='true')report.failures.push(label+': node not selected '+stopIndex);
    await metric(label+'/map-stop-'+stopIndex);
   }
   if(fixture!=='completed')await page.getByRole('button',{name:'Obstacolul curent',exact:true}).click();
   if(fixture==='ready'){
    await page.locator('.northern-obstacle__action').evaluate(button=>{button.click();button.click();});
    await page.waitForTimeout(50);
    const status=await page.evaluate(()=>window.passQa.status());
    if(status.completedCount!==4||status.state.coins!==2400||status.stageSessions!==0)report.failures.push(label+': claim/doubletap incorrect '+JSON.stringify(status));
    await metric(label+'/claimed');
   }
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const focused=await page.evaluate(()=>document.querySelector('dialog').contains(document.activeElement));
   if(!focused)report.failures.push(label+': focus escaped native dialog');
   await page.keyboard.press('Escape');
   await page.waitForFunction(()=>!document.querySelector('dialog')?.open);
   if(!await page.locator('[aria-haspopup="dialog"]').evaluate(button=>button===document.activeElement))report.failures.push(label+': Escape did not restore focus');
   await page.locator('[aria-haspopup="dialog"]').click();
   await page.waitForFunction(()=>document.querySelector('dialog')?.open);
   await page.locator('dialog .mobile-app-nav').getByRole('link',{name:'Jocuri',exact:true}).click();
   await page.waitForFunction(()=>!document.querySelector('dialog')?.open);
  }
 }
 await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({screens:report.screens.length,failures:report.failures,browserErrors:report.browserErrors},null,2));
 process.exitCode=report.failures.length||report.browserErrors.length?1:0;
}finally{await browser.close();}
