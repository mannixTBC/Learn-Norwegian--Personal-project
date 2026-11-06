import {ui} from '../../languages/messages.js';
import React, {useEffect,useRef} from 'react';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import {normalizePracticeAnswer} from '../../content/features/games.js';
import './SentenceWorkshop.css';

export default function SentenceWorkshop({level,question,current,total,headingRef,selected,setSelected,orderHint,checked,correct,completeAnswer,onVerify,onNext,onExit,onSpeak}) {
 const feedback=useRef(null);
 const prompt=question.prompt.replace(/^Construiește\s*:?\s*[„“"]?/iu,'').replace(/[”"]\.?$/u,'');
 const unchanged=orderHint && normalizePracticeAnswer(selected.map(index=>question.words[index]).join(' '))===orderHint.response;
 useEffect(()=>{if(checked||orderHint)feedback.current?.focus({preventScroll:true});},[checked,orderHint]);
 return <main className="sentence-workshop" aria-label={ui('web_af7bc1db97be6f46')}>
  <header className="sw-header"><button type="button" onClick={onExit} aria-label={ui('ui_18c234c09d63bb77')}>‹</button><NorwegianFlagIcon className="sw-logo"/><span className="sw-level">{level}</span></header>
  <div className="sw-progress"><span>{current+1}{ui('ui_dbd8b6478643d623')}{total}</span><progress aria-label={ui('web_845f7806fcc783e5')} value={current+1} max={total}/></div>
  <section className="sw-prompt"><small>{ui('ui_daecf28c86764a78')}</small><div><h2 ref={headingRef} tabIndex={-1}>{prompt}</h2><img src="/images/practice/notebook.png" alt="" aria-hidden="true"/></div></section>
  <section className="sw-compose" aria-label={ui('web_c45de7846db3a2d2')}><div className="sw-label"><span>{ui('ui_04764192e1d2a2b9')}</span><button type="button" className="sw-reset" aria-label={ui('ui_ccf213e57e4eb316')} disabled={checked||!selected.length} onClick={()=>setSelected([])}>↺</button></div><div className={'sw-answer'+(checked?correct?' is-correct':' is-wrong':'')}>{selected.map((index,position)=><button type="button" key={index} lang="nb" disabled={checked} className={!checked&&unchanged&&orderHint?.positions.includes(position)?'needs-attention':''} aria-label={`Scoate ${question.words[index]}, poziția ${position+1}`} onClick={()=>setSelected(all=>all.filter((_,i)=>i!==position))}>{question.words[index]}</button>)}{!completeAnswer&&<span className="sw-placeholder" aria-hidden="true"/>}{!selected.length&&<span className="sw-empty">{ui('ui_9a693db8b90806dc')}</span>}</div></section>
  {!checked&&orderHint&&<aside className="sw-hint" ref={feedback} tabIndex={-1} role="status"><span aria-hidden="true">☼</span><div><h3>{ui('ui_9209dc69eca1f3ca')}</h3><p>{orderHint.text}</p></div></aside>}
  {!checked?<section className="sw-bank" aria-label={ui('ui_7f216313f7587489')}><div>{question.words.map((word,index)=><button type="button" key={index} lang="nb" disabled={selected.includes(index)} onClick={()=>setSelected(all=>all.includes(index)?all:[...all,index])}>{word}</button>)}</div></section>:<section className={'sw-feedback'+(correct?' is-correct':' is-wrong')} ref={feedback} tabIndex={-1} role="status"><h3>{correct?orderHint?ui('ui_0be061c2bc5d2443'):ui('ui_73966da3e79b7077'):ui('ui_9a4b90423e0b01bc')}</h3><p lang="nb">{question.answer}</p><button type="button" onClick={onSpeak}>{ui('ui_e5754a2f37259ec8')}</button>{question.explanation&&normalizePracticeAnswer(question.explanation)!==normalizePracticeAnswer(question.answer)&&<p className="sw-explanation">{question.explanation}</p>}{(!correct||orderHint)&&<small>{ui('ui_3873bfc575f18cf2')}</small>}</section>}
  <footer className="sw-footer"><button type="button" disabled={!checked&&(!completeAnswer||Boolean(unchanged))} onClick={checked?onNext:()=>onVerify()}>{checked?current===total-1?ui('ui_1834cd8f7b513ef9'):ui('ui_5fc4497d148a38a8'):orderHint?ui('ui_0e8e5b37b58acef8'):ui('ui_b69a8da1603647a2')}</button>{!checked&&<small>{orderHint?ui('ui_ea6f0a6ca33ebac0'):!completeAnswer?ui('ui_4f4a44085c87da1d'):ui('ui_c130359352f06d45')}</small>}</footer>
 </main>;
}
