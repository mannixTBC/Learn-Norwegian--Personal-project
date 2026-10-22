import { build } from 'vite';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { isAbsolute, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'node_modules/.cache/page-loading-ui');
await mkdir(output, { recursive: true });
let chromium;
for (const candidate of [process.env.PLAYWRIGHT_MODULE, 'playwright', resolve(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')].filter(Boolean)) {
  try { ({ chromium } = await import(isAbsolute(candidate) ? pathToFileURL(candidate).href : candidate)); if (chromium) break; } catch { /* Try an installed runtime. */ }
}
if (!chromium) throw Error('Set PLAYWRIGHT_MODULE to an installed Playwright module.');
const abs = path => JSON.stringify(resolve(root, path).replaceAll('\\', '/'));
const source = `
import React,{useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter,useHistory,useLocation} from 'react-router-dom';
import ${abs('src/App.css')};
import PageLoading from ${abs('src/modules/layout/PageLoading.js')};
function Fixture(){
 const main=useRef(null),history=useHistory(),location=useLocation(),[step,next]=useState(1);
 const params=new URLSearchParams(location.search),kind=params.get('kind'),asset=params.get('asset')||'default';
 const image='/assets/'+asset+'.svg';
 window.loadingQa={navigate:to=>history.push(to)};
 return <main ref={main} style={{minHeight:600,padding:16,background:'#f4f9fa'}}>
  <h1>{location.pathname}</h1><button onClick={()=>next(step+1)}>Pasul {step}</button>
  {kind==='background'&&<div style={{'--picture':'url("'+image+'")',backgroundImage:'linear-gradient(transparent,#fff3),var(--picture)',height:200}}/>}
  {(kind==='img'||kind==='offscreen'||kind==='hidden')&&<img src={image} alt="Imaginea paginii" style={{width:240,height:160,display:kind==='hidden'?'none':'block',marginTop:kind==='offscreen'?1800:20}}/>}
  {kind==='splash'&&<div className="session-loading"><img src={image} alt="NordLingo"/></div>}
  <PageLoading contentRef={main}/>
 </main>;
}
createRoot(document.getElementById('root')).render(<MemoryRouter initialEntries={['/dashboard']}><Fixture/></MemoryRouter>);
`;
await writeFile(resolve(output, 'entry.jsx'), source);
await build({ configFile: resolve(root, 'vite.config.js'), logLevel: 'error', publicDir: false, define: { 'process.env.NODE_ENV': JSON.stringify('production') }, build: { outDir: output, emptyOutDir: false, minify: false, lib: { entry: resolve(output, 'entry.jsx'), formats: ['iife'], name: 'LoadingQa', fileName: () => 'fixture.js' } } });
const files = await readdir(output);
const js = await readFile(resolve(output, 'fixture.js'), 'utf8');
const css = (await Promise.all(files.filter(name => name.endsWith('.css')).map(name => readFile(resolve(output, name), 'utf8')))).join('\n');
const html = '<!doctype html><html lang="ro"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body style="margin:0"><div id="root"></div><script>'+js.replaceAll('</script','<\\/script')+'</script></body></html>';
let executablePath;
for (const candidate of [process.env.PLAYWRIGHT_CHROME_EXECUTABLE_PATH, process.platform === 'win32' && 'C:/Program Files/Google/Chrome/Application/chrome.exe', chromium.executablePath()].filter(Boolean)) {
  try { await access(candidate); executablePath = candidate; break; } catch { /* Try another installation. */ }
}
const browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), headless: true });
const report = { checks: [], browserErrors: [] };
try {
 const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
 page.on('pageerror', error => report.browserErrors.push(error.message));
 const requests = new Map();
 const picture = '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="240" height="160" fill="#9fcac1"/></svg>';
 await page.route('**/*', async route => {
  const url = new URL(route.request().url());
  if (url.pathname === '/') return route.fulfill({contentType:'text/html',body:html});
  if (url.pathname.startsWith('/assets/')) { requests.set(url.pathname.split('/').pop().replace('.svg',''),route); return; }
  return route.abort();
 });
 const navigate = to => page.evaluate(to => window.loadingQa.navigate(to), to);
 const pause = () => page.waitForTimeout(250);
 const visible = async () => (await page.locator('.page-loading').count()) > 0;
 const release = async (asset, fail=false) => {
  assert.ok(requests.has(asset), 'The browser requested '+asset);
  const request=requests.get(asset); requests.delete(asset);
  if(fail) await request.abort(); else await request.fulfill({contentType:'image/svg+xml',body:picture});
 };
 await page.goto('http://loading.test/');
 await page.waitForFunction(() => Boolean(window.loadingQa));
 await pause(); assert.equal(await visible(),false); report.checks.push('No indicator for an immediately ready page');
 for(const [path,theme,kind] of [['/dashboard','home','background'],['/cont','account','img'],['/invata','lessons','background']]){
  await navigate('/away');
  await navigate(path+'?kind='+kind+'&asset='+theme); await pause();
  assert.ok(await visible(),path+' waits for a real pending image');
  assert.equal(await page.locator('.page-loading--'+theme).count(),1);
  assert.equal(await page.locator('main').getAttribute('aria-busy'),'true');
  const before=await page.locator('button').textContent(); await page.locator('button').click();
  assert.notEqual(await page.locator('button').textContent(),before,'Navigation/content remains interactive');
  await release(theme); await page.waitForSelector('.page-loading',{state:'detached'});
  assert.equal(await page.locator('main').getAttribute('aria-busy'),null);
  report.checks.push(path+': correct theme, CSS/HTML image readiness and no blocked controls');
 }
 await navigate('/cont?kind=img&asset=fast');
 await page.waitForTimeout(40); await release('fast'); await pause();
 assert.equal(await visible(),false); report.checks.push('Fast image finishes before the indicator appears');
 for(const kind of ['hidden','offscreen']){
  await navigate('/away'); await navigate('/dashboard?kind='+kind+'&asset='+kind); await pause();
  assert.equal(await visible(),false); await release(kind);
 }
 report.checks.push('Hidden and below-fold images do not delay the visible page');
 await navigate('/away'); await navigate('/dashboard?kind=background&asset=old'); await pause();
 await navigate('/cont?kind=img&asset=new'); await pause();
 await release('old'); await pause();
 assert.ok(await visible()); assert.equal(await page.locator('main').getAttribute('aria-busy'),'true');
 await release('new'); await page.waitForSelector('.page-loading',{state:'detached'});
 report.checks.push('An old image cannot dismiss a newer route’s indicator');
 await navigate('/invata?kind=img&asset=broken'); await pause(); await release('broken',true);
 await page.waitForSelector('.page-loading',{state:'detached'}); report.checks.push('Broken image clears loading');
 for(const path of ['/curs/A1/1','/asculta-si-alege','/program-norvegiana']){
  await navigate(path+'?kind=img&asset=exercise'+encodeURIComponent(path)); await pause();
  assert.equal(await visible(),false);
  await page.locator('button').click(); await pause(); assert.equal(await visible(),false);
 }
 report.checks.push('No loading in lesson steps or exercises');
 await navigate('/invata'); await pause(); await navigate('/invata?nivel=A2&kind=img&asset=level'); await pause();
 assert.equal(await visible(),false); await release('level'); report.checks.push('Changing a level on the same page never starts the route indicator');
 await navigate('/away'); await navigate('/dashboard?kind=splash&asset=splash'); await pause();
 assert.equal(await visible(),false); await release('splash'); report.checks.push('Startup splash and page indicator never overlap');
 await navigate('/away'); await navigate('/cont?kind=img&asset=stalled'); await pause();
 assert.ok(await visible()); await page.waitForSelector('.page-loading',{state:'detached',timeout:10000});
 assert.equal(await page.locator('main').getAttribute('aria-busy'),null); await release('stalled');
 report.checks.push('A stalled download cannot leave a permanent spinner');
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:680}); await navigate('/away');
  await navigate('/invata?kind=background&asset=size'+width); await pause();
  const bounds=await page.locator('.page-loading').boundingBox(); assert.equal(bounds.width,68); assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width);
  await page.screenshot({path:resolve(output,'loading-'+width+'.png')});
  await release('size'+width); await page.waitForSelector('.page-loading',{state:'detached'});
 }
 report.checks.push('Spinner fits 320/390/768/1280px screens');
 await page.emulateMedia({reducedMotion:'reduce'}); await navigate('/away'); await navigate('/cont?kind=img&asset=motion'); await pause();
 assert.equal(await page.locator('.page-loading__ring').evaluate(el=>getComputedStyle(el).animationName),'none');
 await release('motion'); report.checks.push('Reduced-motion preference respected');
 assert.deepEqual(report.browserErrors,[]);
 await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
} finally { await browser.close(); }
