import React,{useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import NorwegianFlagIcon from '../../layout/Navbar/NorwegianFlagIcon';
import MobileAppNav from '../../layout/MobileAppNav';
import {ExerciseLevelSelect} from '../ExerciseUI';
import {speakNorwegian} from '../../../services/norwegianSpeech';
import {recordStudyActivity} from '../../../services/learningActivity';
import {createNotebookRound,readNotebookMemory,readNotebookLearning,saveNotebookRound,tenseLabels,personForm} from './verbNotebookData';
import './VerbNotebook.css';
const storage=()=>{try{return window.localStorage;}catch{return null;}};
const persons=['jeg','du','han','hun','den','det','vi','dere','de'];
function SoundIcon(){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m11 5-5 4H3v6h3l5 4V5ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/></svg>;}
export default function VerbNotebook({level,userId}){
 const nextRound=previous=>createNotebookRound(level,readNotebookMemory(storage(),userId,level),previous,Math.random,readNotebookLearning(userId,level));
 const [round,setRound]=useState(()=>nextRound(null));
 const [stage,setStage]=useState('learn'),[index,setIndex]=useState(0),[selected,setSelected]=useState(null),[checked,setChecked]=useState(false),[answers,setAnswers]=useState([]),[hint,setHint]=useState(false),[helped,setHelped]=useState(false),[audioError,setAudioError]=useState(''),[playing,setPlaying]=useState(null),[saveError,setSaveError]=useState('');
 const audio=useRef(null),lock=useRef(false),saved=useRef(false),heading=useRef(null),started=useRef(Date.now());
 const {verb,tenses}=round,q=round.questions[index],correct=selected===q.answer,total=round.questions.length;
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
 return <section className="exercise-screen verb-notebook">
  <header className="vn-header"><Link className="vn-back" to={'/recapitulare-azi?nivel='+level} aria-label="Înapoi la recapitulare">‹</Link><Link className="vn-brand" to="/dashboard" aria-label="NordLingo - Acasă"><NorwegianFlagIcon/></Link><ExerciseLevelSelect level={level}/></header>
  <div className="vn-step"><span>{stage==='learn'?'1 · Învață':stage==='exercise'?'2 · Exersează':'Rundă încheiată'}</span>{stage==='exercise'&&<><progress aria-label="Progres" value={index+1} max={total}/><span>{index+1} / {total}</span></>}</div>
  <header className="vn-title"><div><h1 ref={heading} tabIndex={-1}>{stage==='result'?'Bravo, ai exersat!':verb.infinitive}</h1><p>{stage==='result'?verb.infinitive+' · '+verb.translation:verb.translation}</p></div></header>
  <span className="vn-tense">{stage==='exercise'?tenseLabels[q.tense]:stage==='result'?'3 forme exersate':'Compară 3 forme'}</span>
  {stage==='learn'&&round.source==='lesson'&&<span className="vn-source">Din lecțiile tale</span>}
  {stage==='learn'&&round.source==='review'&&<span className="vn-source">Pentru consolidare</span>}
  {audioError&&<p role="alert" className="vn-error">{audioError}</p>}
  {stage==='learn'?<>
   <div className="vn-comparison">
    {tenses.map(tense=><section className="vn-paper vn-tense-card" key={tense} data-tense={tense}>
     <div className="vn-form-heading"><div><h2>{tenseLabels[tense]}</h2></div><button className="vn-sound" aria-label={'Ascultă exemplul: '+tenseLabels[tense]} aria-busy={playing===tense} onClick={()=>listen(tense)}><SoundIcon/></button></div>
     <div className="vn-persons">{verb.impersonal?<p lang="nb">det {verb.forms[tense]}</p>:<table className="vn-conjugation" aria-label={'Persoanele la '+tenseLabels[tense]}><tbody>{persons.map(person=><tr key={person}><th scope="row" lang="nb">{person}</th><td lang="nb">{personForm(verb,tense,person)}</td></tr>)}</tbody></table>}</div>
     <div className="vn-rule"><h3>Regula</h3><p className="vn-form-rule">{verb.rules[tense]}</p></div>
    </section>)}
    <p className="vn-person-note">{verb.reflexive?'Verbul are aceeași formă; pronumele reflexiv se schimbă: meg, deg, seg, oss, dere, seg.':verb.impersonal?'Această expresie se folosește aici cu subiectul impersonal det.':'Forma verbală rămâne aceeași pentru toate persoanele.'}</p>
   </div>
   <button className="vn-primary" onClick={()=>setStage('exercise')}>Exersează</button>
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
