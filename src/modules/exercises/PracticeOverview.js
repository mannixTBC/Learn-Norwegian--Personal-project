import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExerciseIcon, ExerciseLevelSelect } from './ExerciseUI';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import './PracticeOverview.css';

const reference = '/images/practice/ivory-reference.png';
const crops = { quiz: [70,383,111,69], listen:[70,465,111,69], order:[70,548,111,70], pronunciation:[70,632,111,70] };
function Artwork({ type }) {
  return <svg className="practice-art" viewBox={crops[type].join(' ')} preserveAspectRatio="xMidYMid slice" aria-hidden="true"><image href={reference} width="1461" height="1076" /></svg>;
}
function Clock() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg>; }
function Bubble() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M21 11a9 9 0 0 1-13 8l-5 2 2-5A9 9 0 1 1 21 11Z"/></svg>; }
export default function PracticeOverview({ level, cards = [], activities = [], reviewStats = {} }) {
  const byId = Object.fromEntries(cards.map(card => [card.id, card]));
  const wordDialog = useRef(null), wordsTrigger = useRef(null);
  const [wordsOpen, setWordsOpen] = useState(false);
  const listen = activities.find(card => card.id === 'listen');
  const rows = [
    { id:'quiz', title:'Reține cuvintele', subtitle:'Vocabular și verbe', time:3 },
    { id:'listen', title:'Înțelege ce auzi', subtitle:'Ascultă și alege', time:4, to:(listen?.to || '/asculta-si-alege')+'?nivel='+encodeURIComponent(level) },
    { id:'order', title:'Construiește fraze', subtitle:'Propoziții în context', time:5, to:byId.order?.to || '/drag?nivel='+encodeURIComponent(level) },
    { id:'pronunciation', title:'Exersează pronunția', subtitle:'Ascultă și repetă', time:3, to:byId.pronunciation?.to || '/pronuntie?nivel='+encodeURIComponent(level) },
  ];
  const rowContent = row => <><Artwork type={row.id}/><span className="practice-row-copy"><strong>{row.title}</strong><small>{row.subtitle}</small></span><span className="practice-time"><Clock/>{row.time} min</span><span className="practice-chevron" aria-hidden="true">›</span></>;
  const closeWords=()=>{wordDialog.current?.close();setWordsOpen(false);wordsTrigger.current?.focus();};
  return <div className="practice-overview">
    <header className="practice-header">
      <svg className="practice-fjord" viewBox="305 175 166 85" aria-hidden="true"><image href={reference} width="1461" height="1076" /></svg>
      <div className="practice-top"><Link to="/dashboard" className="practice-brand" aria-label="NordLingo - Acasă"><NorwegianFlagIcon/></Link><ExerciseLevelSelect level={level}/></div>
      <div className="practice-heading"><h1>Ce vrei să <br/>exersezi?</h1></div>
    </header>
    <Link to={byId.review?.to || '/recapitulare?nivel='+encodeURIComponent(level)} className="practice-review"><ExerciseIcon name="review"/><span><strong>De repetat astăzi</strong><small>{reviewStats.due ? reviewStats.due+(reviewStats.due === 1 ? ' cuvânt' : ' cuvinte') : reviewStats.total ? 'Ești la zi' : 'Nimic de repetat încă'}</small></span><span className="practice-chevron" aria-hidden="true">›</span></Link>
    <section className="practice-quick" aria-labelledby="practice-quick-title"><h2 id="practice-quick-title">Exerciții rapide</h2><div className="practice-rows">{rows.map(row=>row.id==='quiz'?<button key={row.id} type="button" ref={wordsTrigger} className="practice-row" aria-haspopup="dialog" aria-expanded={wordsOpen} aria-controls="practice-words-picker" onClick={()=>{setWordsOpen(true);wordDialog.current.showModal();}}>{rowContent(row)}</button>:<Link className="practice-row" key={row.id} data-game={row.id} to={row.to}>{rowContent(row)}</Link>)}</div></section>
    <section className="practice-studio" aria-labelledby="practice-studio-title">
      <Link className="practice-studio-entry" to={'/studio?nivel='+level} aria-labelledby="practice-studio-title"/>
      <svg className="practice-studio-scene" preserveAspectRatio="xMaxYMid slice" viewBox="64 720 393 221" aria-hidden="true"><defs><linearGradient id="practice-scene-reveal"><stop offset="0" stopColor="black"/><stop offset=".535" stopColor="black"/><stop offset=".64" stopColor="white"/><stop offset="1" stopColor="white"/></linearGradient><mask id="practice-scene-mask"><rect x="64" y="720" width="393" height="221" fill="url(#practice-scene-reveal)"/><rect x="76" y="876" width="312" height="53" rx="13" fill="black"/></mask></defs><image href={reference} width="1461" height="1076" mask="url(#practice-scene-mask)"/></svg>
      <div className="practice-studio-copy"><span className="practice-eyebrow">Vorbește norvegiană</span><h2 id="practice-studio-title">Studio de <br/>conversație</h2><p>Exersează cu Nora, în ritmul tău.</p></div>
      <div className="practice-studio-actions"><Link className="practice-studio-action" to={'/scenarii?nivel='+level}><Bubble/>Situații practice</Link><Link className="practice-studio-action practice-studio-action--free" to={'/studio?nivel='+level+'&mod=liber'}><ExerciseIcon name="pronunciation"/>Dialog liber</Link></div>
    </section>
    <dialog id="practice-words-picker" ref={wordDialog} className="practice-picker" aria-labelledby="practice-words-title" onCancel={event=>{event.preventDefault();closeWords();}}><header><h2 id="practice-words-title">Reține cuvintele</h2><button type="button" aria-label="Închide" onClick={closeWords}>×</button></header>{[['quiz','Vocabular'],['verbs','Verbe'],['word','Descoperă cuvântul']].filter(([id])=>byId[id]).map(([id,title])=><Link key={id} data-game={id} to={byId[id].to} onClick={closeWords}><ExerciseIcon name={id}/>{title}<span aria-hidden="true">›</span></Link>)}</dialog>
  </div>;
}
