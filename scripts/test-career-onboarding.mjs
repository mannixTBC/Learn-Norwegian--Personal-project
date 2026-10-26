import { build } from 'vite';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'node_modules/.cache/onboarding');
await mkdir(output, { recursive: true });
const abs = path => JSON.stringify(resolve(root, path).replaceAll('\\', '/'));
await writeFile(resolve(output, 'entry.jsx'), `
import React from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter,Route,Switch,useLocation} from 'react-router-dom';
import withCareerProfile from ${abs('src/modules/onboarding/CareerProfileGate.js')};
import CareerOnboarding from ${abs('src/modules/onboarding/CareerOnboarding.js')};
import {getCareerProfile} from ${abs('src/services/careerProfile.js')};
const Home=withCareerProfile(()=>{const location=useLocation();return <div id="home">{location.pathname+location.search+location.hash}</div>;});
window.profile=(id='onboarding-qa')=>getCareerProfile({id});
const root=createRoot(document.getElementById('root'));
let run=0;
window.mount=(path='/dashboard')=>root.render(<MemoryRouter key={++run} initialEntries={[path]}><div className="App"><nav className="navbar">Nav</nav><main className="App__main"><Switch><Route path="/alege-directia" component={CareerOnboarding}/><Route><Home/></Route></Switch></main><footer className="footer">Footer</footer></div></MemoryRouter>);
const originalSetItem=Storage.prototype.setItem;
window.failSave=(fail)=>{Storage.prototype.setItem=function(key,value){if(fail&&key.startsWith('norwegian_career_profile'))throw new Error('Storage unavailable');return originalSetItem.call(this,key,value);};};
window.mount();
`);
await build({configFile:resolve(root,'vite.config.js'),publicDir:false,logLevel:'error',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'onboarding-auth',enforce:'pre',resolveId(id){if(id.endsWith('/AuthContext'))return '\0qa-auth';},load(id){if(id==='\0qa-auth')return 'export const useAuth=()=>({user:{id:"onboarding-qa"}});';}}],build:{outDir:output,emptyOutDir:false,lib:{entry:resolve(output,'entry.jsx'),formats:['iife'],name:'OnboardingQa',fileName:()=> 'client.js'}}});
const js=await readFile(resolve(output,'client.js'),'utf8');
// Include the complete production cascade, including installed-app navigation rules.
const assets=resolve(root,'dist/assets');
const css=(await Promise.all((await readdir(assets)).filter(f=>f.endsWith('.css')).map(f=>readFile(resolve(assets,f),'utf8')))).join('\n');
const html=`<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div id="root"></div><script>${js.replaceAll('</script','<\\/script')}</script></body></html>`;
const {chromium}=await import(pathToFileURL(resolve(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}:{})});
let cases=0;
try {
 for(const installed of [false,true]) for(const [width,height] of [[320,640],[360,640],[390,844],[1280,800]]) {
  const page=await browser.newPage({viewport:{width,height},reducedMotion:installed?'reduce':'no-preference'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async route=>{
   const pathname=new URL(route.request().url()).pathname;
   if(pathname==='/')return route.fulfill({contentType:'text/html',body:html});
   if(pathname==='/branding/nordlingo-selected-color.png')return route.fulfill({contentType:'image/png',body:await readFile(resolve(root,'public',pathname.slice(1)))});
   return route.abort();
  });
  await page.goto('http://onboarding.test/');
  await page.evaluate(installed=>document.documentElement.classList.toggle('is-installed-app',installed),installed);
  const waitStep=async id=>{await page.locator('.career-onboarding--'+id).waitFor();await page.waitForFunction(()=>!document.querySelector('.career-onboarding__card:disabled'));};
  const checkLayout=async step=>{
   const layout=await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,viewportWidth:innerWidth,viewportHeight:innerHeight,background:getComputedStyle(document.querySelector('.career-onboarding')).backgroundImage,title:document.activeElement.id,logo:document.querySelector('.career-onboarding__brand img').naturalWidth,paragraphs:document.querySelectorAll('.career-onboarding__content>p').length}));
   assert.ok(layout.width<=layout.viewportWidth,`${width} ${step}: no horizontal overflow`);
   assert.ok(layout.height<=layout.viewportHeight+1,`${width} ${step}: choices fit viewport (${layout.height}/${layout.viewportHeight})`);
   assert.match(layout.background,/gradient/);
   assert.doesNotMatch(layout.background,/url\(/);
   assert.equal(layout.title,'onboarding-title');
   assert.ok(layout.logo>0,'original logo loads');
   assert.equal(layout.paragraphs,0,'no helper paragraphs');
   assert.equal(await page.locator('.navbar').isVisible(),false);
   assert.equal(await page.locator('.footer').isVisible(),false);
   if(width===390&&!installed)await page.screenshot({path:resolve(output,step+'.png'),fullPage:true,animations:'disabled'});
  };
  await waitStep('support');
  await checkLayout('support');
  assert.equal(await page.locator('.career-onboarding__language').count(),4);
  await page.getByRole('button',{name:'Română',exact:true}).click();
  await waitStep('language');
  await checkLayout('language');
  assert.equal(await page.locator('.career-onboarding__language').count(),4);
  await page.getByRole('button',{name:'Norvegiană',exact:true}).click();
  await waitStep('paths');
  await checkLayout('paths');
  assert.equal(await page.locator('.career-onboarding__path').count(),10);
  await page.getByRole('button',{name:'Transport',exact:true}).click();
  await waitStep('levels');
  await checkLayout('levels');
  assert.equal(await page.evaluate(()=>window.profile()),null,'profile is saved only at completion');
  assert.equal(await page.locator('.career-onboarding__level').count(),4);
  // Backtracking preserves choices, and a changed route is saved at completion.
  await page.getByRole('button',{name:'Înapoi la traseu',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Transport',exact:true}).getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'Înapoi la limba învățată',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Norvegiană',exact:true}).getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'Înapoi la explicații',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Română',exact:true}).getAttribute('aria-pressed'),'true');
  // Keyboard-only completion, including the current progress indicator.
  await page.getByRole('button',{name:'Română',exact:true}).focus();
  await page.keyboard.press('Enter');
  await waitStep('language');
  await page.getByRole('button',{name:'Norvegiană',exact:true}).focus();
  await page.keyboard.press('Space');
  await waitStep('paths');
  await page.getByRole('button',{name:'Familie',exact:true}).click();
  await waitStep('levels');
  assert.equal(await page.locator('[aria-current="step"]').innerText(),'4. Nivel');
  await page.getByRole('button',{name:/Intermediar/}).click();
  await page.locator('#home').waitFor();
  assert.equal(await page.locator('#home').innerText(),'/dashboard');
  assert.equal(await page.evaluate(()=>localStorage.getItem('norwegian_active_level')),'B1');
  const profile=await page.evaluate(()=>window.profile());
  assert.equal(profile.pathId,'family');
  assert.equal(profile.supportLanguage,'ro');
  assert.equal(profile.learningLanguage,'nb');
  assert.equal(await page.evaluate(()=>window.profile('another-user')),null);
  assert.equal(await page.locator('.navbar').isVisible(),true);
  assert.deepEqual(errors,[]);
  if(width===390&&!installed) {
   const complete=async()=>{
    await waitStep('support');await page.getByRole('button',{name:'English',exact:true}).click();
    await waitStep('language');await page.getByRole('button',{name:'Germană',exact:true}).click();
    await waitStep('paths');await page.getByRole('button',{name:'Studii',exact:true}).click();
    await waitStep('levels');await page.getByRole('button',{name:/De bază/}).click();
   };
   // Preview-language selections persist, and the original lesson redirect is retained.
   await page.evaluate(()=>{localStorage.clear();window.mount('/alege-directia?redirect='+encodeURIComponent('/lectii?nivel=A1#start'));});
   await complete();await page.locator('#home').waitFor();
   assert.equal(await page.locator('#home').innerText(),'/lectii?nivel=A2#start');
   assert.equal((await page.evaluate(()=>window.profile())).learningLanguage,'de');
   assert.equal((await page.evaluate(()=>window.profile())).supportLanguage,'en');
   // A failed save stays on the last step and allows retry; unsafe redirects stay local.
   await page.evaluate(()=>{localStorage.clear();window.failSave(true);window.mount('/alege-directia?redirect='+encodeURIComponent('//example.com'));});
   await complete();await page.getByRole('alert').waitFor();
   assert.equal(await page.locator('#home').count(),0);
   await page.waitForFunction(()=>!document.querySelector('.career-onboarding__card:disabled'));
   await page.evaluate(()=>window.failSave(false));
   await page.getByRole('button',{name:/Avansat/}).click();await page.locator('#home').waitFor();
   assert.equal(await page.locator('#home').innerText(),'/dashboard');
   assert.equal(await page.evaluate(()=>localStorage.getItem('norwegian_active_level')),'C1');
   // Existing profiles still pass the gate.
   await page.evaluate(()=>window.mount('/dashboard'));
   await page.locator('#home').waitFor();
   assert.equal(await page.locator('.career-onboarding').count(),0);
  }
  cases++;
  await page.close();
 }
 console.log(`PASS: ${cases} web/installed viewport flows, four steps, keyboard/back, profile persistence, redirects, save retry and original logo. Screenshots: ${output}`);
} finally {await browser.close();}
