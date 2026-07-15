import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { courseCatalog } from './lessonContent';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import { saveReviewItem } from '../../../services/spacedReview';
import { recordStudyActivity } from '../../../services/learningActivity';
import { syncLearningProgress } from '../../../services/supabaseLearning';
import { getCareerLessonModule, getCareerProfile } from '../../../services/careerProfile';
import { useAuth } from '../../auth/AuthContext';
import './LessonProgram.css';

const getProgressKey = (levelCode) => levelCode === 'A1' ? 'lesson_prog_progress' : `lesson_prog_progress_${levelCode.toLowerCase()}`;
const getLessonStepKey = (levelCode, lessonId, user) => `lesson_resume_${user && user.id ? user.id : 'guest'}_${levelCode.toLowerCase()}_${lessonId}`;
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

const DialoguePlayIcon = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <path d="M6.5 18.5v-5a9.5 9.5 0 0 1 19 0v5" />
    <path d="M6.5 17.5h3.2v7H7.8c-.7 0-1.3-.6-1.3-1.3Zm19 0h-3.2v7h1.9c.7 0 1.3-.6 1.3-1.3Z" />
    <path d="M13.2 13.1v6l5.1-3Z" className="dialogue-play-button__play" />
  </svg>
);

const SpeakerAvatar = ({ voice }) => (
  <span className={`speaker speaker--${voice}`} aria-hidden="true">
    <svg viewBox="0 0 40 40" focusable="false">
      {voice === 'female' ? (
        <>
          <path className="speaker__shirt speaker__shirt--anna" d="M7 38c.8-8 5.2-12 13-12s12.2 4 13 12Z" />
          <path className="speaker__hair speaker__hair--anna" d="M9.4 19.5C8.8 9.2 13.2 4.3 20 4.3s11.2 4.9 10.6 15.2l-2.3 10.2H11.7Z" />
          <ellipse className="speaker__skin" cx="20" cy="17" rx="7.8" ry="9.2" />
          <path className="speaker__hair speaker__hair--anna" d="M11.8 15.2c.8-7.2 4.5-9.5 8.7-9.5 4.4 0 7.2 2.8 7.8 7.5-4.9.3-8.7-1.1-11.2-3.5-1 2.5-2.8 4.3-5.3 5.5Z" />
          <path className="speaker__happy-eye" d="M15.7 17.2c.8-.8 1.7-.8 2.5 0M21.8 17.2c.8-.8 1.7-.8 2.5 0" />
          <path className="speaker__smile" d="M16.8 20.5c1.8 2.4 4.6 2.4 6.4 0" />
          <circle className="speaker__cheek" cx="15.4" cy="20" r="1" />
          <circle className="speaker__cheek" cx="24.6" cy="20" r="1" />
          <circle className="speaker__earring" cx="12.5" cy="20" r="1" />
          <circle className="speaker__earring" cx="27.5" cy="20" r="1" />
        </>
      ) : (
        <>
          <path className="speaker__shirt speaker__shirt--lars" d="M7 38c.8-8 5.2-12 13-12s12.2 4 13 12Z" />
          <circle className="speaker__skin" cx="20" cy="16.8" r="8.5" />
          <path className="speaker__hair speaker__hair--lars" d="M11.8 14.3c.3-6.7 3.5-10 9-10 5.7 0 8.5 3.8 8 9.8-3.7-.3-6.9-1.7-9.5-4.2-1.7 2.2-4.2 3.7-7.5 4.4Z" />
          <path className="speaker__happy-eye" d="M15.5 17.1c.8-.8 1.7-.8 2.5 0M22 17.1c.8-.8 1.7-.8 2.5 0" />
          <path className="speaker__beard" d="M13.7 20.2c1.4 5 3.4 7 6.3 7s5-2 6.3-7c-1.8 1.5-3.9 2.2-6.3 2.2s-4.5-.7-6.3-2.2Z" />
          <path className="speaker__smile speaker__smile--lars" d="M17.2 20.5c1.6 2.1 4 2.1 5.6 0" />
          <circle className="speaker__cheek" cx="14.9" cy="20" r=".9" />
          <circle className="speaker__cheek" cx="25.1" cy="20" r=".9" />
        </>
      )}
    </svg>
  </span>
);

