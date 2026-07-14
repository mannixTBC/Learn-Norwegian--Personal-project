import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { courseCatalog } from './lessonContent';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import { saveReviewItem } from '../../../services/spacedReview';
import { recordStudyActivity } from '../../../services/learningActivity';
import { getCareerLessonModule, getCareerProfile } from '../../../services/careerProfile';
import { useAuth } from '../../auth/AuthContext';
import './LessonProgram.css';

const getProgressKey = (levelCode) => levelCode === 'A1' ? 'lesson_prog_progress' : `lesson_prog_progress_${levelCode.toLowerCase()}`;
const steps = ['Introducere', 'Vocabular', 'Direcția ta', 'Dialog', 'Gramatică', 'Exerciții', 'Rezultat'];

const readStorage = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; }
};

const AudioButton = ({ text, slow = false, voice = 'male', label }) => (
  <button className="audio-button" type="button" onClick={() => speakNorwegian(text, { slow, voice })} aria-label={`Ascultă ${slow ? 'lent ' : ''}: ${text}`}>
    <span role="img" aria-hidden="true">🔊</span>{label || (slow ? 'Lent' : 'Ascultă')}
  </button>
);

const femaleSpeakers = new Set(['anna', 'ana', 'nora', 'ida', 'sara', 'mia']);
const maleSpeakers = new Set(['lars', 'erik', 'mihai', 'radu', 'andrei', 'alex', 'dan', 'ola']);

const getDialogueVoice = (speaker, index) => {
  const normalizedSpeaker = speaker.toLocaleLowerCase().trim();
  if (femaleSpeakers.has(normalizedSpeaker)) return 'female';
  if (maleSpeakers.has(normalizedSpeaker)) return 'male';
  return index % 2 === 0 ? 'female' : 'male';
};

