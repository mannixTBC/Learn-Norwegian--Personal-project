import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { courseCatalog } from './lessonContent';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import { readReviewItems, saveReviewItem } from '../../../services/spacedReview';
import { recordStudyActivity } from '../../../services/learningActivity';
import { syncLearningProgress } from '../../../services/supabaseLearning';
import { getCareerLessonModule, getCareerProfile } from '../../../services/careerProfile';
import { useAuth } from '../../auth/AuthContext';
import { courseProgressKey, currentLessonKey, lessonResumeKey, readCourseProgress } from '../../../services/curriculumProgress';
import { CurriculumRecall } from './CurriculumPractice';
import LessonGrammar, { grammarStepDescription } from './LessonGrammar';
import PremiumGate from '../../premium/PremiumGate';
import ChatAssistant from '../../chat/ChatAssistant';
import VoiceLessonConversation from '../../chat/VoiceLessonConversation';
import './LessonProgram.css';
import LessonAppView from './LessonAppView';
import { getLessonImage } from '../lessonVisuals';
import { lessonExerciseAnswer, lessonExerciseReviewPrompt } from './lessonExerciseContent';
import {
  getDialogueVoice,
  SpeakerAvatar,
  DialogueAudioButton,
  DialogueLineAudioButton,
  CompactSlowAudioButton,
  LessonMetaIcon,
  HighlightedSentence,
  LessonExercise,
} from './lessonParts';

/* În aplicația instalată (și în previzualizarea ?appPreview=1) lecția
   folosește LessonAppView; web-ul rămâne pe JSX-ul de mai jos. */
const isInstalledAppView = () => typeof document !== 'undefined' && document.documentElement.classList.contains('is-installed-app');

const getProgressKey = courseProgressKey;
const getLessonStepKey = lessonResumeKey;
const steps = ['Introducere', 'Vocabular', 'Direcția ta', 'Dialog', 'Gramatică', 'Exerciții', 'Dialog vocal', 'Rezultat'];

const readStorage = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; }
};

const readLessonStep = (key, legacyKey) => {
  const current = readStorage(key, null);
  // The old mobile flow used step 6 for the result. Resume at exercises rather
  // than treating an old result as the new voice stage with no saved answers.
  const value = current === null ? Math.min(5, Number(readStorage(legacyKey, 0))) : Number(current);
  return Number.isFinite(value) ? Math.min(steps.length - 1, Math.max(0, Math.trunc(value))) : 0;
};

const readLessonExerciseState = (key, exercises, completed) => {
  const savedAnswers = readStorage(`${key}_answers`, {});
  const savedResponses = readStorage(`${key}_responses`, {});
  const versions = readStorage(`${key}_exercise_versions`, {});
  const answers = {};
  const responses = {};
  let revised = false;
  exercises.forEach((exercise, index) => {
    if (typeof savedAnswers[index] !== 'boolean' && !savedResponses[index]) return;
    if (!completed && exercise.answerRevision && versions[index] !== exercise.answerRevision) {
      revised = true;
      return;
    }
    if (typeof savedAnswers[index] === 'boolean') answers[index] = savedAnswers[index];
    if (savedResponses[index]) responses[index] = savedResponses[index];
  });
  return { answers, responses, revised };
};

const readExerciseIndex = (key, total) => {
  const index = Number(readStorage(`${key}_exercise_index`, 0));
  return Number.isInteger(index) ? Math.max(0, Math.min(total - 1, index)) : 0;
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
    <button type="button" onClick={onPrevious} aria-label={current === 0 ? 'Etapa anterioară' : 'Întrebarea anterioară'}>
      <span aria-hidden="true">←</span> Înapoi
    </button>
    <div className="mobile-expression-navigation__progress">
      <span>{current + 1} din {total}</span>
      <div>{Array.from({ length: total }, (_, index) => <i className={index === current ? 'active' : ''} key={index}/>)}</div>
    </div>
    <button type="button" className="primary" disabled={!answeredCurrent} onClick={current === total - 1 ? onComplete : onNext}>
      {current === total - 1 ? 'Dialog vocal' : 'Următoarea'} <span aria-hidden="true">→</span>
    </button>
  </nav>
);


