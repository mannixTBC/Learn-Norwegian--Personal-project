import React, { useEffect, useMemo, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { courseLessons } from './lessonContent';
import './LessonProgram.css';

const PROGRESS_KEY = 'lesson_prog_progress';
const REVIEW_KEY = 'norwegian_review_items';
const steps = ['Introducere', 'Vocabular', 'Dialog', 'Gramatică', 'Exerciții', 'Rezultat'];

const readStorage = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; }
};

const speak = (text, rate = 0.85) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'nb-NO';
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
};

const AudioButton = ({ text, slow = false }) => (
  <button className="audio-button" type="button" onClick={() => speak(text, slow ? 0.58 : 0.85)} aria-label={`Ascultă ${slow ? 'lent ' : ''}: ${text}`}>
    <span role="img" aria-hidden="true">🔊</span>{slow ? 'Lent' : 'Ascultă'}
  </button>
);

const LessonExercise = ({ exercise, index, onResult }) => {
  const [value, setValue] = useState('');
  const [selectedWords, setSelectedWords] = useState([]);
  const [checked, setChecked] = useState(false);

  const isCorrect = exercise.type === 'choice'
    ? Number(value) === exercise.answer
    : exercise.type === 'fill'
      ? value.trim().toLocaleLowerCase() === exercise.answer.toLocaleLowerCase()
      : selectedWords.join(' ') === exercise.answer.join(' ');

  const check = () => {
    if (!value && exercise.type !== 'order') return;
    if (exercise.type === 'order' && !selectedWords.length) return;
    setChecked(true);
    onResult(index, isCorrect, exercise);
  };

  const reset = () => { setValue(''); setSelectedWords([]); setChecked(false); };
  const addWord = (word, originalIndex) => setSelectedWords((words) => [...words, `${word}::${originalIndex}`]);
  const cleanWords = selectedWords.map((entry) => entry.split('::')[0]);
  const orderCorrect = exercise.type === 'order' && cleanWords.join(' ') === exercise.answer.join(' ');
  const finalCorrect = exercise.type === 'order' ? orderCorrect : isCorrect;

  const checkOrder = () => {
    if (!selectedWords.length) return;
    setChecked(true);
    onResult(index, orderCorrect, exercise);
  };

  return (
    <div className="practice-card">
      <div className="practice-card__counter">Întrebarea {index + 1}</div>
      <h3>{exercise.prompt}</h3>
      {exercise.type === 'choice' && <div className="choice-list">{exercise.options.map((option, optionIndex) => <button type="button" disabled={checked} className={Number(value) === optionIndex ? 'selected' : ''} onClick={() => setValue(String(optionIndex))} key={option}>{option}</button>)}</div>}
      {exercise.type === 'fill' && <input className="answer-input" value={value} disabled={checked} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && check()} placeholder="Scrie răspunsul aici" />}
      {exercise.type === 'order' && <><div className="sentence-builder">{cleanWords.length ? cleanWords.map((word, i) => <button type="button" disabled={checked} key={`${word}-${i}`} onClick={() => !checked && setSelectedWords((all) => all.filter((_, position) => position !== i))}>{word}</button>) : <span>Apasă cuvintele în ordinea corectă</span>}</div><div className="word-bank">{exercise.words.map((word, i) => <button type="button" disabled={checked || selectedWords.some((entry) => entry.endsWith(`::${i}`))} onClick={() => addWord(word, i)} key={`${word}-${i}`}>{word}</button>)}</div></>}
      {!checked && <button className="check-button" type="button" onClick={exercise.type === 'order' ? checkOrder : check}>Verifică răspunsul</button>}
      {checked && <div className={`answer-feedback ${finalCorrect ? 'answer-feedback--correct' : 'answer-feedback--wrong'}`} role="status"><strong>{finalCorrect ? 'Corect! Foarte bine.' : 'Mai încearcă o dată.'}</strong><p>{exercise.explanation}</p>{!finalCorrect && <p>Răspuns corect: <b>{Array.isArray(exercise.answer) ? exercise.answer.join(' ') : exercise.type === 'choice' ? exercise.options[exercise.answer] : exercise.answer}</b></p>}{!finalCorrect && <button type="button" onClick={reset}>Încearcă din nou</button>}</div>}
    </div>
  );
};

