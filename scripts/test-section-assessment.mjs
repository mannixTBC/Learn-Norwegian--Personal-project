import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer,{act} from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
const outDir=resolve('node_modules/.cache/section-tests');
await build({logLevel:'error',plugins:[{name:'test-services',enforce:'pre',resolveId(id){if(id.endsWith('/AuthContext'))return 'virtual:auth';if(id.endsWith('/norwegianSpeech'))return 'virtual:speech';if(id.endsWith('/spacedReview'))return 'virtual:review';},load(id){if(id==='virtual:auth')return 'export const useAuth=()=>({user:{id:"section-test"}});';if(id==='virtual:speech')return 'export const speakNorwegian=async()=>({ok:true});';if(id==='virtual:review')return 'export const saveReviewItem=item=>globalThis.savedReviews.push(item);';}}],build:{ssr:true,outDir,emptyOutDir:false,rollupOptions:{input:{catalog:resolve('src/modules/lessons/norwegian-program/lessonContent.js'),assessment:resolve('src/modules/lessons/sectionAssessment.js'),ui:resolve('src/modules/lessons/SectionFinalTest.js')},output:{entryFileNames:'[name].mjs'}}}});
const load=n=>import(pathToFileURL(resolve(outDir,n+'.mjs')));
const {courseCatalog}=await load('catalog');const {buildSectionTest,sectionTestSummary}=await load('assessment');
let sections=0;
for(const course of Object.values(courseCatalog))for(const section of course.sections){
 const {questions,practical}=buildSectionTest(section);assert.equal(questions.length,6);assert.equal(practical.length,2);assert.equal(new Set(questions.map(q=>q.id)).size,6);
 const answers={};for(const q of questions){assert.ok(section.lessons.some(l=>l.id===q.lessonId));if(q.type==='audio'){assert.equal(new Set(q.options).size,3);assert.ok(q.audioText);}
 answers[q.id]=q.type==='order'?q.answer.map((word,index)=>{const used=q.answer.slice(0,index).filter(w=>w===word).length;return q.words.map((w,i)=>w===word?i:-1).filter(i=>i>=0)[used];}):q.answer;
 }assert.equal(sectionTestSummary(questions,answers).correct,6);for(const p of practical)assert.ok(p.cue&&p.model&&p.intent);sections++;
}
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};globalThis.savedReviews=[];
const {default:UI}=await load('ui');const section=courseCatalog.A1.sections[0];const test=buildSectionTest(section);let renderer;
const mount=()=>TestRenderer.create(React.createElement(MemoryRouter,null,React.createElement(UI,{match:{params:{level:'a1',sectionId:section.id}}})));
await act(async()=>{renderer=mount();});const button=t=>renderer.root.findAllByType('button').find(b=>b.props.children===t);
await act(async()=>button('Începe testul').props.onClick());
for(const q of test.questions){
 if(q.type==='choice'||q.type==='audio'){const options=renderer.root.findAllByType('button').filter(b=>b.props['aria-pressed']!==undefined);await act(async()=>options[q.answer].props.onClick());}
 if(q.type==='fill')await act(async()=>renderer.root.findByType('input').props.onChange({target:{value:q.answer}}));
 if(q.type==='order')for(const word of q.answer){const b=renderer.root.findAllByType('button').find(b=>b.props.children===word&&!b.props.disabled);await act(async()=>b.props.onClick());}
 await act(async()=>button('Continuă').props.onClick());
}
await act(async()=>renderer.root.findByType('textarea').props.onChange({target:{value:'Jeg heter Anna.'}}));
await act(async()=>renderer.unmount());await act(async()=>{renderer=mount();});assert.equal(renderer.root.findByType('textarea').props.value,'Jeg heter Anna.');
await act(async()=>button('Continuă').props.onClick());await act(async()=>renderer.root.findByType('textarea').props.onChange({target:{value:'Takk!'}}));await act(async()=>button('Vezi rezultatul').props.onClick());
assert.equal(renderer.root.findByProps({className:'st-score'}).children.join(''),'6 din 6 răspunsuri corecte');assert.equal(savedReviews.length,0);assert.ok(JSON.stringify(renderer.toJSON()).includes('Autoevaluare'));
await act(async()=>renderer.unmount());
const stateKey=[...storage.keys()][0];const saved=JSON.parse(storage.get(stateKey));saved.stage='practical';saved.index=1;saved.answers[test.questions[0].id]=(test.questions[0].answer+1)%test.questions[0].options.length;storage.set(stateKey,JSON.stringify(saved));
await act(async()=>{renderer=mount();});await act(async()=>button('Vezi rezultatul').props.onClick());assert.equal(savedReviews.length,1);assert.equal(savedReviews[0].lessonId,test.questions[0].lessonId);
await act(async()=>button('Revezi greșeala').props.onClick());assert.ok(JSON.stringify(renderer.toJSON()).includes('Răspuns corect'));
await act(async()=>button('Înapoi la rezultat').props.onClick());assert.equal(renderer.root.findByProps({className:'st-score'}).children.join(''),'5 din 6 răspunsuri corecte');
await act(async()=>renderer.unmount());console.log(`PASS: ${sections} sections, all exercise types, perfect scores, full UI flow, local resume and separate practical self-assessment.`);
