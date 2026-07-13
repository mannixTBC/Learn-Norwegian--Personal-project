import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  formatDueDate,
  getDueReviewItems,
  getReviewItemsForLevel,
  getReviewStats,
  rateReviewItem,
  ratingPreview,
} from '../../services/spacedReview';
import { recordStudyActivity } from '../../services/learningActivity';
import { getLearningLevel, levelName } from './learningLevel';
import './ReviewPage.css';

const ratings = [
  { id: 'again', label: 'Mai repet', help: 'Nu mi-am amintit', tone: 'again' },
  { id: 'hard', label: 'Greu', help: 'Am ezitat', tone: 'hard' },
  { id: 'good', label: 'Știu', help: 'Mi-am amintit', tone: 'good' },
];

const ReviewPage = () => {
  const location = useLocation();
  const level = getLearningLevel(location.search);
  const [queue, setQueue] = useState(() => getDueReviewItems(level));
  const [sessionTotal, setSessionTotal] = useState(() => getDueReviewItems(level).length);
  const [revealed, setRevealed] = useState(false);
  const [sessionRatings, setSessionRatings] = useState({ again: 0, hard: 0, good: 0 });
  const current = queue[0];
  const reviewed = sessionTotal - queue.length;
  const stats = getReviewStats(level);
  const allLevelItems = getReviewItemsForLevel(level);
  const sessionFinished = sessionTotal > 0 && queue.length === 0;

  useEffect(() => {
    const due = getDueReviewItems(level);
    setQueue(due);
    setSessionTotal(due.length);
    setSessionRatings({ again: 0, hard: 0, good: 0 });
    setRevealed(false);
  }, [level]);

  const rateCurrent = (rating) => {
    if (!current) return;
    rateReviewItem(current.id, rating);
    if (queue.length === 1) recordStudyActivity({ type: 'review', level, minutes: Math.max(1, Math.ceil(sessionTotal / 2)), reviewed: sessionTotal });
    setSessionRatings((values) => ({ ...values, [rating]: values[rating] + 1 }));
    setQueue((items) => items.slice(1));
    setRevealed(false);
  };

  const startExtraReview = () => {
    const scheduled = getReviewItemsForLevel(level).slice(0, 10);
    setQueue(scheduled);
    setSessionTotal(scheduled.length);
    setSessionRatings({ again: 0, hard: 0, good: 0 });
    setRevealed(false);
  };

  return (
    <div className="review-page">
      <Link className="tool-back" to={`/invata?nivel=${level}`}>← Înapoi la curs</Link>
      <header className="tool-hero review-hero">
        <div>
          <span className="tool-level">{level} · {levelName[level]}</span>
          <p>Repetare spațiată</p>
          <h1>Învață astăzi. Amintește-ți și peste o lună.</h1>
          <small>Greșelile reapar exact când memoria are nevoie de încă o repetare.</small>
        </div>
        <div className="tool-hero__stat"><strong>{stats.due}</strong><span>de repetat acum</span></div>
      </header>

      <section className="review-overview" aria-label="Progresul recapitulării">
        <div><span>Astăzi</span><strong>{stats.due}</strong><small>elemente pregătite</small></div>
        <div><span>În învățare</span><strong>{stats.learning}</strong><small>interval sub 21 zile</small></div>
        <div><span>Fixate</span><strong>{stats.mastered}</strong><small>interval de minimum 21 zile</small></div>
      </section>

      {sessionFinished ? (
        <section className="review-finished">
          <div className="review-finished__icon" aria-hidden="true">✓</div>
          <span>Sesiune finalizată</span>
          <h2>Ai repetat toate cele {sessionTotal} elemente</h2>
          <p>Următoarele apariții au fost programate automat după dificultatea aleasă.</p>
          <div className="review-finished__ratings">
            <div><strong>{sessionRatings.again}</strong><span>Mai repet</span></div>
            <div><strong>{sessionRatings.hard}</strong><span>Greu</span></div>
            <div><strong>{sessionRatings.good}</strong><span>Știu</span></div>
          </div>
          <Link to={`/invata?nivel=${level}`}>Înapoi la cursul {level} →</Link>
        </section>
      ) : !current ? (
        <section className="review-empty">
          <div className="review-empty__icon" aria-hidden="true">✓</div>
          <span>Totul este la zi</span>
          <h2>Nu ai nimic programat acum</h2>
          <p>
            {allLevelItems.length
              ? `Următoarea recapitulare este ${formatDueDate(stats.nextDueAt)}.`
              : `Continuă lecțiile nivelului ${level}. Greșelile vor fi adăugate automat aici.`}
          </p>
          <div className="review-empty__actions">
            {allLevelItems.length > 0 && <button type="button" onClick={startExtraReview}>Repetă oricum</button>}
            <Link to={`/invata?nivel=${level}`}>Continuă cursul {level} →</Link>
          </div>
        </section>
      ) : (
        <section className="review-workspace">
          <div className="review-progress">
            <div><span>Sesiunea de astăzi</span><strong>{reviewed + 1} / {sessionTotal}</strong></div>
            <div className="review-progress__track"><span style={{ width: `${(reviewed / sessionTotal) * 100}%` }} /></div>
          </div>
          <article className="review-card">
            <div className="review-card__top">
              <span>{level} · Lecția {current.lessonId}</span>
              <span>{current.source === 'final-test' ? 'Test final' : current.source === 'practice' ? 'Exercițiu' : 'Lecție'}</span>
            </div>
            <p className="review-card__label">Răspunde în minte înainte să verifici</p>
            <h2>{current.prompt}</h2>
            {revealed ? (
              <>
                <div className="review-answer"><small>Răspunsul corect</small><strong>{current.answer}</strong></div>
                <div className="review-rating-intro"><strong>Cât de ușor ți-ai amintit?</strong><span>Alegerea stabilește următoarea repetare.</span></div>
                <div className="review-rating-actions">
                  {ratings.map((rating) => (
                    <button className={`review-rating review-rating--${rating.tone}`} type="button" onClick={() => rateCurrent(rating.id)} key={rating.id}>
                      <span>{rating.label}</span><small>{rating.help} · {ratingPreview(current, rating.id)}</small>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <button className="review-reveal" type="button" onClick={() => setRevealed(true)}>Arată răspunsul</button>
            )}
          </article>
        </section>
      )}
    </div>
  );
};

export default ReviewPage;