const LessonSession = ({ match }) => {
  const history = useHistory();
  const { user } = useAuth();
  const requestedLevel = ((match && match.params && match.params.level) || 'a1').toUpperCase();
  const course = courseCatalog[requestedLevel] || courseCatalog.A1;
  const courseLessons = course.lessons;
  const levelCode = course.code;
  const progressKey = getProgressKey(levelCode, user);
  const requestedId = Number(match && match.params && match.params.lessonId) || 1;
  const lesson = courseLessons.find((item) => item.id === requestedId) || courseLessons[0];
  const resultStep = steps.length - 1;
  const legacyStepKey = getLessonStepKey(levelCode, lesson.id, user);
  const lessonStepKey = `${legacyStepKey}_voice_v1`;
  const careerProfile = getCareerProfile(user) || { pathId: 'general' };
  const careerModule = useMemo(() => getCareerLessonModule(careerProfile.pathId, levelCode, lesson.id, lesson), [careerProfile.pathId, lesson, levelCode]);
  const lessonExercises = useMemo(() => [...lesson.exercises, careerModule.exercise], [careerModule, lesson.exercises]);
  const completedLesson = readCourseProgress(levelCode, user, courseLessons).completed.includes(lesson.id);
  const savedExerciseState = useMemo(() => readLessonExerciseState(lessonStepKey, lessonExercises, completedLesson), [lessonStepKey, lessonExercises, completedLesson]);
  const resumeStep = () => {
    const savedStep = readLessonStep(lessonStepKey, legacyStepKey);
    return savedExerciseState.revised && savedStep > 5 ? 5 : savedStep;
  };
  const lessonStartedAt = useRef(Date.now());
  const lessonContentRef = useRef(null);
  const skipStepSave = useRef(true);
  const [step, setStep] = useState(resumeStep);
  const [vocabularyIndex, setVocabularyIndex] = useState(0);
  const [careerPhraseIndex, setCareerPhraseIndex] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(() => readExerciseIndex(lessonStepKey, lessonExercises.length));
  const [showVocabularyTranslations, setShowVocabularyTranslations] = useState({});
  const [showTranslations, setShowTranslations] = useState({});
  const [answers, setAnswers] = useState(() => savedExerciseState.answers);
  const [exerciseResponses, setExerciseResponses] = useState(() => savedExerciseState.responses);
  const [voiceCompleted, setVoiceCompleted] = useState(() => readStorage(`${lessonStepKey}_voice_complete`, false) === true);
  const [progress, setProgress] = useState(() => readCourseProgress(levelCode, user, courseLessons));
  const score = Object.values(answers).filter(Boolean).length;
  const answered = Object.keys(answers).length;
  const canFinish = answered === lessonExercises.length;

  useEffect(() => {
    if (!readCourseProgress(levelCode, user, courseLessons).completed.includes(lesson.id)) {
      localStorage.setItem(currentLessonKey(user), JSON.stringify({ level: levelCode, lessonId: lesson.id }));
    }
  }, [levelCode, lesson.id, user?.id, courseLessons]);

  useEffect(() => {
    lessonStartedAt.current = Date.now();
    skipStepSave.current = true;
    setStep(resumeStep());
    setVocabularyIndex(0);
    setCareerPhraseIndex(0);
    setExerciseIndex(readExerciseIndex(lessonStepKey, lessonExercises.length));
    const saved = readLessonExerciseState(lessonStepKey, lessonExercises, completedLesson);
    setAnswers(saved.answers);
    setExerciseResponses(saved.responses);
    setVoiceCompleted(readStorage(`${lessonStepKey}_voice_complete`, false) === true);
    setShowVocabularyTranslations({});
    setShowTranslations({});
    window.scrollTo(0, 0);
  }, [lesson.id, lessonStepKey, legacyStepKey, levelCode, resultStep]);
  useEffect(() => {
    if (!skipStepSave.current) {
      localStorage.setItem(`${lessonStepKey}_answers`, JSON.stringify(answers));
      localStorage.setItem(`${lessonStepKey}_responses`, JSON.stringify(exerciseResponses));
      localStorage.setItem(`${lessonStepKey}_exercise_index`, JSON.stringify(exerciseIndex));
      localStorage.setItem(`${lessonStepKey}_exercise_versions`, JSON.stringify(Object.fromEntries(lessonExercises.map((exercise, index) => [index, exercise.answerRevision || null]))));
    }
  }, [answers, exerciseResponses, exerciseIndex, lessonStepKey]);
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
  useEffect(() => { setProgress(readCourseProgress(levelCode, user, courseLessons)); }, [progressKey]);
  useEffect(() => {
    localStorage.setItem(progressKey, JSON.stringify(progress));
    void syncLearningProgress(progressKey, progress).catch((error) => {
      console.warn('Progresul este păstrat local, dar nu a putut fi sincronizat încă.', error.message);
    });
  }, [progress, progressKey]);
  useEffect(() => {
    if (lessonContentRef.current) lessonContentRef.current.scrollTo({ top: 0, behavior: 'auto' });
  }, [careerPhraseIndex, step, vocabularyIndex]);
  useEffect(() => {
    if (!isInstalledAppView() && !window.matchMedia?.('(max-width: 520px)').matches) return;
    lessonContentRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [exerciseIndex]);

  const reviewItems = useMemo(() => lessonExercises.filter((_, index) => answers[index] === false), [answers, lessonExercises]);

  const recordResult = (index, correct, exercise, response) => {
    setExerciseIndex(index);
    setAnswers((current) => ({ ...current, [index]: correct }));
    setExerciseResponses((current) => {
      const nextResponses = { ...current };
      if (response) nextResponses[index] = response;
      else delete nextResponses[index];
      return nextResponses;
    });
    if (!correct) {
      saveReviewItem({
        level: levelCode,
        lessonId: lesson.id,
        source: 'lesson',
        id: `${lesson.uid}-${index}`,
        prompt: lessonExerciseReviewPrompt(exercise),
        answer: lessonExerciseAnswer(exercise),
      });
    }
  };

  const recordVoiceComplete = (learning) => {
    setVoiceCompleted(true);
    localStorage.setItem(`${lessonStepKey}_voice_complete`, JSON.stringify(true));
    if (learning) localStorage.setItem(`${lessonStepKey}_voice_learning`, JSON.stringify(learning));
  };

  const saveExerciseDraft = (index, response) => {
    if (typeof answers[index] === 'boolean') return;
    setExerciseIndex(index);
    setExerciseResponses((current) => ({ ...current, [index]: response }));
  };

  const finishLesson = () => {
    if (!canFinish) return;
    const scheduledIds = new Set(readReviewItems().map((item) => item.id));
    lesson.introducedVocabulary.forEach(([word, meaning]) => {
      const id = `curriculum-${lesson.curriculumVersion}-${levelCode}-${word.toLocaleLowerCase('nb-NO')}`;
      if (!scheduledIds.has(id)) saveReviewItem({ id, level: levelCode, lessonId: lesson.id, source: 'curriculum', prompt: `Ce înseamnă „${word}”?`, answer: meaning, dueAt: new Date(Date.now() + 86400000).toISOString() });
    });
    setProgress((current) => ({ unlocked: Math.max(current.unlocked || 1, Math.min(lesson.id + 1, courseLessons.length)), completed: Array.from(new Set([...(current.completed || []), lesson.id])) }));
    recordStudyActivity({ type: 'lesson', level: levelCode, lessonId: lesson.id, lessonUid: lesson.uid, curriculumVersion: lesson.curriculumVersion, minutes: Math.min(lesson.duration, Math.max(1, Math.round((Date.now() - lessonStartedAt.current) / 60000))), score: Math.round((score / lessonExercises.length) * 100), words: lesson.introducedVocabulary.length });
    setStep(resultStep);
    window.scrollTo(0, 0);
  };

  const next = () => {
    if (step === 5 && !canFinish) return;
    if (step === 6) finishLesson();
    else { setStep((current) => Math.min(current + 1, resultStep)); window.scrollTo(0, 0); }
  };
  const previous = () => { setStep((current) => Math.max(current - 1, 0)); window.scrollTo(0, 0); };
  const goNextLesson = () => { const nextId = Math.min(lesson.id + 1, courseLessons.length); history.push(`/curs/${levelCode.toLowerCase()}/${nextId}`); };

  if (isInstalledAppView()) {
    return (
      <LessonAppView
        step={step}
        steps={steps}
        lesson={lesson}
        course={course}
        levelCode={levelCode}
        courseLessons={courseLessons}
        lessonExercises={lessonExercises}
        careerModule={careerModule}
        careerPathId={careerProfile.pathId}
        voiceCompleted={voiceCompleted}
        vocabularyIndex={vocabularyIndex}
        careerPhraseIndex={careerPhraseIndex}
        exerciseIndex={exerciseIndex}
        answers={answers}
        exerciseResponses={exerciseResponses}
        showVocabularyTranslations={showVocabularyTranslations}
        showTranslations={showTranslations}
        contentRef={lessonContentRef}
        resultStep={resultStep}
        setVocabularyIndex={setVocabularyIndex}
        setCareerPhraseIndex={setCareerPhraseIndex}
        setExerciseIndex={setExerciseIndex}
        toggleVocabularyTranslation={(index) => setShowVocabularyTranslations((current) => ({ ...current, [index]: !current[index] }))}
        toggleTranslation={(index) => setShowTranslations((current) => ({ ...current, [index]: !current[index] }))}
        next={next}
        previous={previous}
        goNextLesson={goNextLesson}
        onRecordResult={recordResult}
        onDraftExercise={saveExerciseDraft}
        onVoiceComplete={recordVoiceComplete}
        onReplayExercises={() => { setAnswers({}); setExerciseResponses({}); setExerciseIndex(0); setStep(5); }}
        onReviewVocabulary={() => { setVocabularyIndex(0); setStep(1); }}
      />
    );
  }

  return (
    <div className="lesson-shell">
      <div className="lesson-sidebar">
      <header className="lesson-topbar"><Link to="/invata">← Cursul {levelCode}</Link><div><span>Lecția {lesson.id} din {courseLessons.length}</span><strong>{lesson.title}</strong></div><span>{lesson.duration} min</span></header>
      <section className="lesson-app-progress" aria-label={`Pasul ${step + 1} din ${steps.length}: ${steps[step]}`}>
        <div className="lesson-app-progress__copy">
          <strong>{steps[step]}</strong>
          <span>Pasul {step + 1} din {steps.length} · Lecția {lesson.id}</span>
        </div>
        <div className="lesson-app-progress__track" aria-hidden="true"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      </section>
      <div className="lesson-stepper" aria-label="Progresul lecției">{steps.map((label, index) => <button type="button" key={label} className={`${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`} onClick={() => index <= step && setStep(index)} disabled={index > step}><span>{index < step ? '✓' : index + 1}</span><small>{label}</small></button>)}</div>

      </div>
      <main
        className={`lesson-content lesson-content--step-${step}`}
        ref={lessonContentRef}
        style={{ '--lesson-context-image': `url("${getLessonImage(levelCode, lesson.id)}")` }}
      >
        {step === 0 && <CurriculumRecall key={lesson.uid} lesson={lesson} level={levelCode} />}
        {step === 6 && <PremiumGate feature="Dialogul vocal cu AI"><VoiceLessonConversation key={`${levelCode}-${lesson.id}-${careerProfile.pathId}`} level={levelCode} lessonId={lesson.id} pathId={careerProfile.pathId} lessonTitle={lesson.title} task={lesson.production?.speakingPrompt} onComplete={recordVoiceComplete} /></PremiumGate>}
        {step === 0 && <section className="lesson-intro"><div className="lesson-intro__copy"><p className="lesson-eyebrow">Lecția {lesson.id} · Nivel {levelCode} {course.title}</p><h1>{lesson.title}</h1><p className="lesson-lead">O lecție practică pe care o poți finaliza în aproximativ {lesson.duration} minute.</p>{lesson.buildsOn && <aside className="lesson-bridge"><span>Legătura cu ce știi deja</span><p>{lesson.buildsOn}</p></aside>}</div><div className="lesson-mobile-stats" aria-label="Detaliile lecției"><article><span><LessonMetaIcon type="time"/></span><div><strong>{lesson.duration} min</strong><small>Durata lecției</small></div></article><article><span><LessonMetaIcon type="vocabulary"/></span><div><strong>{lesson.vocabulary.length} expresii</strong><small>Vocabular</small></div></article><article><span><LessonMetaIcon type="level"/></span><div><strong>Nivel {levelCode}</strong><small>{course.title}</small></div></article></div><div className="objectives"><h2>După această lecție vei putea:</h2>{lesson.objectives.map((objective) => <div key={objective}><span>✓</span><p>{objective}</p></div>)}</div></section>}
        {step === 1 && <section><div className="lesson-heading"><p className="lesson-eyebrow">Pasul 2</p><h1>Vocabular esențial</h1><p>Ascultă fraza completă în ritm lent, observă cuvântul evidențiat și compară traducerea.</p></div><div className="vocabulary-grid">{lesson.vocabulary.map(([word, wordTranslation, example, sentenceTranslation, highlight], index) => <article className={`vocabulary-card ${index === vocabularyIndex ? 'mobile-expression-card--active' : ''}`} key={word}><header><div><span className="vocabulary-card__label">Expresia {String(index + 1).padStart(2, '0')}</span><h2>{word}</h2></div><span className="vocabulary-card__meaning">{wordTranslation}</span></header><div className="vocabulary-card__example"><span>Exemplu în context</span><div className="vocabulary-card__example-row"><blockquote lang="no"><HighlightedSentence sentence={example} word={word} highlight={highlight}/></blockquote><CompactSlowAudioButton text={example}/></div></div><button className="vocabulary-card__translation-toggle" type="button" aria-expanded={showVocabularyTranslations[index] === true} onClick={() => setShowVocabularyTranslations((current) => ({ ...current, [index]: !current[index] }))}><LessonMetaIcon type="vocabulary"/>{showVocabularyTranslations[index] ? 'Ascunde traducerea' : 'Vezi traducerea și exemplul'}<span aria-hidden="true">⌄</span></button><div className={`vocabulary-card__translation ${showVocabularyTranslations[index] ? 'is-visible' : ''}`} lang="ro"><span>RO</span><p>{sentenceTranslation}</p></div></article>)}</div><MobileExpressionNavigation current={vocabularyIndex} total={lesson.vocabulary.length} onPrevious={() => setVocabularyIndex((current) => Math.max(0, current - 1))} onNext={() => setVocabularyIndex((current) => Math.min(lesson.vocabulary.length - 1, current + 1))} onComplete={() => { setStep(2); window.scrollTo(0, 0); }}/></section>}
        {step === 2 && <section className="career-lesson">
          <div className="lesson-heading career-lesson__heading"><p className="lesson-eyebrow">Pasul 3 · Personalizat</p><h1>Expresii pentru tine</h1><p>{careerModule.coaching}</p></div>
          <div className="career-phrase-grid">{careerModule.phrases.map(([norwegian, romanian, highlight], index) => <article className={index >= careerPhraseIndex * 2 && index < (careerPhraseIndex * 2) + 2 ? 'mobile-expression-card--active' : ''} key={norwegian}><span>Expresia {index + 1}</span><div className="career-phrase-grid__phrase-row"><h2 lang="no"><HighlightedSentence sentence={norwegian} word={highlight} highlight={highlight}/></h2><CompactSlowAudioButton text={norwegian}/></div><p lang="ro">{romanian}</p></article>)}</div>
          <MobileExpressionNavigation current={careerPhraseIndex} total={Math.ceil(careerModule.phrases.length / 2)} onPrevious={() => setCareerPhraseIndex((current) => Math.max(0, current - 1))} onNext={() => setCareerPhraseIndex((current) => Math.min(Math.ceil(careerModule.phrases.length / 2) - 1, current + 1))} onComplete={() => { setStep(3); window.scrollTo(0, 0); }} label="grupuri de expresii"/>
        </section>}
        {step === 3 && <section><div className="lesson-heading"><p className="lesson-eyebrow">Pasul 4</p><h1>Conversație</h1></div><div className="dialogue"><div className="dialogue__actions"><DialogueAudioButton dialogue={lesson.dialogue}/></div>{lesson.dialogue.map(([speaker, text, translation], index) => <article className="dialogue-line" key={`${speaker}-${index}`}><div className="dialogue-speaker"><SpeakerAvatar voice={getDialogueVoice(speaker, index)} /><strong>{speaker}</strong></div><div className="dialogue-line__content"><p>{text}</p>{showTranslations[index] && <small>{translation}</small>}<div><DialogueLineAudioButton text={text} voice={getDialogueVoice(speaker, index)}/><button className="translation-button" type="button" onClick={() => setShowTranslations((current) => ({...current,[index]:!current[index]}))}>{showTranslations[index] ? 'Ascunde' : 'În română'}</button></div></div></article>)}</div><PremiumGate feature="Asistentul virtual de conversație"><ChatAssistant key={`${levelCode}-${lesson.id}-${careerProfile.pathId}`} level={levelCode} lessonId={lesson.id} pathId={careerProfile.pathId} lessonTitle={lesson.title} /></PremiumGate></section>}
        {step === 4 && <section><div className="lesson-heading"><p className="lesson-eyebrow">Pasul 5</p><h1>{lesson.grammar.title}</h1><p>{grammarStepDescription(lesson)}</p></div><LessonGrammar key={lesson.uid} lesson={lesson} /></section>}
        {step === 5 && <section><div className="lesson-heading"><p className="lesson-eyebrow">Pasul 6</p><h1>Verifică ce ai învățat</h1><p>Răspunde la toate cele {lessonExercises.length} întrebări. Greșelile vor fi salvate pentru recapitulare.</p></div><div className="exercise-progress"><span style={{width:`${(answered/lessonExercises.length)*100}%`}}/><small>{answered} din {lessonExercises.length} răspunsuri verificate</small></div><div className="lesson-exercise-list">{lessonExercises.map((exercise,index) => <LessonExercise exercise={exercise} index={index} onResult={recordResult} onDraft={saveExerciseDraft} result={answers[index]} response={exerciseResponses[index]} isMobileActive={index === exerciseIndex} key={`${lesson.id}-${index}-${exercise.careerPath || 'general'}`}/>)}</div><MobileExerciseNavigation current={exerciseIndex} total={lessonExercises.length} answeredCurrent={Object.prototype.hasOwnProperty.call(answers, exerciseIndex)} onPrevious={() => { if (exerciseIndex === 0) previous(); else setExerciseIndex((current) => current - 1); window.scrollTo(0, 0); }} onNext={() => { setExerciseIndex((current) => Math.min(lessonExercises.length - 1, current + 1)); window.scrollTo(0, 0); }} onComplete={next}/></section>}
        {step === resultStep && <section className="lesson-result"><div className="result-icon">✓</div><p className="lesson-eyebrow">Lecție finalizată</p><h1>Bravo! Ai terminat „{lesson.title}”</h1><p>Ai răspuns corect la {score} din {lessonExercises.length} întrebări.</p><div className="result-score"><strong>{Math.round((score/lessonExercises.length)*100)}%</strong><span>scorul lecției</span></div><div className="lesson-result__summary"><div><span><LessonMetaIcon type="vocabulary"/></span><strong>Exerciții</strong><b>{score}/{lessonExercises.length}</b></div><div><span><LessonMetaIcon type="voice"/></span><strong>{voiceCompleted ? 'Dialog vocal finalizat' : 'Dialog vocal de exersat'}</strong><b>{voiceCompleted ? '✓' : '—'}</b></div><div><span><LessonMetaIcon type="level"/></span><strong>{lesson.vocabulary.length} expresii</strong><b>✓</b></div></div>{reviewItems.length > 0 && <div className="review-box"><h2>De repetat</h2><p>Am salvat {reviewItems.length} {reviewItems.length === 1 ? 'răspuns' : 'răspunsuri'} pentru recapitulare.</p><button type="button" onClick={() => {setAnswers({});setExerciseResponses({});setExerciseIndex(0);setStep(5);}}>Repetă exercițiile</button></div>}<div className="result-actions">{lesson.id < courseLessons.length ? <button type="button" className="primary" onClick={goNextLesson}>Continuă cu lecția {lesson.id + 1} →</button> : <Link className="primary" to="/invata">Înapoi la curs</Link>}<button type="button" onClick={() => {setVocabularyIndex(0);setStep(1);}}>Revezi vocabularul</button></div></section>}
      </main>

      {step < resultStep && <footer className={`lesson-navigation ${step === 1 || step === 2 ? 'lesson-navigation--expressions' : ''} ${step === 5 ? 'lesson-navigation--exercises' : ''} ${step === 6 ? 'lesson-navigation--voice' : ''}`}><button type="button" onClick={previous} disabled={step === 0}>← Înapoi</button><span>Pasul {step + 1} din {steps.length}</span><button type="button" className="primary" onClick={next} disabled={step === 5 && !canFinish}>{step === 5 ? (canFinish ? 'Dialog vocal →' : 'Răspunde la toate întrebările') : step === 6 ? 'Finalizează lecția' : 'Continuă →'}</button></footer>}
    </div>
  );
};

const LessonProgram = ({ match }) => {
  const { user } = useAuth();
  const level = String(match?.params?.level || 'A1').toUpperCase();
  const course = courseCatalog[level] || courseCatalog.A1;
  const lesson = course.lessons.find((item) => item.id === Number(match?.params?.lessonId)) || course.lessons[0];
  return <LessonSession key={`${user?.id || 'guest'}-${lesson.uid}`} match={match} />;
};

export default LessonProgram;
