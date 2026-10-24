import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import MobileAppNav from '../layout/MobileAppNav';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import { ExerciseLevelSelect } from './ExerciseUI';
import NorthernPassMap from './NorthernPassMap';
import { NORTHERN_PASS_STOPS, getNorthernPassStatus } from '../../services/northernPassProgress';
import './GamesMosaic.css';
import './GamesExpedition.css';
import './LegendMap.css';
import GameArt from './ExpeditionGameArt';
import { getStudySummary } from '../../services/learningActivity';

const number = (value) => Math.max(0, Math.floor(Number(value) || 0)).toLocaleString('ro-RO');
const stopNames = ['Port', 'Far', 'Fiord', 'Podul trolului', 'Pădure', 'Cascadă', 'Poarta runelor', 'Ghețar', 'Sala vikingilor', 'Auroră'];
// Presentation only: keep saved stop IDs, prices and session requirements intact.
const legendCopy = {
  port: { title: 'Portul vikingilor' },
  pod: { title: 'Podul trolului', action: 'Repară podul trolului', description: 'Adună resurse și redeschide trecerea peste cascadă.', reward: 'Prietenul trolilor' },
  trecatoare: { title: 'Poarta runelor', action: 'Deschide poarta runelor', description: 'Urmează semnele nordice spre înălțimile muntelui.' },
  varf: { title: 'Sala vikingilor', action: 'Ajungi la sala vikingilor', description: 'Strânge provizii pentru urcarea spre sala de pe culme.' },
};
const mapStops = NORTHERN_PASS_STOPS.map((stop, index) => ({ ...stop, ...legendCopy[stop.id], name: stopNames[index] }));
const CoinBalance = ({ balance }) => <span className="mini-coins" aria-label={`${number(balance)} monede`}><img src="/images/games/viking-coin.png" alt="" /><strong>{balance >= 10000 ? new Intl.NumberFormat('ro-RO', { notation: 'compact', maximumFractionDigits: 1 }).format(balance) : number(balance)}</strong></span>;

