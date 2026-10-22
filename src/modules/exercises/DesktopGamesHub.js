import React from 'react';
import { Link } from 'react-router-dom';
import { ExerciseIcon, ExerciseLevelSelect } from './ExerciseUI';
import './DesktopGamesHub.css';

const descriptions = {
  quiz: 'Alege sensul potrivit și verifică vocabularul învățat.',
  order: 'Pune cuvintele în ordine și construiește propoziții corecte.',
  verbs: 'Fixează verbele prin asociere, propoziții și completare.',
  pronunciation: 'Ascultă, înregistrează-te și exersează claritatea pronunției.',
  word: 'Folosește indiciile pentru a descoperi cuvintele și expresiile.',
  review: 'Revino la expresiile care au nevoie de puțină practică.',
};

const positiveNumber = (value) => Math.max(0, Number(value) || 0);
const percentage = (value) => Math.min(100, Math.round(positiveNumber(value)));

const progressFor = (card, reviewStats) => {
  const completed = positiveNumber(card.progress?.completed);
  const target = Math.max(1, positiveNumber(card.progress?.target));
  const percent = percentage(completed / target * 100);
  if (card.id === 'pronunciation') {
    return { percent, text: completed ? `Cel mai bun rezultat: ${percentage(completed)}%` : 'Prima încercare te așteaptă' };
  }
  if (card.id === 'review') {
    return {
      percent,
      text: reviewStats.due
        ? `${reviewStats.due} ${reviewStats.due === 1 ? 'expresie de repetat' : 'expresii de repetat'}`
        : reviewStats.total ? 'Recapitularea este la zi' : 'Expresiile din lecții vor apărea aici',
    };
  }
  return { percent, text: `${completed} din ${target} ${card.id === 'verbs' ? 'sesiuni' : 'exerciții'}` };
};

const activityLink = (to, level) => `${to}${to.includes('?') ? '&' : '?'}nivel=${encodeURIComponent(level)}`;

export default function DesktopGamesHub({ level, cards = [], activities = [], reviewStats = {} }) {
  return (
    <div className="desktop-games-hub">
      <Link className="desktop-games-hub__back" to={`/invata?nivel=${level}`}><span aria-hidden="true">←</span> Înapoi la lecții</Link>

      <header className="desktop-games-hub__heading">
        <div>
          <span className="desktop-games-hub__eyebrow">Practică în ritmul tău</span>
          <h1>Exerciții de norvegiană</h1>
          <p>Alege o abilitate, repetă ce ai învățat și urmărește-ți progresul.</p>
        </div>
        <div className="desktop-games-hub__level"><ExerciseLevelSelect level={level} /></div>
      </header>

      <section className="desktop-games-hub__section" aria-labelledby="desktop-exercises-title">
        <div className="desktop-games-hub__section-heading"><h2 id="desktop-exercises-title">Exersează o abilitate</h2><span>Nivel {level}</span></div>
        <div className="desktop-games-hub__grid">
          {cards.map((card) => {
            const progress = progressFor(card, reviewStats);
            return (
              <Link className={`desktop-games-hub__card desktop-games-hub__card--${card.id}`} key={card.id} to={card.to}>
                <span className="desktop-games-hub__icon"><ExerciseIcon name={card.id} /></span>
                <h3>{card.title}</h3>
                <p>{descriptions[card.id]}</p>
                <div className="desktop-games-hub__progress">
                  <span>{progress.text}</span>
                  <progress max="100" value={progress.percent} aria-label={`Progres ${card.title}: ${progress.text}`} />
                </div>
                <span className="desktop-games-hub__action">Deschide exercițiul <span aria-hidden="true">→</span></span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="desktop-games-hub__section" aria-labelledby="desktop-practical-title">
        <div className="desktop-games-hub__section-heading"><div><h2 id="desktop-practical-title">Pune norvegiana în practică</h2><p>Ascultare și conversații în situații de zi cu zi.</p></div></div>
        <div className="desktop-games-hub__activities">
          {activities.map((activity) => (
            <Link className="desktop-games-hub__activity" key={activity.id} to={activityLink(activity.to, level)}>
              <span className="desktop-games-hub__icon"><ExerciseIcon name={activity.id} /></span>
              <div className="desktop-games-hub__activity-copy"><small>{activity.meta}</small><h3>{activity.title}</h3><p>{activity.text}</p><span>{activity.progress?.sessions ? `${activity.progress.sessions} ${activity.progress.sessions === 1 ? 'sesiune' : 'sesiuni'} · Cel mai bun rezultat: ${percentage(activity.progress.best)}%` : 'Începe prima sesiune'}</span></div>
              <span className="desktop-games-hub__activity-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
