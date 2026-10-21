import React, { useId } from 'react';
import { Link } from 'react-router-dom';
import MobileAppNav from '../layout/MobileAppNav';
import { ExerciseLevelSelect } from './ExerciseUI';
import './GamesMosaic.css';

function GameArt({ type }) {
  const id = useId().replace(/:/g, '');
  const blue = `url(#blue${id})`, gold = `url(#gold${id})`;
  return <svg className="mini-art" viewBox="0 0 160 140" aria-hidden="true">
    <defs><linearGradient id={`blue${id}`} x2=".8" y2="1"><stop stopColor="#78eff2"/><stop offset=".45" stopColor="#149cad"/><stop offset="1" stopColor="#06455e"/></linearGradient><linearGradient id={`gold${id}`} x2=".7" y2="1"><stop stopColor="#fff2ab"/><stop offset=".5" stopColor="#ffc949"/><stop offset="1" stopColor="#d28a13"/></linearGradient></defs>
    <ellipse cx="82" cy="126" rx="49" ry="7" fill="#073b58" opacity=".13"/>
    {type === 'listen' && <g stroke="#063a4d" strokeWidth="5"><path d="M29 91V67a51 51 0 0 1 102 0v24" fill="none" strokeWidth="17"/><path d="M29 73V65a51 51 0 0 1 102 0v8" fill="none" stroke="#8be2e8" strokeWidth="8"/><rect x="16" y="66" width="34" height="54" rx="15" fill={blue} transform="rotate(-10 33 93)"/><rect x="110" y="66" width="34" height="54" rx="15" fill={blue} transform="rotate(10 127 93)"/><path d="M55 78v26m13-43v57m13-48v40m13-30v20" stroke="#6ce6df" strokeWidth="5" strokeLinecap="round"/></g>}
    {type === 'pronunciation' && <g stroke="#075773" strokeWidth="5"><rect x="58" y="12" width="44" height="76" rx="22" fill={blue}/><path d="M46 62v10a34 34 0 0 0 68 0V62M80 106v17" fill="none"/><path d="M67 31h26M65 42h30M65 53h30" stroke="#b9f2f7" strokeWidth="3"/><ellipse cx="80" cy="124" rx="25" ry="6" fill={blue}/></g>}
    {type === 'verbs' && <g transform="rotate(-9 80 70)"><rect x="28" y="86" width="105" height="34" rx="9" fill={gold}/><rect x="37" y="88" width="95" height="21" rx="5" fill="#fff9dd"/><rect x="22" y="53" width="105" height="34" rx="9" fill={blue}/><rect x="31" y="56" width="95" height="20" rx="5" fill="#effcfa"/><rect x="30" y="20" width="105" height="34" rx="9" fill={gold}/><path d="M40 29h82" stroke="#fff5c1" strokeWidth="3"/></g>}
    {type === 'quiz' && <g transform="rotate(9 80 70)"><rect x="35" y="18" width="94" height="105" rx="17" fill="#cf8b13"/><rect x="27" y="12" width="94" height="105" rx="17" fill={gold} stroke="#fff1af" strokeWidth="2"/><text x="74" y="91" textAnchor="middle" fontSize="79" fontWeight="900" fill="#075c86">A</text></g>}
    {type === 'order' && <g fontSize="29" fontWeight="800" fill="#123753"><g transform="rotate(-12 52 68)"><rect x="15" y="28" width="69" height="82" rx="12" fill="#92b8cc"/><rect x="12" y="23" width="69" height="82" rx="12" fill="#fff"/><text x="45" y="74" textAnchor="middle">jeg</text></g><g transform="rotate(12 111 80)"><rect x="83" y="44" width="65" height="76" rx="12" fill="#92b8cc"/><rect x="80" y="39" width="65" height="76" rx="12" fill="#f7fcff"/><text x="112" y="85" textAnchor="middle">er</text></g></g>}
    {type === 'word' && <g><rect x="20" y="71" width="49" height="48" rx="9" fill="#fff" transform="rotate(-12 45 95)"/><text x="35" y="106" fontSize="34" fill="#123753">a</text><path d="m99 78 40 37" stroke="#a25b22" strokeWidth="18" strokeLinecap="round"/><circle cx="77" cy="53" r="36" fill="#d7f5ff" stroke="#b7752b" strokeWidth="12"/><circle cx="77" cy="53" r="31" fill="none" stroke={gold} strokeWidth="6"/><path d="M58 47q3-15 20-16" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round"/></g>}
    {type === 'missions' && <g stroke="#bd8f39" strokeWidth="4"><path d="M58 36V22h43v14" fill="none" strokeWidth="9"/><rect x="20" y="35" width="120" height="85" rx="15" fill={blue}/><path d="M23 66q57 25 114 0" fill="none"/><rect x="72" y="67" width="17" height="25" rx="4" fill={gold}/></g>}
    {type === 'review' && <g fill="none" stroke={blue} strokeWidth="20" strokeLinecap="round"><path d="M115 51A42 42 0 0 0 40 43M43 88a42 42 0 0 0 75 5"/><path d="m32 24 6 26 26-5m35 51 25-5 6 26" strokeWidth="13"/></g>}
  </svg>;
}


export default function GamesMosaic({ level, balance, streak, cards, activities, reviewStats }) {
  const byId = Object.fromEntries(cards.map(card => [card.id, card]));
  const listen = activities.find(card => card.id === 'listen');
  const missions = activities.find(card => card.id === 'missions');
  const tiles = [{ ...listen, to: `${listen.to}?nivel=${level}`, percent: listen.progress.best, label: listen.progress.sessions ? `Record: ${listen.progress.best}%` : 'Nou' }, ...['pronunciation', 'verbs', 'quiz', 'order', 'word'].map(id => {
    const card = byId[id];
    return { ...card, percent: Math.min(100, Math.round(card.progress.completed / card.progress.target * 100)), label: id === 'pronunciation' ? card.progress.completed ? `Record: ${card.progress.completed}%` : 'Nou' : `${card.progress.completed} din ${card.progress.target}` };
  })];
  return <main className="mini-games mini-games--compact">
    <header className="mini-top"><Link to="/dashboard" className="mini-brand">Nordlingo</Link><ExerciseLevelSelect level={level}/><span className="mini-coins"><img src="/images/norwegian-gold-coin.svg" alt=""/>{balance.toLocaleString('ro-RO')}<span className="mini-sr"> monede</span></span></header>
    <div className="mini-heading"><h1>Jocuri</h1><span className="mini-streak"><span aria-hidden="true">🔥</span> {streak} {streak === 1 ? 'zi' : 'zile'}</span></div>
    <Link to={`/hangman?nivel=${level}`} className="mini-daily"><h2>Provocarea zilei</h2><p>Descoperă cuvinte în norvegiană</p><span className="mini-start">Începe <span aria-hidden="true">→</span></span></Link>
    <h2 className="mini-section-title mini-sr">Alege un joc</h2>
    <section className="mini-grid" aria-label="Mini-jocuri">{tiles.map(card => <Link key={card.id} to={card.to} className={`mini-tile mini-tile--${card.id}`}><GameArt type={card.id}/><div className="mini-tile-copy"><h3>{card.title}</h3></div><div className="mini-progress" aria-label={card.label}><span className="mini-rating" aria-hidden="true">★</span><small>{card.label}</small></div><span className="mini-chevron" aria-hidden="true">›</span></Link>)}</section>
    <Link className="mini-missions" to={`${missions.to}?nivel=${level}`}><GameArt type="missions"/><div><h2>Misiuni la serviciu</h2><small>{missions.meta}</small></div><b aria-hidden="true">›</b></Link>
    <Link className="mini-review" to={byId.review.to}><GameArt type="review"/><div><h2>Recapitulare</h2></div><span>{reviewStats.due ? `${reviewStats.due} de repetat` : reviewStats.total ? 'La zi' : 'Nou'}</span><b aria-hidden="true">›</b></Link>
    <MobileAppNav activeLevel={level}/>
  </main>;
}
