import React, {useState,useEffect,useRef} from 'react';
import {Link,useLocation,useHistory} from 'react-router-dom';
import {getLearningLevel} from './learningLevel';
import {courseCatalog} from './norwegian-program/lessonContent';
import {ExerciseLevelSelect} from '../exercises/ExerciseUI';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import MobileAppNav from '../layout/MobileAppNav';
import './RecapHub.css';
import {speakNorwegian} from '../../services/norwegianSpeech';
const choices=[
 {id:'lessons',title:'Sumar lecții',description:'Ideile esențiale din lecțiile tale.',path:'/sumar-lectii'},
 {id:'verbs',title:'Verbe',description:'Repetă formele și folosirea verbelor.',path:'/challenge30'},
 {id:'grammar',title:'Gramatică',description:'Reguli și structuri ale limbii norvegiene.',path:'/gramatica'},
];
function RecapHeader({level,summary=false,grammar=false}){
 return <><header className="recap-top"><Link className="recap-back" to={((summary||grammar)?'/recapitulare-azi':'/jocuri')+'?nivel='+level} aria-label={(summary||grammar)?'Înapoi la recapitulare':'Înapoi la practică'}>‹</Link><Link className="recap-logo" to="/dashboard" aria-label="NordLingo - Acasă"><NorwegianFlagIcon/></Link><ExerciseLevelSelect level={level}/></header></>;
}
export default function RecapHub(){
 const {search}=useLocation(),level=getLearningLevel(search);
 return <section className="exercise-screen recap-page recap-hub"><RecapHeader level={level}/><div className="recap-choices">{choices.map((choice,i)=><Link className="recap-choice" key={choice.id} to={choice.path+'?nivel='+level} aria-labelledby={'recap-'+choice.id}><svg className="recap-art" viewBox={`${i*724} 0 724 724`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><image href="/images/recap/cards.png" width="2172" height="724"/></svg><div className="recap-choice-copy"><h2 id={'recap-'+choice.id}>{choice.title}</h2><p>{choice.description}</p></div></Link>)}</div><MobileAppNav activeLevel={level} activeSection="games"/></section>;
}
function SoundIcon(){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m11 5-5 4H3v6h3l5 4V5ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/></svg>;}
function SummaryContent({level}){
 const {search}=useLocation(),history=useHistory();
 const lessons=courseCatalog[level]?.lessons||[];
 const selected=new URLSearchParams(search).get('lectie');
 const index=Math.max(0,lessons.findIndex(item=>String(item.id)===selected));
 const lesson=lessons[index];
 const audio=useRef(null),[playing,setPlaying]=useState(null),[error,setError]=useState('');
 useEffect(()=>{setPlaying(null);setError('');return()=>audio.current?.abort();},[level,lesson?.id]);
 const listen=async(text,i)=>{audio.current?.abort();const controller=new AbortController();audio.current=controller;setPlaying(i);setError('');try{const result=await speakNorwegian(text,{signal:controller.signal,waitForEnd:true});if(!controller.signal.aborted&&!result.ok)setError('Sunetul nu a putut fi redat. Încearcă din nou.');}catch{if(!controller.signal.aborted)setError('Sunetul nu a putut fi redat. Încearcă din nou.');}finally{if(!controller.signal.aborted)setPlaying(null);}};
 const navigate=i=>{audio.current?.abort();history.replace('/sumar-lectii?nivel='+level+'&lectie='+lessons[i].id);};
 if(!lesson)return <p role="status">Nu sunt lecții pentru acest nivel.</p>;
 return <><article className="summary-notebook"><header className="summary-lesson-nav">{index>0&&<button className="summary-arrow" aria-label="Lecția anterioară" onClick={()=>navigate(index-1)}>‹</button>}<div><span>Lecția {lesson.id}</span><h1>{lesson.title}</h1></div>{index<lessons.length-1&&<button className="summary-arrow" aria-label="Lecția următoare" onClick={()=>navigate(index+1)}>›</button>}</header><h2>Expresii utile</h2><ol className="summary-expressions">{(lesson.vocabulary||[]).slice(0,4).map(([norwegian,translation],i)=><li key={i}><span className="summary-number">{String(i+1).padStart(2,'0')}</span><div><strong lang="nb">{norwegian}</strong><p>{translation}</p></div><button className="summary-sound" aria-label={'Ascultă: '+norwegian} aria-busy={playing===i} onClick={()=>listen(norwegian,i)}><SoundIcon/></button></li>)}</ol>{error&&<p role="alert" className="summary-audio-error">{error}</p>}</article><div className="summary-actions"><Link className="summary-grammar" to={'/gramatica?nivel='+level+'&lectie='+lesson.id}>Gramatică</Link><Link className="summary-restart" to={'/curs/'+level.toLowerCase()+'/'+lesson.id}>Reia lecția</Link></div></>;
}
export function LessonSummary(){const {search}=useLocation(),level=getLearningLevel(search);return <section className="exercise-screen recap-page recap-summary"><RecapHeader level={level} summary/><SummaryContent key={level} level={level}/><MobileAppNav activeLevel={level} activeSection="games"/></section>;}
export function GrammarPage(){
 const {search}=useLocation(),level=getLearningLevel(search),id=new URLSearchParams(search).get('lectie');
 const lesson=courseCatalog[level]?.lessons.find(item=>String(item.id)===id);
 return <section className="exercise-screen recap-page recap-grammar"><RecapHeader level={level} grammar/><div className="recap-heading"><h1>Gramatică</h1>{lesson&&<p>Lecția {lesson.id} · {lesson.title}</p>}</div><article className="recap-lesson">{lesson?<><h2>{lesson.grammar?.title||'Regula lecției'}</h2><p>{lesson.grammar?.rule||'Această lecție nu are o regulă de gramatică separată.'}</p></>:<p>Pregătim această pagină. Exercițiile de gramatică vor apărea aici.</p>}</article>{lesson&&<Link className="recap-review-link" to={'/sumar-lectii?nivel='+level+'&lectie='+lesson.id}>Înapoi la sumarul lecției</Link>}<MobileAppNav activeLevel={level} activeSection="games"/></section>;
}
