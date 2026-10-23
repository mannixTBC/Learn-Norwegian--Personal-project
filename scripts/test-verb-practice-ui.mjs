import { build } from 'vite';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { isAbsolute, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'node_modules/.cache/verb-practice-ui');
await mkdir(output, { recursive: true });
const abs = path => JSON.stringify(resolve(root, path).replaceAll('\\', '/'));
await writeFile(resolve(output, 'entry.jsx'), `
import React from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter,Route,Switch} from 'react-router-dom';
import ${abs('node_modules/bootstrap/dist/css/bootstrap.min.css')};
import ${abs('src/App.css')};
import Challenge30 from ${abs('src/modules/exercises/challenge30/Challenge30.js')};
import {getVerbSessions} from ${abs('src/modules/exercises/challenge30/verbsForLevel.js')};
import {createVerbSession,getKnownReviewVerbs} from ${abs('src/modules/exercises/challenge30/verbPracticeData.js')};
import {readVerbPracticeProgress,selectDueVerbReviews} from ${abs('src/modules/exercises/challenge30/verbPracticeState.js')};
const root=createRoot(document.getElementById('root'));
let run=0;
window.verbQa={activities:[],speech:[],sessions:getVerbSessions,session(options){
 const {level,day,progress}=options,memory=this.memory(level),known=getKnownReviewVerbs(options);
 const due=selectDueVerbReviews(memory,known,{limit:2});
 const candidates=[...known.filter(item=>memory.verbs[item.id]?.needsReview),...due,...known.slice().reverse()];
 const reviewVerbs=[...new Map(candidates.map(item=>[item.id,item])).values()].slice(0,2);
 return createVerbSession({level,day,progress,reviewVerbs});
},memory(level='A1'){return readVerbPracticeProgress(localStorage,{level,userId:'verb-ui-qa'});},mount(level='A1',app=true){
 document.documentElement.classList.toggle('is-installed-app',app);
 root.render(<MemoryRouter key={++run} initialEntries={['/challenge30?nivel='+level]}>
  <div className="App"><nav className="navbar" style={{display:app?'none':'flex',minHeight:64}}>NordLingo · Navigare web</nav>
   <main className="App__main"><Switch><Route path="/challenge30"><Challenge30/></Route><Route path="/jocuri"><h1 data-testid="exercise-hub">Jocuri și exerciții</h1></Route></Switch></main>
   <footer className="footer" style={{display:app?'none':'block',padding:20}}>NordLingo</footer>
  </div>
 </MemoryRouter>);
},reset(){localStorage.clear();this.activities=[];this.speech=[];},unmount(){root.render(null);}};
window.verbQa.mount();
`);
await build({
  configFile: resolve(root, 'vite.config.js'), publicDir: false, logLevel: 'error',
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  plugins: [{
    name: 'verb-practice-offline-boundaries', enforce: 'pre',
    resolveId(id) {
      if (id.endsWith('/AuthContext')) return '\0verb-qa-auth';
      if (id.endsWith('/learningActivity')) return '\0verb-qa-activity';
      if (id.endsWith('/norwegianSpeech')) return '\0verb-qa-speech';
    },
    load(id) {
      if (id === '\0verb-qa-auth') return 'export const useAuth=()=>({user:{id:"verb-ui-qa"}});';
      if (id === '\0verb-qa-activity') return 'export const recordStudyActivity=activity=>{window.verbQa.activities.push({...activity});};export const getStudySummary=()=>({streak:4});';
      if (id === '\0verb-qa-speech') return 'export const speakNorwegian=async(text,options={})=>{window.verbQa.speech.push({text,slow:Boolean(options.slow)});return {ok:true};};';
    },
  }],
  build: { outDir: output, emptyOutDir: false, minify: false, lib: { entry: resolve(output, 'entry.jsx'), formats: ['iife'], name: 'VerbPracticeQa', fileName: () => 'client.js' } },
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
const longContentOnly = process.argv.includes('--long-content-only');
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
  await page.goto('http://verb-practice.test/');
  await page.waitForFunction(() => Boolean(window.verbQa));

  const primary = () => page.locator('[data-action="primary"]');
  const previous = () => page.locator('[data-action="previous"]');
  const mount = async ({ level = 'A1', app = true, clear = true, progress } = {}) => {
    await page.evaluate(({ level, app, clear, progress }) => {
      if (clear) window.verbQa.reset();
      if (progress) localStorage.setItem('challenge_verbs_progress_' + level.toLowerCase(), JSON.stringify(progress));
      window.verbQa.mount(level, app);
    }, { level, app, clear, progress });
    await page.waitForSelector('.verb-practice__card');
  };
  const checkLayout = async label => {
    const measurements = await page.evaluate(() => {
      const screen = document.querySelector('dialog[open]') || document.querySelector('.verb-practice');
      const bounds = screen.getBoundingClientRect();
      const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
      const controls = [...screen.querySelectorAll('button,a,input,select')].filter(visible);
      const horizontal = controls.flatMap(el => {
        const r = el.getBoundingClientRect();
        return r.left < -1 || r.right > innerWidth + 1 || (el.tagName !== 'INPUT' && el.scrollWidth > el.clientWidth + 1)
          ? [{ label: el.getAttribute('aria-label') || el.textContent.trim(), left: r.left, right: r.right, width: r.width, scroll: el.scrollWidth, client: el.clientWidth }] : [];
      });
      const overlaps = [];
      for (let i = 0; i < controls.length; i++) for (let j = i + 1; j < controls.length; j++) {
        const a = controls[i], b = controls[j];
        if (a.contains(b) || b.contains(a)) continue;
        const x = a.getBoundingClientRect(), y = b.getBoundingClientRect();
        if (Math.min(x.right, y.right) - Math.max(x.left, y.left) > 1 && Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 1) overlaps.push([a.textContent.trim(), b.textContent.trim()]);
      }
      const card = screen.querySelector('.verb-practice__card');
      const cardOverflow = card && card.scrollHeight > card.clientHeight + 1 && !['auto','scroll'].includes(getComputedStyle(card).overflowY)
        ? { scroll: card.scrollHeight, client: card.clientHeight, overflow: getComputedStyle(card).overflowY } : null;
      return { horizontal, overlaps, cardOverflow, screen: { left: bounds.left, right: bounds.right }, scrollWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth, pageHeight: document.documentElement.scrollHeight, viewportHeight: innerHeight };
    });
    assert.ok(measurements.scrollWidth <= measurements.viewportWidth + 1, label + ': no horizontal page overflow');
    assert.deepEqual(measurements.horizontal, [], label + ': controls contain their text and fit horizontally');
    assert.deepEqual(measurements.overlaps, [], label + ': interactive controls do not overlap');
    assert.equal(measurements.cardOverflow, null, label + ': card content is contained or can scroll accessibly');
    assert.ok(measurements.screen.left >= -1 && measurements.screen.right <= measurements.viewportWidth + 1, label + ': exercise fits page width');
    const actionScope = await page.locator('dialog[open]').count() ? page.locator('dialog[open]') : page.locator('.verb-practice');
    for (const action of ['primary', 'previous', 'hint']) {
      const target = actionScope.locator('[data-action="' + action + '"]:enabled');
      if (!await target.count()) continue;
      await target.scrollIntoViewIfNeeded();
      const reachable = await target.evaluate(el => {
        const r = el.getBoundingClientRect();
        const point = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return r.width >= 30 && r.height >= 36 && r.top >= -1 && r.bottom <= innerHeight + 1 && (point === el || el.contains(point));
      });
      assert.ok(reachable, label + ': ' + action + ' remains visible and usable after scrolling');
    }
    const cardControls = actionScope.locator('.verb-practice__audio:enabled,.verb-practice__choices button:enabled,#verb-answer:enabled');
    for (let index = 0; index < await cardControls.count(); index++) {
      const target = cardControls.nth(index);
      await target.scrollIntoViewIfNeeded();
      assert.ok(await target.evaluate(el => {
        const r = el.getBoundingClientRect(), point = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return r.top >= -1 && r.bottom <= innerHeight + 1 && (point === el || el.contains(point));
      }), label + ': question controls remain usable inside a scrolling card');
    }
    report.states.push({ label, pageHeight: measurements.pageHeight, viewportHeight: measurements.viewportHeight });
  };

  const sessionPlan = (level = 'A1', day = 1, progress = { day: 1, completed: [] }) => page.evaluate(({ level, day, progress }) => window.verbQa.session({ level, day, progress }), { level, day, progress });
  const currentQuestion = async plan => {
    const id = await page.locator('.verb-practice__card').getAttribute('data-question-id');
    const question = plan.questions.find(item => item.id === id);
    assert.ok(question, 'The rendered question maps to the real session data: ' + id);
    return question;
  };
  const advanceIntros = async ({ layoutLabel, testBack = false, capture, checkEveryFrame = false } = {}) => {
    for (let index = 0; index < 3; index++) {
      assert.equal(await page.locator('.verb-practice__card').getAttribute('data-question-id'), null, 'Discovery cards precede the questions');
      if (layoutLabel && (index === 0 || checkEveryFrame)) await checkLayout(layoutLabel + ' discovery ' + (index + 1));
      if (capture && index === 0) await page.screenshot({ path: resolve(output, capture + '-discovery.png'), fullPage: true });
      if (capture && checkEveryFrame) await page.screenshot({ path: resolve(output, capture + '-discovery-' + (index + 1) + '.png'), fullPage: true });
      if (testBack && index === 1) {
        const heading = await page.locator('.verb-practice__card').innerText();
        await previous().click();
        assert.notEqual(await page.locator('.verb-practice__card').innerText(), heading, 'Back revisits the preceding discovery card');
        await primary().click();
      }
      await primary().click();
    }
  };
  const submitQuestion = async (question, { wrong = false, hint = false, duplicate = false } = {}) => {
    const input = page.locator('#verb-answer');
    if (await input.count()) {
      if (hint) await page.locator('[data-action="hint"]').click();
      await input.fill(wrong ? 'răspuns greșit' : question.answer);
    } else {
      const buttons = page.locator('[data-choice]');
      const index = await buttons.evaluateAll((elements, { answer, wrong }) => elements.findIndex(el => wrong ? el.getAttribute('data-choice') !== answer : el.getAttribute('data-choice') === answer), { answer: question.answer, wrong });
      assert.ok(index >= 0, question.id + ': correct/wrong choice exists');
      await buttons.nth(index).click();
      assert.equal(await buttons.nth(index).getAttribute('aria-pressed'), 'true', 'Choosing an answer does not verify automatically');
    }
    assert.match(await primary().innerText(), /Verifică/, 'Answers are verified explicitly');
    if (duplicate) await primary().evaluate(button => { button.click(); button.click(); });
    else await primary().click();
    await page.locator('.verb-practice__feedback[role="status"]').waitFor();
    assert.doesNotMatch(await primary().innerText(), /Verifică/, 'Checked answer advances instead of submitting again');
    assert.equal(await page.locator('[data-choice]:enabled,#verb-answer:enabled').count(), 0, 'A checked answer is read-only');
    if (wrong) assert.ok((await page.locator('.verb-practice__card').innerText()).includes(question.answer), 'Wrong feedback shows the original correct form');
  };
  const finish = async (plan, { layoutLabel, makeMistakes = false, testBack = false, capture, checkEveryFrame = false } = {}) => {
    let wrongDone = false, hintDone = false, inputIndex = 0;
    const captured = new Set();
    for (let index = 0; index < plan.questions.length; index++) {
      const question = await currentQuestion(plan);
      const isInput = await page.locator('#verb-answer').count() > 0;
      if (isInput) inputIndex++;
      const wrong = makeMistakes && isInput && !wrongDone;
      const hint = makeMistakes && isInput && !wrong && !hintDone;
      if (layoutLabel && (index === 0 || isInput && inputIndex === 1 || checkEveryFrame)) await checkLayout(layoutLabel + ' ' + question.id);
      if (capture && !captured.has(question.phase)) {
        await page.screenshot({ path: resolve(output, capture + '-' + question.phase + '.png'), fullPage: true });
        captured.add(question.phase);
      }
      if (capture && checkEveryFrame && question.formLabel === 'construcție la prezent') await page.screenshot({ path: resolve(output, capture + '-construction-' + question.phase + '.png'), fullPage: true });
      await submitQuestion(question, { wrong, hint, duplicate: index === 0 });
      if (wrong) wrongDone = true;
      if (hint) hintDone = true;
      if (layoutLabel && (index === 0 || wrong || checkEveryFrame)) await checkLayout(layoutLabel + ' ' + question.id + (wrong ? ' wrong feedback' : ' checked'));
      if (capture && wrong) await page.screenshot({ path: resolve(output, capture + '-wrong-feedback.png'), fullPage: true });
      await primary().click();
      if (testBack && index === 0) {
        const nextId = await page.locator('.verb-practice__card').getAttribute('data-question-id');
        await previous().click();
        assert.equal(await page.locator('.verb-practice__card').getAttribute('data-question-id'), question.id);
        assert.equal(await page.locator('[data-choice]:enabled,#verb-answer:enabled').count(), 0, 'Previous checked question remains read-only');
        assert.equal(await page.evaluate(() => window.verbQa.activities.length), 0);
        await primary().click();
        assert.equal(await page.locator('.verb-practice__card').getAttribute('data-question-id'), nextId, 'Continue returns from review to the unanswered question');
      }
    }
    await page.waitForSelector('.verb-practice__result');
    assert.ok(!makeMistakes || wrongDone && hintDone, 'Session exercises include wrong and assisted recall');
    return { correct: plan.questions.length - (wrongDone ? 1 : 0), helped: hintDone ? 1 : 0, total: plan.questions.length };
  };
  const assertScore = async expected => {
    assert.match(await page.locator('.verb-practice__score').innerText(), new RegExp(expected.correct + '\\s+din\\s+' + expected.total + '\\s+răspunsuri corecte'));
    if (expected.helped > 0) assert.match(await page.locator('.verb-practice__score').innerText(), new RegExp(expected.helped + '\\s+cu ajutor'));
    else assert.doesNotMatch(await page.locator('.verb-practice__score').innerText(), /cu ajutor/);
  };

  if (!longContentOnly) {
  const sizes = [
    { width: 320, height: 740, app: true }, { width: 390, height: 844, app: true },
    { width: 430, height: 932, app: true }, { width: 768, height: 1024, app: true },
    { width: 844, height: 390, app: true }, { width: 1440, height: 900, app: false },
  ];
  for (const { width, height, app } of sizes) {
    const label = (app ? 'app ' : 'web ') + width + 'x' + height;
    console.log('Checking ' + label);
    await page.setViewportSize({ width, height });
    await mount({ app });
    assert.equal(await page.locator(app ? '.verb-practice--app' : '.challenge30 .verb-practice--web').count(), 1);
    if (!app) {
      assert.equal(await page.locator('.nordic-exercise,.verb-practice__top').count(), 0, 'Web retains its neutral exercise presentation');
      assert.equal(await page.locator('.exercise-topbar').count(), 1);
    }
    const plan = await sessionPlan();
    assert.equal(plan.questions.length, 9, 'The first session introduces three verbs with nine questions');
    const capture = width === 390 || !app ? (app ? 'app' : 'web') : undefined;
    await advanceIntros({ layoutLabel: label, testBack: true, capture });
    const expected = await finish(plan, { layoutLabel: label, makeMistakes: true, testBack: true, capture });
    await checkLayout(label + ' result');
    await assertScore(expected);
    assert.equal(await page.locator('.verb-practice__result-row').count(), plan.verbs.length);
    const statuses = await page.locator('.verb-practice__status').allTextContents();
    assert.ok(statuses.every(status => status.trim().length > 0), 'Each verb has an explicit outcome');
    const activities = await page.evaluate(() => window.verbQa.activities);
    assert.equal(activities.length, 1, 'Completing a session records one activity');
    assert.equal(activities[0].type, 'verbs');
    assert.equal(activities[0].score, Math.round(expected.correct / expected.total * 100));
    const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('challenge_verbs_progress_a1')));
    assert.deepEqual(progress.completed, [1]);
    assert.equal(progress.day, 2, 'Completion unlocks the next session');
    if (width === 390 || !app) await page.screenshot({ path: resolve(output, app ? 'app-result.png' : 'web-result.png'), fullPage: true });
    report.logic.push(label + ': discovery, choice, explicit verification, hint, wrong recall, read-only back, score and persisted completion');
  }

  // A completed older session contributes two review questions to the next one.
  await page.setViewportSize({ width: 390, height: 844 });
  await mount({ progress: { day: 2, completed: [1] } });
  const second = await sessionPlan('A1', 2, { day: 2, completed: [1] });
  assert.equal(second.questions.length, 11);
  assert.equal(second.questions.filter(question => question.old).length, 2);
  await advanceIntros();
  await finish(second);
  await assertScore({ correct: 11, total: 11, helped: 0 });
  assert.equal(await page.locator('.verb-practice__result-row').count(), second.verbs.length);
  const secondResult = await page.locator('.verb-practice__result').innerText();
  assert.ok(second.reviewVerbs.every(verb => secondResult.includes(verb.form)), 'The result also acknowledges the older reviewed verbs');
  assert.equal(await page.evaluate(() => window.verbQa.activities.length), 1);
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('challenge_verbs_progress_a1')).completed), [1, 2]);
  report.logic.push('Previously completed verbs return in session two as two review questions; all eleven are scored and saved');

  // The primary result action repeats weak verbs without replacing the first score.
  await mount();
  const retryPlan = await sessionPlan();
  await advanceIntros();
  const originalScore = await finish(retryPlan, { makeMistakes: true });
  const originalText = await page.locator('.verb-practice__score').innerText();
  const memoryBefore = await page.evaluate(() => window.verbQa.memory());
  assert.equal(memoryBefore.completions.length, 1);
  assert.ok(Object.values(memoryBefore.verbs).some(verb => verb.needsReview), 'Wrong and assisted answers are scheduled for review');
  assert.match(await primary().innerText(), /Repetă verbele/);
  await primary().click();
  let retryQuestions = 0;
  while (!await page.locator('.verb-practice__result').count()) {
    if (await page.locator('[data-choice],#verb-answer').count()) {
      await submitQuestion(await currentQuestion(retryPlan));
      retryQuestions++;
    }
    await primary().click();
    assert.ok(retryQuestions <= retryPlan.questions.length, 'Retry stays within the existing verb session');
  }
  assert.ok(retryQuestions > 0);
  await assertScore(originalScore);
  assert.equal(await page.locator('.verb-practice__score').innerText(), originalText, 'Practice cannot overwrite the first-attempt score');
  assert.equal(await page.evaluate(() => window.verbQa.activities.length), 1, 'Retry gives no additional activity or reward');
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('challenge_verbs_progress_a1')).completed), [1]);
  const memoryAfter = await page.evaluate(() => window.verbQa.memory());
  assert.equal(memoryAfter.completions.length, 2, 'The retry stores a distinct memory round');
  assert.ok(Object.values(memoryAfter.verbs).every(verb => !verb.needsReview), 'Successful independent retry fixes each weak verb’s next review');
  report.logic.push('Targeted retry fixes weak verbs without duplicate completion or activity and keeps the original score');

  await page.locator('[data-action="sessions"]').click();
  await page.waitForSelector('.verb-practice__sessions[open]');
  assert.equal(await page.locator('[data-session="2"]').isEnabled(), true);
  assert.equal(await page.locator('[data-session="3"]').isEnabled(), false, 'Sessions unlock in order');
  await checkLayout('session picker');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.verb-practice__sessions[open]').count(), 0);
  report.logic.push('The session picker respects saved unlocks and closes with Escape');

  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
    await mount({ level });
    await checkLayout(level + ' discovery');
    const plan = await sessionPlan(level);
    await advanceIntros();
    const question = await currentQuestion(plan);
    await submitQuestion(question);
    await checkLayout(level + ' checked answer');
  }
  report.logic.push('Real content from all six levels renders and answers correctly');

  await mount();
  await page.locator('.verb-practice__top a').first().click();
  await page.waitForSelector('[data-testid="exercise-hub"]');
  assert.equal(await page.evaluate(() => window.verbQa.activities.length), 0, 'Leaving a partial session does not record a completion');
  report.logic.push('Returning to games leaves unfinished activity unrecorded');
  }

  // Inspect the longest real C-level sessions, rather than rendering every session.
  await page.setViewportSize({ width: 320, height: 740 });
  await page.evaluate(() => window.verbQa.reset());
  const longSessions = await page.evaluate(() => {
    const samples = [];
    const score = plan => Math.max(...plan.verbs.map(verb => [verb.norwegian,verb.form,verb.example,verb.translation].join(' ').length), ...plan.questions.map(question => [question.prompt,question.sentence,question.translation,question.answer].join(' ').length));
    for (const level of ['C1','C2']) {
      const candidates = window.verbQa.sessions(level).map((_, index) => {
        const day=index+1,progress={day,completed:Array.from({length:index},(_,i)=>i+1)};
        const plan=window.verbQa.session({level,day,progress});
        return {level,day,progress,characters:score(plan),construction:plan.verbs.some(verb=>verb.formLabel==='construcție la prezent')};
      }).sort((a,b)=>b.characters-a.characters);
      samples.push(candidates[0]);
      if(level==='C2') {
        const construction=candidates.find(candidate=>candidate.construction);
        if(construction&&!samples.some(sample=>sample.level===level&&sample.day===construction.day))samples.push(construction);
        const last=candidates.find(candidate=>candidate.day===window.verbQa.sessions(level).length);
        if(!samples.some(sample=>sample.level===level&&sample.day===last.day))samples.push(last);
      }
    }
    return samples;
  });
  assert.ok(longSessions.some(sample => sample.level === 'C2' && sample.construction), 'The long-content audit includes a C2 present-tense construction');
  report.longContent = longSessions;
  for (const sample of longSessions) {
    const { level, day, progress } = sample;
    const label = level + ' day ' + day + ' long-content';
    console.log('Checking ' + label);
    await mount({ level, progress });
    const plan = await sessionPlan(level, day, progress);
    await advanceIntros({ layoutLabel: label, checkEveryFrame: true, capture: level.toLowerCase() + '-' + day });
    const expected = await finish(plan, { layoutLabel: label, checkEveryFrame: true, makeMistakes: true, capture: level.toLowerCase() + '-' + day });
    await checkLayout(label + ' result');
    await assertScore(expected);
    await page.screenshot({ path: resolve(output, level.toLowerCase() + '-' + day + '-result.png'), fullPage: true });
    assert.equal(await page.evaluate(() => window.verbQa.activities.length), 1);
    report.logic.push(label + ': every discovery/question/feedback and result fits or scrolls accessibly');
  }

  assert.deepEqual(report.browserErrors, []);
  await writeFile(resolve(output, longContentOnly ? 'long-content-report.json' : 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  const page = browser.contexts()[0]?.pages()[0];
  if (page) {
    await page.screenshot({ path: resolve(output, 'failure.png'), fullPage: true });
    await writeFile(resolve(output, 'failure.txt'), await page.locator('body').innerText());
  }
  console.error(JSON.stringify(report));
  throw error;
} finally { await browser.close(); }
