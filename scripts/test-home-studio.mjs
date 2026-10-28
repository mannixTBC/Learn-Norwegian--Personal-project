import { build } from 'vite';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'node_modules/.cache/home-studio');
await mkdir(output, { recursive: true });
const abs = path => JSON.stringify(resolve(root, path).replaceAll('\\', '/'));
await writeFile(resolve(output, 'entry.jsx'), `
import React from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter,Route,Switch} from 'react-router-dom';
import ${abs('node_modules/bootstrap/dist/css/bootstrap.min.css')};
import ${abs('src/App.css')};
import AuthPage from ${abs('src/modules/dashboard/Dashboard.js')};
import ${abs('src/modules/layout/Navbar/Navbar.css')};
createRoot(document.getElementById('root')).render(<MemoryRouter><div className="App"><nav className="navbar">Nav</nav><main className="App__main"><AuthPage/></main><footer className="footer">Footer</footer></div></MemoryRouter>);
`);
await build({configFile:resolve(root,'vite.config.js'),publicDir:false,logLevel:'error',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'onboarding-auth',enforce:'pre',resolveId(id){if(id.endsWith('/appExperience'))return '\0qa-experience';if(id.endsWith('/AuthContext'))return '\0qa-auth';},load(id){if(id==='\0qa-experience')return 'export const isInstalledAppView=()=>true;';if(id==='\0qa-auth')return 'export const useAuth=()=>({user:null,initializing:false,isAuthenticated:false});';}}],build:{outDir:output,emptyOutDir:false,lib:{entry:resolve(output,'entry.jsx'),formats:['iife'],name:'OnboardingQa',fileName:()=> 'client.js'}}});
const js=await readFile(resolve(output,'client.js'),'utf8');
const css=(await Promise.all((await readdir(output)).filter(f=>f.endsWith('.css')).map(f=>readFile(resolve(output,f),'utf8')))).join('\n');
const html=`<!doctype html><html class="is-installed-app"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div id="root"></div><script>${js.replaceAll('</script','<\\/script')}</script></body></html>`;
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
  await page.waitForSelector('.dashboard-app-home .practice-studio-entry',{state:'attached'});
  await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));
  if(width<681){
    const m=await page.evaluate(()=>({h:document.documentElement.scrollHeight,w:document.documentElement.scrollWidth}));
    assert.ok(m.h<=height+1,'Home fits '+width+'x'+height+' '+JSON.stringify(m));
    assert.ok(m.w<=width+1,'Home width');
    assert.equal(await page.locator('.dashboard-app-home__discover').count(),0);
    assert.equal(await page.locator('.dashboard-app-home .practice-studio-action').first().getAttribute('href'),'/scenarii?nivel=A1');
    assert.equal(await page.locator('.dashboard-app-home .practice-studio-action--free').getAttribute('href'),'/studio?nivel=A1&mod=liber');
    assert.equal(await page.locator('.dashboard-app-home .practice-studio-entry').getAttribute('href'),'/studio?nivel=A1');
    if(width===390)await page.screenshot({path:resolve(output,'home.png'),fullPage:true});
  }
  assert.deepEqual(errors,[]);
  await page.close();
 }
 console.log('Home studio card fits mobile viewports and links to level-specific scenarios.');
} finally { await browser.close(); }