const LessonProgram = ({ match }) => {
  const history = useHistory();
  const requestedId = Number(match && match.params && match.params.lessonId) || 1;
  const lesson = courseLessons.find((item) => item.id === requestedId) || courseLessons[0];
  const [step, setStep] = useState(0);
  const [showTranslations, setShowTranslations] = useState({});
  const [answers, setAnswers] = useState({});
  const [progress, setProgress] = useState(() => readStorage(PROGRESS_KEY, { unlocked: 1, completed: [] }));
  const score = Object.values(answers).filter(Boolean).length;
  const answered = Object.keys(answers).length;
  const canFinish = answered === lesson.exercises.length;

  useEffect(() => { setStep(0); setAnswers({}); setShowTranslations({}); window.scrollTo(0, 0); }, [lesson.id]);
  useEffect(() => { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); }, [progress]);

  const reviewItems = useMemo(() => lesson.exercises.filter((_, index) => answers[index] === false), [answers, lesson.exercises]);

  const recordResult = (index, correct, exercise) => {
    setAnswers((current) => ({ ...current, [index]: correct }));
    if (!correct) {
      const stored = readStorage(REVIEW_KEY, []);
      const item = { lessonId: lesson.id, prompt: exercise.prompt, answer: Array.isArray(exercise.answer) ? exercise.answer.join(' ') : exercise.type === 'choice' ? exercise.options[exercise.answer] : exercise.answer };
      const unique = stored.filter((entry) => !(entry.lessonId === item.lessonId && entry.prompt === item.prompt));
      localStorage.setItem(REVIEW_KEY, JSON.stringify([...unique, item]));
    }
  };

  const finishLesson = () => {
    if (!canFinish) return;
    setProgress((current) => ({ unlocked: Math.max(current.unlocked || 1, Math.min(lesson.id + 1, courseLessons.length)), completed: Array.from(new Set([...(current.completed || []), lesson.id])) }));
    setStep(5);
    window.scrollTo(0, 0);
  };

  const next = () => { if (step === 4) finishLesson(); else { setStep((current) => Math.min(current + 1, 5)); window.scrollTo(0, 0); } };
  const previous = () => { setStep((current) => Math.max(current - 1, 0)); window.scrollTo(0, 0); };
  const goNextLesson = () => { const nextId = Math.min(lesson.id + 1, courseLessons.length); history.push(`/curs/a1/${nextId}`); };

  return (
    <div className="lesson-shell">
      <header className="lesson-topbar"><Link to="/invata">← Cursul A1</Link><div><span>Lecția {lesson.id} din {courseLessons.length}</span><strong>{lesson.title}</strong></div><span>{lesson.duration} min</span></header>
      <div className="lesson-stepper" aria-label="Progresul lecției">{steps.map((label, index) => <button type="button" key={label} className={`${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`} onClick={() => index <= step && setStep(index)} disabled={index > step}><span>{index < step ? '✓' : index + 1}</span><small>{label}</small></button>)}</div>

      <main className="lesson-content">
        {step === 0 && <section className="lesson-intro"><p className="lesson-eyebrow">Lecția {lesson.id} · Nivel A1</p><h1>{lesson.title}</h1><p className="lesson-lead">O lecție practică pe care o poți finaliza în aproximativ {lesson.duration} minute.</p><div className="objectives"><h2>După această lecție vei putea:</h2>{lesson.objectives.map((objective) => <div key={objective}><span>✓</span><p>{objective}</p></div>)}</div></section>}
        {step === 1 && <section><div className="lesson-heading"><p className="lesson-eyebrow">Pasul 2</p><h1>Vocabular esențial</h1><p>Ascultă fiecare expresie și citește exemplul. Nu trebuie să memorezi totul din prima.</p></div><div className="vocabulary-grid">{lesson.vocabulary.map(([word, translation, example]) => <article className="vocabulary-card" key={word}><div><h2>{word}</h2><p>{translation}</p></div><AudioButton text={word}/><blockquote>{example}</blockquote><AudioButton text={example} slow/></article>)}</div></section>}
        {step === 2 && <section><div className="lesson-heading"><p className="lesson-eyebrow">Pasul 3</p><h1>Dialog practic</h1><p>Ascultă dialogul, apoi descoperă traducerea fiecărei replici.</p></div><div className="dialogue"><div className="dialogue__actions"><AudioButton text={lesson.dialogue.map((line) => line[1]).join('. ')}/><AudioButton text={lesson.dialogue.map((line) => line[1]).join('. ')} slow/></div>{lesson.dialogue.map(([speaker, text, translation], index) => <article className="dialogue-line" key={`${speaker}-${index}`}><div className="speaker">{speaker.charAt(0)}</div><div><strong>{speaker}</strong><p>{text}</p>{showTranslations[index] && <small>{translation}</small>}<div><AudioButton text={text}/><button className="translation-button" type="button" onClick={() => setShowTranslations((current) => ({...current,[index]:!current[index]}))}>{showTranslations[index] ? 'Ascunde traducerea' : 'Vezi traducerea'}</button></div></div></article>)}</div></section>}
        {step === 3 && <section><div className="lesson-heading"><p className="lesson-eyebrow">Pasul 4</p><h1>{lesson.grammar.title}</h1><p>O regulă scurtă, urmată imediat de exemple.</p></div><div className="grammar-card"><div className="grammar-rule"><span>Regula</span><p>{lesson.grammar.rule}</p></div>{lesson.grammar.examples.map((example) => <div className="grammar-example" key={example}><span>✓</span><p>{example}</p></div>)}<div className="grammar-example grammar-example--wrong"><span>×</span><p>{lesson.grammar.wrong}</p></div></div></section>}
        {step === 4 && <section><div className="lesson-heading"><p className="lesson-eyebrow">Pasul 5</p><h1>Verifică ce ai învățat</h1><p>Răspunde la toate cele {lesson.exercises.length} întrebări. Greșelile vor fi salvate pentru recapitulare.</p></div><div className="exercise-progress"><span style={{width:`${(answered/lesson.exercises.length)*100}%`}}/><small>{answered} din {lesson.exercises.length} răspunsuri verificate</small></div>{lesson.exercises.map((exercise,index) => <LessonExercise exercise={exercise} index={index} onResult={recordResult} key={`${lesson.id}-${index}`}/>)}</section>}
        {step === 5 && <section className="lesson-result"><div className="result-icon">✓</div><p className="lesson-eyebrow">Lecție finalizată</p><h1>Bravo! Ai terminat „{lesson.title}”</h1><p>Ai răspuns corect la {score} din {lesson.exercises.length} întrebări.</p><div className="result-score"><strong>{Math.round((score/lesson.exercises.length)*100)}%</strong><span>scorul lecției</span></div>{reviewItems.length > 0 && <div className="review-box"><h2>De repetat</h2><p>Am salvat {reviewItems.length} {reviewItems.length === 1 ? 'răspuns' : 'răspunsuri'} pentru recapitulare.</p><button type="button" onClick={() => {setAnswers({});setStep(4);}}>Repetă exercițiile</button></div>}<div className="result-actions">{lesson.id < courseLessons.length ? <button type="button" className="primary" onClick={goNextLesson}>Continuă cu lecția {lesson.id + 1} →</button> : <Link className="primary" to="/invata">Înapoi la curs</Link>}<button type="button" onClick={() => setStep(1)}>Revezi vocabularul</button></div></section>}
      </main>

      {step < 5 && <footer className="lesson-navigation"><button type="button" onClick={previous} disabled={step === 0}>← Înapoi</button><span>Pasul {step + 1} din {steps.length}</span><button type="button" className="primary" onClick={next} disabled={step === 4 && !canFinish}>{step === 4 ? (canFinish ? 'Finalizează lecția' : 'Răspunde la toate întrebările') : 'Continuă →'}</button></footer>}
    </div>
  );
};

export default LessonProgram;
