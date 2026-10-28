import React,{useEffect,useReducer,useRef} from 'react';
import {Link} from 'react-router-dom';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import {initialGuessing,spellingLetters,guessingReducer} from './wordSpelling';
import './WordSpelling.css';
const rows=['QWERTYUIOP','ASDFGHJKL','ZXCVBNM','ÆØÅ'];
function Header({level}){return <header className="ws-header"><Link to={'/jocuri?nivel='+level} aria-label="Înapoi la practică">‹</Link><Link to="/dashboard" aria-label="NordLingo - Acasă"><NorwegianFlagIcon className="ws-logo"/></Link><span className="ws-level">{level}</span></header>;}
export default function WordDiscovery({question,current,total,level,checked,onResolve,onNext,onSpeak}){
 const [state,dispatch]=useReducer(guessingReducer,undefined,initialGuessing);
 const sent=useRef(false);
 const send=(type,letter)=>{if(checked)return;dispatch({type,letter,answer:question.answer});};
 const helped=state.revealed.length>0;
 useEffect(()=>{if(!state.done||sent.current)return;sent.current=true;onResolve(state.correct,state.guessed.join(' '),helped);},[state.done]);
 useEffect(()=>{const keydown=event=>{if(event.ctrlKey||event.metaKey||event.altKey||event.target?.closest?.('input,textarea,select'))return;if(/^\p{L}$/u.test(event.key)){event.preventDefault();send('GUESS',event.key);}};window.addEventListener('keydown',keydown);return()=>window.removeEventListener('keydown',keydown);});
 const done=state.done||checked,target=spellingLetters(question.answer);
 let offset=0;const tile=Number.isInteger(question.tile)?question.tile:0;
 return <section className="word-discovery word-spelling" aria-label="Descoperă cuvântul">
  <Header level={level}/><div className="ws-progress"><span>{current+1} din {total}</span><progress value={current+1} max={total} aria-label="Progresul sesiunii"/></div>
  <h1 className="ws-title">Descoperă cuvântul</h1>
  <figure className="ws-photo"><div role="img" aria-label={question.translation||question.prompt} className="ws-photo-image" style={{backgroundImage:`url("${question.image||'/images/word-discovery/home.webp'}")`,backgroundPosition:`${tile%3*50}% ${Math.floor(tile/3)*100/3}%`}}/></figure>
  <div className="ws-answer"><div className="ws-slots" lang="nb" aria-label="Cuvântul tău">{question.answer.normalize('NFC').split(/\s+/u).map((word,wordIndex)=><span className="ws-word" key={wordIndex}>{Array.from(word).map((char,index)=>{if(!/\p{L}/u.test(char))return <span key={index}>{char}</span>;const position=offset++,letter=done||state.guessed.includes(target[position])?target[position]:'';return <span className={'ws-slot'+(!letter?' is-hidden':'')+(state.revealed.includes(target[position])?' is-hint':'')} key={index} aria-label={letter||'Literă necompletată'}>{letter||'\u00a0'}</span>;})}</span>)}</div><p>{done?state.correct?helped?'Corect, cu ajutor!':'Cuvânt descoperit!':'Reține forma corectă.':'Alege literele și descoperă cuvântul.'}</p></div>
  {!done?<button type="button" className="ws-hint" disabled={done} onClick={()=>send('HINT')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M9 18h6m-5 3h4M9 18c0-5-4-5-4-10a7 7 0 0 1 14 0c0 5-4 5-4 10Z"/></svg> Dezvăluie o literă</button>:<div className="ws-feedback" role="status"><button type="button" onClick={onSpeak}>Ascultă cuvântul</button>{(!state.correct||helped)&&<small>Îl vei revedea la recapitulare.</small>}</div>}
  <div className="ws-keyboard" role="group" aria-label="Tastatura norvegiană">{rows.map(row=><div className="ws-key-row" key={row}>{Array.from(row).map(letter=><button type="button" aria-label={letter} key={letter} disabled={done||state.guessed.includes(letter)} className={state.guessed.includes(letter)?target.includes(letter)?'is-found':'is-missed':''} onClick={()=>send('GUESS',letter)}>{letter}</button>)}</div>)}</div>
  <footer className="ws-footer">{done?<button type="button" onClick={onNext}>{current===total-1?'Vezi rezultatul':'Continuă'}</button>:<small role="status">{3-state.wrong} {3-state.wrong===1?'greșeală permisă':'greșeli permise'}</small>}</footer>
 </section>;
}
export function WordDiscoveryResult({level,score,results,onRestart,onRetry}){
 const review=results.filter(item=>!item.correct||item.helped);
 return <section className="word-discovery word-spelling ws-results"><Header level={level}/><h1 className="ws-title">Sesiune încheiată</h1><article className="ws-result"><h2>{score} din {results.length}</h2><p>Cuvinte descoperite</p><div>{results.map(item=><p key={item.question.id}><strong lang="nb">{item.question.answer}</strong><span>{item.correct?item.helped?'Cu ajutor':'Corect':'De repetat'}</span></p>)}</div>{review.length>0&&<button type="button" onClick={onRetry}>Repetă cuvintele ({review.length})</button>}<button type="button" onClick={onRestart}>Sesiune nouă</button><Link to={'/jocuri?nivel='+level}>Înapoi la practică</Link></article></section>;
}
