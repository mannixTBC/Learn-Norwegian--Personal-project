import React,{useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import NorwegianFlagIcon from '../../layout/Navbar/NorwegianFlagIcon';
import MobileAppNav from '../../layout/MobileAppNav';
import {ExerciseLevelSelect} from '../ExerciseUI';
import {speakNorwegian} from '../../../services/norwegianSpeech';
import {recordStudyActivity} from '../../../services/learningActivity';
import {createNotebookRound,readNotebookMemory,readNotebookLearning,saveNotebookRound,tenseLabels,personForm} from './verbNotebookData';
import './VerbNotebook.css';
const shortTense=tense=>tense==='past'?'Trecut':tenseLabels[tense];
const storage=()=>{try{return window.localStorage;}catch{return null;}};
const persons=['jeg','du','han','hun','vi','dere','de'];
function SoundIcon(){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m11 5-5 4H3v6h3l5 4V5ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/></svg>;}
export default function VerbNotebook({level,userId,requested}){
 const nextRound=previous=>createNotebookRound(level,readNotebookMemory(storage(),userId,level),previous,Math.random,readNotebookLearning(userId,level),previous?null:requested);
 const [round,setRound]=useState(()=>nextRound(null));
 const [stage,setStage]=useState('learn'),[index,setIndex]=useState(0),[selected,setSelected]=useState(null),[checked,setChecked]=useState(false),[answers,setAnswers]=useState([]),[hint,setHint]=useState(false),[helped,setHelped]=useState(false),[audioError,setAudioError]=useState(''),[playing,setPlaying]=useState(null),[saveError,setSaveError]=useState('');
 const audio=useRef(null),lock=useRef(false),saved=useRef(false),heading=useRef(null),started=useRef(Date.now());
 const {verb,tenses}=round,q=round.questions[index],correct=selected===q.answer,total=round.questions.length;
 const displayVerb=verb.id==='høre på musikk'?{...verb,infinitive:'å høre',translation:'a auzi',forms:Object.fromEntries(Object.entries(verb.forms).map(([tense,form])=>[tense,form.replace(/ på musikk$/u,'')]))}:verb;
 const comparisonPersons=verb.impersonal?['det']:persons;
 useEffect(()=>{audio.current?.abort();setPlaying(null);setAudioError('');heading.current?.focus({preventScroll:true});window.scrollTo(0,0);return()=>audio.current?.abort();},[stage,index,verb.id]);
 useEffect(()=>{
  if(stage!=='result'||saved.current)return;
  saved.current=true;let failed=false;
  try{saveNotebookRound(storage(),userId,level,round,answers);}catch{failed=true;}
  try{recordStudyActivity({type:'verbs',level,userId,verb:verb.id,tenses,minutes:Math.max(1,Math.round((Date.now()-started.current)/60000)),words:1,score:Math.round(answers.filter(a=>a.correct).length/total*100)});}catch{failed=true;}
  if(failed)setSaveError('Progresul nu a putut fi salvat pe acest dispozitiv.');
 },[stage,answers,round,userId,level,verb.id,tenses,total]);
 const listen=async(tense)=>{
  audio.current?.abort();const controller=new AbortController();audio.current=controller;setPlaying(tense);setAudioError('');
  const question=round.questions.find(item=>item.tense===tense);
  try{const result=await speakNorwegian(question.sentence.replace('___',question.answer),{signal:controller.signal,waitForEnd:true});if(!controller.signal.aborted&&!result.ok)setAudioError('Sunetul nu a putut fi redat. Încearcă din nou.');}catch{if(!controller.signal.aborted)setAudioError('Sunetul nu a putut fi redat. Încearcă din nou.');}finally{if(!controller.signal.aborted)setPlaying(null);}
 };
 const verify=()=>{if(selected===null||checked||lock.current)return;lock.current=true;setChecked(true);setHint(false);setAnswers(old=>[...old,{tense:q.tense,correct:selected===q.answer,helped}]);};
 const advance=()=>{if(!checked||!lock.current)return;lock.current=false;if(index===total-1){setStage('result');return;}setIndex(i=>i+1);setSelected(null);setChecked(false);setHint(false);setHelped(false);};
 const another=()=>{setRound(nextRound(verb.id));setStage('learn');setIndex(0);setSelected(null);setChecked(false);setAnswers([]);setHint(false);setHelped(false);setSaveError('');lock.current=false;saved.current=false;started.current=Date.now();};
 return <section className="exercise-screen verb-notebook" data-stage={stage}>
  <header className="vn-header"><Link className="vn-back" to={'/recapitulare-azi?nivel='+level} aria-label="Înapoi la recapitulare">‹</Link><Link className="vn-brand" to="/dashboard" aria-label="NordLingo - Acasă"><NorwegianFlagIcon/></Link><ExerciseLevelSelect level={level}/></header>
  {(stage==='exercise'||stage==='result')&&<>
  <div className="vn-step"><span>{stage==='learn'?'1 · Învață':stage==='exercise'?'2 · Exersează':'Rundă încheiată'}</span>{stage==='exercise'&&<><progress aria-label="Progres" value={index+1} max={total}/><span>{index+1} / {total}</span></>}</div>
  <header className="vn-title"><div><h1 ref={heading} tabIndex={-1}>{stage==='result'?'Bravo, ai exersat!':verb.infinitive}</h1><p>{stage==='result'?verb.infinitive+' · '+verb.translation:verb.translation}</p></div></header>
  <span className="vn-tense">{stage==='exercise'?tenseLabels[q.tense]:stage==='result'?'3 forme exersate':'Compară 3 forme'}</span>
  </>}
  {audioError&&<p role="alert" className="vn-error">{audioError}</p>}
  {stage==='learn'?<>
   <article className="vn-paper vn-comparison">
    <header className="vn-title vn-comparison-title"><div><h1 ref={heading} tabIndex={-1} lang="nb">{displayVerb.infinitive}</h1><p>{displayVerb.translation}</p></div><button className="vn-sound" aria-label={'Asculta exemplul: '+tenseLabels[tenses[0]]} aria-busy={playing===tenses[0]} onClick={()=>listen(tenses[0])}><SoundIcon/></button></header>
    <table className="vn-conjugation vn-comparison-table" aria-label="Conjugare la trei timpuri">
     <colgroup><col className="vn-person-column"/>{tenses.map(tense=><col key={tense}/>)}</colgroup>
     <thead><tr><th scope="col">Persoană</th>{tenses.map(tense=><th scope="col" key={tense} data-tense={tense}>{shortTense(tense)}</th>)}</tr></thead>
     <tbody>{comparisonPersons.map(person=><tr key={person}><th scope="row" lang="nb">{person}</th>{tenses.map(tense=><td key={tense} lang="nb">{personForm(displayVerb,tense,person)}</td>)}</tr>)}</tbody>
    </table>
   </article>
   <button className="vn-primary" onClick={()=>setStage('rules')}>Vezi regulile</button>
  </>:stage==='rules'?<>
   <article className="vn-paper vn-rules-page">
    <header className="vn-title vn-rules-title"><div><h1 ref={heading} tabIndex={-1} lang="nb">{displayVerb.infinitive}</h1><p>{displayVerb.translation}</p></div></header>
    <h2 className="vn-rules-heading">Reguli</h2>
    <div className="vn-rule-sections">{tenses.map(tense=><section className="vn-rule-section" key={tense} data-tense={tense}>
     <h3>{shortTense(tense)}</h3>
     <p className="vn-rule-form" lang="nb">{['present','past'].includes(tense)?displayVerb.infinitive.replace(/^å /u,'')+' → ':''}{displayVerb.forms[tense]}</p>
     <p>{verb.rules[tense]}</p>
    </section>)}</div>
    <p className="vn-person-note">{verb.reflexive?'Pronumele reflexiv se schimbă: meg, deg, seg, oss, dere, seg.':verb.impersonal?'Expresie folosită cu subiectul impersonal det.':'Aceeași formă pentru toate persoanele.'}</p>

   </article>
   <button className="vn-primary" onClick={()=>setStage('exercise')}>La exerciții <span aria-hidden="true">→</span></button>
   <button className="vn-return" onClick={()=>setStage('learn')}>Înapoi la conjugare</button>
  </>:stage==='exercise'?<>
   <article className="vn-paper vn-exercise">
    <p className="vn-instruction">Completează la {tenseLabels[q.tense].toLocaleLowerCase('ro')}. {q.context}</p>
    <h2 className="vn-sentence" lang="nb">{q.sentence.replace('___',checked?q.answer:'___')}</h2>
    <p className="vn-translation">{q.translation||'Sensul verbului: '+q.meaning}</p>
    <div className="vn-options" role="group" aria-label="Alege forma corectă">{q.options.map(option=><button key={option} lang="nb" aria-pressed={selected===option} disabled={checked} className={checked?(option===q.answer?'is-correct':option===selected?'is-wrong':''):selected===option?'is-selected':''} onClick={()=>setSelected(option)}>{option}</button>)}</div>
    {!checked&&<button className="vn-hint" aria-expanded={hint} onClick={()=>{setHint(!hint);setHelped(true);}}>Vezi regula</button>}
    {hint&&!checked&&<div className="vn-rule"><p>{verb.rules[q.tense]}</p></div>}
    {checked&&<div className={'vn-feedback '+(correct?'is-correct':'is-wrong')} role="status"><strong>{correct?(helped?'Corect, cu ajutor!':'Corect!'):'Forma cerută: '+q.answer}</strong><p>{q.answer} — {tenseLabels[q.tense].toLocaleLowerCase('ro')}.</p>{(!correct||helped)&&<small>Vom readuce această combinație la repetare.</small>}</div>}
   </article>
   <button className="vn-primary" disabled={!checked&&selected===null} onClick={checked?advance:verify}>{checked?(index===total-1?'Vezi rezultatul':'Continuă'):'Verifică'}</button>
  </>:<>
   <article className="vn-paper vn-result"><h2>{answers.filter(a=>a.correct).length} / {total} răspunsuri corecte</h2><p>{answers.some(a=>!a.correct||a.helped)?'Continuă să exersezi. Formele dificile vor reveni pentru consolidare.':'Ai comparat și folosit corect trei forme ale verbului.'}</p><ol>{round.questions.map((question,i)=><li key={question.tense}><span className={answers[i]?.correct?'vn-ok':'vn-again'}>{answers[i]?.correct?'✓':'↻'}</span><div><small>{tenseLabels[question.tense]}</small><strong lang="nb">{question.sentence.replace('___',question.answer)}</strong>{question.translation&&<p>{question.translation}</p>}{answers[i]?.helped&&<small>Cu ajutorul regulii</small>}</div></li>)}</ol></article>
   {saveError&&<p role="alert" className="vn-error">{saveError}</p>}
   <button className="vn-primary" onClick={another}>Exersează alt verb</button><Link className="vn-finish" to={'/recapitulare-azi?nivel='+level}>Înapoi la recapitulare</Link>
  </>}
  <MobileAppNav activeLevel={level} activeSection="games"/>
 </section>;
}
