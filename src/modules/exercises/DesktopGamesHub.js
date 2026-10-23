import React from 'react';
import { Link } from 'react-router-dom';
import { ExerciseIcon, ExerciseLevelSelect } from './ExerciseUI';
import { recommendDesktopPractice } from './desktopPracticeRecommendation';
import './DesktopGamesHub.css';

const copy = {
  listen: ['Ascultă și alege', 'Ascultă norvegiana și recunoaște sensul potrivit.'],
  quiz: ['Vocabular', 'Fixează cuvintele prin sens, context și reamintire.'],
  order: ['Propoziții', 'Ordonează cuvintele și construiește propoziții corecte.'],
  verbs: ['Verbe', 'Înțelege formele verbelor și folosește-le în context.'],
  pronunciation: ['Pronunție', 'Ascultă, înregistrează-te și urmărește claritatea vorbirii.'],
  word: ['Descoperă cuvântul', 'Pornește de la imagine și indicii pentru a găsi cuvântul.'],
};
const withLevel = (to, level) => `${to}${to.includes('?') ? '&' : '?'}nivel=${encodeURIComponent(level)}`;
const count = value => Math.max(0, Number(value) || 0);

function PracticeStatus({ card }) {
  const progress = card.progress || {};
  if (card.id === 'listen') return <span>{count(progress.sessions) ? `${count(progress.sessions)} sesiuni · Cel mai bun rezultat: ${count(progress.best)}%` : 'Începe prima sesiune'}</span>;
  if (card.id === 'pronunciation') return <span>{count(progress.completed) ? `Cel mai bun rezultat: ${count(progress.completed)}%` : 'Exersează în ritmul tău'}</span>;
  return <span>{count(progress.completed) ? `${count(progress.completed)} ${card.id === 'verbs' ? 'sesiuni parcurse' : 'exerciții parcurse'}` : 'Începe prima sesiune'}</span>;
}

export default function DesktopGamesHub({ level, cards = [], activities = [], reviewStats = {} }) {
  const listen = activities.find(item => item.id === 'listen');
  const games = [listen && { ...listen, to: withLevel(listen.to, level) }, ...['quiz', 'order', 'verbs', 'pronunciation', 'word'].map(id => cards.find(item => item.id === id))].filter(Boolean);
  const review = cards.find(item => item.id === 'review');
  const mission = activities.find(item => item.id === 'missions');
  const recommendation = recommendDesktopPractice({ games, review, reviewStats });
  const due = count(reviewStats.due);
  return <div className="desktop-games-hub">
    <header className="desktop-games-hub__heading"><div><span className="desktop-games-hub__eyebrow">PRACTICĂ PERSONALĂ</span><h1>Jocuri</h1><p>Exersează norvegiana în ritmul tău.</p></div><ExerciseLevelSelect level={level} /></header>
    <div className="desktop-games-hub__overview">
      {recommendation && <section className="desktop-games-hub__recommendation" aria-labelledby="practice-recommendation-title"><div><span className="desktop-games-hub__eyebrow">RECOMANDAT PENTRU TINE</span><h2 id="practice-recommendation-title">{recommendation.id === 'review' ? 'Revino la ce ai de consolidat' : copy[recommendation.id]?.[0]}</h2><p>{recommendation.reason}</p><Link className="desktop-games-hub__primary" to={recommendation.to}>{recommendation.id === 'review' ? 'Începe recapitularea' : 'Începe sesiunea'} <span aria-hidden="true">→</span></Link></div><span className="desktop-games-hub__feature-icon" aria-hidden="true"><ExerciseIcon name={recommendation.id} /></span></section>}
      <aside className="desktop-games-hub__consolidate" aria-labelledby="consolidate-title"><span className="desktop-games-hub__icon"><ExerciseIcon name="review" /></span><h2 id="consolidate-title">De consolidat</h2><strong>{due ? `${due} ${due === 1 ? 'expresie de repetat' : 'expresii de repetat'}` : reviewStats.total ? 'Recapitularea este la zi' : 'Construiește-ți vocabularul'}</strong><p>{due ? 'Revino la expresiile salvate și fixează-le prin practică.' : reviewStats.total ? 'Poți revedea expresiile salvate sau continua cu un exercițiu.' : 'Expresiile salvate din lecții și exerciții vor apărea în recapitulare.'}</p>{review && <Link to={review.to}>Deschide recapitularea <span aria-hidden="true">→</span></Link>}</aside>
    </div>
    <section className="desktop-games-hub__section" aria-labelledby="desktop-games-title"><div className="desktop-games-hub__section-heading"><h2 id="desktop-games-title">Toate jocurile</h2><span>Nivel {level}</span></div><div className="desktop-games-hub__grid">{games.map(card => <Link className={`desktop-games-hub__card desktop-games-hub__card--${card.id}`} key={card.id} to={card.to}><span className="desktop-games-hub__icon"><ExerciseIcon name={card.id} /></span><div className="desktop-games-hub__card-copy"><h3>{copy[card.id][0]}</h3><p>{copy[card.id][1]}</p><div className="desktop-games-hub__status"><PracticeStatus card={card} /></div></div><span className="desktop-games-hub__card-arrow" aria-hidden="true">→</span><span className="desktop-games-hub__card-action">Începe</span></Link>)}</div></section>
    {mission && <section className="desktop-games-hub__mission" aria-labelledby="desktop-mission-title"><span className="desktop-games-hub__icon"><ExerciseIcon name="missions" /></span><div><h2 id="desktop-mission-title">Misiuni la serviciu</h2><p>Exersează norvegiana în situații reale de la locul de muncă.</p></div><Link to={withLevel(mission.to, level)}>Descoperă misiunile <span aria-hidden="true">→</span></Link></section>}
  </div>;
}
