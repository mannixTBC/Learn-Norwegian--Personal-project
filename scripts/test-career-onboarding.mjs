import { build } from 'vite';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'node_modules/.cache/guest');
await mkdir(output, { recursive: true });
const abs = path => JSON.stringify(resolve(root, path).replaceAll('\\', '/'));
await writeFile(resolve(output, 'entry.jsx'), `
import React from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter,Route,Switch} from 'react-router-dom';
import ${abs('node_modules/bootstrap/dist/css/bootstrap.min.css')};
import ${abs('src/App.css')};
import withCareerProfile from ${abs('src/modules/onboarding/CareerProfileGate.js')};
import CareerOnboarding from ${abs('src/modules/onboarding/CareerOnboarding.js')};
import {getCareerProfile} from ${abs('src/services/careerProfile.js')};
const Home=withCareerProfile(()=> <div id="home">Acasă</div>);
window.profile=()=>getCareerProfile({id:'guest'});
createRoot(document.getElementById('root')).render(<MemoryRouter initialEntries={['/dashboard']}><div className="App"><nav className="navbar">Nav</nav><main className="App__main"><Switch><Route path="/alege-directia" component={CareerOnboarding}/><Route><Home/></Route></Switch></main><footer className="footer">Footer</footer></div></MemoryRouter>);
`);
await build({configFile:resolve(root,'vite.config.js'),publicDir:false,logLevel:'error',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'onboarding-auth',enforce:'pre',resolveId(id){if(id.endsWith('/AuthContext'))return '\0qa-auth';},load(id){if(id==='\0qa-auth')return 'export const useAuth=()=>({user:{id:"guest"}});';}}],build:{outDir:output,emptyOutDir:false,lib:{entry:resolve(output,'entry.jsx'),formats:['iife'],name:'OnboardingQa',fileName:()=> 'client.js'}}});
const js=await readFile(resolve(output,'client.js'),'utf8');
const css=(await Promise.all((await readdir(output)).filter(f=>f.endsWith('.css')).map(f=>readFile(resolve(output,f),'utf8')))).join('\n');
const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div id="root"></div><script>${js.replaceAll('</script','<\\/script')}</script></body></html>`;
const {chromium}=await import(pathToFileURL(resolve(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try {
 for(const [width,height] of [[320,640],[360,640],[390,844],[1280,800]]) {
  const page=await browser.newPage({viewport:{width,height}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async route=>{
   const pathname=new URL(route.request().url()).pathname;
   if(pathname==='/')return route.fulfill({contentType:'text/html',body:html});
   if(pathname.startsWith('/branding/')||pathname.startsWith('/images/'))return route.fulfill({body:await readFile(resolve(root,'public',pathname.slice(1)))});
   return route.abort();
  });
  await page.goto('http://onboarding.test/');
  await page.waitForSelector('.career-onboarding__row');
  assert.equal(await page.locator('.career-onboarding__row').count(),10);
  assert.equal(await page.locator('.navbar').isVisible(),false);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight),true,'Route list fits viewport');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor),'rgb(255, 254, 250)');
  await page.getByRole('button',{name:'Transport',exact:true}).click();
  await page.waitForSelector('.is-selected');
  await page.locator('.career-onboarding--levels').waitFor();
  assert.equal(await page.evaluate(()=>window.profile()),null);
  assert.equal(await page.locator('.career-onboarding__row').count(),4);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight),true,'Levels fit viewport');
  assert.equal(await page.locator('.career-onboarding__route').count(),0);
  await page.getByRole('button',{name:'Înapoi la trasee'}).click();
  await page.getByRole('button',{name:'Transport',exact:true}).click();
  await page.locator('.career-onboarding--levels').waitFor();
  if(width===390)await page.waitForTimeout(250);
  if(width===390)await page.screenshot({path:resolve(output,'levels.png'),fullPage:true});
  await page.getByRole('button',{name:/Intermediar/}).click();
  await page.locator('#home').waitFor();
  assert.equal(await page.evaluate(()=>localStorage.getItem('norwegian_active_level')),'B1');
  assert.equal(await page.evaluate(()=>window.profile().pathId),'transport');
  assert.equal(await page.locator('.navbar').isVisible(),true);
  assert.deepEqual(errors,[]);
  await page.close();
 }
 console.log('Onboarding passed: 320/390/1280px, route selection, back, four levels, persistence, navigation and canvas.');
} finally { await browser.close(); }

