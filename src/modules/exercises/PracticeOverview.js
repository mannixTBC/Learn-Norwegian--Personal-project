import {ui} from '../../languages/messages.js';
import React from 'react';
import { Link } from 'react-router-dom';
import { ExerciseLevelSelect } from './ExerciseUI';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import './PracticeOverview.css';
import './PracticePencil.css';
import PracticeStudioCard from './PracticeStudioCard';

// Approved pencil artwork only; all labels, destinations and controls are live HTML.
const reference = '/images/practice/pencil-reference.webp';
const crops = {
  grammar: [100,150,340,185], review: [500,150,340,180],
  word: [100,495,340,180], listen: [500,495,340,180],
  order: [100,840,340,180], pronunciation: [500,840,340,180],
};
function Artwork({ type }) {
  const [x,y,width,height] = crops[type];
  const clip = 'practice-pencil-' + type;
  return <svg className="practice-art" viewBox={crops[type].join(' ')} preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><defs><clipPath id={clip}><rect {...{x,y,width,height}}/></clipPath></defs><image href={reference} width="941" height="1672" clipPath={'url(#'+clip+')'} /></svg>;
}
function Clock() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg>; }
export default function PracticeOverview({ level, cards = [], activities = [] }) {
  const byId = Object.fromEntries(cards.map(card => [card.id, card]));
  const listen = activities.find(card => card.id === 'listen');
  const listenUrl = new URL(listen?.to || '/asculta-si-alege', 'https://nordlingo.net');
  listenUrl.searchParams.set('nivel', level);
  const rows = [
    { id:'grammar', title:ui('ui_b3e5917f6637de1c'), subtitle:'Reguli și explicații', time:4, to:'/gramatica?nivel='+encodeURIComponent(level) },
    { id:'review', title:ui('ui_fe74dd05d0e5825f'), subtitle:'Repetă și consolidează', time:3, to:'/recapitulare-azi?nivel='+encodeURIComponent(level) },
    { id:'word', title:ui('ui_a60eba1190b8698d'), subtitle:'Ghicește cuvântul', time:3, to:byId.word?.to || '/hangman?nivel='+encodeURIComponent(level) },
    { id:'listen', title:ui('ui_41349046bc57865f'), subtitle:ui('ui_b58cf3ae7c001d99'), time:4, to:listenUrl.pathname+listenUrl.search },
    { id:'order', title:ui('ui_bdeb956c78055dc4'), subtitle:'Propoziții în context', time:5, to:byId.order?.to || '/drag?nivel='+encodeURIComponent(level) },
    { id:'pronunciation', title:ui('ui_efcec15f0e8e3101'), subtitle:'Ascultă și repetă', time:3, to:byId.pronunciation?.to || '/pronuntie?nivel='+encodeURIComponent(level) },
  ];
  return <div className="practice-overview practice-overview--pencil">
    <header className="practice-header">
      <div className="practice-top"><Link to="/dashboard" className="practice-brand" aria-label={ui('web_c5ac94a4335cbea9')}><NorwegianFlagIcon/></Link><ExerciseLevelSelect level={level}/></div>
      <div className="practice-heading"><h1>{ui('ui_56e2f4a1b2800215')}</h1></div>
    </header>
    <section className="practice-quick" aria-label={ui('web_569b49d564ebbc59')}><div className="practice-rows">{rows.map(row => <Link className="practice-row" key={row.id} data-game={row.id} to={row.to}>
      <Artwork type={row.id}/>
      <span className="practice-row-copy"><strong>{row.title}</strong><small>{row.subtitle}</small></span>
      <span className="practice-card-footer"><span className="practice-time"><Clock/>{row.time}{ui('ui_2e75737a6b582974')}</span><span className="practice-chevron" aria-hidden="true">›</span></span>
    </Link>)}</div></section>
    <PracticeStudioCard level={level}/>
  </div>;
}
