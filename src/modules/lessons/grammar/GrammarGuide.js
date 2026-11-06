import {ui} from '../../../languages/messages.js';
import {courseLocalStorage as localStorage} from '../../../languages/storage.js';
import React,{useEffect,useState} from 'react';
import {Link,useHistory,useLocation} from 'react-router-dom';
import {useAuth} from '../../auth/AuthContext';
import {norwegianGrammar} from '../../../content/features/grammar.js';
import {norwegianRuleGuides} from '../../../content/features/ruleGuides.js';
import {basicGuides} from '../../../content/features/basicGuides.js';
import {makeGrammarSession,grammarSessionReducer,grammarResult,persistGrammarResult} from './practice';
import './GrammarGuide.css';
const categories={...norwegianGrammar.categories,...basicGuides,...Object.fromEntries(Object.entries(norwegianRuleGuides.guides).map(([id,guide])=>[id,{...guide,chapters:guide.rules}]))};
export const grammarLinks=Object.values(categories).map(c=>({id:c.id,title:c.title,path:'/gramatica',description:c.chapters[0].subtitle,art:0}));
function Blocks({blocks=[]}){return blocks.map((b,i)=><section key={i} className="grammar-block">
  {b.title&&<h3>{b.title}</h3>}
  {b.kind==='picture'&&<img className="grammar-picture" src={b.src} alt={b.alt}/>}
  {b.kind==='table'&&<div className="grammar-table-wrap"><table>{b.columns&&<thead><tr>{b.columns.map((c,j)=><th key={j}>{c}</th>)}</tr></thead>}<tbody>{b.rows.map((row,r)=><tr key={r}>{row.map((c,j)=><td key={j} className={c.tone||''}>{c.text}</td>)}</tr>)}</tbody></table></div>}
  {b.kind==='sentences'&&b.examples.map((e,j)=><p key={j}><strong lang="nb">{e.text}</strong>{e.translation&&<small>{e.translation}</small>}</p>)}
  {b.kind==='roles'&&b.examples.map((e,j)=><div key={j}><div className="grammar-tokens">{e.tokens.map((t,k)=><span key={k} className={t.tone||''}><strong lang="nb">{t.text}</strong><small>{t.label}</small></span>)}</div><p>{e.translation}</p></div>)}
  {b.kind==='agreement'&&b.rows.map((r,j)=><p key={j}><small>{r.label}</small><strong lang="nb">{r.article} <mark>{r.adjective}</mark> {r.noun}</strong></p>)}
</section>);}
function Chapter({chapter,category,level,user}){
 const [mode,setMode]=useState(0),[session,setSession]=useState(null),[saved,setSaved]=useState(false),[error,setError]=useState('');
 const currentMode=chapter.modes?.[mode];
 const save=()=>{try{persistGrammarResult(localStorage,{owner:user?.id||'guest',language:'nb',category,chapter:chapter.id},session,Date.now());setSaved(true);setError('');}catch{setError(ui('ui_2f7ff1b54fa100ff'));}};
 useEffect(()=>{if(session?.phase==='complete')save();},[session?.phase]);
 if(session){const q=session.questions[session.index];return <article className="grammar-paper">
  <button onClick={()=>setSession(null)}>{ui('web_16d564b8c4af29da')}</button>
  {session.phase==='complete'?<><h2>{ui('web_03b722f69910e5f7')}</h2><p>{grammarResult(session).correct}{ui('ui_dbd8b6478643d623')}{session.questions.length}{ui('ui_9872b8021dcbf076')}</p><p role="status">{saved?'Rezultatul este salvat pe acest dispozitiv.':error}</p>{error&&<button onClick={save}>{ui('ui_00f43e1030978b17')}</button>}<button onClick={()=>{setSaved(false);setSession(makeGrammarSession(chapter,crypto.randomUUID()));}}>{ui('web_d938c309b2417c48')}</button></>:<>
   <p>{session.index+1}{ui('ui_dbd8b6478643d623')}{session.questions.length}</p>{q.image&&<img className="grammar-picture" src={q.image} alt={q.translation}/>}<h2 lang="nb">{q.sentence}</h2><p>{q.translation}</p>
   <div className="grammar-options">{q.options.map(option=><button key={option} aria-pressed={session.choice===option} disabled={session.choice!==null} onClick={()=>setSession(s=>grammarSessionReducer(s,{type:'answer',answer:option}))}>{option}</button>)}</div>
   {session.choice!==null&&<div role="status"><strong>{session.choice===q.answer?'Corect.':`Răspuns: ${q.answer}`}</strong><p>{q.explanation}</p><button onClick={()=>setSession(s=>grammarSessionReducer(s,{type:'next'}))}>{ui('ui_5fc4497d148a38a8')}</button></div>}
  </>}
 </article>;}
 return <article className="grammar-paper"><small>{chapter.level||level}</small><h1>{chapter.title}</h1><p>{chapter.subtitle}</p>
  {chapter.modes&&<div className="grammar-tabs">{chapter.modes.map((m,i)=><button key={m.id} aria-pressed={i===mode} onClick={()=>setMode(i)}>{m.label}</button>)}</div>}
  {currentMode?.examples.map((e,i)=><section className="grammar-block" key={i}><h3>{e.caption}</h3><div className="grammar-tokens">{e.tokens.map((t,j)=><span key={j} className={t.tone||''}><strong lang="nb">{t.text}</strong><small>{t.label}</small></span>)}</div><p>{e.translation}</p></section>)}
  <Blocks blocks={chapter.blocks}/><p className="grammar-reminder">{currentMode?.reminder||chapter.reminder}</p>
  <button className="grammar-primary" onClick={()=>setSession(makeGrammarSession(chapter,crypto.randomUUID()))}>{ui('web_138cf528302cc667')}</button>
 </article>;
}
export default function GrammarGuide({level}){
 const {search}=useLocation(),history=useHistory(),{user}=useAuth();
 const query=new URLSearchParams(search),category=categories[query.get('capitol')];
 if(!category)return <p>{ui('web_c7bcdd942bc5bb4e')}<Link to={'/gramatica?nivel='+level}>{ui('web_f5267fd53f929386')}</Link>.</p>;
 const index=Math.max(0,category.chapters.findIndex(c=>c.id===(query.get('regula')||category.initialChapter)));
 const chapter=category.chapters[index];
 const choose=id=>history.replace(`/gramatica?nivel=${level}&capitol=${category.id}&regula=${id}`);
 return <section className="exercise-screen recap-page grammar-guide">
  <header className="grammar-heading"><Link to={'/gramatica?nivel='+level}>{ui('web_261f759bddb2639d')}</Link><span>{category.title}</span></header>
  <label className="grammar-picker">{ui('ui_e7807b5d087f1c98')}<select value={chapter.id} onChange={e=>choose(e.target.value)}>{category.chapters.map(c=><option key={c.id} value={c.id}>{c.tab||c.title}</option>)}</select></label>
  <Chapter key={`${user?.id||'guest'}:${category.id}:${chapter.id}`} {...{chapter,level,user}} category={category.id}/>
  <nav className="grammar-pager" aria-label={ui('web_341d3d1efcae841b')}><button disabled={index===0} onClick={()=>choose(category.chapters[index-1].id)}>{ui('web_a354f4064be3dfef')}</button><span>{index+1} / {category.chapters.length}</span><button disabled={index===category.chapters.length-1} onClick={()=>choose(category.chapters[index+1].id)}>{ui('web_42faca2e4e4f76ad')}</button></nav>
 </section>;
}
