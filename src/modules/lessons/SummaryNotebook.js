import {ui} from '../../languages/messages.js';
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Link,useHistory,useLocation} from 'react-router-dom';
import {courseCatalog} from '../../content/activeContent.js';
import {buildLessonSummary} from '../../content/features/summary.js';
import {speakNorwegian} from '../../services/norwegianSpeech';
import './SummaryNotebook.css';
export default function SummaryNotebook({level}){
 const {search}=useLocation(),history=useHistory();
 const lessons=courseCatalog[level]?.lessons||[],id=new URLSearchParams(search).get('lectie');
 const index=Math.max(0,lessons.findIndex(l=>String(l.id)===id)),lesson=lessons[index];
 const summary=useMemo(()=>lesson?buildLessonSummary(lesson):null,[lesson]);
 const controller=useRef(null),[error,setError]=useState(''),[playing,setPlaying]=useState(false);
 useEffect(()=>{setError('');setPlaying(false);return()=>controller.current?.abort();},[level,lesson?.id]);
 const listen=async text=>{controller.current?.abort();const abort=new AbortController();controller.current=abort;setError('');setPlaying(true);try{const result=await speakNorwegian(text,{signal:abort.signal,waitForEnd:true});if(!abort.signal.aborted&&!result.ok)setError('Sunetul nu a putut fi redat.');}catch{if(!abort.signal.aborted)setError('Sunetul nu a putut fi redat.');}finally{if(!abort.signal.aborted)setPlaying(false);}};
 const navigate=i=>history.replace(`/sumar-lectii?nivel=${level}&lectie=${lessons[i].id}`);
 if(!summary)return <p>{ui('web_aa3920a8b3e94006')}</p>;
 return <><article className="summary-notebook summary-complete">
  <header className="summary-lesson-nav"><button className="summary-arrow" disabled={!index} aria-label={ui('web_3e859bc447f5d145')} onClick={()=>navigate(index-1)}>‹</button><div><span>{ui('ui_abf153365567efe1')}{lesson.id} · {level}</span><h1>{lesson.title}</h1></div><button className="summary-arrow" disabled={index===lessons.length-1} aria-label={ui('web_628120ae7c2470fb')} onClick={()=>navigate(index+1)}>›</button></header>
  <p className="summary-objective">{summary.objective}</p>
  <div className="summary-columns"><section><h2>{ui('web_a0f17cbedf66213a')}</h2><dl>{summary.vocabulary.map(([no,ro])=><div key={no}><dt lang="nb">{no}</dt><dd>{ro}</dd></div>)}</dl></section>
  <section><h2>{ui('ui_c411681fd767dbca')}</h2>{summary.expressions.map(([no,ro])=><p key={no}><strong lang="nb">{no}</strong><small>{ro}</small></p>)}</section></div>
  <section className="summary-rule"><h2>{ui('web_3530651c7a570fe1')}</h2><p>{summary.rule}</p><strong lang="nb">{summary.example}</strong></section>
  <section className="summary-dialogue"><h2>{ui('web_8368a08d6176c889')}</h2>{summary.dialogue.map((line,i)=><p key={i}><b>{line.label}:</b> <span lang="nb">{line.text}</span></p>)}<button disabled={playing} onClick={()=>listen(summary.dialogue.map(l=>l.text).join(' '))}>{playing?'Se redă…':ui('web_b0caa2c071f2271c')}</button></section>
  {error&&<p role="alert">{error}</p>}
 </article><div className="summary-actions"><Link className="summary-restart" to={`/recapitulare-activa?nivel=${level}&lectie=${lesson.id}`}>{ui('web_baa6bfa37f2f62df')}</Link><Link className="summary-restart" to={'/curs/'+level.toLowerCase()+'/'+lesson.id}>{ui('web_910bd7ae2303e25e')}</Link></div></>;
}
