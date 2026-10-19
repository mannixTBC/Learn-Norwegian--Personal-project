import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { courseCatalog } from '../lessons/norwegian-program/lessonContent';
import { getLearningLevel } from '../lessons/learningLevel';
import { useAuth } from '../auth/AuthContext';
import { speakNorwegian } from '../../services/norwegianSpeech';
import { saveReviewItem } from '../../services/spacedReview';
import { recordStudyActivity } from '../../services/learningActivity';
import { ExerciseExitDialog, ExerciseLayout, ExerciseLessonSelect } from './ExerciseUI';
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
  const [screen, setScreen] = useState('setup');
  const [lessonFilter, setLessonFilter] = useState('all');
  const [difficulty, setDifficulty] = useState('normal');
  const [length, setLength] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selected, setSelected] = useState([]);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState([]);
  const [hint, setHint] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [retry, setRetry] = useState(false);
  const [setupError, setSetupError] = useState('');
  const questionTitle = useRef(null);
  const answered = useRef(false);
  const moving = useRef(false);
  const finished = useRef(false);
  const startedAt = useRef(0);
  const question = questions[current];
  const selectedLessons = useMemo(() => lessonFilter === 'all' ? course.lessons : course.lessons.filter((lesson) => lesson.id === Number(lessonFilter)), [course, lessonFilter]);
  const score = results.filter((result) => result.correct).length;
  const mistakes = results.filter((result) => !result.correct);
  const given = game === 'order' && question ? selected.map((index) => question.words[index]).join(' ') : answer;
  const completeAnswer = game === 'order' ? selected.length === question?.words.length : Boolean(answer.trim());
  const isCorrect = () => (question.acceptedAnswers || [question.answer]).some((accepted) => normalizePracticeAnswer(given) === normalizePracticeAnswer(accepted));

  useEffect(() => {
    moving.current = false;
    window.scrollTo?.({ top: 0, behavior: 'auto' });
    if (screen !== 'setup') questionTitle.current?.focus();
  }, [screen, current]);

  const resetAnswer = () => { answered.current = false; setAnswer(''); setSelected([]); setChecked(false); setHint(false); };
  const begin = (pool, isRetry = false) => {
    if (!pool.length) { setSetupError('Alege altă lecție pentru o sesiune cu suficiente răspunsuri distincte.'); return; }
    resetAnswer(); setRetry(isRetry); setQuestions(pool); setCurrent(0); setResults([]); setSetupError(''); setScreen('game'); finished.current = false; startedAt.current = Date.now();
  };
  const start = () => begin(shufflePractice(createPracticeQuestions(selectedLessons, game, difficulty)).slice(0, length));
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

  if (screen === 'setup') return <ExerciseLayout className="practice-game" level={level} icon={game} title={info.title} description={info.subtitle} allowLevelChange>
    <div className="game-setup">
      <section className="practice-config-card"><h2>Alege ce repeți</h2><ExerciseLessonSelect course={course} value={lessonFilter} onChange={setLessonFilter} /><p className="exercise-note">{selectedLessons.length} {selectedLessons.length === 1 ? 'lecție selectată' : 'lecții selectate'} · {level}</p></section>
      {game === 'quiz' && <fieldset className="practice-config-card"><legend>Dificultate</legend><div className="difficulty-options">{[['easy', 'Ușor', 'Trei variante'], ['normal', 'Normal', 'Patru variante'], ['hard', 'Dificil', 'Scrii răspunsul']].map(([value, label, description]) => <button type="button" aria-pressed={difficulty === value} className={difficulty === value ? 'active' : ''} onClick={() => setDifficulty(value)} key={value}><strong>{label}</strong><small>{description}</small></button>)}</div></fieldset>}
      <fieldset className="practice-config-card"><legend>Lungimea sesiunii</legend><div className="length-options">{[5, 10, 15].map((value) => <button type="button" aria-pressed={length === value} className={length === value ? 'active' : ''} onClick={() => setLength(value)} key={value}><strong>{value}</strong><span>întrebări</span></button>)}</div></fieldset>
      {setupError && <p className="practice-error" role="alert">{setupError}</p>}
      <button type="button" className="start-game exercise-primary" onClick={start}>Începe sesiunea <span aria-hidden="true">→</span></button>
    </div>
  </ExerciseLayout>;

  if (screen === 'result') return <ExerciseLayout className="practice-game" level={level} icon={game} title={info.title} compact>
    <section className="game-result"><span className="game-result__icon" aria-hidden="true">{mistakes.length ? '↗' : '✓'}</span><p>Sesiune finalizată · {level}</p><h1 ref={questionTitle} tabIndex={-1}>{mistakes.length ? 'Încă un pas înainte' : 'Le-ai rezolvat pe toate!'}</h1><div className="game-result__score">{Math.round(score / results.length * 100)}<small>%</small></div><p>{score} din {results.length} răspunsuri corecte</p><div className="game-result__actions">{mistakes.length > 0 && <button type="button" className="exercise-primary" onClick={() => begin(mistakes.map((item) => item.question), true)}>Repetă greșelile ({mistakes.length})</button>}<button type="button" className={mistakes.length ? 'exercise-secondary' : 'exercise-primary'} onClick={() => setScreen('setup')}>Sesiune nouă</button><Link to={'/jocuri?nivel=' + level}>Înapoi la jocuri</Link></div></section>
    {mistakes.length > 0 && <section className="mistake-summary"><h2>De repetat</h2>{mistakes.map((result) => <article key={result.question.id}><span>{result.question.prompt}</span><strong lang={game === 'quiz' && result.question.type === 'choice' ? 'ro' : 'nb'}>{result.question.answer}</strong></article>)}</section>}
  </ExerciseLayout>;

  const correct = checked && isCorrect();
  return <ExerciseLayout className="practice-game practice-game--session" level={level} icon={game} title={info.title} compact onExit={() => setShowExit(true)}>
    <div className="session-header"><span>Întrebarea {current + 1} din {questions.length}</span><strong>{score} corecte</strong><div role="progressbar" aria-label="Progresul sesiunii" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={results.length}><span style={{ width: results.length / questions.length * 100 + '%' }} /></div></div>
    <section className="game-question"><p className="question-meta">Lecția {question.lessonId} · {level}</p><h1 ref={questionTitle} tabIndex={-1}>{game === 'word' ? 'Ce expresie se ascunde aici?' : question.prompt}</h1>
      {game === 'word' && <div className="word-clue"><small>Sensul în română</small><strong>{question.prompt}</strong><div className="word-clue__slots" aria-hidden="true">{question.answer.split(/\s+/).map((word, wordIndex) => <span key={wordIndex}>{Array.from(word).map((char, index) => <i key={index}>{!/[\p{L}\p{N}]/u.test(char) || (hint && wordIndex === 0 && index === 0) ? char : '·'}</i>)}</span>)}</div><p lang="nb">{maskExample(question.example, question.answer)}</p><button type="button" className="hint-button" onClick={() => setHint(true)} disabled={hint}>{hint ? 'Indiciul este afișat' : 'Arată prima literă'}</button></div>}
      {game === 'quiz' && question.type === 'choice' && <div className="game-choices" role="group" aria-label="Alege răspunsul">{question.options.map((option, index) => { const state = checked ? option === question.answer ? 'correct' : answer === option ? 'wrong' : '' : answer === option ? 'selected' : ''; return <button type="button" disabled={checked} aria-pressed={answer === option} className={state} onClick={() => setAnswer(option)} key={option}><span aria-hidden="true">{String.fromCharCode(65 + index)}</span><strong>{option}</strong><b aria-hidden="true">{state === 'correct' ? '✓' : state === 'wrong' ? '×' : answer === option ? '●' : ''}</b></button>; })}</div>}
      {((game === 'quiz' && question.type === 'text') || game === 'word') && <form className="practice-answer" onSubmit={(event) => { event.preventDefault(); if (!checked) verify(); }}><label htmlFor="practice-answer">Răspunsul tău în norvegiană</label><input id="practice-answer" className="game-input" lang="nb" autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} enterKeyHint="done" disabled={checked} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Scrie aici…" /></form>}
      {game === 'order' && <><div className="order-zone" aria-label="Propoziția ta"><small>Propoziția ta</small><div>{selected.length ? selected.map((wordIndex, index) => <button type="button" lang="nb" disabled={checked} onClick={() => setSelected((all) => all.filter((_, position) => position !== index))} aria-label={'Elimină ' + question.words[wordIndex] + ' din poziția ' + (index + 1)} key={wordIndex}>{question.words[wordIndex]}<span aria-hidden="true">×</span></button>) : <p>Atinge cuvintele de mai jos, în ordinea potrivită.</p>}</div></div><div className="order-bank" aria-label="Cuvinte disponibile">{question.words.map((word, index) => <button type="button" lang="nb" disabled={checked || selected.includes(index)} aria-pressed={selected.includes(index)} onClick={() => setSelected((all) => all.includes(index) ? all : [...all, index])} key={index}>{word}</button>)}</div><p className="exercise-note">Atinge un cuvânt din propoziție pentru a-l pune înapoi.</p></>}
      {checked && <div role="status" className={'game-feedback ' + (correct ? 'correct' : 'wrong')}><span aria-hidden="true">{correct ? '✓' : '↻'}</span><div><h2>{correct ? 'Corect!' : 'Reține pentru data viitoare'}</h2><p>{correct ? question.example || question.explanation || 'Ai găsit răspunsul potrivit.' : 'Răspunsul corect: ' + question.answer}</p>{game === 'word' && <button type="button" onClick={() => speakNorwegian(question.answer)}>Ascultă pronunția</button>}</div></div>}
    </section>
    <footer className="session-actions"><button type="button" className="exercise-primary" disabled={!checked && !completeAnswer} onClick={checked ? next : verify}>{checked ? current === questions.length - 1 ? 'Vezi rezultatul' : 'Continuă' : 'Verifică răspunsul'} <span aria-hidden="true">→</span></button></footer>
    {showExit && <ExerciseExitDialog onContinue={() => setShowExit(false)} onExit={() => { setShowExit(false); setScreen('setup'); }} />}
  </ExerciseLayout>;
};

const PracticeGame = ({ game }) => {
  const { user } = useAuth();
  const location = useLocation();
  const level = getLearningLevel(location.search);
  return <PracticeSession key={(user?.id || 'guest') + '-' + level + '-' + game} game={game} level={level} user={user} />;
};
export default PracticeGame;
