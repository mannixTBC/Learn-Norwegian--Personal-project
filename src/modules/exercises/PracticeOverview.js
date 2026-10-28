import React from 'react';
import { Link } from 'react-router-dom';
import { ExerciseIcon, ExerciseLevelSelect } from './ExerciseUI';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import './PracticeOverview.css';
import PracticeStudioCard from './PracticeStudioCard';

const reference = '/images/practice/ivory-reference.png';
const crops = { quiz: [70,383,111,69], listen:[70,465,111,69], order:[70,548,111,70], pronunciation:[70,632,111,70] };
function Artwork({ type }) {
  return <svg className="practice-art" viewBox={(crops[type] || crops.quiz).join(' ')} preserveAspectRatio="xMidYMid slice" aria-hidden="true"><image href={reference} width="1461" height="1076" /></svg>;
}
function Clock() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg>; }
export default function PracticeOverview({ level, cards = [], activities = [], reviewStats = {} }) {
  const byId = Object.fromEntries(cards.map(card => [card.id, card]));
  const listen = activities.find(card => card.id === 'listen');
  const rows = [
    { id:'word', title:'Descoperă cuvântul', subtitle:'Ghicește cuvântul din imagine', time:3, to:byId.word?.to || '/hangman?nivel='+encodeURIComponent(level) },
    { id:'listen', title:'Înțelege ce auzi', subtitle:'Ascultă și alege', time:4, to:(listen?.to || '/asculta-si-alege')+'?nivel='+encodeURIComponent(level) },
    { id:'order', title:'Construiește fraze', subtitle:'Propoziții în context', time:5, to:byId.order?.to || '/drag?nivel='+encodeURIComponent(level) },
    { id:'pronunciation', title:'Exersează pronunția', subtitle:'Ascultă și repetă', time:3, to:byId.pronunciation?.to || '/pronuntie?nivel='+encodeURIComponent(level) },
  ];
  const rowContent = row => <><Artwork type={row.id}/><span className="practice-row-copy"><strong>{row.title}</strong><small>{row.subtitle}</small></span><span className="practice-time"><Clock/>{row.time} min</span><span className="practice-chevron" aria-hidden="true">›</span></>;
  return <div className="practice-overview">
    <header className="practice-header">
      <img className="practice-header-art" src="/images/practice/notebook.png" alt="" aria-hidden="true" width="1280" height="1280" />
      <div className="practice-top"><Link to="/dashboard" className="practice-brand" aria-label="NordLingo - Acasă"><NorwegianFlagIcon/></Link><ExerciseLevelSelect level={level}/></div>
      <div className="practice-heading"><h1>Ce vrei să <br/>exersezi?</h1></div>
    </header>
    <Link to={'/recapitulare-azi?nivel='+encodeURIComponent(level)} className="practice-review"><ExerciseIcon name="review"/><span><strong>De repetat astăzi</strong><small>{reviewStats.due ? reviewStats.due+(reviewStats.due === 1 ? ' cuvânt' : ' cuvinte') : reviewStats.total ? 'Ești la zi' : 'Nimic de repetat încă'}</small></span><span className="practice-chevron" aria-hidden="true">›</span></Link>
    <section className="practice-quick" aria-labelledby="practice-quick-title"><h2 id="practice-quick-title">Exerciții rapide</h2><div className="practice-rows">{rows.map(row=><Link className="practice-row" key={row.id} data-game={row.id} to={row.to}>{rowContent(row)}</Link>)}</div></section>
    <PracticeStudioCard level={level}/>
  </div>;
}
