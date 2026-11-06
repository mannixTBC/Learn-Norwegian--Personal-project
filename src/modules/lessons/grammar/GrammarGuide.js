import React,{useEffect,useState} from 'react';
import {Link,useHistory,useLocation} from 'react-router-dom';
import {useAuth} from '../../auth/AuthContext';
import {norwegianGrammar} from './nbContent';
import {norwegianRuleGuides} from './ruleGuideContent';
import {basicGuides} from './basicGuides';
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
 const save=()=>{try{persistGrammarResult(localStorage,{owner:user?.id||'guest',language:'nb',category,chapter:chapter.id},session,Date.now());setSaved(true);setError('');}catch{setError('Rezultatul nu a putut fi salvat.');}};
 useEffect(()=>{if(session?.phase==='complete')save();},[session?.phase]);
 if(session){const q=session.questions[session.index];return <article className="grammar-paper">
  <button onClick={()=>setSession(null)}>← Înapoi la regulă</button>
  {session.phase==='complete'?<><h2>Exercițiu încheiat</h2><p>{grammarResult(session).correct} din {session.questions.length} răspunsuri corecte</p><p role="status">{saved?'Rezultatul este salvat pe acest dispozitiv.':error}</p>{error&&<button onClick={save}>Reîncearcă salvarea</button>}<button onClick={()=>{setSaved(false);setSession(makeGrammarSession(chapter,crypto.randomUUID()));}}>Repetă exercițiul</button></>:<>
   <p>{session.index+1} din {session.questions.length}</p>{q.image&&<img className="grammar-picture" src={q.image} alt={q.translation}/>}<h2 lang="nb">{q.sentence}</h2><p>{q.translation}</p>
   <div className="grammar-options">{q.options.map(option=><button key={option} aria-pressed={session.choice===option} disabled={session.choice!==null} onClick={()=>setSession(s=>grammarSessionReducer(s,{type:'answer',answer:option}))}>{option}</button>)}</div>
   {session.choice!==null&&<div role="status"><strong>{session.choice===q.answer?'Corect.':`Răspuns: ${q.answer}`}</strong><p>{q.explanation}</p><button onClick={()=>setSession(s=>grammarSessionReducer(s,{type:'next'}))}>Continuă</button></div>}
  </>}
 </article>;}
 return <article className="grammar-paper"><small>{chapter.level||level}</small><h1>{chapter.title}</h1><p>{chapter.subtitle}</p>
  {chapter.modes&&<div className="grammar-tabs">{chapter.modes.map((m,i)=><button key={m.id} aria-pressed={i===mode} onClick={()=>setMode(i)}>{m.label}</button>)}</div>}
  {currentMode?.examples.map((e,i)=><section className="grammar-block" key={i}><h3>{e.caption}</h3><div className="grammar-tokens">{e.tokens.map((t,j)=><span key={j} className={t.tone||''}><strong lang="nb">{t.text}</strong><small>{t.label}</small></span>)}</div><p>{e.translation}</p></section>)}
  <Blocks blocks={chapter.blocks}/><p className="grammar-reminder">{currentMode?.reminder||chapter.reminder}</p>
  <button className="grammar-primary" onClick={()=>setSession(makeGrammarSession(chapter,crypto.randomUUID()))}>Exersează regula</button>
 </article>;
}
export default function GrammarGuide({level}){
 const {search}=useLocation(),history=useHistory(),{user}=useAuth();
 const query=new URLSearchParams(search),category=categories[query.get('capitol')];
 if(!category)return <p>Alege un capitol din <Link to={'/gramatica?nivel='+level}>ghidul de gramatică</Link>.</p>;
 const index=Math.max(0,category.chapters.findIndex(c=>c.id===(query.get('regula')||category.initialChapter)));
 const chapter=category.chapters[index];
 const choose=id=>history.replace(`/gramatica?nivel=${level}&capitol=${category.id}&regula=${id}`);
 return <section className="exercise-screen recap-page grammar-guide">
  <header className="grammar-heading"><Link to={'/gramatica?nivel='+level}>← Gramatică</Link><span>{category.title}</span></header>
  <label className="grammar-picker">Regula<select value={chapter.id} onChange={e=>choose(e.target.value)}>{category.chapters.map(c=><option key={c.id} value={c.id}>{c.tab||c.title}</option>)}</select></label>
  <Chapter key={`${user?.id||'guest'}:${category.id}:${chapter.id}`} {...{chapter,level,user}} category={category.id}/>
  <nav className="grammar-pager" aria-label="Regulile capitolului"><button disabled={index===0} onClick={()=>choose(category.chapters[index-1].id)}>← Înapoi</button><span>{index+1} / {category.chapters.length}</span><button disabled={index===category.chapters.length-1} onClick={()=>choose(category.chapters[index+1].id)}>Înainte →</button></nav>
 </section>;
}
