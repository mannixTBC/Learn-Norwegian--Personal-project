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
import PracticeOverview from './PracticeOverview';

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
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(status.currentStop?.id || 'aurora');
  const [notice, setNotice] = useState('');
  const [lockOpen,setLockOpen] = useState(false);
  const dialog = useRef(null);
  const mapTrigger = useRef(null);
  const backButton = useRef(null);
  const obstacleHeading = useRef(null);
  const focusObstacle = () => requestAnimationFrame(() => obstacleHeading.current?.focus());
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

  return <main className="northern-games practice-hub">
    <header className="practice-top"><Link to="/dashboard" className="practice-brand" aria-label="NordLingo - Acasă"><NorwegianFlagIcon /></Link><ExerciseLevelSelect level={level} /><CoinBalance balance={status.state.coins} /></header>
    <PracticeOverview {...{level, cards, activities, reviewStats, mapTrigger, openMap}} />
    <MobileAppNav activeLevel={level}/>
    <dialog ref={dialog} className="northern-dialog legend-map-dialog" aria-labelledby="northern-map-title" onCancel={(event) => { event.preventDefault(); closeMap(); }} onClose={closeMap}>
      <header className="northern-dialog__header"><button type="button" ref={backButton} onClick={closeMap} className="northern-back" aria-label="Înapoi la practică">←</button><NorwegianFlagIcon className="northern-logo northern-dialog__logo" /><CoinBalance balance={status.state.coins} /></header>
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
