import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getLearningLevel, levelName } from '../lessons/learningLevel';
import { getReviewStats } from '../../services/spacedReview';
import './GamesHub.css';
import './MobileExercisePolish.css';

const gameCards = [
  { to: '/chestionar', icon: '✓', eyebrow: 'Alege răspunsul', title: 'Chestionar', text: 'Verifică rapid vocabularul și expresiile din lecțiile tale.', meta: '5–15 întrebări', tone: 'quiz' },
  { to: '/drag', icon: '↔', eyebrow: 'Pune în ordine', title: 'Construiește propoziția', text: 'Așază cuvintele corect și exersează structurile limbii.', meta: 'Sesiune personalizată', tone: 'order' },
  { to: '/hangman', icon: 'Aa', eyebrow: 'Joc de vocabular', title: 'Descoperă cuvântul', text: 'Folosește indiciile pentru a găsi cuvântul norvegian.', meta: '5–15 cuvinte', tone: 'word' },
];

const GamesHub = () => {
  const location = useLocation();
  const level = getLearningLevel(location.search);
  const reviewStats = getReviewStats(level);
  let verbProgress = { day: 1 };
  try { verbProgress = JSON.parse(localStorage.getItem(`challenge_verbs_progress_${level.toLowerCase()}`)) || verbProgress; } catch (_) { /* Folosim progresul implicit. */ }

  return (
    <div className="games-hub">
      <Link className="games-hub__back" to={`/invata?nivel=${level}`}><span aria-hidden="true">←</span><div><small>Înapoi la meniu</small><strong>Lecțiile mele</strong></div></Link>

      <header className="games-hub__hero">
        <div>
          <h1>Jocuri și exerciții</h1>
          <p>Exersează fără presiune. Alege o activitate scurtă și fixează ce ai învățat în lecții.</p>
        </div>
        <div className="games-hub__level"><small>Nivel activ</small><strong>{level}</strong><span>{levelName[level]}</span></div>
      </header>

      <section className="games-hub__section" aria-labelledby="games-title">
        <div className="games-hub__heading"><div><span>Alege un joc</span><h2 id="games-title">Învață prin practică</h2></div><small>Progresul cursului nu este afectat</small></div>
        <div className="games-hub__grid">
          {gameCards.map((game) => (
            <Link className={`game-hub-card game-hub-card--${game.tone}`} to={game.to} key={game.to}>
              <span className="game-hub-card__icon" aria-hidden="true">{game.icon}</span>
              <div><small>{game.eyebrow}</small><h3>{game.title}</h3><p>{game.text}</p></div>
              <footer><span>{game.meta}</span><strong>Deschide <i aria-hidden="true">→</i></strong></footer>
            </Link>
          ))}
        </div>
      </section>

      <section className="games-hub__training" aria-labelledby="training-title">
        <div className="games-hub__heading"><div><span>Antrenament ghidat</span><h2 id="training-title">Continuă să progresezi</h2></div></div>
        <div className="games-hub__training-grid">
          <Link to={`/challenge30?nivel=${level}`}><span aria-hidden="true">30</span><div><small>Seria ta de verbe</small><h3>Verbele de astăzi</h3><p>Sesiunea {Math.min(verbProgress.day || 1, 10)} din 10 · trei verbe noi</p></div><b aria-hidden="true">→</b></Link>
          <Link to={`/pronuntie?nivel=${level}`}><span aria-hidden="true">♪</span><div><small>Voce și ascultare</small><h3>Laborator de pronunție</h3><p>Ascultă, repetă și primește feedback.</p></div><b aria-hidden="true">→</b></Link>
          <Link to={`/recapitulare?nivel=${level}`}><span aria-hidden="true">↻</span><div><small>Memorie inteligentă</small><h3>Recapitulare</h3><p>{reviewStats.due ? `${reviewStats.due} ${reviewStats.due === 1 ? 'element pregătit' : 'elemente pregătite'} pentru tine.` : 'Totul este la zi pentru moment.'}</p></div><b aria-hidden="true">→</b></Link>
        </div>
      </section>
    </div>
  );
};

export default GamesHub;
