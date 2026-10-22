import { build } from 'vite';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { isAbsolute, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'node_modules/.cache/desktop-app-separation');
await mkdir(output, { recursive: true });
const abs = path => JSON.stringify(resolve(root, path).replaceAll('\\', '/'));
await writeFile(resolve(output, 'entry.jsx'), `
import React from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import ${abs('node_modules/bootstrap/dist/css/bootstrap.min.css')};
import {AppContent} from ${abs('src/App.js')};
let run=0;
const root=createRoot(document.getElementById('root'));
window.audit={mount(path,app=false){
  document.documentElement.classList.toggle('is-installed-app',app);
  window.auditAuthenticated=!path.startsWith('/autentificare');
  root.render(<MemoryRouter key={++run} initialEntries={[path]}><AppContent/></MemoryRouter>);
}};
window.audit.mount('/dashboard');
`);
await build({ configFile: resolve(root, 'vite.config.js'), publicDir: false, logLevel: 'error', define: { 'process.env.NODE_ENV': JSON.stringify('production') }, plugins: [{
  name: 'desktop-audit-offline-boundaries', enforce: 'pre', resolveId(id) {
    if (id.endsWith('/AuthContext')) return '\0desktop-auth';
    if (id.endsWith('/supabaseLearning')) return '\0desktop-sync';
    if (id.endsWith('/CareerProfileGate')) return '\0desktop-onboarding';
    if (id.endsWith('/norwegianSpeech')) return '\0desktop-audio';
    if (id.endsWith('/azurePronunciationSpeech')) return '\0desktop-model';
  }, load(id) {
    if (id === '\0desktop-auth') return `export const AuthProvider=({children})=>children;
      export const useAuth=()=>({user:window.auditAuthenticated?{id:'desktop-audit',name:'Vizitator',isGuest:true}:null,
      initializing:false,isAuthenticated:!!window.auditAuthenticated,passwordRecovery:false,plan:'free',isPremium:false,isDevBypass:false,
      refreshEntitlements:async()=>{},logout:async()=>{},deleteAccount:async()=>{},login:async()=>{},register:async()=>({}),loginAsGuest:async()=>{},loginWithGoogle:async()=>{},requestPasswordReset:async()=>{},updatePassword:async()=>{}});`;
    if (id === '\0desktop-sync') return 'export const syncStudyActivity=async()=>({});export const syncLearningProgress=async()=>({});';
    if (id === '\0desktop-onboarding') return 'export default Component=>Component;';
    if (id === '\0desktop-audio') return 'export const speakNorwegian=async(text,options={})=>{window.auditAudio=[...(window.auditAudio||[]),text];options.onPlaybackStart?.();return {ok:true};};';
    if (id === '\0desktop-model') return 'export const speakPronunciationModel=async(text,options={})=>{window.auditAudio=[...(window.auditAudio||[]),text];return {ok:true};};';
  },
}], build: { outDir: output, emptyOutDir: false, minify: false, lib: { entry: resolve(output, 'entry.jsx'), formats: ['iife'], name: 'DesktopAudit', fileName: () => 'client.js' } } });
const js = await readFile(resolve(output, 'client.js'), 'utf8');
const css = (await Promise.all((await readdir(output)).filter(file => file.endsWith('.css')).map(file => readFile(resolve(output, file), 'utf8')))).join('\n');
const html = '<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>' + css + '</style></head><body style="margin:0"><div id="root"></div><script>' + js.replaceAll('</script', '<\\/script') + '</script></body></html>';
let chromium;
for (const candidate of [process.env.PLAYWRIGHT_MODULE, 'playwright', resolve(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')].filter(Boolean)) {
  try { ({ chromium } = await import(isAbsolute(candidate) ? pathToFileURL(candidate).href : candidate)); if (chromium) break; } catch { /* Try another installed runtime. */ }
}
if (!chromium) throw Error('Set PLAYWRIGHT_MODULE to an installed Playwright module.');
let executablePath;
for (const candidate of [process.env.PLAYWRIGHT_CHROME_EXECUTABLE_PATH, process.platform === 'win32' && 'C:/Program Files/Google/Chrome/Application/chrome.exe', chromium.executablePath()].filter(Boolean)) {
  try { await access(candidate); executablePath = candidate; break; } catch { /* Try another browser. */ }
}
const browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), headless: true });
const report = { desktop: [], app: [], logic: [], browserErrors: [] };
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(10000);
  page.on('pageerror', error => report.browserErrors.push(error.message));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: html });
    const file = resolve(root, 'public', decodeURIComponent(url.pathname).replace(/^\/+/, ''));
    if (file.startsWith(resolve(root, 'public') + sep)) try { return route.fulfill({ body: await readFile(file), contentType: file.endsWith('.webp') ? 'image/webp' : file.endsWith('.jpg') ? 'image/jpeg' : 'image/png' }); } catch { /* Offline audit. */ }
    return route.abort();
  });
  await page.goto('http://desktop-audit.test/');
  const mount = async (path, app = false) => {
    await page.evaluate(({ path, app }) => window.audit.mount(path, app), { path, app });
    await page.waitForTimeout(100);
    assert.equal(await page.locator('.App').count(), 1, path + ': application mounted');
  };
  const visible = async selector => page.locator(selector).evaluateAll(elements => elements.filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden').length);
  const mobileOnly = '.mobile-app-nav,.dashboard-app-home,.learn-app,.account-mobile,.northern-games,.listening-expedition,.pronunciation-cathedral,.nordic-exercise,.ng-header,.lapp,.auth-fjord';
  const desktopCases = [
    ['/dashboard', '.daily-dashboard'], ['/invata?nivel=A1', '.learn-page'], ['/cont', '.account-page'],
    ['/jocuri?nivel=A1', '.desktop-games-hub'], ['/pronuntie?nivel=A1', '.pronuntie'],
    ['/chestionar?nivel=A1', '.practice-game'], ['/drag?nivel=A1', '.practice-game'], ['/hangman?nivel=A1', '.word-discovery--web'],
    ['/asculta-si-alege?nivel=A1', '.desktop-activity'], ['/misiuni-la-serviciu?nivel=A1', '.desktop-activity'],
    ['/challenge30?nivel=A1', '.challenge30'], ['/recapitulare?nivel=A1', '.review-page'],
    ['/curs/A1/1', '.lesson-shell:not(.lapp)'], ['/alege-directia', '.career-onboarding'], ['/autentificare', '.auth-web'],
  ];
  for (const width of [1440, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [path, selector] of desktopCases) {
      console.log('Desktop ' + width + ' ' + path);
      await mount(path);
      assert.equal(await visible(selector), 1, path + ': desktop content');
      assert.equal(await visible('.App > .navbar'), 1, path + ': web navigation visible');
      assert.equal(await visible('.App > .footer'), 1, path + ': web footer visible');
      assert.equal(await visible(mobileOnly), 0, path + ': no installed app UI');
      assert.equal(await page.locator('.navbar__nav a[href="/jocuri"]').count(), 0, 'Games stays out of desktop main navigation');
      const size = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, overflow: getComputedStyle(document.body).overflow }));
      assert.ok(size.scroll <= size.width + 1, path + ': no horizontal overflow (' + size.scroll + ')');
      assert.notEqual(size.overflow, 'hidden', path + ': page is not locked to app viewport');
      if (width === 1440 && ['/jocuri?nivel=A1', '/pronuntie?nivel=A1', '/asculta-si-alege?nivel=A1', '/hangman?nivel=A1', '/chestionar?nivel=A1', '/autentificare'].includes(path)) await page.screenshot({ path: resolve(output, path.split('?')[0].slice(1) + '-desktop.png'), fullPage: true });
      report.desktop.push({ width, path });
    }
  }
  // A narrow browser is still the web experience; installation controls app UI.
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/jocuri?nivel=A1', '/pronuntie?nivel=A1', '/asculta-si-alege?nivel=A1', '/hangman?nivel=A1']) {
    await mount(path);
    assert.equal(await visible(mobileOnly), 0, path + ': narrow web does not activate app UI');
    report.desktop.push({ width: 390, path });
  }
  const appCases = [
    ['/dashboard', '.dashboard-app-home'], ['/invata?nivel=A1', '.learn-app'], ['/cont', '.account-mobile'],
    ['/jocuri?nivel=A1', '.northern-games'], ['/pronuntie?nivel=A1', '.pronunciation-cathedral'],
    ['/chestionar?nivel=A1', '.nordic-exercise'], ['/drag?nivel=A1', '.nordic-exercise'], ['/hangman?nivel=A1', '.word-discovery:not(.word-discovery--web)'],
    ['/asculta-si-alege?nivel=A1', '.listening-expedition'], ['/misiuni-la-serviciu?nivel=A1', '.nordic-exercise'],
    ['/challenge30?nivel=A1', '.nordic-exercise'], ['/recapitulare?nivel=A1', '.nordic-exercise'], ['/curs/A1/1', '.lapp'], ['/autentificare', '.auth-fjord'],
  ];
  for (const [path, selector] of appCases) {
    await mount(path, true);
    assert.equal(await visible(selector), 1, path + ': installed app presentation preserved');
    if (['/dashboard', '/invata?nivel=A1', '/cont', '/jocuri?nivel=A1'].includes(path)) assert.equal(await visible('.mobile-app-nav'), 1, path + ': app navigation preserved');
    report.app.push(path);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await mount('/chestionar?nivel=A1');
  await page.locator('.game-choices button').first().click();
  if (!await page.locator('.game-feedback').count()) await page.getByRole('button', { name: 'Verifică', exact: false }).click();
  await page.locator('.game-feedback').waitFor();
  assert.equal(await page.locator('.game-choices button:enabled').count(), 0, 'Answer is locked after checking');
  await page.getByRole('button', { name: 'Continuă', exact: false }).click();
  assert.equal(await page.locator('.game-feedback').count(), 0, 'Next question resets feedback');
  report.logic.push('Desktop vocabulary still checks once, locks answer and advances.');
  await mount('/asculta-si-alege?nivel=A1');
  assert.equal(await page.locator('.desktop-activity__choices button:enabled').count(), 0, 'Listening requires completed audio');
  for (let index = 0; index < 10; index++) {
    await page.locator('.desktop-activity__audio .exercise-primary').click();
    await page.locator('.desktop-activity__choices button:enabled').first().waitFor();
    await page.locator('.desktop-activity__choices button').first().click();
    await page.getByRole('button', { name: 'Verifică', exact: false }).click();
    await page.locator('.desktop-activity__feedback').waitFor();
    assert.ok(await page.locator('.desktop-activity__source').innerText(), 'Norwegian source is revealed after checking');
    await page.getByRole('button', { name: index === 9 ? 'Vezi rezultatul' : 'Continuă', exact: false }).click();
  }
  await page.locator('.activity-result').waitFor();
  assert.equal(await visible('.listening-expedition,.nordic-exercise'), 0, 'Desktop result retains web layout');
  const activity = await page.evaluate(() => JSON.parse(localStorage.getItem('norwegian_learning_activity')));
  assert.ok(activity.some(item => item.type === 'listening-game'), 'Shared progress is saved after ten questions');
  report.logic.push('Desktop listening keeps ten questions, audio gate, feedback, result and saved progress.');
  await mount('/pronuntie?nivel=A1');
  await page.locator('.pronuntie__phrase-bar button[aria-label="Expresia următoare"]').click();
  assert.match(await page.locator('.pronuntie__phrase-bar').innerText(), /Expresia 2/);
  report.logic.push('Desktop pronunciation keeps the original lab and phrase selection.');
  assert.deepEqual(report.browserErrors, []);
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  const page = browser.contexts()[0]?.pages()[0];
  if (page) { await page.screenshot({ path: resolve(output, 'failure.png'), fullPage: true }); await writeFile(resolve(output, 'failure.txt'), await page.locator('body').innerText()); }
  throw error;
} finally { await browser.close(); }
