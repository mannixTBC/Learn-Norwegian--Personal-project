import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import MobileAppNav from '../layout/MobileAppNav';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import { ExerciseLevelSelect } from './ExerciseUI';
import NorthernPassMap from './NorthernPassMap';
import { NORTHERN_PASS_STOPS, getNorthernPassStatus } from '../../services/northernPassProgress';
import './GamesMosaic.css';
import './GamesExpedition.css';
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
  const streak = getStudySummary().streak;
  const rank = mapStops[status.completedCount - 1]?.reward || status.rank;
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
  const tiles = [{ ...listen, to: `${listen.to}?nivel=${level}`, percent: listen.progress.best, label: listen.progress.sessions ? `Record: ${listen.progress.best}%` : 'Nou' }, ...['pronunciation', 'quiz', 'order', 'verbs', 'word'].map(id => {
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

  const openMap = () => {
    setSelectedId(status.currentStop?.id || 'aurora');
    setNotice('');
    setMapOpen(true);
  };
  const closeMap = () => setMapOpen(false);
  const selected = mapStops.find(stop => stop.id === selectedId) || mapStops[status.currentIndex] || mapStops[9];
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
    <section className="mini-grid" aria-label="Mini-jocuri">{tiles.map(card => <Link key={card.id} to={card.to} className={`mini-tile mini-tile--${card.id}`}>
      <GameArt type={card.id} />
      {card.percent >= 100 && <span className="expedition-earned" role="img" aria-label={card.id === 'listen' || card.id === 'pronunciation' ? 'Record de 100%' : 'Obiectiv atins'} title={card.id === 'listen' || card.id === 'pronunciation' ? 'Record de 100%' : 'Obiectiv atins'}><svg viewBox="0 0 32 40" aria-hidden="true"><path d="m7 25-2 14 10-5 10 5-2-14" fill="#e9b64c"/><path d="m16 1 4 3 5 1 2 5 3 4-2 5-1 5-5 2-6 3-5-3-5-2-1-5-2-5 3-4 2-5 5-1Z" fill="#f4ca6d" stroke="#bd8b2d"/><circle cx="16" cy="15" r="9" fill="#eeb23b" stroke="#fff1bd"/><path d="m16 7 2 5 5 1-4 4 1 5-4-3-4 3 1-5-4-4 5-1Z" fill="#fff9e6"/></svg></span>}
      <div className="mini-tile-copy"><h3>{card.title}</h3></div>
      <div className="mini-progress" aria-label={card.label}><span className="expedition-dots" aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <i key={index} className={card.percent >= (index + 1) * 20 ? 'is-earned' : ''} />)}</span><small>{card.label}</small></div>
      <span className="expedition-chevron" aria-hidden="true">›</span>
    </Link>)}</section>
    <div className="northern-utilities">
      <Link className="mini-missions" to={"/scenarii?nivel=" + level}><GameArt type="missions" /><div><h2>Studio de conversație</h2><span>Intră în rol cu Nora</span></div><b aria-hidden="true">→</b></Link>
      <Link className="mini-missions" to={`${missions.to}?nivel=${level}`}><GameArt type="missions" /><div><h2>Misiuni la serviciu</h2></div><b aria-hidden="true">›</b></Link>
      <Link className="mini-review" to={byId.review.to}><GameArt type="review" /><div><h2>Recapitulare</h2></div>{reviewStats.due > 0 && <span className="expedition-due" aria-label={`${reviewStats.due} de repetat`}>{reviewStats.due}</span>}<b aria-hidden="true">›</b></Link>
    </div>
    <MobileAppNav activeLevel={level}/>
    <dialog ref={dialog} className="northern-dialog" aria-labelledby="northern-map-title" onCancel={(event) => { event.preventDefault(); closeMap(); }} onClose={closeMap}>
      <header className="northern-dialog__header"><button type="button" ref={backButton} onClick={closeMap} className="northern-back" aria-label="Înapoi la jocuri">←</button><NorwegianFlagIcon className="northern-logo northern-dialog__logo" /><CoinBalance balance={status.state.coins} /></header>
      <div className="northern-dialog__body">
        <div className="northern-dialog__map"><div className="northern-map-heading"><h2 id="northern-map-title">Tărâmul legendelor</h2><p>Expediția ta nordică · {rank}</p></div><NorthernPassMap stops={mapStops} completedCount={status.completedCount} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setNotice(''); }} /></div>
        <section className="northern-obstacle" aria-labelledby="northern-obstacle-title">
          <div className="northern-obstacle__copy"><p className="northern-obstacle__eyebrow">{status.finished ? 'Expediție încheiată' : selectedCompleted ? 'Popas încheiat' : selectedCurrent ? `Popasul ${selectedIndex + 1} din 10` : 'Mai departe pe traseu'}</p><h3 id="northern-obstacle-title" ref={obstacleHeading} tabIndex={-1}>{selected.title}</h3><p className="northern-obstacle__description">{selectedCompleted ? 'Insigna ta este câștigată. Jocurile rămân deschise pentru practică.' : selected.description}</p>
            {!selectedCompleted && <div className="northern-requirements">
              <label><span><img src="/images/games/viking-coin.png" alt="" />{selected.cost ? `${number(selectedCurrent ? Math.min(status.state.coins, selected.cost) : 0)} / ${number(selected.cost)} monede` : 'Fără cost de monede'}</span><progress max={selected.cost || 1} value={selected.cost ? selectedCurrent ? Math.min(status.state.coins, selected.cost) : 0 : 1} /></label>
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
