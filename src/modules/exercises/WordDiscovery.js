import {getContent} from '../../content/activeContent';
import {ui} from '../../languages/messages.js';
import React,{useEffect,useReducer,useRef} from 'react';
import {Link} from 'react-router-dom';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import {initialGuessing,spellingLetters,guessingReducer} from '../../content/features/spelling.js';
import './WordSpelling.css';
function Header({level}){return <header className="ws-header"><Link to={'/jocuri?nivel='+level} aria-label={ui('ui_18c234c09d63bb77')}>‹</Link><Link to="/dashboard" aria-label={ui('web_c5ac94a4335cbea9')}><NorwegianFlagIcon className="ws-logo"/></Link><span className="ws-level">{level}</span></header>;}
export default function WordDiscovery({question,current,total,level,checked,onResolve,onNext,onSpeak}){
 const rows=getContent('keyboardRows');
 const [state,dispatch]=useReducer(guessingReducer,undefined,initialGuessing);
 const sent=useRef(false);
 const send=(type,letter)=>{if(checked)return;dispatch({type,letter,answer:question.answer});};
 const helped=state.revealed.length>0;
 useEffect(()=>{if(!state.done||sent.current)return;sent.current=true;onResolve(state.correct,state.guessed.join(' '),helped);},[state.done]);
 useEffect(()=>{const keydown=event=>{if(event.ctrlKey||event.metaKey||event.altKey||event.target?.closest?.('input,textarea,select'))return;if(/^\p{L}$/u.test(event.key)){event.preventDefault();send('GUESS',event.key);}};window.addEventListener('keydown',keydown);return()=>window.removeEventListener('keydown',keydown);});
 const done=state.done||checked,target=spellingLetters(question.answer);
 let offset=0;const tile=Number.isInteger(question.tile)?question.tile:0;
 return <section className="word-discovery word-spelling" aria-label={ui('ui_a60eba1190b8698d')}>
  <Header level={level}/><div className="ws-progress"><span>{current+1}{ui('ui_dbd8b6478643d623')}{total}</span><progress value={current+1} max={total} aria-label={ui('web_845f7806fcc783e5')}/></div>
  <figure className="ws-photo"><div role="img" aria-label={question.translation||question.prompt} className="ws-photo-image" style={{backgroundImage:`url("${question.image||'/images/word-discovery/home.webp'}")`,backgroundPosition:`${tile%3*50}% ${Math.floor(tile/3)*100/3}%`}}/></figure>
  <div className="ws-answer"><div className="ws-slots" lang="nb" aria-label="Cuvântul tău">{question.answer.normalize('NFC').split(/\s+/u).map((word,wordIndex)=><span className="ws-word" key={wordIndex}>{Array.from(word).map((char,index)=>{if(!/\p{L}/u.test(char))return <span key={index}>{char}</span>;const position=offset++,letter=done||state.guessed.includes(target[position])?target[position]:'';return <span className={'ws-slot'+(!letter?' is-hidden':'')+(state.revealed.includes(target[position])?' is-hint':'')} key={index} aria-label={letter||'Literă necompletată'}>{letter||'\u00a0'}</span>;})}</span>)}</div><p>{done?state.correct?helped?ui('ui_0858815f3cc92b63'):ui('ui_c67c57e65d9ce569'):ui('ui_dea7a5d039a2ee61'):ui('ui_22d8e1bc73c7f5aa')}</p></div>
  {!done?<button type="button" className="ws-hint" disabled={done} onClick={()=>send('HINT')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M9 18h6m-5 3h4M9 18c0-5-4-5-4-10a7 7 0 0 1 14 0c0 5-4 5-4 10Z"/></svg>{ui('web_ea73f2bc3bc63d7a')}</button>:<div className="ws-feedback" role="status"><button type="button" onClick={onSpeak}>{ui('ui_10ef3aea8a2cd47b')}</button>{(!state.correct||helped)&&<small>{ui('ui_f2926daeef3d251f')}</small>}</div>}
  <div className="ws-keyboard" role="group" aria-label={ui('web_c19668830ac03f13')}>{rows.map(row=><div className="ws-key-row" key={row}>{Array.from(row).map(letter=><button type="button" aria-label={letter} key={letter} disabled={done||state.guessed.includes(letter)} className={state.guessed.includes(letter)?target.includes(letter)?'is-found':'is-missed':''} onClick={()=>send('GUESS',letter)}>{letter}</button>)}</div>)}</div>
  <footer className="ws-footer">{done?<button type="button" onClick={onNext}>{current===total-1?ui('ui_1834cd8f7b513ef9'):ui('ui_5fc4497d148a38a8')}</button>:<small role="status">{3-state.wrong} {3-state.wrong===1?ui('ui_8ac4859ccd6f5f96'):ui('ui_48e2263df9e52f32')}</small>}</footer>
 </section>;
}
export function WordDiscoveryResult({level,score,results,onRestart,onRetry}){
 const review=results.filter(item=>!item.correct||item.helped);
 return <section className="word-discovery word-spelling ws-results"><Header level={level}/><h1 className="ws-title">{ui('ui_f565f52a394e5205')}</h1><article className="ws-result"><h2>{score}{ui('ui_dbd8b6478643d623')}{results.length}</h2><p>{ui('web_725b546ebcee648b')}</p><div>{results.map(item=><p key={item.question.id}><strong lang="nb">{item.question.answer}</strong><span>{item.correct?item.helped?'Cu ajutor':ui('ui_6c2b431b8fba2553'):ui('ui_352b62f7948b0ff4')}</span></p>)}</div>{review.length>0&&<button type="button" onClick={onRetry}>{ui('web_b07150ba6720f748')}{review.length})</button>}<button type="button" onClick={onRestart}>{ui('ui_3bbd5edf7ea5fe1b')}</button><Link to={'/jocuri?nivel='+level}>{ui('ui_18c234c09d63bb77')}</Link></article></section>;
}
