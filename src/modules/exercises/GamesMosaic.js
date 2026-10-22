import React, { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import MobileAppNav from '../layout/MobileAppNav';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import { ExerciseLevelSelect } from './ExerciseUI';
import NorthernPassMap from './NorthernPassMap';
import { NORTHERN_PASS_STOPS, getNorthernPassStatus } from '../../services/northernPassProgress';
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


const number = (value) => Math.max(0, Math.floor(Number(value) || 0)).toLocaleString('ro-RO');
const stopNames = ['Port', 'Far', 'Fiord', 'Podul rupt', 'Pădure', 'Cascadă', 'Trecătoare', 'Ghețar', 'Vârf', 'Auroră'];
const mapStops = NORTHERN_PASS_STOPS.map((stop, index) => ({ ...stop, name: stopNames[index] }));
const CoinBalance = ({ balance }) => <span className="mini-coins" aria-label={`${number(balance)} monede`}><img src="/images/norwegian-gold-coin.svg" alt="" /><strong>{balance >= 10000 ? new Intl.NumberFormat('ro-RO', { notation: 'compact', maximumFractionDigits: 1 }).format(balance) : number(balance)}</strong></span>;

const badgePaths = {
  port: <><path d="m4 15 3 5h10l3-5ZM12 3v12M11 4 5 12h6m3-6 5 7h-5" /></>,
  far: <><path d="m8 21 2-13h4l2 13M8 8h8M9 4h6v4H9ZM12 2v2M2 6h4m12 0h4M9 15h6" /></>,
  fiord: <><path d="M2 15 7 4l5 8 4-7 6 10M2 20c3-3 5 3 8 0s5 3 8 0 4 0 4 0" /></>,
  pod: <><path d="M2 11h20M4 7v13M20 7v13M4 16q8-8 16 0M8 10V5m8 5V5M2 21h20" /></>,
  padure: <><path d="m8 3-5 8h3l-4 6h12l-4-6h3ZM8 17v5m10-18-4 7h2l-3 6h9l-3-6h2ZM18 17v5" /></>,
  cascada: <><path d="M2 5h7v8m3-10v14m4-12v9m3-9h3M3 20q3-4 6 0m3 0q3-4 6 0m-2-3h6" /></>,
  trecatoare: <><path d="m2 20 7-14 4 7 3-9 6 16M8 20l4-3 2 3M7 10l2 2 2-2m4-2 2 2 1-2" /></>,
  ghetar: <><path d="m2 19 4-11 5 3 4-7 7 15ZM11 11l-1 8m5-15 2 15M6 8l1 11M2 22h20" /></>,
  varf: <><path d="m2 21 10-16 10 16ZM12 5V2l7 2-7 2M8 12l4 3 4-3" /></>,
  aurora: <><path d="M3 15V4l4 4 4-5 4 5 6-4v11M3 18l5-3 5 3 5-3 3 2M3 22h18" /></>,
};
const ExpeditionBadge = ({ stop }) => <span className="northern-badge" aria-hidden="true"><svg viewBox="0 0 32 36"><path className="northern-badge__shield" d="m16 2 13 7v18l-13 7-13-7V9Z" /><g transform="translate(4 6)">{badgePaths[stop?.id] || badgePaths.port}</g></svg></span>;

export default function GamesMosaic({ level, balance = 0, cards, activities, reviewStats, expedition, onClaimStop }) {
  const status = getNorthernPassStatus(expedition || { version: 1, coins: balance });
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(status.currentStop?.id || 'aurora');
  const [notice, setNotice] = useState('');
  const dialog = useRef(null);
  const mapTrigger = useRef(null);
  const backButton = useRef(null);
  const obstacleHeading = useRef(null);
  const focusObstacle = () => requestAnimationFrame(() => obstacleHeading.current?.focus());
  const byId = Object.fromEntries(cards.map(card => [card.id, card]));
  const listen = activities.find(card => card.id === 'listen');
  const missions = activities.find(card => card.id === 'missions');
  const tiles = [{ ...listen, to: `${listen.to}?nivel=${level}`, percent: listen.progress.best, label: listen.progress.sessions ? `Record: ${listen.progress.best}%` : 'Nou' }, ...['pronunciation', 'verbs', 'quiz', 'order', 'word'].map(id => {
    const card = byId[id];
    return { ...card, percent: Math.min(100, Math.round(card.progress.completed / card.progress.target * 100)), label: id === 'pronunciation' ? card.progress.completed ? `Record: ${card.progress.completed}%` : 'Nou' : `${card.progress.completed} din ${card.progress.target}` };
  })];
  useEffect(() => {
    if (mapOpen) {
      if (!dialog.current?.open) dialog.current?.showModal?.();
      backButton.current?.focus();
    } else if (dialog.current?.open) {
      dialog.current.close();
      mapTrigger.current?.focus();
    }
  }, [mapOpen]);

  const openMap = () => {
    setSelectedId(status.currentStop?.id || 'aurora');
    setNotice('');
    setMapOpen(true);
  };
  const closeMap = () => setMapOpen(false);
  const selected = NORTHERN_PASS_STOPS.find(stop => stop.id === selectedId) || status.currentStop || NORTHERN_PASS_STOPS[9];
  const selectedIndex = NORTHERN_PASS_STOPS.findIndex(stop => stop.id === selected.id);
  const selectedCompleted = selectedIndex < status.completedCount;
  const selectedCurrent = selected.id === status.currentStop?.id;
  const practiceByStop = { port: listen.to, far: byId.word.to, fiord: byId.quiz.to, pod: byId.order.to, padure: byId.quiz.to, cascada: listen.to, trecatoare: byId.verbs.to, ghetar: byId.pronunciation.to, varf: missions.to, aurora: listen.to };
  const practiceHref = `${practiceByStop[selected.id].split('?')[0]}?nivel=${level}`;
  const claim = () => {
    const result = onClaimStop?.(selected.id);
    if (result?.claimed) {
      const next = getNorthernPassStatus(result.state);
      setNotice(`Ai câștigat insigna „${selected.reward}”.`);
      setSelectedId(next.currentStop?.id || selected.id);
    } else setNotice(result?.reason === 'storage-unavailable' ? 'Nu am putut salva progresul. Încearcă din nou.' : 'Progresul s-a actualizat. Verifică cerințele popasului.');
    focusObstacle();
  };

  return <main className="mini-games northern-games">
    <h1 className="mini-sr">Jocuri și expediția Trecătoarea Nordului</h1>
    <header className="mini-top"><Link to="/dashboard" className="mini-brand" aria-label="NordLingo — Acasă"><NorwegianFlagIcon className="northern-logo" /></Link><ExerciseLevelSelect level={level} /><CoinBalance balance={status.state.coins} /></header>
    <section className="northern-overview" aria-labelledby="northern-pass-heading">
      <div className="northern-overview__heading"><h2 id="northern-pass-heading">Trecătoarea Nordului</h2><span>{status.completedCount} din 10 popasuri</span></div>
      <NorthernPassMap stops={mapStops} completedCount={status.completedCount} selectedId={status.currentStop?.id} compact />
      <div className="northern-overview__footer"><div><small>{status.finished ? 'Ai ajuns la destinație' : 'Următorul obstacol'}</small><strong>{status.currentStop?.title || 'Aurora boreală'}</strong></div><button type="button" ref={mapTrigger} className="northern-gold" onClick={openMap} aria-haspopup="dialog">Vezi harta <span aria-hidden="true">→</span></button></div>
    </section>
    <Link to={`/hangman?nivel=${level}`} className="mini-daily"><div><h2>Provocarea zilei</h2><p>Descoperă cuvinte în norvegiană</p></div><span className="mini-start">Joacă <span aria-hidden="true">→</span></span></Link>
    <section className="mini-grid" aria-label="Mini-jocuri">{tiles.map(card => <Link key={card.id} to={card.to} className={`mini-tile mini-tile--${card.id}`}><GameArt type={card.id} /><div className="mini-tile-copy"><h3>{card.title}</h3></div><div className="mini-progress" aria-label={card.label}><span className="mini-rating" aria-hidden="true">★</span><small>{card.label}</small></div></Link>)}</section>
    <div className="northern-utilities">
      <Link className="mini-missions" to={`${missions.to}?nivel=${level}`}><GameArt type="missions" /><div><h2>Misiuni la serviciu</h2><small>{missions.meta}</small></div><b aria-hidden="true">›</b></Link>
      <Link className="mini-review" to={byId.review.to}><GameArt type="review" /><div><h2>Recapitulare</h2><span>{reviewStats.due ? `${reviewStats.due} de repetat` : reviewStats.total ? 'La zi' : 'Nou'}</span></div><b aria-hidden="true">›</b></Link>
    </div>
    <MobileAppNav activeLevel={level}/>
    <dialog ref={dialog} className="northern-dialog" aria-labelledby="northern-map-title" onCancel={(event) => { event.preventDefault(); closeMap(); }} onClose={closeMap}>
      <header className="northern-dialog__header"><button type="button" ref={backButton} onClick={closeMap} className="northern-back" aria-label="Înapoi la jocuri">←</button><h2 id="northern-map-title">Harta expediției<small>Rang: {status.rank}</small></h2><CoinBalance balance={status.state.coins} /></header>
      <div className="northern-dialog__body">
        <div className="northern-dialog__map"><NorthernPassMap stops={mapStops} completedCount={status.completedCount} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setNotice(''); }} /></div>
        <section className="northern-obstacle" aria-labelledby="northern-obstacle-title">
          <div className="northern-obstacle__copy"><p className="northern-obstacle__eyebrow">{status.finished ? 'Expediție încheiată' : selectedCompleted ? 'Popas încheiat' : selectedCurrent ? `Popasul ${selectedIndex + 1} din 10` : 'Mai departe pe traseu'}</p><h3 id="northern-obstacle-title" ref={obstacleHeading} tabIndex={-1}>{selectedCompleted ? selected.title : selected.action}</h3><p className="northern-obstacle__description">{selectedCompleted ? 'Insigna ta este câștigată. Jocurile rămân deschise pentru practică.' : selected.description}</p>
            {!selectedCompleted && <div className="northern-requirements">
              <label><span><img src="/images/norwegian-gold-coin.svg" alt="" />{selected.cost ? `${number(selectedCurrent ? Math.min(status.state.coins, selected.cost) : 0)} / ${number(selected.cost)} monede` : 'Fără cost de monede'}</span><progress max={selected.cost || 1} value={selected.cost ? selectedCurrent ? Math.min(status.state.coins, selected.cost) : 0 : 1} /></label>
              <label><span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="3" /><path d="m8 8 2 2 5-4M8 15h8" /></svg>{selectedCurrent ? Math.min(status.stageSessions, selected.sessions) : 0} / {selected.sessions} {selected.sessions === 1 ? 'sesiune încheiată' : 'sesiuni încheiate'}</span><progress max={selected.sessions} value={selectedCurrent ? Math.min(status.stageSessions, selected.sessions) : 0} /></label>
            </div>}
          </div>
          <aside className="northern-obstacle__reward"><small>{selectedCompleted ? 'Insignă câștigată' : 'Recompensă'}</small><ExpeditionBadge stop={selected} /><strong>{selected.reward}</strong></aside>
          <p className="northern-obstacle__note" role="status">{notice || (selectedCompleted ? status.finished ? 'Ai depășit toate cele 10 obstacole. Felicitări!' : 'Continuă spre următorul obstacol.' : !selectedCurrent ? 'Depășește întâi popasurile anterioare.' : status.remainingCoins ? `Mai ai nevoie de ${number(status.remainingCoins)} monede.` : status.remainingSessions ? 'Câștigi monede din sesiuni de joc încheiate.' : 'Ai îndeplinit cerințele. Poți continua!')}</p>
          {selectedCurrent ? status.canClaim
            ? <button type="button" className="northern-gold northern-obstacle__action" onClick={claim}>{selected.action} <span aria-hidden="true">→</span></button>
            : <Link className="northern-gold northern-obstacle__action" to={practiceHref}>Joacă și avansează <span aria-hidden="true">→</span></Link>
            : status.finished ? <button type="button" className="northern-gold northern-obstacle__action" onClick={closeMap}>Continuă să joci <span aria-hidden="true">→</span></button>
              : <button type="button" className="northern-gold northern-obstacle__action" onClick={() => { setSelectedId(status.currentStop.id); setNotice(''); focusObstacle(); }}>Obstacolul curent <span aria-hidden="true">→</span></button>}
        </section>
      </div>
      <MobileAppNav activeLevel={level} onNavigate={closeMap} />
    </dialog>
  </main>;
}