const DialogueAudioButton = ({ dialogue, slow = false }) => {
  const playDialogue = async () => {
    for (let index = 0; index < dialogue.length; index += 1) {
      const [speaker, text] = dialogue[index];
      const result = await speakNorwegian(text, {
        slow,
        voice: getDialogueVoice(speaker, index),
        waitForEnd: true,
      });
      if (!result.ok) break;
    }
  };

  return (
    <button className="audio-button" type="button" onClick={playDialogue} aria-label={`${slow ? 'Ascultă lent' : 'Ascultă'} dialogul cu două voci`}>
      <span role="img" aria-hidden="true">🔊</span>{slow ? 'Dialog lent' : 'Ascultă dialogul'}
    </button>
  );
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const HighlightedSentence = ({ sentence, word, highlight }) => {
  const term = highlight || word.replace(/^(å|en|ei|et)\s+/i, '');
  if (!term) return sentence;

  const parts = sentence.split(new RegExp(`(${escapeRegExp(term)})`, 'i'));
  return parts.map((part, index) => (
    part.toLocaleLowerCase() === term.toLocaleLowerCase()
      ? <mark className="vocabulary-card__highlight" key={`${part}-${index}`}>{part}</mark>
      : part
  ));
};

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
  const { user } = useAuth();
  const requestedLevel = ((match && match.params && match.params.level) || 'a1').toUpperCase();
  const course = courseCatalog[requestedLevel] || courseCatalog.A1;
  const courseLessons = course.lessons;
  const levelCode = course.code;
  const progressKey = getProgressKey(levelCode);
  const requestedId = Number(match && match.params && match.params.lessonId) || 1;
  const lesson = courseLessons.find((item) => item.id === requestedId) || courseLessons[0];
  const careerProfile = getCareerProfile(user) || { pathId: 'general' };
  const careerModule = useMemo(() => getCareerLessonModule(careerProfile.pathId, levelCode, lesson.id), [careerProfile.pathId, lesson.id, levelCode]);
  const lessonExercises = useMemo(() => [...lesson.exercises, careerModule.exercise], [careerModule, lesson.exercises]);
  const lessonStartedAt = useRef(Date.now());
  const [step, setStep] = useState(0);
  const [showTranslations, setShowTranslations] = useState({});
  const [answers, setAnswers] = useState({});
  const [progress, setProgress] = useState(() => readStorage(progressKey, { unlocked: 1, completed: [] }));
  const score = Object.values(answers).filter(Boolean).length;
  const answered = Object.keys(answers).length;
  const canFinish = answered === lessonExercises.length;

  useEffect(() => { lessonStartedAt.current = Date.now(); setStep(0); setAnswers({}); setShowTranslations({}); window.scrollTo(0, 0); }, [lesson.id, levelCode]);
  useEffect(() => { setProgress(readStorage(progressKey, { unlocked: 1, completed: [] })); }, [progressKey]);
  useEffect(() => { localStorage.setItem(progressKey, JSON.stringify(progress)); }, [progress, progressKey]);

  const reviewItems = useMemo(() => lessonExercises.filter((_, index) => answers[index] === false), [answers, lessonExercises]);

  const recordResult = (index, correct, exercise) => {
    setAnswers((current) => ({ ...current, [index]: correct }));
    if (!correct) {
      saveReviewItem({
        level: levelCode,
        lessonId: lesson.id,
        source: 'lesson',
        prompt: exercise.prompt,
        answer: Array.isArray(exercise.answer) ? exercise.answer.join(' ') : exercise.type === 'choice' ? exercise.options[exercise.answer] : exercise.answer,
      });
    }
  };

  const finishLesson = () => {
    if (!canFinish) return;
    setProgress((current) => ({ unlocked: Math.max(current.unlocked || 1, Math.min(lesson.id + 1, courseLessons.length)), completed: Array.from(new Set([...(current.completed || []), lesson.id])) }));
    recordStudyActivity({ type: 'lesson', level: levelCode, lessonId: lesson.id, minutes: Math.min(lesson.duration, Math.max(1, Math.round((Date.now() - lessonStartedAt.current) / 60000))), score: Math.round((score / lessonExercises.length) * 100), words: lesson.vocabulary.length + careerModule.phrases.length });
    setStep(6);
    window.scrollTo(0, 0);
  };

  const next = () => { if (step === 5) finishLesson(); else { setStep((current) => Math.min(current + 1, 6)); window.scrollTo(0, 0); } };
  const previous = () => { setStep((current) => Math.max(current - 1, 0)); window.scrollTo(0, 0); };
  const goNextLesson = () => { const nextId = Math.min(lesson.id + 1, courseLessons.length); history.push(`/curs/${levelCode.toLowerCase()}/${nextId}`); };

  return (
    <div className="lesson-shell">
      <header className="lesson-topbar"><Link to="/invata">← Cursul {levelCode}</Link><div><span>Lecția {lesson.id} din {courseLessons.length}</span><strong>{lesson.title}</strong></div><span>{lesson.duration} min</span></header>
      <div className="lesson-stepper" aria-label="Progresul lecției">{steps.map((label, index) => <button type="button" key={label} className={`${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`} onClick={() => index <= step && setStep(index)} disabled={index > step}><span>{index < step ? '✓' : index + 1}</span><small>{label}</small></button>)}</div>

      <main className="lesson-content">
        {step === 0 && <section className="lesson-intro"><p className="lesson-eyebrow">Lecția {lesson.id} · Nivel {levelCode} {course.title}</p><h1>{lesson.title}</h1><p className="lesson-lead">O lecție practică pe care o poți finaliza în aproximativ {lesson.duration} minute.</p><div className="objectives"><h2>După această lecție vei putea:</h2>{lesson.objectives.map((objective) => <div key={objective}><span>✓</span><p>{objective}</p></div>)}</div></section>}
        {step === 1 && <section><div className="lesson-heading"><p className="lesson-eyebrow">Pasul 2</p><h1>Vocabular esențial</h1><p>Ascultă fraza completă, observă cuvântul evidențiat și compară traducerea. Poți reda fiecare exemplu normal sau lent.</p></div><div className="vocabulary-grid">{lesson.vocabulary.map(([word, wordTranslation, example, sentenceTranslation, highlight], index) => <article className="vocabulary-card" key={word}><header><div><span className="vocabulary-card__label">Expresia {String(index + 1).padStart(2, '0')}</span><h2>{word}</h2></div><span className="vocabulary-card__meaning">{wordTranslation}</span></header><div className="vocabulary-card__example"><span>Exemplu în context</span><blockquote lang="no"><HighlightedSentence sentence={example} word={word} highlight={highlight}/></blockquote></div><div className="vocabulary-card__translation" lang="ro"><span>RO</span><p>{sentenceTranslation}</p></div><div className="vocabulary-card__audio"><AudioButton text={example}/><AudioButton text={example} slow/></div></article>)}</div></section>}
        {step === 2 && <section className="career-lesson">
          <div className="lesson-heading"><p className="lesson-eyebrow">Pasul 3 · Personalizat</p><h1>{careerModule.path.title} în viața reală</h1><p>{careerModule.coaching}</p></div>
          <div className="career-lesson__intro"><span aria-hidden="true">{careerModule.path.icon}</span><div><small>Direcția aleasă</small><strong>{careerModule.path.shortTitle}</strong><p>{careerModule.path.outcome}</p></div><Link to={`/alege-directia?redirect=${encodeURIComponent(`/curs/${levelCode.toLowerCase()}/${lesson.id}`)}`}>Schimbă direcția</Link></div>
          <div className="career-phrase-grid">{careerModule.phrases.map(([norwegian, romanian, highlight], index) => <article key={norwegian}><span>Expresia {index + 1}</span><h2 lang="no"><HighlightedSentence sentence={norwegian} word={highlight} highlight={highlight}/></h2><p lang="ro">{romanian}</p><div><AudioButton text={norwegian}/><AudioButton text={norwegian} slow/></div></article>)}</div>
          <div className="career-scenario"><div><span>Scenariu profesional</span><h2>{careerModule.scenario.title}</h2></div><div><p lang="no">{careerModule.scenario.norwegian}</p><small lang="ro">{careerModule.scenario.romanian}</small><AudioButton text={careerModule.scenario.norwegian}/></div></div>
        </section>}
        {step === 3 && <section><div className="lesson-heading"><p className="lesson-eyebrow">Pasul 4</p><h1>Dialog practic</h1><p>Ascultă dialogul cu voci diferite pentru fiecare vorbitor, apoi descoperă traducerea fiecărei replici.</p></div><div className="dialogue"><div className="dialogue__actions"><DialogueAudioButton dialogue={lesson.dialogue}/><DialogueAudioButton dialogue={lesson.dialogue} slow/></div>{lesson.dialogue.map(([speaker, text, translation], index) => <article className="dialogue-line" key={`${speaker}-${index}`}><div className={`speaker speaker--${getDialogueVoice(speaker, index)}`}>{speaker.charAt(0)}</div><div><strong>{speaker}</strong><p>{text}</p>{showTranslations[index] && <small>{translation}</small>}<div><AudioButton text={text} voice={getDialogueVoice(speaker, index)}/><button className="translation-button" type="button" onClick={() => setShowTranslations((current) => ({...current,[index]:!current[index]}))}>{showTranslations[index] ? 'Ascunde traducerea' : 'Vezi traducerea'}</button></div></div></article>)}</div></section>}
        {step === 4 && <section><div className="lesson-heading"><p className="lesson-eyebrow">Pasul 5</p><h1>{lesson.grammar.title}</h1><p>O regulă scurtă, urmată imediat de exemple.</p></div><div className="grammar-card"><div className="grammar-rule"><span>Regula</span><p>{lesson.grammar.rule}</p></div>{lesson.grammar.examples.map((example) => <div className="grammar-example" key={example}><span>✓</span><p>{example}</p></div>)}<div className="grammar-example grammar-example--wrong"><span>×</span><p>{lesson.grammar.wrong}</p></div></div></section>}
        {step === 5 && <section><div className="lesson-heading"><p className="lesson-eyebrow">Pasul 6</p><h1>Verifică ce ai învățat</h1><p>Răspunde la toate cele {lessonExercises.length} întrebări, inclusiv situația pentru „{careerModule.path.shortTitle}”. Greșelile vor fi salvate pentru recapitulare.</p></div><div className="exercise-progress"><span style={{width:`${(answered/lessonExercises.length)*100}%`}}/><small>{answered} din {lessonExercises.length} răspunsuri verificate</small></div>{lessonExercises.map((exercise,index) => <LessonExercise exercise={exercise} index={index} onResult={recordResult} key={`${lesson.id}-${index}-${exercise.careerPath || 'general'}`}/>)}</section>}
        {step === 6 && <section className="lesson-result"><div className="result-icon">✓</div><p className="lesson-eyebrow">Lecție finalizată</p><h1>Bravo! Ai terminat „{lesson.title}”</h1><p>Ai răspuns corect la {score} din {lessonExercises.length} întrebări.</p><div className="result-score"><strong>{Math.round((score/lessonExercises.length)*100)}%</strong><span>scorul lecției</span></div>{reviewItems.length > 0 && <div className="review-box"><h2>De repetat</h2><p>Am salvat {reviewItems.length} {reviewItems.length === 1 ? 'răspuns' : 'răspunsuri'} pentru recapitulare.</p><button type="button" onClick={() => {setAnswers({});setStep(5);}}>Repetă exercițiile</button></div>}<div className="result-actions">{lesson.id < courseLessons.length ? <button type="button" className="primary" onClick={goNextLesson}>Continuă cu lecția {lesson.id + 1} →</button> : <Link className="primary" to="/invata">Înapoi la curs</Link>}<button type="button" onClick={() => setStep(1)}>Revezi vocabularul</button></div></section>}
      </main>

      {step < 6 && <footer className="lesson-navigation"><button type="button" onClick={previous} disabled={step === 0}>← Înapoi</button><span>Pasul {step + 1} din {steps.length}</span><button type="button" className="primary" onClick={next} disabled={step === 5 && !canFinish}>{step === 5 ? (canFinish ? 'Finalizează lecția' : 'Răspunde la toate întrebările') : 'Continuă →'}</button></footer>}
    </div>
  );
};

export default LessonProgram;