const DialogueAudioButton = ({ dialogue }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playDialogue = async () => {
    if (isPlaying) return;
    setIsPlaying(true);

    try {
      for (let index = 0; index < dialogue.length; index += 1) {
        const [speaker, text] = dialogue[index];
        const result = await speakNorwegian(text, {
          slow: true,
          voice: getDialogueVoice(speaker, index),
          waitForEnd: true,
        });
        if (!result.ok) break;
      }
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <button className={`dialogue-play-button ${isPlaying ? 'is-playing' : ''}`} type="button" onClick={playDialogue} disabled={isPlaying} aria-label="Ascultă dialogul">
      <span className="dialogue-play-button__icon" aria-hidden="true">
        <DialoguePlayIcon />
      </span>
      <span className="dialogue-play-button__copy">
        <strong>Ascultă dialogul</strong>
      </span>
    </button>
  );
};

const DialogueLineAudioButton = ({ text, voice }) => (
  <button className="dialogue-line-audio-button" type="button" onClick={() => speakNorwegian(text, { voice })} aria-label={`Ascultă replica: ${text}`}>
    <span className="dialogue-line-audio-button__icon" aria-hidden="true"><DialoguePlayIcon /></span>
    <span>Ascultă</span>
  </button>
);

const CompactSlowAudioButton = ({ text }) => (
  <button className="dialogue-line-audio-button compact-slow-audio-button" type="button" onClick={() => speakNorwegian(text, { voice: 'male', slow: true })} aria-label={`Ascultă lent: ${text}`}>
    <span className="dialogue-line-audio-button__icon" aria-hidden="true"><DialoguePlayIcon /></span>
  </button>
);

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

const MobileExpressionNavigation = ({ current, total, onPrevious, onNext, onComplete, label = 'expresii' }) => (
  <nav className="mobile-expression-navigation" aria-label={`Navigare între ${label}`}>
    <button type="button" onClick={onPrevious} disabled={current === 0} aria-label="Expresia anterioară">
      <span aria-hidden="true">←</span> Înapoi
    </button>
    <div className="mobile-expression-navigation__progress" aria-live="polite">
      <span>{current + 1} din {total}</span>
      <div aria-hidden="true">
        {Array.from({ length: total }, (_, index) => <i className={index === current ? 'active' : ''} key={index}/>) }
      </div>
    </div>
    <button type="button" className="primary" onClick={current === total - 1 ? onComplete : onNext} aria-label={current === total - 1 ? 'Continuă la etapa următoare' : 'Expresia următoare'}>
      {current === total - 1 ? 'Continuă' : 'Următoarea'} <span aria-hidden="true">→</span>
    </button>
  </nav>
);

const MobileExerciseNavigation = ({ current, total, answeredCurrent, onPrevious, onNext, onComplete }) => (
  <nav className="mobile-expression-navigation mobile-exercise-navigation" aria-label="Navigare între întrebări">
    <button type="button" onClick={onPrevious} disabled={current === 0} aria-label="Întrebarea anterioară">
      <span aria-hidden="true">←</span> Înapoi
    </button>
    <div className="mobile-expression-navigation__progress">
      <span>{current + 1} din {total}</span>
      <div>{Array.from({ length: total }, (_, index) => <i className={index === current ? 'active' : ''} key={index}/>)}</div>
    </div>
    <button type="button" className="primary" disabled={!answeredCurrent} onClick={current === total - 1 ? onComplete : onNext}>
      {current === total - 1 ? 'Vezi rezultatul' : 'Următoarea'} <span aria-hidden="true">→</span>
    </button>
  </nav>
);

const LessonExercise = ({ exercise, index, onResult, isMobileActive }) => {
  const [value, setValue] = useState('');
  const [selectedWords, setSelectedWords] = useState([]);
  const [gapAnswers, setGapAnswers] = useState([]);
  const [checked, setChecked] = useState(false);

  const cleanWords = selectedWords.map((entry) => entry.split('::')[0]);
  const isCorrect = exercise.type === 'choice'
    ? Number(value) === exercise.answer
    : exercise.type === 'fill'
      ? value.trim().toLocaleLowerCase() === exercise.answer.toLocaleLowerCase()
      : exercise.type === 'gaps'
        ? gapAnswers.length === exercise.answer.length && gapAnswers.every((answer, answerIndex) => answer === exercise.answer[answerIndex])
        : cleanWords.join(' ') === exercise.answer.join(' ');

  const check = () => {
    if (!value && (exercise.type === 'choice' || exercise.type === 'fill')) return;
    if (exercise.type === 'order' && !selectedWords.length) return;
    if (exercise.type === 'gaps' && (gapAnswers.length !== exercise.answer.length || gapAnswers.some((answer) => !answer))) return;
    setChecked(true);
    onResult(index, isCorrect, exercise);
  };

  const reset = () => { setValue(''); setSelectedWords([]); setGapAnswers([]); setChecked(false); };
  const addWord = (word, originalIndex) => setSelectedWords((words) => [...words, `${word}::${originalIndex}`]);
  const placeGapAnswer = (word, preferredIndex) => {
    if (checked || gapAnswers.includes(word)) return;
    setGapAnswers((current) => {
      const nextAnswers = [...current];
      const emptyIndex = nextAnswers.findIndex((answer) => !answer);
      const targetIndex = Number.isInteger(preferredIndex) ? preferredIndex : emptyIndex >= 0 ? emptyIndex : 0;
      nextAnswers[targetIndex] = word;
      return nextAnswers;
    });
  };
  const clearGapAnswer = (gapIndex) => !checked && setGapAnswers((current) => current.map((answer, answerIndex) => answerIndex === gapIndex ? '' : answer));

  return (
    <div className={`practice-card ${isMobileActive ? 'mobile-exercise-card--active' : ''}`}>
      <div className="practice-card__counter">Întrebarea {index + 1}</div>
      <h3>{exercise.prompt}</h3>
      {exercise.type === 'choice' && <div className="choice-list">{exercise.options.map((option, optionIndex) => <button type="button" disabled={checked} className={Number(value) === optionIndex ? 'selected' : ''} onClick={() => setValue(String(optionIndex))} key={option}>{option}</button>)}</div>}
      {exercise.type === 'fill' && <input className="answer-input" value={value} disabled={checked} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && check()} placeholder="Scrie răspunsul aici" />}
      {exercise.type === 'order' && <><div className="sentence-builder">{cleanWords.length ? cleanWords.map((word, i) => <button type="button" disabled={checked} key={`${word}-${i}`} onClick={() => !checked && setSelectedWords((all) => all.filter((_, position) => position !== i))}>{word}</button>) : <span>Apasă cuvintele în ordinea corectă</span>}</div><div className="word-bank">{exercise.words.map((word, i) => <button type="button" disabled={checked || selectedWords.some((entry) => entry.endsWith(`::${i}`))} onClick={() => addWord(word, i)} key={`${word}-${i}`}>{word}</button>)}</div></>}
      {exercise.type === 'gaps' && <div className="gap-exercise"><p className="gap-exercise__hint gap-exercise__hint--pointer">Trage cuvântul în spațiul liber.</p><p className="gap-exercise__hint gap-exercise__hint--touch">Atinge cuvântul pentru a completa propoziția.</p><div className="gap-sentence">{exercise.sentence.split('___').map((sentencePart, sentenceIndex, sentenceParts) => <React.Fragment key={`${sentencePart}-${sentenceIndex}`}><span>{sentencePart}</span>{sentenceIndex < sentenceParts.length - 1 && <button type="button" className={gapAnswers[sentenceIndex] ? 'gap-slot gap-slot--filled' : 'gap-slot'} disabled={checked} onClick={() => clearGapAnswer(sentenceIndex)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); placeGapAnswer(event.dataTransfer.getData('text/plain'), sentenceIndex); }} aria-label={gapAnswers[sentenceIndex] ? `Cuvânt selectat: ${gapAnswers[sentenceIndex]}. Apasă pentru a-l elimina.` : `Spațiul liber ${sentenceIndex + 1}`}>{gapAnswers[sentenceIndex] || <span className="gap-slot__placeholder" aria-hidden="true"/>}</button>}</React.Fragment>)}</div><div className="gap-word-bank">{exercise.options.map((option) => { const used = gapAnswers.includes(option); return <button type="button" draggable={!checked && !used} disabled={checked || used} onClick={() => placeGapAnswer(option)} onDragStart={(event) => event.dataTransfer.setData('text/plain', option)} key={option}>{option}</button>; })}</div></div>}
      {!checked && <button className="check-button" type="button" onClick={check}>Verifică răspunsul</button>}
      {checked && <div className={`answer-feedback ${isCorrect ? 'answer-feedback--correct' : 'answer-feedback--wrong'}`} role="status"><strong>{isCorrect ? 'Corect! Foarte bine.' : 'Mai încearcă o dată.'}</strong><p>{exercise.explanation}</p>{!isCorrect && <p>Răspuns corect: <b>{Array.isArray(exercise.answer) ? exercise.answer.join(' ') : exercise.type === 'choice' ? exercise.options[exercise.answer] : exercise.answer}</b></p>}{!isCorrect && <button type="button" onClick={reset}>Încearcă din nou</button>}</div>}
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
  const lessonStepKey = getLessonStepKey(levelCode, lesson.id, user);
  const careerProfile = getCareerProfile(user) || { pathId: 'general' };
  const careerModule = useMemo(() => getCareerLessonModule(careerProfile.pathId, levelCode, lesson.id), [careerProfile.pathId, lesson.id, levelCode]);
  const lessonExercises = useMemo(() => [...lesson.exercises, careerModule.exercise], [careerModule, lesson.exercises]);
  const lessonStartedAt = useRef(Date.now());
  const skipStepSave = useRef(true);
  const [step, setStep] = useState(() => Math.min(6, Math.max(0, Number(readStorage(lessonStepKey, 0)) || 0)));
  const [vocabularyIndex, setVocabularyIndex] = useState(0);
  const [careerPhraseIndex, setCareerPhraseIndex] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [showTranslations, setShowTranslations] = useState({});
  const [answers, setAnswers] = useState({});
  const [progress, setProgress] = useState(() => readStorage(progressKey, { unlocked: 1, completed: [] }));
  const score = Object.values(answers).filter(Boolean).length;
  const answered = Object.keys(answers).length;
  const canFinish = answered === lessonExercises.length;

  useEffect(() => {
    lessonStartedAt.current = Date.now();
    skipStepSave.current = true;
    setStep(Math.min(6, Math.max(0, Number(readStorage(lessonStepKey, 0)) || 0)));
    setVocabularyIndex(0);
    setCareerPhraseIndex(0);
    setExerciseIndex(0);
    setAnswers({});
    setShowTranslations({});
    window.scrollTo(0, 0);
  }, [lesson.id, lessonStepKey, levelCode]);
  useEffect(() => {
    if (skipStepSave.current) {
      skipStepSave.current = false;
      return;
    }
    localStorage.setItem(lessonStepKey, JSON.stringify(step));
    void syncLearningProgress(lessonStepKey, step).catch((error) => {
      console.warn('Etapa lecției este păstrată local, dar nu a putut fi sincronizată încă.', error.message);
    });
  }, [lessonStepKey, step]);
  useEffect(() => { setProgress(readStorage(progressKey, { unlocked: 1, completed: [] })); }, [progressKey]);
  useEffect(() => {
    localStorage.setItem(progressKey, JSON.stringify(progress));
    void syncLearningProgress(progressKey, progress).catch((error) => {
      console.warn('Progresul este păstrat local, dar nu a putut fi sincronizat încă.', error.message);
    });
  }, [progress, progressKey]);

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
        {step === 1 && <section><div className="lesson-heading"><p className="lesson-eyebrow">Pasul 2</p><h1>Vocabular esențial</h1><p>Ascultă fraza completă în ritm lent, observă cuvântul evidențiat și compară traducerea.</p></div><div className="vocabulary-grid">{lesson.vocabulary.map(([word, wordTranslation, example, sentenceTranslation, highlight], index) => <article className={`vocabulary-card ${index === vocabularyIndex ? 'mobile-expression-card--active' : ''}`} key={word}><header><div><span className="vocabulary-card__label">Expresia {String(index + 1).padStart(2, '0')}</span><h2>{word}</h2></div><span className="vocabulary-card__meaning">{wordTranslation}</span></header><div className="vocabulary-card__example"><span>Exemplu în context</span><div className="vocabulary-card__example-row"><blockquote lang="no"><HighlightedSentence sentence={example} word={word} highlight={highlight}/></blockquote><CompactSlowAudioButton text={example}/></div></div><div className="vocabulary-card__translation" lang="ro"><span>RO</span><p>{sentenceTranslation}</p></div></article>)}</div><MobileExpressionNavigation current={vocabularyIndex} total={lesson.vocabulary.length} onPrevious={() => setVocabularyIndex((current) => Math.max(0, current - 1))} onNext={() => setVocabularyIndex((current) => Math.min(lesson.vocabulary.length - 1, current + 1))} onComplete={() => { setStep(2); window.scrollTo(0, 0); }}/></section>}
        {step === 2 && <section className="career-lesson">
          <div className="lesson-heading career-lesson__heading"><p className="lesson-eyebrow">Pasul 3 · Personalizat</p><p>{careerModule.coaching}</p></div>
          <div className="career-phrase-grid">{careerModule.phrases.map(([norwegian, romanian, highlight], index) => <article className={index >= careerPhraseIndex * 2 && index < (careerPhraseIndex * 2) + 2 ? 'mobile-expression-card--active' : ''} key={norwegian}><span>Expresia {index + 1}</span><div className="career-phrase-grid__phrase-row"><h2 lang="no"><HighlightedSentence sentence={norwegian} word={highlight} highlight={highlight}/></h2><CompactSlowAudioButton text={norwegian}/></div><p lang="ro">{romanian}</p></article>)}</div>
          <MobileExpressionNavigation current={careerPhraseIndex} total={Math.ceil(careerModule.phrases.length / 2)} onPrevious={() => setCareerPhraseIndex((current) => Math.max(0, current - 1))} onNext={() => setCareerPhraseIndex((current) => Math.min(Math.ceil(careerModule.phrases.length / 2) - 1, current + 1))} onComplete={() => { setStep(3); window.scrollTo(0, 0); }} label="grupuri de expresii"/>
        </section>}
        {step === 3 && <section><div className="lesson-heading"><p className="lesson-eyebrow">Pasul 4</p><h1>Conversație</h1></div><div className="dialogue"><div className="dialogue__actions"><DialogueAudioButton dialogue={lesson.dialogue}/></div>{lesson.dialogue.map(([speaker, text, translation], index) => <article className="dialogue-line" key={`${speaker}-${index}`}><div className="dialogue-speaker"><SpeakerAvatar voice={getDialogueVoice(speaker, index)} /><strong>{speaker}</strong></div><div className="dialogue-line__content"><p>{text}</p>{showTranslations[index] && <small>{translation}</small>}<div><DialogueLineAudioButton text={text} voice={getDialogueVoice(speaker, index)}/><button className="translation-button" type="button" onClick={() => setShowTranslations((current) => ({...current,[index]:!current[index]}))}>{showTranslations[index] ? 'Ascunde' : 'În română'}</button></div></div></article>)}</div></section>}
        {step === 4 && <section><div className="lesson-heading"><p className="lesson-eyebrow">Pasul 5</p><h1>{lesson.grammar.title}</h1><p>O regulă scurtă, urmată imediat de exemple.</p></div><div className="grammar-card"><div className="grammar-rule"><span>Regula</span><p>{lesson.grammar.rule}</p></div>{lesson.grammar.examples.map((example) => <div className="grammar-example" key={example}><span>✓</span><p>{example}</p></div>)}<div className="grammar-example grammar-example--wrong"><span>×</span><p>{lesson.grammar.wrong}</p></div></div></section>}
        {step === 5 && <section><div className="lesson-heading"><p className="lesson-eyebrow">Pasul 6</p><h1>Verifică ce ai învățat</h1><p>Răspunde la toate cele {lessonExercises.length} întrebări. Greșelile vor fi salvate pentru recapitulare.</p></div><div className="exercise-progress"><span style={{width:`${(answered/lessonExercises.length)*100}%`}}/><small>{answered} din {lessonExercises.length} răspunsuri verificate</small></div><div className="lesson-exercise-list">{lessonExercises.map((exercise,index) => <LessonExercise exercise={exercise} index={index} onResult={recordResult} isMobileActive={index === exerciseIndex} key={`${lesson.id}-${index}-${exercise.careerPath || 'general'}`}/>)}</div><MobileExerciseNavigation current={exerciseIndex} total={lessonExercises.length} answeredCurrent={Object.prototype.hasOwnProperty.call(answers, exerciseIndex)} onPrevious={() => { setExerciseIndex((current) => Math.max(0, current - 1)); window.scrollTo(0, 0); }} onNext={() => { setExerciseIndex((current) => Math.min(lessonExercises.length - 1, current + 1)); window.scrollTo(0, 0); }} onComplete={finishLesson}/></section>}
        {step === 6 && <section className="lesson-result"><div className="result-icon">✓</div><p className="lesson-eyebrow">Lecție finalizată</p><h1>Bravo! Ai terminat „{lesson.title}”</h1><p>Ai răspuns corect la {score} din {lessonExercises.length} întrebări.</p><div className="result-score"><strong>{Math.round((score/lessonExercises.length)*100)}%</strong><span>scorul lecției</span></div>{reviewItems.length > 0 && <div className="review-box"><h2>De repetat</h2><p>Am salvat {reviewItems.length} {reviewItems.length === 1 ? 'răspuns' : 'răspunsuri'} pentru recapitulare.</p><button type="button" onClick={() => {setAnswers({});setStep(5);}}>Repetă exercițiile</button></div>}<div className="result-actions">{lesson.id < courseLessons.length ? <button type="button" className="primary" onClick={goNextLesson}>Continuă cu lecția {lesson.id + 1} →</button> : <Link className="primary" to="/invata">Înapoi la curs</Link>}<button type="button" onClick={() => setStep(1)}>Revezi vocabularul</button></div></section>}
      </main>

      {step < 6 && step !== 2 && <footer className={`lesson-navigation ${step === 5 ? 'lesson-navigation--exercises' : ''}`}><button type="button" onClick={previous} disabled={step === 0}>← Înapoi</button><span>Pasul {step + 1} din {steps.length}</span><button type="button" className="primary" onClick={next} disabled={step === 5 && !canFinish}>{step === 5 ? (canFinish ? 'Finalizează lecția' : 'Răspunde la toate întrebările') : 'Continuă →'}</button></footer>}
    </div>
  );
};

export default LessonProgram;
