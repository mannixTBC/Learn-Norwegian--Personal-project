import React, {useEffect,useRef} from 'react';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import {normalizePracticeAnswer} from './practiceGameData';
import './SentenceWorkshop.css';

export default function SentenceWorkshop({level,question,current,total,headingRef,selected,setSelected,orderHint,checked,correct,completeAnswer,onVerify,onNext,onExit,onSpeak}) {
 const feedback=useRef(null);
 const prompt=question.prompt.replace(/^Construiește\s*:?\s*[„“"]?/iu,'').replace(/[”"]\.?$/u,'');
 const unchanged=orderHint && normalizePracticeAnswer(selected.map(index=>question.words[index]).join(' '))===orderHint.response;
 useEffect(()=>{if(checked||orderHint)feedback.current?.focus({preventScroll:true});},[checked,orderHint]);
 return <main className="sentence-workshop" aria-label="Construiește propoziția">
  <header className="sw-header"><button type="button" onClick={onExit} aria-label="Înapoi la practică">‹</button><NorwegianFlagIcon className="sw-logo"/><span className="sw-level">{level}</span></header>
  <div className="sw-progress"><span>{current+1} din {total}</span><progress aria-label="Progresul sesiunii" value={current+1} max={total}/></div>
  <section className="sw-prompt"><small>CONSTRUIEȘTE ÎN NORVEGIANĂ</small><div><h2 ref={headingRef} tabIndex={-1}>{prompt}</h2><img src="/images/practice/notebook.png" alt="" aria-hidden="true"/></div></section>
  <section className="sw-compose" aria-label="Propoziția ta"><div className="sw-label"><span>PROPOZIȚIA TA</span><button type="button" className="sw-reset" aria-label="Reia propoziția" disabled={checked||!selected.length} onClick={()=>setSelected([])}>↺</button></div><div className={'sw-answer'+(checked?correct?' is-correct':' is-wrong':'')}>{selected.map((index,position)=><button type="button" key={index} lang="nb" disabled={checked} className={!checked&&unchanged&&orderHint?.positions.includes(position)?'needs-attention':''} aria-label={`Scoate ${question.words[index]}, poziția ${position+1}`} onClick={()=>setSelected(all=>all.filter((_,i)=>i!==position))}>{question.words[index]}</button>)}{!completeAnswer&&<span className="sw-placeholder" aria-hidden="true"/>}{!selected.length&&<span className="sw-empty">Atinge cuvintele de mai jos</span>}</div></section>
  {!checked&&orderHint&&<aside className="sw-hint" ref={feedback} tabIndex={-1} role="status"><span aria-hidden="true">☼</span><div><h3>Mai încearcă o dată</h3><p>{orderHint.text}</p></div></aside>}
  {!checked?<section className="sw-bank" aria-label="Cuvinte disponibile"><div>{question.words.map((word,index)=><button type="button" key={index} lang="nb" disabled={selected.includes(index)} onClick={()=>setSelected(all=>all.includes(index)?all:[...all,index])}>{word}</button>)}</div></section>:<section className={'sw-feedback'+(correct?' is-correct':' is-wrong')} ref={feedback} tabIndex={-1} role="status"><h3>{correct?orderHint?'Corect, cu un indiciu!':'Foarte bine!':'Iată ordinea corectă'}</h3><p lang="nb">{question.answer}</p><button type="button" onClick={onSpeak}>Ascultă propoziția</button>{question.explanation&&normalizePracticeAnswer(question.explanation)!==normalizePracticeAnswer(question.answer)&&<p className="sw-explanation">{question.explanation}</p>}{(!correct||orderHint)&&<small>O vei revedea la recapitulare.</small>}</section>}
  <footer className="sw-footer"><button type="button" disabled={!checked&&(!completeAnswer||Boolean(unchanged))} onClick={checked?onNext:()=>onVerify()}>{checked?current===total-1?'Vezi rezultatul':'Continuă':orderHint?'Verifică din nou':'Verifică'}</button>{!checked&&<small>{orderHint?'Atinge un cuvânt de sus pentru a-l muta înapoi.':!completeAnswer?'Așază toate cuvintele pentru a verifica.':'Propoziția este gata de verificare.'}</small>}</footer>
 </main>;
}
