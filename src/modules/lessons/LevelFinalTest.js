import {ui} from '../../languages/messages.js';
import {courseLocalStorage as localStorage} from '../../languages/storage.js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseCatalog } from '../../content/activeContent.js';
import { CurriculumProduction } from './norwegian-program/CurriculumPractice';
import { curriculumLevels } from './curriculumMetadata';
import { buildExam, correctAnswerText, givenAnswerText, isCompleteAnswer, isCorrectAnswer } from './curriculumAssessment';
import { useAuth } from '../auth/AuthContext';
import { finalTestKey } from '../../services/curriculumProgress';
import { syncLearningProgress } from '../../services/supabaseLearning';
import { speakNorwegian } from '../../services/norwegianSpeech';
import { saveReviewItem } from '../../services/spacedReview';
import { recordStudyActivity } from '../../services/learningActivity';
import { ExerciseLayout } from '../exercises/ExerciseUI';
import './LevelFinalTest.css';

export { buildExam } from './curriculumAssessment';
const PASS_PERCENT = 70;
const readBest = (level, user) => {
  const value = Number(localStorage.getItem(finalTestKey(level, 'best', user)));
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
};
const scoreMessage = (percent) => {
  if (percent >= 90) return { title: 'Foarte bine la exercițiile de recapitulare!', text: 'Ai rezolvat cu siguranță majoritatea sarcinilor cu răspuns fix. Continuă cu scrierea și vorbirea de mai jos.', tone: 'excellent' };
  if (percent >= 75) return { title: 'Un rezultat bun!', text: 'Revizuiește răspunsurile marcate și folosește expresiile într-un text și într-o conversație proprie.', tone: 'good' };
  if (percent >= 55) return { title: 'Ai puncte clare de consolidat', text: 'Reia lecțiile indicate la greșeli și verifică dacă poți folosi expresiile fără variante de răspuns.', tone: 'medium' };
  return { title: 'Reia secțiunile care au nevoie de practică', text: 'Folosește explicațiile de mai jos, revino la dialoguri și încearcă din nou după recapitulare.', tone: 'practice' };
};

