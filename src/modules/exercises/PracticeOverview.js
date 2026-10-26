import React from 'react';
import { Link } from 'react-router-dom';
import { ExerciseIcon } from './ExerciseUI';
import GameArt from './ExpeditionGameArt';
import ScenarioIllustration from './ScenarioIllustration';
import './PracticeOverview.css';

export default function PracticeOverview({ level, cards, activities, reviewStats, mapTrigger, openMap }) {
  const byId = Object.fromEntries(cards.map(card => [card.id, card]));
  const listen = activities.find(card => card.id === 'listen');
  const rows = [
    { id: 'listen', title: 'Înțelege ce auzi', subtitle: 'Ascultă și alege', time: 4, to: listen.to + '?nivel=' + level },
    { id: 'order', title: 'Construiește fraze', subtitle: 'Propoziții în context', time: 5, to: byId.order.to },
    { id: 'pronunciation', title: 'Exersează pronunția', subtitle: 'Ascultă și repetă', time: 3, to: byId.pronunciation.to },
  ];
  return <div className="practice-overview">
    <div className="practice-heading"><div><span className="practice-eyebrow">Practică</span><h1>Ce vrei să<br />exersezi?</h1></div>{openMap && <button ref={mapTrigger} className="practice-map" onClick={openMap} aria-haspopup="dialog" aria-label="Deschide harta Tărâmul legendelor"><img src="/images/games/expedition-hero.jpg" alt="" /><span>Harta mea <span aria-hidden="true">↗</span></span></button>}</div>
    <Link to={byId.review.to} className="practice-review"><ExerciseIcon name="review" /><span><strong>De repetat astăzi</strong><small>{reviewStats.due ? reviewStats.due + ' de repetat' : reviewStats.total ? 'Ești la zi' : 'Recapitulează ce ai învățat'}</small></span><b aria-hidden="true">›</b></Link>
    <section className="practice-quick" aria-labelledby="practice-quick-title"><h2 id="practice-quick-title">Exerciții rapide</h2>
      <div className="practice-rows">
        <details className="practice-words"><summary className="practice-row"><GameArt type="quiz" /><span className="practice-row-copy"><strong>Reține cuvintele</strong><small>Vocabular și verbe</small></span><span className="practice-time">◷ 3 min</span><b aria-hidden="true">⌄</b></summary><div className="practice-word-links">{[['quiz', 'Vocabular'], ['verbs', 'Verbe'], ['word', 'Descoperă cuvântul']].map(([id, title]) => <Link key={id} data-game={id} to={byId[id].to}><ExerciseIcon name={id} />{title}<span aria-hidden="true">›</span></Link>)}</div></details>
        {rows.map(row => <Link className="practice-row" key={row.id} data-game={row.id} to={row.to}><GameArt type={row.id} /><span className="practice-row-copy"><strong>{row.title}</strong><small>{row.subtitle}</small></span><span className="practice-time">◷ {row.time} min</span><b aria-hidden="true">›</b></Link>)}
      </div>
    </section>
    <section className="practice-studio" aria-labelledby="practice-studio-title"><div className="practice-studio-copy"><span className="practice-eyebrow">Vorbește norvegiană</span><h2 id="practice-studio-title">Studio de<br />conversație</h2></div><ScenarioIllustration scenarioId="nora" className="practice-nora" /><p>Exersează cu Nora, în ritmul tău.</p><Link className="practice-studio-action" to={'/scenarii?nivel=' + level}><ExerciseIcon name="missions" />Situații practice<span aria-hidden="true">→</span></Link></section>
  </div>;
}
