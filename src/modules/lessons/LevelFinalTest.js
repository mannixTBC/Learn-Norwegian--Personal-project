import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseCatalog } from './norwegian-program/lessonContent';
import { speakNorwegian } from '../../services/norwegianSpeech';
import { saveReviewItem } from '../../services/spacedReview';
import { recordStudyActivity } from '../../services/learningActivity';
import './LevelFinalTest.css';

const normalize = (value) => String(value || '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
const nextAvailableLevel = { A1: 'A2', A2: 'B1', B1: 'B2' };
const PASS_PERCENT = 70;

const buildExam = (course) => {
  const lessonQuestions = course.lessons.map((lesson, index) => {
    const exercise = lesson.exercises[index % lesson.exercises.length];
    return { ...exercise, id: `${course.code}-${lesson.id}`, lessonId: lesson.id, category: exercise.type === 'order' ? 'Construiește' : exercise.type === 'fill' ? 'Completează' : 'Alege' };
  });
  const audioLessons = [course.lessons[2], course.lessons[7]];
  const audioQuestions = audioLessons.map((lesson, index) => {
    const vocabulary = lesson.vocabulary[(index + 1) % lesson.vocabulary.length];
    const distractors = course.lessons.filter((item) => item.id !== lesson.id).slice(index, index + 3).map((item) => item.vocabulary[0][3]).filter((item) => item !== vocabulary[3]).slice(0, 3);
    const options = [vocabulary[3], ...distractors].sort((a, b) => a.localeCompare(b));
    return { id: `${course.code}-audio-${index}`, type: 'audio', category: 'Ascultă', lessonId: lesson.id, prompt: 'Ascultă fraza și alege traducerea corectă.', audioText: vocabulary[2], options, answer: options.indexOf(vocabulary[3]), explanation: `Fraza „${vocabulary[2]}” înseamnă „${vocabulary[3]}”.` };
  });
  return [...lessonQuestions.slice(0, 5), audioQuestions[0], ...lessonQuestions.slice(5), audioQuestions[1]];
};

const isCorrect = (question, answer) => {
  if (question.type === 'choice' || question.type === 'audio') return Number(answer) === question.answer;
  if (question.type === 'fill') return normalize(answer) === normalize(question.answer);
  return Array.isArray(answer) && answer.map((index) => question.words[index]).join(' ') === question.answer.join(' ');
};

const correctAnswer = (question) => {
  if (question.type === 'choice' || question.type === 'audio') return question.options[question.answer];
  return Array.isArray(question.answer) ? question.answer.join(' ') : question.answer;
};

const scoreMessage = (percent) => {
  if (percent >= 90) return { title: 'Excelent — nivel stăpânit!', text: 'Folosești vocabularul și structurile cu multă siguranță. Ești pregătit pentru următoarea etapă.', tone: 'excellent' };
  if (percent >= 75) return { title: 'Foarte bine!', text: 'Ai o bază solidă. Recapitulează răspunsurile marcate și vei fixa nivelul complet.', tone: 'good' };
  if (percent >= 55) return { title: 'Ești pe drumul cel bun', text: 'Ai înțeles ideile principale, dar câteva lecții merită revăzute înainte să continui.', tone: 'medium' };
  return { title: 'Mai exersăm puțin', text: 'Reia vocabularul și exercițiile indicate mai jos, apoi încearcă testul din nou.', tone: 'practice' };
};

const LevelFinalTest = ({ match }) => {
  const requestedLevel = ((match && match.params && match.params.level) || 'a1').toUpperCase();
  const course = courseCatalog[requestedLevel] || courseCatalog.A1;
  const testStartedAt = useRef(Date.now());
  const questions = useMemo(() => buildExam(course), [course]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem(`final_test_best_${course.code.toLowerCase()}`)) || 0);
  const current = questions[currentIndex];
  const answer = answers[current.id];
  const answered = current.type === 'order' ? Array.isArray(answer) && answer.length > 0 : answer !== undefined && String(answer).trim() !== '';
  const correctCount = questions.filter((question) => isCorrect(question, answers[question.id])).length;
  const percent = Math.round((correctCount / questions.length) * 100);
  const feedback = scoreMessage(percent);
  const passed = percent >= PASS_PERCENT;
  const nextLevel = nextAvailableLevel[course.code];

  useEffect(() => { window.scrollTo(0, 0); }, [currentIndex, submitted]);

  const chooseWord = (wordIndex) => setAnswers((all) => ({ ...all, [current.id]: [...(all[current.id] || []), wordIndex] }));
  const removeWord = (position) => setAnswers((all) => ({ ...all, [current.id]: all[current.id].filter((_, index) => index !== position) }));
  const selectedIndexes = current.type === 'order' && Array.isArray(answer) ? answer : [];
  const selectedWords = current.type === 'order' ? selectedIndexes.map((index) => current.words[index]) : [];

  const finish = () => {
    const nextBest = Math.max(bestScore, percent);
    const previewMode = new URLSearchParams(window.location.search).has('preview');
    if (!previewMode) {
      localStorage.setItem(`final_test_best_${course.code.toLowerCase()}`, String(nextBest));
      if (percent >= PASS_PERCENT) localStorage.setItem(`final_test_passed_${course.code.toLowerCase()}`, 'true');
      questions.filter((question) => !isCorrect(question, answers[question.id])).forEach((question) => {
        saveReviewItem({
          level: course.code,
          lessonId: question.lessonId,
          source: 'final-test',
          prompt: question.prompt,
          answer: correctAnswer(question),
        });
      });
      recordStudyActivity({ type: 'final-test', level: course.code, minutes: Math.max(1, Math.round((Date.now() - testStartedAt.current) / 60000)), score: percent });
      setBestScore(nextBest);
    }
    setSubmitted(true);
  };

  const restart = () => { testStartedAt.current = Date.now(); setAnswers({}); setCurrentIndex(0); setSubmitted(false); };

  if (submitted) return (
    <div className="final-test final-test--result">
      <Link className="final-test__back" to="/invata">← Înapoi la curs</Link>
      <header className={`final-result final-result--${feedback.tone}`}>
        <div><span>Evaluare finală · {course.code}</span><h1>{feedback.title}</h1><p>{feedback.text}</p>{passed && <div className="final-result__passed">✓ Test promovat · prag {PASS_PERCENT}%</div>}</div>
        <div className="final-result__score"><strong>{percent}%</strong><span>{correctCount} din {questions.length} corecte</span></div>
      </header>
      <section className="final-summary"><div><small>Punctaj obținut</small><strong>{correctCount * 10} puncte</strong></div><div><small>Cel mai bun rezultat</small><strong>{bestScore}%</strong></div><div><small>Întrebări de revăzut</small><strong>{questions.length - correctCount}</strong></div></section>
      <section className="final-review"><div className="final-review__heading"><div><span>Feedback detaliat</span><h2>Vezi ce ai stăpânit și ce repeți</h2></div><button type="button" onClick={restart}>Repetă testul</button></div>{questions.map((question, index) => { const correct = isCorrect(question, answers[question.id]); return <article className={correct ? 'correct' : 'wrong'} key={question.id}><div>{correct ? '✓' : '×'}</div><div><small>Întrebarea {index + 1} · Lecția {question.lessonId}</small><h3>{question.prompt}</h3><p>Răspunsul tău: <strong>{question.type === 'order' ? (answers[question.id] || []).map((wordIndex) => question.words[wordIndex]).join(' ') : question.type === 'choice' || question.type === 'audio' ? question.options[answers[question.id]] : answers[question.id]}</strong></p>{!correct && <p className="correct-answer">Corect: <strong>{correctAnswer(question)}</strong></p>}<small className="explanation">{question.explanation}</small></div></article>; })}</section>
      <div className="final-result__actions">{passed && nextLevel ? <Link className="next-level" to={`/invata?nivel=${nextLevel}`}>Continuă cu nivelul {nextLevel} →</Link> : <Link to="/invata">Înapoi la cursul {course.code}</Link>}<button type="button" onClick={restart}>Încearcă din nou</button></div>
    </div>
  );

  return (
    <div className="final-test">
      <Link className="final-test__back" to="/invata">← Înapoi la cursul {course.code}</Link>
      <header className="final-test__hero"><div><span>Test final · {course.code} {course.title}</span><h1>Demonstrează ce ai învățat</h1><p>{questions.length} provocări interactive din toate cele 10 lecții. Primești punctaj și feedback complet la final.</p></div><div><small>Cel mai bun scor</small><strong>{bestScore}%</strong></div></header>
      <div className="final-test__layout">
        <aside className="final-test__map"><p>Progresul testului</p><div>{questions.map((question, index) => <button type="button" onClick={() => answers[question.id] !== undefined && setCurrentIndex(index)} className={`${index === currentIndex ? 'active' : ''} ${answers[question.id] !== undefined ? 'answered' : ''}`} key={question.id}>{answers[question.id] !== undefined ? '✓' : index + 1}</button>)}</div><small>{Object.keys(answers).length} din {questions.length} rezolvate</small></aside>
        <main className="final-question">
          <div className="final-question__meta"><span>{current.category} · Lecția {current.lessonId}</span><strong>Întrebarea {currentIndex + 1} / {questions.length}</strong></div>
          <div className="final-question__progress"><span style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} /></div>
          <h2>{current.prompt}</h2>
          {current.type === 'audio' && <div className="final-question__audio"><button type="button" onClick={() => speakNorwegian(current.audioText)}><span aria-hidden="true">▶</span> Ascultă fraza</button><button type="button" onClick={() => speakNorwegian(current.audioText, { slow: true })}>Ascultă lent</button></div>}
          {(current.type === 'choice' || current.type === 'audio') && <div className="final-question__choices">{current.options.map((option, index) => <button type="button" className={Number(answer) === index ? 'selected' : ''} onClick={() => setAnswers((all) => ({ ...all, [current.id]: index }))} key={option}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>}
          {current.type === 'fill' && <div className="final-question__fill"><label htmlFor="final-answer">Răspunsul tău</label><input id="final-answer" value={answer || ''} onChange={(event) => { const value = event.target.value; setAnswers((all) => ({ ...all, [current.id]: value })); }} placeholder="Scrie răspunsul în norvegiană" autoComplete="off" /></div>}
          {current.type === 'order' && <div className="final-order"><div className="final-order__sentence">{selectedWords.length ? selectedWords.map((word, position) => <button type="button" onClick={() => removeWord(position)} key={`${word}-${position}`}>{word}</button>) : <span>Alege cuvintele în ordinea corectă</span>}</div><div className="final-order__bank">{current.words.map((word, index) => <button type="button" disabled={selectedIndexes.includes(index)} onClick={() => chooseWord(index)} key={`${word}-${index}`}>{word}</button>)}</div></div>}
          <footer className="final-question__nav"><button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => index - 1)}>← Înapoi</button>{currentIndex < questions.length - 1 ? <button className="primary" type="button" disabled={!answered} onClick={() => setCurrentIndex((index) => index + 1)}>Următoarea întrebare →</button> : <button className="primary" type="button" disabled={Object.keys(answers).length !== questions.length} onClick={finish}>Finalizează și vezi punctajul</button>}</footer>
        </main>
      </div>
    </div>
  );
};

export default LevelFinalTest;