const FinalTestSession = ({ course, user }) => {
  const questions = useMemo(() => buildExam(course), [course]);
  const startedAt = useRef(Date.now());
  const finishing = useRef(false);
  const audioController = useRef(null);
  const heading = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [bestScore, setBestScore] = useState(() => readBest(course.code, user));
  const [audioError, setAudioError] = useState('');
  const current = questions[currentIndex];
  const answer = current ? answers[current.id] : undefined;
  const answeredCount = questions.filter((question) => isCompleteAnswer(question, answers[question.id])).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const correctCount = questions.filter((question) => isCorrectAnswer(question, answers[question.id])).length;
  const percent = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
  const feedback = scoreMessage(percent);
  const passed = percent >= PASS_PERCENT;
  const nextLevel = curriculumLevels[curriculumLevels.findIndex((level) => level.code === course.code) + 1]?.code;
  const productionLesson = [...course.lessons].reverse().find((lesson) => lesson.kind === 'consolidation') || course.lessons[course.lessons.length - 1];
  const courseLink = `/invata?nivel=${course.code}`;
  const selectedIndexes = current?.type === 'order' && Array.isArray(answer) ? answer : [];

  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus();
    setAudioError('');
    return () => audioController.current?.abort();
  }, [currentIndex, submitted]);

  const chooseWord = (wordIndex) => setAnswers((all) => {
    const selected = all[current.id] || [];
    if (selected.includes(wordIndex) || selected.length >= current.answer.length) return all;
    return { ...all, [current.id]: [...selected, wordIndex] };
  });
  const removeWord = (position) => setAnswers((all) => ({ ...all, [current.id]: (all[current.id] || []).filter((_, index) => index !== position) }));
  const playAudio = async (slow = false) => {
    audioController.current?.abort();
    const controller = new AbortController();
    audioController.current = controller;
    setAudioError('');
    try {
      const result = await speakNorwegian(current.audioText, { slow, signal: controller.signal });
      if (!controller.signal.aborted && result?.ok === false && !result.cancelled) setAudioError('Înregistrarea nu a putut fi redată. Încearcă din nou.');
    } catch (_) {
      if (!controller.signal.aborted) setAudioError('Înregistrarea nu a putut fi redată. Încearcă din nou.');
    }
  };
  const finish = () => {
    if (finishing.current || submitted || !allAnswered) return;
    finishing.current = true;
    const nextBest = Math.max(readBest(course.code, user), bestScore, percent);
    const previewMode = new URLSearchParams(window.location.search).has('preview');
    if (!previewMode) {
      localStorage.setItem(finalTestKey(course.code, 'best', user), String(nextBest));
      if (passed) localStorage.setItem(finalTestKey(course.code, 'passed', user), 'true');
      void syncLearningProgress(finalTestKey(course.code, 'best', user), nextBest).catch(console.warn);
      if (passed) void syncLearningProgress(finalTestKey(course.code, 'passed', user), true).catch(console.warn);
      questions.filter((question) => !isCorrectAnswer(question, answers[question.id])).forEach((question) => {
        saveReviewItem({ id: question.id, level: course.code, lessonId: question.lessonId, lessonUid: question.lessonUid, source: 'final-test', prompt: question.type === 'audio' ? `Ce înseamnă „${question.audioText}”?` : question.prompt, answer: correctAnswerText(question) });
      });
      recordStudyActivity({ type: 'final-test', level: course.code, minutes: Math.max(1, Math.round((Date.now() - startedAt.current) / 60000)), score: percent });
    }
    setBestScore(nextBest);
    setSubmitted(true);
  };
  const restart = () => {
    startedAt.current = Date.now();
    finishing.current = false;
    setAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
  };

  if (!questions.length) return <ExerciseLayout className="final-test" level={course.code} title={ui('web_bc7e06c250027f68')} icon="quiz" backTo={courseLink} backLabel={"Cursul " + course.code}><p>{ui('web_c15c95ad5b65374b')}</p></ExerciseLayout>;

  if (submitted) return (
    <ExerciseLayout className="final-test final-test--result" level={course.code} title={ui('web_bc7e06c250027f68')} compact backTo={courseLink} backLabel={"Cursul " + course.code}>
      <header className={`final-result final-result--${feedback.tone}`}>
        <div><span>{ui('web_0bc92c4e93a21cbd')}{course.code}</span><h1 ref={heading} tabIndex={-1}>{feedback.title}</h1><p>{feedback.text}</p>{passed && <div className="final-result__passed">{ui('web_5b7cf1d2406b5363')}{PASS_PERCENT}%</div>}</div>
        <div className="final-result__score"><strong>{percent}%</strong><span>{correctCount}{ui('ui_dbd8b6478643d623')}{questions.length}{ui('web_46b0458e0186fc59')}</span></div>
      </header>
      <section className="final-summary" aria-label={ui('web_01dd8940b351cf9e')}><div><small>{ui('ui_8871b4813f3253e4')}</small><strong>{correctCount}{ui('ui_dbd8b6478643d623')}{questions.length}</strong></div><div><small>{ui('web_e7105a1c66152b75')}</small><strong>{bestScore}%</strong></div><div><small>{ui('web_69e3407ed9826317')}</small><strong>{questions.length - correctCount}</strong></div></section>
      <section className="final-review">
        <div className="final-review__heading"><div><span>{ui('web_2e6e39bc9e527d0a')}</span><h2>{ui('web_1442d471506f17f5')}</h2></div><button type="button" onClick={restart}>{ui('web_65273187e53f635e')}</button></div>
        {questions.map((question, index) => {
          const correct = isCorrectAnswer(question, answers[question.id]);
          return <article className={correct ? 'correct' : 'wrong'} key={question.id}><div aria-hidden="true">{correct ? '✓' : '×'}</div><div><small>{ui('web_d3526d8dd6340992')}{index + 1} · {question.sectionTitle}{ui('ui_a2ba73094f24b2ce')}{question.lessonId}</small><h3>{question.type === 'audio' ? `Ascultare: „${question.audioText}”` : question.prompt}</h3><p>{ui('ui_0c46929809fbd9a6')}<strong>{givenAnswerText(question, answers[question.id])}</strong></p>{!correct && <p className="correct-answer">{ui('web_0ae463faac65307a')}<strong>{correctAnswerText(question)}</strong></p>}<small className="explanation">{question.explanation}</small>{!correct && <Link to={`/curs/${course.code.toLowerCase()}/${question.lessonId}`}>{ui('web_f763a29346cdbaaa')}</Link>}</div></article>;
        })}
      </section>
      <section aria-labelledby="final-production-title">
        <div className="final-review__heading"><div><span>{ui('web_b07a57d56429e866')}</span><h2 id="final-production-title">{ui('web_4686fc3e41901e1e')}</h2><p>{ui('web_2ffe9d640744b99e')}</p></div></div>
        {productionLesson && <CurriculumProduction key={productionLesson.uid} lesson={productionLesson} level={course.code} />}
      </section>
      <div className="final-result__actions">{passed && nextLevel ? <Link className="next-level" to={`/invata?nivel=${nextLevel}`}>{ui('web_cfd688c7d2681196')}{nextLevel} →</Link> : <Link to={courseLink}>{ui('web_d71662fa7b58200e')}{course.code}</Link>}<button type="button" onClick={restart}>{ui('web_a09d291920163176')}</button></div>
    </ExerciseLayout>
  );

  return (
    <ExerciseLayout className="final-test" level={course.code} title={ui('web_bc7e06c250027f68')} compact backTo={courseLink} backLabel={"Cursul " + course.code}>
      <div className="final-test__layout">
        <details className="final-test__map"><summary>{ui('web_cd6ccffe06903b4d')}<span>{answeredCount} / {questions.length}{ui('web_1753f7c092360522')}</span></summary><div aria-label={ui('web_ce98922190488090')}>{questions.map((question, index) => {
          const complete = isCompleteAnswer(question, answers[question.id]);
          return <button type="button" onClick={() => setCurrentIndex(index)} aria-label={`Întrebarea ${index + 1}${complete ? ', completată' : ''}`} aria-current={index === currentIndex ? 'step' : undefined} className={`${index === currentIndex ? 'active' : ''} ${complete ? 'answered' : ''}`} key={question.id}>{complete ? '✓' : index + 1}</button>;
        })}</div><small>{answeredCount}{ui('ui_dbd8b6478643d623')}{questions.length}{ui('web_1753f7c092360522')}</small></details>
        <section className="final-question">
          <div className="final-question__meta"><span>{current.category} · {current.sectionTitle}</span><strong>{ui('web_d3526d8dd6340992')}{currentIndex + 1} / {questions.length}</strong></div>
          <div className="final-question__progress" role="progressbar" aria-label={ui('web_1b9bbb431f601b40')} aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={answeredCount}><span style={{ width: `${(answeredCount / questions.length) * 100}%` }} /></div>
          <h2 ref={heading} tabIndex={-1}>{current.prompt}</h2>
          {current.type === 'audio' && <div className="final-question__audio"><button type="button" onClick={() => playAudio()}><span aria-hidden="true">▶</span>{ui('web_0ff3bacc34effb16')}</button><button type="button" onClick={() => playAudio(true)}>{ui('web_3de3b42e77366c93')}</button></div>}
          {audioError && <p role="alert">{audioError}</p>}
          {(current.type === 'choice' || current.type === 'audio') && <div className="final-question__choices">{current.options.map((option, index) => <button type="button" aria-pressed={answer === index} className={answer === index ? 'selected' : ''} onClick={() => setAnswers((all) => ({ ...all, [current.id]: index }))} key={option}><span aria-hidden="true">{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>}
          {current.type === 'fill' && <div className="final-question__fill"><label htmlFor="final-answer">{ui('ui_d6e45310ea716363')}</label><input id="final-answer" lang="nb" value={answer || ''} onChange={(event) => { const value = event.target.value; setAnswers((all) => ({ ...all, [current.id]: value })); }} placeholder="Scrie răspunsul în norvegiană" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} /></div>}
          {current.type === 'order' && <div className="final-order"><div className="final-order__sentence" aria-live="polite">{selectedIndexes.length ? selectedIndexes.map((wordIndex, position) => <button type="button" onClick={() => removeWord(position)} aria-label={`Elimină ${current.words[wordIndex]}`} key={`${wordIndex}-${position}`}>{current.words[wordIndex]}</button>) : <span>{ui('web_539f434f1de2feba')}</span>}</div><div className="final-order__bank">{current.words.map((word, index) => <button type="button" disabled={selectedIndexes.includes(index)} onClick={() => chooseWord(index)} key={`${word}-${index}`}>{word}</button>)}</div></div>}
          <footer className="final-question__nav"><button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => index - 1)}>{ui('web_a354f4064be3dfef')}</button>{currentIndex < questions.length - 1 ? <button className="primary" type="button" disabled={!isCompleteAnswer(current, answer)} onClick={() => setCurrentIndex((index) => index + 1)}>{ui('web_1ca56338f00ca56b')}</button> : <button className="primary" type="button" disabled={!allAnswered} onClick={finish}>{ui('web_34382c445af04ed2')}</button>}</footer>
        </section>
      </div>
    </ExerciseLayout>
  );
};

const LevelFinalTest = ({ match }) => {
  const { user } = useAuth();
  const requestedLevel = ((match?.params?.level) || 'a1').toUpperCase();
  const course = courseCatalog[requestedLevel] || courseCatalog.A1;
  return <FinalTestSession key={`${course.code}-${user?.id || 'guest'}`} course={course} user={user} />;
};
export default LevelFinalTest;
