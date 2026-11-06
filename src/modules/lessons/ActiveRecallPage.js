import React,{useMemo,useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext';
import {courseCatalog} from './norwegian-program/lessonContent';
import {getLearningLevel} from './learningLevel';
import {ExerciseLevelSelect} from '../exercises/ExerciseUI';
import {saveReviewItem} from '../../services/spacedReview';
import './grammar/GrammarGuide.css';
import './RecapHub.css';
import {buildActiveRecall,normalizeRecall,checkRecallOrder,checkRecallResponse,createRecallRecorder,recallReviewItem} from './activeRecall';
const stages=['expression','rule','order','response'],labels=['Expresie','Regulă','Propoziție','Răspuns liber'];
function Session({lesson,level}){
 const plan=useMemo(()=>buildActiveRecall(lesson),[lesson]);
 const record=useMemo(()=>createRecallRecorder(saveReviewItem),[lesson,level]);
 const [step,setStep]=useState(0),[input,setInput]=useState(''),[choice,setChoice]=useState(null),[selected,setSelected]=useState([]),[checked,setChecked]=useState(false),[feedback,setFeedback]=useState(''),[error,setError]=useState('');
 const words=useMemo(()=>{const result=[...(plan.order.words||plan.order.answerText.split(/\s+/))];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;},[plan]);
 function mistake(){try{record(recallReviewItem(lesson,level,plan,stages[step]));setError('');return true;}catch{setError('Nu am putut salva exercițiul pentru repetare. Încearcă din nou.');return false;}}
 function verify(){
  if(checked)return;
  const correct=step===0?normalizeRecall(input)===normalizeRecall(plan.expression.answer):step===1?choice===plan.rule.answer:step===2?checkRecallOrder(plan,selected.map(i=>words[i])):checkRecallResponse(plan,input);
  if(step===3){setFeedback(correct==='matched'?'Răspunsul tău corespunde modelului.':'Compară sensul răspunsului tău cu modelul. O formulare diferită poate fi corectă.');}
  else {if(!correct&&!mistake())return;setFeedback(correct?'Corect.':'Compară cu răspunsul de mai jos și încearcă să îl reții.');}
  setChecked(true);
 }
 const next=()=>{setStep(s=>s+1);setInput('');setChoice(null);setSelected([]);setChecked(false);setFeedback('');};
 if(step===4)return <article className="grammar-paper"><h1>Recapitulare încheiată</h1><p>Ai exersat expresia, regula, ordinea cuvintelor și un răspuns propriu.</p><Link to={`/sumar-lectii?nivel=${level}&lectie=${lesson.id}`}>Vezi fișa lecției →</Link></article>;
 return <div className="active-recall-workspace"><aside><h2>{lesson.title}</h2><ol>{labels.map((label,i)=><li key={label} aria-current={i===step?'step':undefined}>{i<step?'✓ ':''}{label}</li>)}</ol><p>Încearcă întâi. Consultă modelul după răspuns.</p></aside><article className="grammar-paper"><small>Pasul {step+1} din 4</small><h1>{labels[step]}</h1>
  {step===0&&<><p>Cum spui în norvegiană: „{plan.expression.prompt}”?</p><textarea aria-label="Expresia în norvegiană" value={input} onChange={e=>setInput(e.target.value)} disabled={checked} maxLength={1200}/></>}
  {step===1&&<><h2>{plan.rule.title}</h2><p>{plan.rule.prompt}</p><div className="grammar-options">{plan.rule.options.map((option,i)=><button key={i} disabled={checked} aria-pressed={choice===i} onClick={()=>setChoice(i)}>{option}</button>)}</div></>}
  {step===2&&<><p>{plan.order.prompt}</p><div className="recall-wordbank" aria-label="Propoziția ta">{selected.map((index,i)=><button disabled={checked} key={index} onClick={()=>setSelected(s=>s.filter((_,j)=>j!==i))}>{words[index]}</button>)}</div><div className="recall-wordbank" aria-label="Cuvinte disponibile">{words.map((word,i)=><button key={i} disabled={checked||selected.includes(i)} onClick={()=>setSelected(s=>[...s,i])}>{word}</button>)}</div></>}
  {step===3&&<><p>{plan.response.task}</p><p lang="nb">{plan.response.question}</p><textarea aria-label="Răspunsul în norvegiană" value={input} onChange={e=>setInput(e.target.value)} disabled={checked} maxLength={1200}/></>}
  {checked?<div role="status"><p>{feedback}</p><strong lang="nb">{step===0?plan.expression.answer:step===1?plan.rule.completion:step===2?plan.order.answerText:plan.response.model}</strong>{step===1&&<p>{plan.rule.explanation}</p>}{step===3&&<button onClick={()=>{if(mistake())setFeedback('Răspunsul a fost adăugat la exercițiile de repetat.');}}>Vreau să mai repet</button>}<button className="grammar-primary" onClick={next}>Continuă</button></div>:<button className="grammar-primary" disabled={step===1?choice===null:step===2?selected.length!==words.length:!input.trim()} onClick={verify}>Verifică</button>}
  {error&&<p role="alert">{error}</p>}
 </article></div>;
}
export default function ActiveRecall(){
 const {search}=useLocation(),level=getLearningLevel(search),{user}=useAuth();
 const lessons=courseCatalog[level].lessons,lesson=lessons.find(l=>String(l.id)===new URLSearchParams(search).get('lectie'));
 return <section className="exercise-screen recap-page active-recall grammar-guide"><header className="grammar-heading"><Link to={'/jocuri?nivel='+level}>← Practică</Link><ExerciseLevelSelect level={level}/></header>{lesson?<Session key={`${user?.id}:${level}:${lesson.id}`} {...{lesson,level}}/>:<><h1>Recapitulare activă</h1><p>Alege lecția și aplică ceea ce ai învățat în patru pași.</p><div className="grammar-menu">{lessons.map(l=><Link key={l.id} to={`/recapitulare-activa?nivel=${level}&lectie=${l.id}`}><strong>{l.id}. {l.title}</strong><small>Expresii · Regulă · Propoziții · Răspuns liber</small></Link>)}</div></>}</section>;
}