export default function GamesMosaic({ level, balance = 0, cards, activities, reviewStats, expedition, onClaimStop }) {
  const status = getNorthernPassStatus(expedition || { version: 1, coins: balance });
  const streak = getStudySummary().streak;
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(status.currentStop?.id || 'aurora');
  const [notice, setNotice] = useState('');
  const [lockOpen,setLockOpen] = useState(false);
  const dialog = useRef(null);
  const mapTrigger = useRef(null);
  const backButton = useRef(null);
  const obstacleHeading = useRef(null);
  const focusObstacle = () => requestAnimationFrame(() => obstacleHeading.current?.focus());
  const byId = Object.fromEntries(cards.map(card => [card.id, card]));
  const listen = activities.find(card => card.id === 'listen');
  const listeningCard = { ...listen, to: `${listen.to}?nivel=${level}`, percent: listen.progress.best, label: listen.progress.sessions ? `Record: ${listen.progress.best}%` : 'Nou' };
  const vocabulary = byId.quiz;
  const studio = { id:'missions', title:'Studio de conversație', to:`/scenarii?nivel=${level}`, label:'Cu Nora' };
  const tiles = [studio, ...['pronunciation', 'listen', 'order', 'verbs', 'word'].map(id => {
    if (id === 'listen') return listeningCard;
    const card = byId[id];
    return { ...card, title: id === 'word' ? 'Descoperă cuvântul' : card.title, percent: Math.min(100, Math.round(card.progress.completed / card.progress.target * 100)), label: id === 'pronunciation' ? card.progress.completed ? `Record: ${card.progress.completed}%` : 'Nou' : `${card.progress.completed} / ${card.progress.target}` };
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

  useEffect(() => { if (lockOpen) focusObstacle(); }, [lockOpen,selectedId]);
  const openMap = () => {
    setSelectedId(status.currentStop?.id || 'aurora');
    setNotice('');
    setLockOpen(false); setMapOpen(true);
  };
  const closeMap = () => { setLockOpen(false); setMapOpen(false); };
  const upcoming = mapStops[status.currentIndex] || mapStops[9];
  const selected = mapStops.find(stop => stop.id === selectedId) || mapStops[status.currentIndex] || mapStops[9];
  const selectedIndex = NORTHERN_PASS_STOPS.findIndex(stop => stop.id === selected.id);
  const selectedCompleted = selectedIndex < status.completedCount;
  const selectedCurrent = selected.id === status.currentStop?.id;
  const claim = () => {
    const result = onClaimStop?.(selected.id);
    if (result?.claimed) {
      const next = getNorthernPassStatus(result.state);
      setNotice(`Ai câștigat insigna „${selected.reward}”.`);
      setSelectedId(next.currentStop?.id || selected.id);
      setLockOpen(false);
    } else setNotice(result?.reason === 'storage-unavailable' ? 'Nu am putut salva progresul. Încearcă din nou.' : 'Progresul s-a actualizat. Verifică cerințele popasului.');
    focusObstacle();
  };

  return <main className="mini-games northern-games northern-games--expedition">
    <h1 className="mini-sr">Jocuri și expediția Tărâmul legendelor</h1>
    <header className="mini-top"><Link to="/dashboard" className="mini-brand" aria-label="NordLingo — Acasă"><NorwegianFlagIcon className="northern-logo" /></Link><CoinBalance balance={status.state.coins} /><ExerciseLevelSelect level={level} /></header>
    <section className="northern-overview expedition-feature" aria-labelledby="northern-pass-heading">
      <img className="expedition-feature__scene" src="/images/games/expedition-hero.jpg" alt="" width="1536" height="1024" fetchPriority="high" />
      <div className="expedition-feature__copy">
        <h2 id="northern-pass-heading">Tărâmul legendelor</h2>
        <div className="expedition-feature__progress"><progress value={status.completedCount} max={10} aria-label="Popasuri încheiate" /><span>{status.completedCount} / 10</span></div>
        <button type="button" ref={mapTrigger} className="northern-gold" onClick={openMap} aria-haspopup="dialog">{status.finished ? 'Vezi harta' : status.completedCount ? 'Continuă expediția' : 'Începe expediția'} <span aria-hidden="true">→</span></button>
      </div>
      <span className="expedition-streak" aria-label={`${streak} ${streak === 1 ? 'zi consecutivă' : 'zile consecutive'}`}><svg viewBox="0 0 24 28" aria-hidden="true"><path d="M13 1c2 7-5 8-3 13 2-1 3-3 3-5 6 4 9 8 7 13-3 8-17 6-17-3 0-5 3-8 5-10 0 5 1 6 2 6-2-6 4-9 3-14Z" fill="currentColor" /></svg><span>{streak} {streak === 1 ? 'zi' : 'zile'}</span></span>
    </section>
    <section className="mini-grid" aria-label="Mini-jocuri">{tiles.map(card => <Link key={card.id} to={card.to} data-game={card.id} className={`mini-tile mini-tile--${card.id}`}>
      <GameArt type={card.id} />
      {card.percent >= 100 && <span className="expedition-earned" role="img" aria-label={card.id === 'listen' || card.id === 'pronunciation' ? 'Record de 100%' : 'Obiectiv atins'} title={card.id === 'listen' || card.id === 'pronunciation' ? 'Record de 100%' : 'Obiectiv atins'}><svg viewBox="0 0 32 40" aria-hidden="true"><path d="m7 25-2 14 10-5 10 5-2-14" fill="#e9b64c"/><path d="m16 1 4 3 5 1 2 5 3 4-2 5-1 5-5 2-6 3-5-3-5-2-1-5-2-5 3-4 2-5 5-1Z" fill="#f4ca6d" stroke="#bd8b2d"/><circle cx="16" cy="15" r="9" fill="#eeb23b" stroke="#fff1bd"/><path d="m16 7 2 5 5 1-4 4 1 5-4-3-4 3 1-5-4-4 5-1Z" fill="#fff9e6"/></svg></span>}
      <div className="mini-tile-copy"><h3>{card.title}</h3></div>
      <div className="mini-progress" aria-label={card.label}>{card.percent !== undefined && <span className="expedition-dots" aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <i key={index} className={card.percent >= (index + 1) * 20 ? 'is-earned' : ''} />)}</span>}<small>{card.label}</small></div>
      <span className="expedition-chevron" aria-hidden="true">›</span>
    </Link>)}</section>
    <div className="northern-utilities">
      <Link className="mini-missions mini-vocabulary" data-game="quiz" to={vocabulary.to}><GameArt type="quiz" /><div><h2>Vocabular</h2><small>{vocabulary.progress.completed} / {vocabulary.progress.target} exerciții</small></div><b aria-hidden="true">→</b></Link>
      <Link className="mini-review" to={byId.review.to}><GameArt type="review" /><div><h2>Recapitulare</h2></div>{reviewStats.due > 0 && <span className="expedition-due" aria-label={`${reviewStats.due} de repetat`}>{reviewStats.due}</span>}<b aria-hidden="true">›</b></Link>
    </div>
    <MobileAppNav activeLevel={level}/>
    <dialog ref={dialog} className="northern-dialog legend-map-dialog" aria-labelledby="northern-map-title" onCancel={(event) => { event.preventDefault(); closeMap(); }} onClose={closeMap}>
      <header className="northern-dialog__header"><button type="button" ref={backButton} onClick={closeMap} className="northern-back" aria-label="Înapoi la jocuri">←</button><NorwegianFlagIcon className="northern-logo northern-dialog__logo" /><CoinBalance balance={status.state.coins} /></header>
      <div className="northern-dialog__body">
        <div className="northern-dialog__map">
          <div className="northern-map-heading"><h2 id="northern-map-title">Tărâmul legendelor</h2></div>
          <NorthernPassMap stops={mapStops} completedCount={status.completedCount} selectedId={selectedId} onSelect={id => { setSelectedId(id); setNotice(''); setLockOpen(true); }} />
          {lockOpen && <section className="legend-lock-panel" aria-label="Detalii obstacol" onKeyDown={event => { if(event.key === 'Escape') {event.stopPropagation();setLockOpen(false);} }}>
            <button type="button" className="legend-lock-close" aria-label="Închide detaliile" onClick={() => setLockOpen(false)}>×</button>
            <h3 ref={obstacleHeading} tabIndex={-1}>{selected.title}</h3>
            <p className="legend-lock-price"><img src="/images/games/viking-coin.png" alt="" />{number(selected.cost)} monede</p>
            <p>{selectedCompleted ? 'Obstacol depășit.' : !selectedCurrent ? 'Deblochează mai întâi obstacolele anterioare.' : status.remainingCoins ? 'Îți mai lipsesc ' + number(status.remainingCoins) + ' monede.' : status.remainingSessions ? 'Monedele sunt pregătite. Mai încheie ' + status.remainingSessions + ' sesiuni de joc.' : 'Poți debloca acest obstacol.'}</p>
            {notice && <p role="status">{notice}</p>}
            {selectedCurrent && <button type="button" className="northern-gold" disabled={!status.canClaim} onClick={claim}>Deblochează · {number(selected.cost)} monede</button>}
          </section>}
        </div>
        <section className="legend-next" aria-label="Următorul obstacol" aria-live="polite">
          <div className="legend-next__image" aria-hidden="true" />
          <div className="legend-next__copy"><p>{status.finished ? 'Expediție încheiată' : 'Următorul obstacol'}</p><h3>{status.finished ? 'Ai explorat întregul tărâm!' : upcoming.title}</h3>
          {!status.finished && <><div className="legend-next__balance"><img src="/images/games/viking-coin.png" alt="" /><strong>{number(Math.min(status.state.coins,upcoming.cost))} / {number(upcoming.cost)}</strong></div><progress aria-label="Monede pentru următorul obstacol" max={upcoming.cost || 1} value={upcoming.cost ? Math.min(status.state.coins,upcoming.cost) : 1} /><span className="legend-next__missing">{status.remainingCoins ? <>Îți mai lipsesc <strong>{number(status.remainingCoins)}</strong> monede</> : 'Ai monedele necesare'}</span></>}
          </div>
        </section>
      </div>
      <MobileAppNav activeLevel={level} onNavigate={closeMap} />
    </dialog>
  </main>;
}
