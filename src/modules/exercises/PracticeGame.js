import React, { useEffect, useRef, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { courseCatalog } from '../lessons/norwegian-program/lessonContent';
import { getLearningLevel } from '../lessons/learningLevel';
import { useAuth } from '../auth/AuthContext';
import { speakNorwegian } from '../../services/norwegianSpeech';
import { saveReviewItem } from '../../services/spacedReview';
import { recordStudyActivity } from '../../services/learningActivity';
import { ExerciseLayout } from './ExerciseUI';
import { createPracticeQuestions, normalizePracticeAnswer, saveGameProgress, shufflePractice } from './practiceGameData';
import './PracticeGame.css';

const gameInfo = {
  quiz: { title: 'Chestionar', subtitle: 'Recunoaște și folosește expresiile din lecțiile tale.' },
  order: { title: 'Construiește propoziția', subtitle: 'Atinge cuvintele și așază-le în ordinea corectă.' },
  word: { title: 'Descoperă cuvântul', subtitle: 'Pornește de la sens și găsește expresia în norvegiană.' },
};
const maskExample = (example, answer) => {
  const index = example.toLocaleLowerCase('nb-NO').indexOf(answer.toLocaleLowerCase('nb-NO'));
  return index < 0 ? example : example.slice(0, index) + '_____ ' + example.slice(index + answer.length);
};

const PracticeSession = ({ game, level, user }) => {
  const course = courseCatalog[level];
  const info = gameInfo[game];
  const history = useHistory();
  const createSession = () => shufflePractice(createPracticeQuestions(course.lessons, game, 'normal')).slice(0, 5);
  const [screen, setScreen] = useState('game');
  const [questions, setQuestions] = useState(createSession);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selected, setSelected] = useState([]);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState([]);
  const [hint, setHint] = useState(false);
  const [retry, setRetry] = useState(false);
  const questionTitle = useRef(null);
  const audioController = useRef(null);
  const answered = useRef(false);
  const moving = useRef(false);
  const finished = useRef(false);
  const startedAt = useRef(Date.now());
  const question = questions[current];
  const score = results.filter((result) => result.correct).length;
  const mistakes = results.filter((result) => !result.correct);
  const given = game === 'order' && question ? selected.map((index) => question.words[index]).join(' ') : answer;
  const completeAnswer = game === 'order' ? selected.length === question?.words.length : Boolean(answer.trim());
  const isCorrect = () => (question.acceptedAnswers || [question.answer]).some((accepted) => normalizePracticeAnswer(given) === normalizePracticeAnswer(accepted));

  useEffect(() => {
    moving.current = false;
    audioController.current?.abort();
    window.scrollTo?.({ top: 0, behavior: 'auto' });
    questionTitle.current?.focus();
  }, [screen, current]);
  useEffect(() => () => audioController.current?.abort(), []);

  const playAnswer = () => {
    audioController.current?.abort();
    const controller = new AbortController();
    audioController.current = controller;
    void speakNorwegian(question.answer, { signal: controller.signal });
  };

  const resetAnswer = () => { answered.current = false; setAnswer(''); setSelected([]); setChecked(false); setHint(false); };
  const begin = (pool, isRetry = false) => {
    if (!pool.length) return;
    resetAnswer(); setRetry(isRetry); setQuestions(pool); setCurrent(0); setResults([]); setScreen('game'); finished.current = false; startedAt.current = Date.now();
  };
  const start = () => begin(createSession());
  const verify = () => {
    if (answered.current || !completeAnswer) return;
    answered.current = true;
    const correct = isCorrect();
    setChecked(true); setResults((all) => [...all, { question, correct, given }]);
    if (!correct) saveReviewItem({ id: 'practice-' + level + '-' + question.id, level, lessonId: question.lessonId, source: 'practice', prompt: question.prompt, answer: question.answer });
  };
  const next = () => {
    if (!checked || moving.current) return;
    moving.current = true;
    if (current < questions.length - 1) { resetAnswer(); setCurrent((value) => value + 1); return; }
    if (finished.current) return;
    finished.current = true;
    if (!retry) saveGameProgress(localStorage, game, level, user?.id, results);
    recordStudyActivity({ type: 'practice-' + game, level, minutes: Math.max(1, Math.round((Date.now() - startedAt.current) / 60000)), score: Math.round(score / questions.length * 100), retry });
    setScreen('result');
  };

  if (screen === 'result') return <ExerciseLayout className="practice-game" level={level} icon={game} title={info.title} compact>
    <section className="game-result"><span className="game-result__icon" aria-hidden="true">{mistakes.length ? '↗' : '✓'}</span><p>Sesiune finalizată · {level}</p><h1 ref={questionTitle} tabIndex={-1}>{mistakes.length ? 'Încă un pas înainte' : 'Le-ai rezolvat pe toate!'}</h1><div className="game-result__score">{Math.round(score / results.length * 100)}<small>%</small></div><p>{score} din {results.length} răspunsuri corecte</p><div className="game-result__actions">{mistakes.length > 0 && <button type="button" className="exercise-primary" onClick={() => begin(mistakes.map((item) => item.question), true)}>Repetă greșelile ({mistakes.length})</button>}<button type="button" className={mistakes.length ? 'exercise-secondary' : 'exercise-primary'} onClick={start}>Sesiune nouă</button><Link to={'/jocuri?nivel=' + level}>Înapoi la jocuri</Link></div></section>
    {mistakes.length > 0 && <section className="mistake-summary"><h2>De repetat</h2>{mistakes.map((result) => <article key={result.question.id}><span>{result.question.prompt}</span><strong lang={game === 'quiz' && result.question.type === 'choice' ? 'ro' : 'nb'}>{result.question.answer}</strong></article>)}</section>}
  </ExerciseLayout>;

  if (!question) return <ExerciseLayout className="practice-game" level={level} title={info.title} icon={game}><p role="alert">Nu sunt întrebări disponibile pentru această sesiune.</p><Link to={'/jocuri?nivel=' + level}>Înapoi la jocuri</Link></ExerciseLayout>;

  const correct = checked && isCorrect();
  return <ExerciseLayout className="practice-game practice-game--session" level={level} icon={game} title={info.title} compact onExit={() => history.push('/jocuri?nivel=' + level)}>
    <div className="session-header"><span>Întrebarea {current + 1} din {questions.length}</span><strong>{score} corecte</strong><div role="progressbar" aria-label="Progresul sesiunii" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={results.length}><span style={{ width: results.length / questions.length * 100 + '%' }} /></div></div>
    <section className="game-question"><p className="question-meta">Lecția {question.lessonId} · {level}</p><h1 ref={questionTitle} tabIndex={-1}>{game === 'word' ? 'Ce expresie se ascunde aici?' : question.prompt}</h1>
      {game === 'word' && <div className="word-clue"><small>Sensul în română</small><strong>{question.prompt}</strong><div className="word-clue__slots" aria-hidden="true">{question.answer.split(/\s+/).map((word, wordIndex) => <span key={wordIndex}>{Array.from(word).map((char, index) => <i key={index}>{!/[\p{L}\p{N}]/u.test(char) || (hint && wordIndex === 0 && index === 0) ? char : '·'}</i>)}</span>)}</div><p lang="nb">{maskExample(question.example, question.answer)}</p><button type="button" className="hint-button" onClick={() => setHint(true)} disabled={hint}>{hint ? 'Indiciul este afișat' : 'Arată prima literă'}</button></div>}
      {game === 'quiz' && question.type === 'choice' && <div className="game-choices" role="group" aria-label="Alege răspunsul">{question.options.map((option, index) => { const state = checked ? option === question.answer ? 'correct' : answer === option ? 'wrong' : '' : answer === option ? 'selected' : ''; return <button type="button" disabled={checked} aria-pressed={answer === option} className={state} onClick={() => setAnswer(option)} key={option}><span aria-hidden="true">{String.fromCharCode(65 + index)}</span><strong>{option}</strong><b aria-hidden="true">{state === 'correct' ? '✓' : state === 'wrong' ? '×' : answer === option ? '●' : ''}</b></button>; })}</div>}
      {((game === 'quiz' && question.type === 'text') || game === 'word') && <form className="practice-answer" onSubmit={(event) => { event.preventDefault(); if (!checked) verify(); }}><label htmlFor="practice-answer">Răspunsul tău în norvegiană</label><input id="practice-answer" className="game-input" lang="nb" autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} enterKeyHint="done" disabled={checked} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Scrie aici…" /></form>}
      {game === 'order' && <><div className="order-zone" aria-label="Propoziția ta"><small>Propoziția ta</small><div>{selected.length ? selected.map((wordIndex, index) => <button type="button" lang="nb" disabled={checked} onClick={() => setSelected((all) => all.filter((_, position) => position !== index))} aria-label={'Elimină ' + question.words[wordIndex] + ' din poziția ' + (index + 1)} key={wordIndex}>{question.words[wordIndex]}<span aria-hidden="true">×</span></button>) : <p>Atinge cuvintele de mai jos, în ordinea potrivită.</p>}</div></div><div className="order-bank" aria-label="Cuvinte disponibile">{question.words.map((word, index) => <button type="button" lang="nb" disabled={checked || selected.includes(index)} aria-pressed={selected.includes(index)} onClick={() => setSelected((all) => all.includes(index) ? all : [...all, index])} key={index}>{word}</button>)}</div><p className="exercise-note">Atinge un cuvânt din propoziție pentru a-l pune înapoi.</p></>}
      {checked && <div role="status" className={'game-feedback ' + (correct ? 'correct' : 'wrong')}><span aria-hidden="true">{correct ? '✓' : '↻'}</span><div><h2>{correct ? 'Corect!' : 'Reține pentru data viitoare'}</h2><p>{correct ? question.example || question.explanation || 'Ai găsit răspunsul potrivit.' : 'Răspunsul corect: ' + question.answer}</p>{game === 'word' && <button type="button" onClick={playAnswer}>Ascultă pronunția</button>}</div></div>}
    </section>
    <footer className="session-actions"><button type="button" className="exercise-primary" disabled={!checked && !completeAnswer} onClick={checked ? next : verify}>{checked ? current === questions.length - 1 ? 'Vezi rezultatul' : 'Continuă' : 'Verifică răspunsul'} <span aria-hidden="true">→</span></button></footer>
  </ExerciseLayout>;
};

const PracticeGame = ({ game }) => {
  const { user } = useAuth();
  const location = useLocation();
  const level = getLearningLevel(location.search);
  return <PracticeSession key={(user?.id || 'guest') + '-' + level + '-' + game} game={game} level={level} user={user} />;
};
export default PracticeGame;
