import { build } from 'vite';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { isAbsolute, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'node_modules/.cache/lesson-feedback-ui');
const artifacts = resolve(process.env.LESSON_FEEDBACK_ARTIFACTS || resolve(output, 'screenshots'));
await mkdir(artifacts, { recursive: true });
let chromium;
for (const candidate of [process.env.PLAYWRIGHT_MODULE, 'playwright', '@playwright/test', resolve(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')].filter(Boolean)) {
  try { ({ chromium } = await import(isAbsolute(candidate) ? pathToFileURL(candidate).href : candidate)); if (chromium) break; } catch (_) { /* Use an existing installation. */ }
}
if (!chromium) throw Error('Set PLAYWRIGHT_MODULE to an installed Playwright module.');
const abs = path => JSON.stringify(resolve(root, path).replaceAll('\\', '/'));
const source = `
import React from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter,Route} from 'react-router-dom';
import ${abs('node_modules/bootstrap/dist/css/bootstrap.min.css')};
import ${abs('src/App.css')};
import Lesson from ${abs('src/modules/lessons/norwegian-program/LessonProgram.js')};
import {courseCatalog} from ${abs('src/modules/lessons/norwegian-program/lessonContent.js')};
import {lessonResumeKey} from ${abs('src/services/curriculumProgress.js')};
import {lessonStepState,LESSON_STAGE} from ${abs('src/modules/lessons/norwegian-program/lessonFlow.js')};
import {getCareerLessonModule} from ${abs('src/services/careerProfile.js')};
const root=createRoot(document.getElementById('root'));
const user={id:'lesson-feedback-ui'};
let run=0,key;
window.feedbackQa={
 mount(level='A1',id=1,index=0){
  localStorage.clear();
  const lesson=courseCatalog[level].lessons.find(lesson=>lesson.id===id);
  const exercises=[...lesson.exercises,getCareerLessonModule('general',level,id,lesson).exercise];
  key=lessonResumeKey(level,id,user)+'_voice_v1';
  localStorage.setItem(key,JSON.stringify(lessonStepState(LESSON_STAGE.EXERCISES)));
  localStorage.setItem(key+'_exercise_index',JSON.stringify(index));
  root.render(<MemoryRouter key={++run} initialEntries={['/lectii/'+level.toLowerCase()+'/'+id]}><div className="App"><main className="App__main"><Route path="/lectii/:level/:lessonId" component={Lesson}/></main></div></MemoryRouter>);
  return exercises[index];
 },
 snapshot(){return {answers:JSON.parse(localStorage.getItem(key+'_answers')||'{}'),responses:JSON.parse(localStorage.getItem(key+'_responses')||'{}'),review:JSON.parse(localStorage.getItem('norwegian_review_items')||'[]')};}
};
window.feedbackQa.mount();
`;
await writeFile(resolve(output, 'entry.jsx'), source);
await build({ configFile: resolve(root, 'vite.config.js'), logLevel: 'error', publicDir: false, define: { 'process.env.NODE_ENV': JSON.stringify('production') }, plugins: [{
  name: 'lesson-feedback-offline', enforce: 'pre',
  resolveId(id) {
    if (id.endsWith('/AuthContext')) return '\0feedback-auth';
    if (id.endsWith('/supabaseLearning')) return '\0feedback-sync';
    if (id.endsWith('/norwegianSpeech')) return '\0feedback-speech';
    if (id.endsWith('/VoiceLessonConversation') || id.endsWith('/ChatAssistant')) return '\0feedback-voice';
    if (id.endsWith('/PremiumGate')) return '\0feedback-premium';
  },
  load(id) {
    if (id === '\0feedback-auth') return 'export const useAuth=()=>({user:{id:"lesson-feedback-ui"}});';
    if (id === '\0feedback-sync') return 'export const syncLearningProgress=async()=>({}); export const syncStudyActivity=async()=>({});';
    if (id === '\0feedback-speech') return 'export const speakNorwegian=async(text)=>{window.feedbackSpeech=text;return {ok:true};};';
    if (id === '\0feedback-voice') return 'export default ()=>null;';
    if (id === '\0feedback-premium') return 'export default ({children})=>children;';
  },
}], build: { outDir: output, emptyOutDir: false, minify: false, lib: { entry: resolve(output, 'entry.jsx'), formats: ['iife'], name: 'LessonFeedbackQa', fileName: () => 'client.js' } } });
const js = await readFile(resolve(output, 'client.js'), 'utf8');
const css = (await Promise.all((await readdir(output)).filter(name => name.endsWith('.css')).map(name => readFile(resolve(output, name), 'utf8')))).join('\n');
const html = '<!doctype html><html class="is-installed-app" lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body style="margin:0"><div id="root"></div><script>'+js.replaceAll('</script','<\\/script')+'</script></body></html>';
let executablePath;
for (const candidate of [process.env.PLAYWRIGHT_CHROME_EXECUTABLE_PATH, process.platform === 'win32' && resolve(process.env.PROGRAMFILES || 'C:/Program Files', 'Google/Chrome/Application/chrome.exe'), process.platform === 'darwin' && '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', process.platform === 'linux' && '/usr/bin/chromium', chromium.executablePath()].filter(Boolean)) {
  try { await access(candidate); executablePath = candidate; break; } catch (_) { /* Try another installed browser. */ }
}
const browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), headless: true });
const report = { checked: 0, browserErrors: [] };
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  page.on('pageerror', error => report.browserErrors.push(error.message));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: html });
    const file = resolve(root, 'public', decodeURIComponent(url.pathname).replace(/^\/+/, ''));
    if (file.startsWith(resolve(root, 'public') + sep)) {
      try { return await route.fulfill({ body: await readFile(file), contentType: file.endsWith('.svg') ? 'image/svg+xml' : file.endsWith('.webp') ? 'image/webp' : 'image/png' }); } catch (_) { /* No network is needed. */ }
    }
    return route.abort();
  });
  await page.goto('http://lesson-feedback.local/');
  const paint = () => page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
  const mount = async (level = 'A1', id = 1, index = 0) => {
    const exercise = await page.evaluate(args => window.feedbackQa.mount(...args), [level, id, index]);
    await page.waitForSelector('.lapp-exercise'); await paint(); return exercise;
  };
  const choose = async (exercise, correct) => {
    if (exercise.type === 'choice') await page.locator('.lapp-options button').nth(correct ? exercise.answer : (exercise.answer + 1) % exercise.options.length).click();
    else if (exercise.type === 'fill') await page.locator('.answer-input').fill(correct ? exercise.answer : 'alt-răspuns');
    else if (exercise.type === 'order') for (const word of correct ? exercise.answer : [...exercise.answer].reverse()) {
      const tokens = page.locator('.word-bank').getByRole('button', { name: word, exact: true });
      for (let i=0;i<await tokens.count();i++) if (!await tokens.nth(i).isDisabled()) { await tokens.nth(i).click(); break; }
    }
    else for (const word of correct ? exercise.answer : [exercise.options.find(word => !exercise.answer.includes(word))]) await page.locator('.gap-word-bank').getByRole('button', { name: word, exact: true }).click();
    if (!(exercise.type === 'gaps' && exercise.answer.length === 1)) await page.locator('.lapp-exercise__footer .lapp-exercise__primary').click();
    await page.waitForSelector('.lapp-exercise__feedback-dialog[open]'); await paint();
  };
  const metric = async label => {
    const state = await page.locator('.lapp-exercise__feedback-dialog').evaluate(dialog => {
      const r = dialog.getBoundingClientRect();
      return { x:r.x,y:r.y,right:r.right,bottom:r.bottom,scroll:dialog.scrollHeight-dialog.clientHeight,width:innerWidth,height:innerHeight,
        controls:[...dialog.querySelectorAll('button')].map(button=>{const b=button.getBoundingClientRect();return {width:b.width,height:b.height,bottom:b.bottom,right:b.right,x:b.x,y:b.y};}), focus:dialog.contains(document.activeElement) };
    });
    assert(state.x >= 0 && state.y >= 0 && state.right <= state.width + 1 && state.bottom <= state.height + 1, label+': dialog clipped');
    assert(state.scroll <= 1, label+': feedback introduces internal scroll '+state.scroll);
    assert(state.focus, label+': focus escaped dialog');
    assert(state.controls.every(r => r.width >= 43.5 && r.height >= 43.5 && r.bottom <= state.height + 1 && r.right <= state.width + 1 && r.x >= 0 && r.y >= 0), label+': clipped or small controls');
    report.checked++;
  };
  for (const size of [{width:320,height:480},{width:320,height:568},{width:360,height:640},{width:390,height:844},{width:412,height:915},{width:768,height:1024},{width:1280,height:800},{width:568,height:320}]) {
    await page.setViewportSize(size);
    for (const correct of [true, false]) {
      const exercise = await mount();
      const before = await page.evaluate(() => ({page:document.documentElement.scrollHeight,content:document.querySelector('.lapp-content').scrollHeight}));
      await choose(exercise, correct); await metric(size.width+'x'+size.height+'/'+correct);
      assert.equal(await page.getByRole('button', {name:'Repetă',exact:true}).count(), correct ? 0 : 1);
      const after = await page.evaluate(() => ({page:document.documentElement.scrollHeight,content:document.querySelector('.lapp-content').scrollHeight}));
      assert(after.page <= before.page + 1 && after.content <= before.content + 1, 'feedback increased the question page height');
      if (size.width === 390 || size.width === 320) await page.screenshot({path:resolve(artifacts,size.width+'x'+size.height+'-'+correct+'.png')});
      await page.keyboard.press('Escape'); await page.waitForFunction(() => !document.querySelector('.lapp-exercise__feedback-dialog').open);
      assert(await page.getByRole('button',{name:'Vezi rezultatul răspunsului'}).evaluate(button=>button===document.activeElement));
      await page.getByRole('button',{name:'Vezi rezultatul răspunsului'}).click();
      await page.waitForSelector('.lapp-exercise__feedback-dialog[open]');
      if (!correct) {
        const first = await page.evaluate(() => window.feedbackQa.snapshot());
        await page.getByRole('button',{name:'Repetă',exact:true}).click(); await page.waitForFunction(() => !document.querySelector('.lapp-exercise__feedback-dialog').open);
        await choose(exercise,true); await metric('practice/'+size.width);
        assert.deepEqual(await page.evaluate(() => window.feedbackQa.snapshot()), first, 'practice changes the persisted score, original answer or recap queue');
      }
      await page.locator('.lapp-exercise__modal-continue').click(); await paint();
      assert.equal(await page.locator('dialog[open]').count(),0,'Continue leaves a modal behind');
    }
  }
  // Twenty real lessons across all six levels, with their complete explanations.
  let lessons = 0;
  await page.setViewportSize({width:320,height:480});
  for (const level of ['A1','A2','B1','B2','C1','C2']) for (let id=1;id<=(['A1','A2'].includes(level)?4:3);id++) {
    const exercise = await mount(level,id); await choose(exercise,false); await metric(level+'/'+id); lessons++;
  }
  assert.equal(lessons,20);
  for (const size of [{width:320,height:480},{width:568,height:320}]) {
    await page.setViewportSize(size);
    for (const level of ['A1','B2','C2']) for (const index of [1,2,3]) {
      const exercise = await mount(level,1,index); await choose(exercise,true); await metric(level+'/'+exercise.type+'/'+size.width);
    }
  }
  assert.deepEqual(report.browserErrors,[]);
  await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({...report,lessons},null,2));
} finally { await browser.close(); }
