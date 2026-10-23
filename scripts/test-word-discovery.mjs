import { build } from 'vite';
import { isAbsolute, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
const root=resolve(import.meta.dirname,'..');
await build({configFile:resolve(root,'vite.config.js'),logLevel:'error',build:{ssr:true,outDir:'node_modules/.cache/word-discovery-tests',emptyOutDir:false,rollupOptions:{input:resolve(root,'src/modules/exercises/WordDiscovery.js'),output:{entryFileNames:'word.mjs'}}}});
const {default:WordDiscovery}=await import(pathToFileURL(resolve(root,'node_modules/.cache/word-discovery-tests/word.mjs')));
globalThis.window=new EventTarget();
globalThis.localStorage={getItem:()=>null};
const mount=answer=>{const results=[];let tree;act(()=>{tree=TestRenderer.create(React.createElement(MemoryRouter,null,React.createElement(WordDiscovery,{question:{answer,prompt:'Sensul cuvântului'},current:0,total:5,level:'A1',checked:false,onResolve:(...args)=>results.push(args),onNext(){},onSpeak(){}})))});return {tree,results,press:letter=>act(()=>tree.root.findAllByType('button').find(b=>b.props['aria-label']===letter).props.onClick())};};
let t=mount('hus');t.press('H');t.press('H');assert.equal(t.results.length,0);t.press('U');t.press('S');assert.equal(t.results.length,1);assert.equal(t.results[0][0],true);act(()=>t.tree.unmount());
t=mount('blå øy');for(const ch of ['B','L','Å','Ø','Y'])t.press(ch);assert.equal(t.results[0][0],true);act(()=>t.tree.unmount());
t=mount('hus');for(const ch of ['Q','W','E'])t.press(ch);assert.equal(t.results.length,1);assert.equal(t.results[0][0],false);act(()=>t.tree.unmount());
t=mount('hus');for(let i=0;i<3;i++)act(()=>t.tree.root.findAllByType('button').find(b=>b.props.className === 'wd-hint').props.onClick());assert.equal(t.results[0][0],true);act(()=>t.tree.unmount());
console.log('✓ Word discovery: wins, repeated letters, three misses, hints, Norwegian letters and multiword answers.');
const { wordDiscoveryCatalog } = await import('../src/modules/exercises/wordDiscoveryCatalog.js');
const { existsSync } = await import('node:fs');
assert.equal(wordDiscoveryCatalog.length,120);
assert.equal(new Set(wordDiscoveryCatalog.map(item=>item.answer)).size,120);
assert.equal(new Set(wordDiscoveryCatalog.map(item=>item.image+'#'+item.tile)).size,120);
for(const item of wordDiscoveryCatalog){assert.ok(existsSync(resolve(root,'public'+item.image)),item.answer+' needs its artwork');assert.ok(item.tile>=0&&item.tile<12);assert.match(item.answer,/^[a-zæøåé]+$/u);assert.ok(item.prompt.length>8)}
console.log('✓ Illustrated bank: 120 unique words, 120 mapped illustrations, complete assets and Norwegian spelling.');

// Verify production markup, styles and the complete five-round game in a browser.
delete globalThis.window;
delete globalThis.localStorage;
const output = resolve(root, 'node_modules/.cache/word-discovery-ui');
await mkdir(output, { recursive: true });
const abs = file => JSON.stringify(resolve(root, file).replaceAll('\\', '/'));
await writeFile(resolve(output, 'entry.jsx'), `
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter,Route,Switch} from 'react-router-dom';
import ${abs('node_modules/bootstrap/dist/css/bootstrap.min.css')};
import ${abs('src/App.css')};
import WordDiscovery,{WordDiscoveryResult} from ${abs('src/modules/exercises/WordDiscovery.js')};
import PracticeGame from ${abs('src/modules/exercises/PracticeGame.js')};
import {wordDiscoveryCatalog} from ${abs('src/modules/exercises/wordDiscoveryCatalog.js')};
import {readGameProgress} from ${abs('src/modules/exercises/practiceGameData.js')};
const root=createRoot(document.getElementById('root'));
let run=0;
function Single({question,current=0,total=5}){
 const [checked,setChecked]=useState(false);
 return <WordDiscovery question={question} current={current} total={total} level="A1" checked={checked} onResolve={(...args)=>{window.wordQa.resolved.push(args);setChecked(true);}} onSpeak={()=>window.wordQa.audio.push(question.answer)} onNext={()=>window.wordQa.next++}/>;
}
window.wordQa={bank:wordDiscoveryCatalog,resolved:[],audio:[],next:0,activity:[],review:[],
 reset(){localStorage.clear();this.resolved=[];this.audio=[];this.next=0;this.activity=[];this.review=[];},
 progress(){return readGameProgress(localStorage,'word','A1','word-ui-qa');},
 mount({question=wordDiscoveryCatalog[0],current=0,total=5,app=true,game=false,result=false}={}){
  document.documentElement.classList.toggle('is-installed-app',app);
  this.resolved=[];this.audio=[];this.next=0;
  const currentRun=++run;
  root.render(<MemoryRouter key={currentRun} initialEntries={['/hangman?nivel=A1']}><div className="App" data-qa-run={currentRun}>
   <nav className="navbar" style={{minHeight:64}}>NordLingo · Navigare web</nav><main className="App__main"><Switch>
    <Route path="/hangman">{game?<PracticeGame game="word"/>:result?<WordDiscoveryResult level="A1" score={3} results={wordDiscoveryCatalog.slice(0,5).map((question,index)=>({question,correct:index<3}))} onRestart={()=>this.next++} onRetry={()=>this.next++}/>:<Single {...{question,current,total}}/>}</Route>
    <Route path="/jocuri"><h1 data-testid="games-return">Jocuri și exerciții</h1></Route>
   </Switch></main><footer className="footer" style={{padding:20}}>NordLingo</footer>
  </div></MemoryRouter>);
  return currentRun;
 }};
window.wordQa.mount();
`);
await build({
  configFile: resolve(root, 'vite.config.js'), publicDir: false, logLevel: 'error',
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  plugins: [{
    name: 'word-discovery-offline-boundaries', enforce: 'pre',
    resolveId(id) {
      if (id.endsWith('/AuthContext')) return '\0word-qa-auth';
      if (id.endsWith('/learningActivity')) return '\0word-qa-activity';
      if (id.endsWith('/spacedReview')) return '\0word-qa-review';
      if (id.endsWith('/norwegianSpeech')) return '\0word-qa-speech';
    },
    load(id) {
      if (id === '\0word-qa-auth') return 'export const useAuth=()=>({user:{id:"word-ui-qa"}});';
      if (id === '\0word-qa-activity') return 'export const getStudySummary=()=>({streak:4});export const recordStudyActivity=activity=>{window.wordQa.activity.push({...activity});};';
      if (id === '\0word-qa-review') return 'export const saveReviewItem=item=>window.wordQa.review.push({...item});';
      if (id === '\0word-qa-speech') return 'export const speakNorwegian=async(text)=>{window.wordQa.audio.push(text);return {ok:true};};';
    },
  }],
  build: { outDir: output, emptyOutDir: false, minify: false, lib: { entry: resolve(output, 'entry.jsx'), formats: ['iife'], name: 'WordDiscoveryQa', fileName: () => 'client.js' } },
});
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
const report = { states: [], logic: [], browserErrors: [] };
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(10000);
  page.on('pageerror', error => report.browserErrors.push(error.message));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: html });
    const file = resolve(root, 'public', decodeURIComponent(url.pathname).replace(/^\/+/, ''));
    if (file.startsWith(resolve(root, 'public') + sep)) try { return route.fulfill({ body: await readFile(file), contentType: file.endsWith('.webp') ? 'image/webp' : file.endsWith('.jpg') ? 'image/jpeg' : file.endsWith('.svg') ? 'image/svg+xml' : 'image/png' }); } catch { /* Keep the audit offline. */ }
    return route.abort();
  });
  await page.goto('http://word-discovery.test/');
  await page.waitForFunction(() => Boolean(window.wordQa));
  const mount = async options => {
    const run = await page.evaluate(options => window.wordQa.mount(options), options);
    await page.waitForFunction(run => document.querySelector('.App')?.dataset.qaRun === String(run), run);
    await page.waitForSelector('.word-discovery');
  };
  const letter = value => page.locator('.wd-keyboard button[aria-label=' + JSON.stringify(value.toLocaleUpperCase('nb-NO')) + ']');
  const solve = async answer => {
    for (const char of new Set(Array.from(answer.normalize('NFC').toLocaleUpperCase('nb-NO')).filter(char => /\p{L}/u.test(char)))) {
      const key = letter(char);
      if (await key.isEnabled()) await key.click();
    }
    await page.waitForSelector('.word-discovery--checked');
  };
  const fail = async answer => {
    const letters = answer.toLocaleUpperCase('nb-NO');
    for (const char of Array.from('QWERTYUIOPASDFGHJKLÅZXCVBNMÆØ').filter(char => !letters.includes(char)).slice(0, 3)) await letter(char).click();
    await page.waitForSelector('.word-discovery--checked');
  };
  const checkLayout = async label => {
    const measurement = await page.evaluate(() => {
      const screen = document.querySelector('.word-discovery');
      const bounds = screen.getBoundingClientRect();
      const visible = element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden';
      const elements = [...screen.querySelectorAll('button,a,.wd-heading,.wd-progress,.wd-card,.wd-controls,.wd-keyboard,.wd-result-card')].filter(visible);
      const horizontal = elements.filter(element => {
        const r = element.getBoundingClientRect();
        return r.left < -1 || r.right > innerWidth + 1 || element.scrollWidth > element.clientWidth + 1;
      }).map(element => ({ class: element.className, text: element.textContent.trim().slice(0, 60) }));
      const groups = [...screen.querySelectorAll('.wd-heading,.wd-progress,.wd-card,.wd-controls,.wd-keyboard,.wd-result-card')].filter(visible);
      const overlaps = [];
      for (let i = 0; i < groups.length; i++) for (let j = i + 1; j < groups.length; j++) {
        if (groups[i].contains(groups[j]) || groups[j].contains(groups[i])) continue;
        const a = groups[i].getBoundingClientRect(), b = groups[j].getBoundingClientRect();
        if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) overlaps.push([groups[i].className, groups[j].className]);
      }
      return { horizontal, overlaps, left: bounds.left, right: bounds.right, width: innerWidth, scrollWidth: document.documentElement.scrollWidth, height: innerHeight, pageHeight: document.documentElement.scrollHeight };
    });
    assert.ok(measurement.scrollWidth <= measurement.width + 1, label + ': no horizontal page overflow');
    assert.deepEqual(measurement.horizontal, [], label + ': content fits its columns');
    assert.deepEqual(measurement.overlaps, [], label + ': question, feedback and keyboard do not overlap');
    assert.ok(measurement.left >= -1 && measurement.right <= measurement.width + 1, label + ': game fits page width');
    const controls = page.locator('.wd-controls button:enabled,.wd-result-actions button:enabled,.wd-hint:enabled');
    for (let index = 0; index < await controls.count(); index++) {
      const target = controls.nth(index);
      await target.scrollIntoViewIfNeeded();
      assert.ok(await target.evaluate(element => {
        const r = element.getBoundingClientRect(), point = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return r.height >= (element.classList.contains('wd-listen') ? 24 : 36) && r.top >= -1 && r.bottom <= innerHeight + 1 && (point === element || element.contains(point));
      }), label + ': feedback/hint action stays reachable');
    }
    report.states.push({ label, pageHeight: measurement.pageHeight, viewportHeight: measurement.height });
  };

  const bank = await page.evaluate(() => window.wordQa.bank);
  const samples = [bank.find(item => item.answer === 'hus'), [...bank].sort((a, b) => b.answer.length - a.answer.length)[0], [...bank].sort((a, b) => b.prompt.length - a.prompt.length)[0]];
  for (const { width, height, app } of [
    { width: 320, height: 740, app: true }, { width: 360, height: 640, app: true },
    { width: 375, height: 667, app: true }, { width: 390, height: 844, app: true }, { width: 768, height: 1024, app: true },
    { width: 844, height: 390, app: true }, { width: 1440, height: 900, app: false },
  ]) {
    await page.setViewportSize({ width, height });
    const label = (app ? 'app ' : 'web ') + width + 'x' + height;
    console.log('Checking ' + label);
    for (const question of samples) {
      await mount({ question, current: 2, app });
      assert.equal(await page.locator('.word-discovery--ivory').count(), app ? 1 : 0);
      assert.equal(await page.locator('.word-discovery--web').count(), app ? 0 : 1);
      const progress = page.locator('.wd-progress progress');
      assert.equal(await progress.getAttribute('value'), '3');
      assert.equal(await progress.getAttribute('max'), '5');
      if (app) {
        assert.match(await page.locator('.wd-counter').innerText(), /Cuvântul\s+3\s+din\s+5/i);
        assert.equal(await page.locator('.wd-brand--game .wd-level').innerText(), 'A1');
        assert.equal(await page.locator('.wd-streak').count(), 0, 'The redesign has a level badge instead of a streak');
        assert.equal(await page.locator('.wd-progress-track > *').count(), 5);
        const palette = await page.locator('.wd-keyboard').evaluate(keyboard => ({ panel: getComputedStyle(keyboard).backgroundColor, key: getComputedStyle(keyboard.querySelector('button')).backgroundColor }));
        const panel = palette.panel.match(/\d+/g).slice(0, 3).map(Number);
        assert.ok(panel[0] < 80 && panel[1] < 130 && panel[2] < 150, 'The default keyboard uses its approved petrol panel');
        assert.ok(palette.key.match(/\d+/g).slice(0, 3).every(value => Number(value) > 180), 'The petrol panel keeps contrasting cream keys');
      } else {
        assert.equal(await page.locator('.wd-brand--game,.wd-counter,.wd-progress-track,.wd-level').count(), 0, 'The desktop keeps its existing exercise chrome');
        assert.equal(await page.locator('.App > .navbar').isVisible(), true);
        assert.equal(await page.locator('.App > .footer').isVisible(), true);
        const width = await page.locator('.word-discovery--web').evaluate(element => element.getBoundingClientRect().width);
        assert.ok(width > 800, 'Desktop keeps its wide conventional page');
        const foreground = await page.locator('.wd-keyboard button').first().evaluate(button => getComputedStyle(button).color);
        assert.ok(foreground.match(/\d+/g).slice(0, 3).every(value => Number(value) < 100), 'The desktop keyboard retains its original dark text on light keys');
      }
      await checkLayout(label + ' ' + question.answer + ' ready');
      if (width === 390 && question.answer === 'hus' || !app && question.answer === 'hus') await page.screenshot({ path: resolve(output, (app ? 'ivory' : 'web') + '-ready.png'), fullPage: true });
      await solve(question.answer);
      assert.equal(await page.evaluate(() => window.wordQa.resolved.length), 1);
      assert.equal(await page.evaluate(() => window.wordQa.next), 0, 'A solved word never advances automatically');
      assert.equal(await page.locator('.wd-keyboard button:enabled').count(), 0);
      assert.equal(await page.locator('.wd-keyboard').isVisible(), app, 'Only the app retains the disabled keyboard after checking');
      if (app) assert.equal(await page.locator('.wd-controls > .wd-feedback').count(), 1);
      await checkLayout(label + ' ' + question.answer + ' correct');
      if (width === 390 && question.answer === 'hus') await page.screenshot({ path: resolve(output, 'ivory-correct.png'), fullPage: true });
      await mount({ question, current: 2, app });
      await fail(question.answer);
      assert.equal(await page.evaluate(() => window.wordQa.resolved[0][0]), false);
      assert.equal(await page.locator('.wd-hearts .empty').count(), 3);
      assert.ok((await page.locator('.wd-controls').innerText()).toLocaleLowerCase('nb-NO').includes(question.answer.toLocaleLowerCase('nb-NO')), 'The correct word is revealed after three misses');
      await checkLayout(label + ' ' + question.answer + ' wrong');
      if (width === 390 && question.answer === 'jernbanestasjon') await page.screenshot({ path: resolve(output, 'ivory-long-word.png'), fullPage: true });
    }
    await mount({ app, question: samples[1], current: 4 });
    await fail(samples[1].answer);
    assert.match(await page.locator('.wd-controls').innerText(), /Vezi rezultatul/);
    await checkLayout(label + ' final long word feedback');
    await mount({ app, result: true });
    await checkLayout(label + ' result');
    assert.equal(await page.locator('.wd-result-words > span').count(), 5);
    if (width === 390 || !app) await page.screenshot({ path: resolve(output, (app ? 'ivory' : 'web') + '-result.png'), fullPage: true });
  }
  report.logic.push('Cream/petrol/gold app styling covers short, longest-bank and longest-prompt words; desktop keeps its wide page, light keyboard and checked-keyboard behavior.');

  await page.setViewportSize({ width: 390, height: 844 });
  await mount({ question: { ...bank[0], id: 'repeated-sommer', answer: 'sommer', prompt: 'Anotimpul cald' } });
  await page.keyboard.press('M');
  assert.equal(await page.locator('.wd-slot:not(.wd-slot--hidden)').count(), 2, 'One key reveals all repeated occurrences');
  await page.keyboard.press('M');
  assert.equal(await page.locator('.wd-hearts .empty').count(), 0, 'Repeated keys never consume an attempt');
  await page.locator('.wd-hint').click();
  assert.equal(await page.locator('.wd-hearts .empty').count(), 0, 'Hints reveal a real letter without consuming a miss');
  assert.equal(await page.locator('.wd-slot:not(.wd-slot--hidden)').count(), 3);
  await page.keyboard.press('Control+Q');
  assert.equal(await page.locator('.wd-hearts .empty').count(), 0, 'Keyboard shortcuts do not guess letters');
  await solve('sommer');
  assert.equal(await page.evaluate(() => window.wordQa.resolved.length), 1);
  assert.equal(await page.evaluate(() => window.wordQa.next), 0);
  await page.locator('.wd-listen').click();
  assert.deepEqual(await page.evaluate(() => window.wordQa.audio), ['sommer']);
  await page.locator('.wd-next').click();
  assert.equal(await page.evaluate(() => window.wordQa.next), 1, 'The explicit next action invokes its callback once');
  await mount({ question: { ...bank[0], id: 'norwegian-letters', answer: 'blå øy', prompt: 'O insulă albastră' } });
  await solve('blå øy');
  assert.equal(await page.evaluate(() => window.wordQa.resolved[0][0]), true, 'The original Å/Ø and multiword handling is preserved');
  report.logic.push('Physical/repeated keys, free hints, Norwegian letters, multiword answers, explicit audio and no automatic next are preserved.');

  await page.evaluate(() => window.wordQa.reset());
  await mount({ app: true, game: true });
  let mistake;
  for (let round = 0; round < 5; round++) {
    const prompt = await page.locator('.wd-card h2').innerText();
    const question = bank.find(item => item.prompt === prompt);
    assert.ok(question, 'The real game uses its reviewed illustrated bank');
    assert.match(await page.locator('.wd-counter').innerText(), new RegExp('Cuvântul\\s+' + (round + 1) + '\\s+din\\s+5', 'i'));
    if (round === 0) { mistake = question; await fail(question.answer); }
    else await solve(question.answer);
    assert.equal(await page.locator('.wd-card h2').innerText(), prompt, 'Checking never advances the current round');
    assert.equal(await page.evaluate(() => window.wordQa.activity.length), 0, 'Progress is not recorded before the result action');
    if (round === 0) {
      await page.locator('.wd-listen').click();
      assert.equal(await page.evaluate(() => window.wordQa.audio.at(-1)), question.answer);
      assert.equal(await page.evaluate(() => window.wordQa.review.length), 1, 'The missed word is queued once for spaced review');
    }
    await page.locator('.wd-next').evaluate(button => { button.click(); button.click(); });
    if (round < 4) await page.waitForFunction(next => document.querySelector('.wd-progress progress')?.value === next, round + 2);
  }
  await page.waitForSelector('.word-discovery--result');
  assert.match(await page.locator('.wd-result-card h2').innerText(), /4\s+din\s+5/);
  const activity = await page.evaluate(() => window.wordQa.activity);
  assert.equal(activity.length, 1, 'Rapid Next clicks do not record duplicate activity');
  assert.equal(activity[0].type, 'practice-word');
  assert.equal(activity[0].score, 80);
  assert.equal(activity[0].retry, false);
  const beforeRetry = await page.evaluate(() => window.wordQa.progress());
  assert.equal(beforeRetry.sessions, 1);
  assert.equal(beforeRetry.completed, 4);
  assert.equal(beforeRetry.best, 80);
  await page.getByRole('button', { name: /Repetă greșelile/ }).click();
  assert.equal(await page.locator('.wd-card h2').innerText(), mistake.prompt);
  assert.match(await page.locator('.wd-counter').innerText(), /Cuvântul\s+1\s+din\s+1/i);
  await solve(mistake.answer);
  await page.locator('.wd-next').evaluate(button => { button.click(); button.click(); });
  await page.waitForSelector('.word-discovery--result');
  assert.match(await page.locator('.wd-result-card h2').innerText(), /1\s+din\s+1/);
  assert.equal(await page.getByRole('button', { name: /Repetă greșelile/ }).count(), 0);
  assert.deepEqual(await page.evaluate(() => window.wordQa.progress()), beforeRetry, 'Retry cannot overwrite the first full session’s saved progress');
  const retryActivity = await page.evaluate(() => window.wordQa.activity);
  assert.equal(retryActivity.length, 2);
  assert.equal(retryActivity[1].retry, true, 'A repeated attempt retains its original reward guard');
  await page.getByRole('button', { name: /Sesiune nouă/ }).click();
  assert.match(await page.locator('.wd-counter').innerText(), /Cuvântul\s+1\s+din\s+5/i);
  assert.equal(await page.locator('.word-discovery--checked').count(), 0);
  report.logic.push('The real game retains five rounds, a single 4/5 completion, saved progress, one-word retry and a clean new session.');

  assert.deepEqual(report.browserErrors, []);
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ states: report.states.length, logic: report.logic, browserErrors: report.browserErrors }));
} catch (error) {
  const page = browser.contexts()[0]?.pages()[0];
  if (page) {
    await page.screenshot({ path: resolve(output, 'failure.png'), fullPage: true });
    await writeFile(resolve(output, 'failure.txt'), await page.locator('body').innerText());
  }
  console.error(JSON.stringify(report));
  throw error;
} finally { await browser.close(); }
