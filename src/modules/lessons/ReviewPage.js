import React, { useEffect, useRef, useState } from 'react';
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
import { getLearningLevel } from './learningLevel';
import { ExerciseLayout } from '../exercises/ExerciseUI';
import './ReviewPage.css';

const ratings = [
  { id: 'again', label: 'Mai repet', help: 'Nu mi-am amintit', tone: 'again' },
  { id: 'hard', label: 'Greu', help: 'Am ezitat', tone: 'hard' },
  { id: 'good', label: 'Știu', help: 'Mi-am amintit', tone: 'good' },
];

const ReviewSession = ({ level }) => {
  const ratedRef = useRef(false);
  const promptRef = useRef(null);
  const answerRef = useRef(null);
  const ratingsRef = useRef(null);
  const [queue, setQueue] = useState(() => getDueReviewItems(level));
  const [sessionTotal, setSessionTotal] = useState(() => getDueReviewItems(level).length);
  const [revealed, setRevealed] = useState(false);
  const [sessionRatings, setSessionRatings] = useState({ again: 0, hard: 0, good: 0 });
  const current = queue[0];
  const reviewed = sessionTotal - queue.length;
  const stats = getReviewStats(level);
  const allLevelItems = getReviewItemsForLevel(level);
  const sessionFinished = sessionTotal > 0 && queue.length === 0;

  useEffect(() => { ratedRef.current = false; promptRef.current?.focus(); }, [current?.id]);

  useEffect(() => {
    if (!revealed) return;
    answerRef.current?.focus({ preventScroll: true });
    ratingsRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [revealed]);

  const rateCurrent = (rating) => {
    if (!current || !revealed || ratedRef.current) return;
    ratedRef.current = true;
    rateReviewItem(current.id, rating);
    if (queue.length === 1) recordStudyActivity({ type: 'review', level, minutes: Math.max(1, Math.ceil(sessionTotal / 2)), reviewed: sessionTotal });
    setSessionRatings((values) => ({ ...values, [rating]: values[rating] + 1 }));
    setQueue((items) => items.slice(1));
    setRevealed(false);
  };

  const startExtraReview = () => {
    ratedRef.current = false;
    const scheduled = getReviewItemsForLevel(level).slice(0, 10);
    setQueue(scheduled);
    setSessionTotal(scheduled.length);
    setSessionRatings({ again: 0, hard: 0, good: 0 });
    setRevealed(false);
  };

  return (
    <ExerciseLayout className="review-page" title="Recapitulare" description="Reia cuvintele și expresiile învățate, la momentul potrivit." icon="review" level={level} allowLevelChange>
      <details className="ng-review-stats"><summary>Progresul recapitulării · {stats.due} de repetat</summary><section className="review-overview" aria-label="Progresul recapitulării">
        <div><span>Astăzi</span><strong>{stats.due}</strong><small>elemente pregătite</small></div>
        <div><span>În învățare</span><strong>{stats.learning}</strong><small>interval sub 21 zile</small></div>
        <div><span>Fixate</span><strong>{stats.mastered}</strong><small>interval de minimum 21 zile</small></div>
      </section></details>

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
            <div className="review-progress__track" role="progressbar" aria-label="Elemente repetate" aria-valuemin={0} aria-valuemax={sessionTotal} aria-valuenow={reviewed}><span style={{ width: `${(reviewed / sessionTotal) * 100}%` }} /></div>
          </div>
          <article className={'review-card' + (revealed ? ' is-revealed' : '')}>
            <div className="review-card__top">
              <span>{level}{current.source === 'work-missions' ? ' · Situație de la serviciu' : current.lessonId ? ' · Lecția ' + current.lessonId : ''}</span>
              <span>{current.source === 'final-test' ? 'Test final' : ['practice', 'listening-game', 'work-missions'].includes(current.source) ? 'Exercițiu' : 'Lecție'}</span>
            </div>
            <p className="review-card__label">Răspunde în minte înainte să verifici</p>
            <h2 ref={promptRef} tabIndex={-1}>{current.prompt}</h2>
            {revealed ? (
              <>
                <div className="review-answer" ref={answerRef} tabIndex={-1} role="status"><small>Răspunsul corect</small><strong>{current.answer}</strong></div>

              </>
            ) : (
              <button className="review-reveal" type="button" onClick={() => setRevealed(true)}>Arată răspunsul</button>
            )}
          </article>
          {revealed && <div className="ng-review-ratings" ref={ratingsRef}><div className="review-rating-intro"><strong>Cât de ușor ți-ai amintit?</strong><span>Alegerea stabilește următoarea repetare.</span></div>
                <div className="review-rating-actions">
                  {ratings.map((rating) => (
                    <button className={`review-rating review-rating--${rating.tone}`} type="button" onClick={() => rateCurrent(rating.id)} key={rating.id}>
                      <span aria-hidden="true" className="ng-rating-icon">{rating.id === 'again' ? '↻' : rating.id === 'hard' ? '≈' : '✓'}</span><span>{rating.label}</span><small>{rating.help} · {ratingPreview(current, rating.id)}</small>
                    </button>
                  ))}
                </div></div>}
        </section>
      )}
    </ExerciseLayout>
  );
};

const ReviewPage = () => {
  const location = useLocation();
  const level = getLearningLevel(location.search);
  return <ReviewSession key={level} level={level} />;
};

export default ReviewPage;
