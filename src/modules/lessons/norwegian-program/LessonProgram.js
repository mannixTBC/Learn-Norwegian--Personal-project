import {ui} from '../../../languages/messages.js';
import {courseLocalStorage as localStorage} from '../../../languages/storage.js';
import RecallFocus from './RecallFocus';
import DialogueWalkthrough from './DialogueWalkthrough';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { courseCatalog } from '../../../content/activeContent.js';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import { readReviewItems, saveReviewItem } from '../../../services/spacedReview';
import { recordStudyActivity } from '../../../services/learningActivity';
import { syncLearningProgress } from '../../../services/supabaseLearning';
import { getCareerLessonModule, getCareerProfile } from '../../../services/careerProfile';
import { useAuth } from '../../auth/AuthContext';
import { courseProgressKey, currentLessonKey, lessonResumeKey, readCourseProgress } from '../../../services/curriculumProgress';
import LessonGrammar, { grammarStepDescription } from './LessonGrammar';
import PremiumGate from '../../premium/PremiumGate';
import ChatAssistant from '../../chat/ChatAssistant';
import VoiceLessonConversation from '../../chat/VoiceLessonConversation';
import './LessonProgram.css';
import LessonAppView from './LessonAppView';
import { getLessonImage } from '../lessonVisuals';
import { lessonExerciseAnswer, lessonExerciseReviewPrompt } from './lessonExerciseContent';
import { LESSON_STEPS as steps, LESSON_STAGE, readLessonStep, lessonStepState } from './lessonFlow';
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

const readStorage = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; }
};

const syncSaved = (key, value) => {
  void syncLearningProgress(key, value).catch((error) => {
    console.warn('Progresul rămâne salvat local.', error.message);
  });
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
    <button type="button" onClick={onPrevious} aria-label={current === 0 ? 'Etapa anterioară' : 'Expresia anterioară'}>
      <span aria-hidden="true">←</span>{ui('web_80e573ed8afaa1d0')}</button>
    <div className="mobile-expression-navigation__progress" aria-live="polite">
      <span>{current + 1}{ui('ui_dbd8b6478643d623')}{total}</span>
      <div aria-hidden="true">
        {Array.from({ length: total }, (_, index) => <i className={index === current ? 'active' : ''} key={index}/>) }
      </div>
    </div>
    <button type="button" className="primary" onClick={current === total - 1 ? onComplete : onNext} aria-label={current === total - 1 ? 'Continuă la etapa următoare' : 'Expresia următoare'}>
      {current === total - 1 ? ui('ui_5fc4497d148a38a8') : 'Următoarea'} <span aria-hidden="true">→</span>
    </button>
  </nav>
);

const MobileExerciseNavigation = ({ current, total, answeredCurrent, onPrevious, onNext, onComplete }) => (
  <nav className="mobile-expression-navigation mobile-exercise-navigation" aria-label={ui('web_a1441a12f31d6f30')}>
    <button type="button" onClick={onPrevious} aria-label={current === 0 ? 'Etapa anterioară' : 'Întrebarea anterioară'}>
      <span aria-hidden="true">←</span>{ui('web_80e573ed8afaa1d0')}</button>
    <div className="mobile-expression-navigation__progress">
      <span>{current + 1}{ui('ui_dbd8b6478643d623')}{total}</span>
      <div>{Array.from({ length: total }, (_, index) => <i className={index === current ? 'active' : ''} key={index}/>)}</div>
    </div>
    <button type="button" className="primary" disabled={!answeredCurrent} onClick={current === total - 1 ? onComplete : onNext}>
      {current === total - 1 ? ui('web_7a0056842e472dc1') : 'Următoarea'} <span aria-hidden="true">→</span>
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
    return savedExerciseState.revised && savedStep > LESSON_STAGE.EXERCISES ? LESSON_STAGE.EXERCISES : savedStep;
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
      const current = { level: levelCode, lessonId: lesson.id };
      localStorage.setItem(currentLessonKey(user), JSON.stringify(current));
      syncSaved(currentLessonKey(user), current);
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
      for (const suffix of ['answers', 'responses', 'exercise_index', 'exercise_versions']) {
        const key = `${lessonStepKey}_${suffix}`;
        syncSaved(key, readStorage(key, null));
      }
    }
  }, [answers, exerciseResponses, exerciseIndex, lessonStepKey]);
  useEffect(() => {
    if (skipStepSave.current) {
      skipStepSave.current = false;
      return;
    }
    const savedStep = lessonStepState(step);
    localStorage.setItem(lessonStepKey, JSON.stringify(savedStep));
    void syncLearningProgress(lessonStepKey, savedStep).catch((error) => {
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
    syncSaved(`${lessonStepKey}_voice_complete`, true);
    if (learning) localStorage.setItem(`${lessonStepKey}_voice_learning`, JSON.stringify(learning));
    if (learning) syncSaved(`${lessonStepKey}_voice_learning`, learning);
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
    if (step === LESSON_STAGE.EXERCISES && !canFinish) return;
    if (step === LESSON_STAGE.VOICE) finishLesson();
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
        onReplayExercises={() => { setAnswers({}); setExerciseResponses({}); setExerciseIndex(0); setStep(LESSON_STAGE.EXERCISES); }}
        onReviewVocabulary={() => { setVocabularyIndex(0); setStep(LESSON_STAGE.VOCABULARY); }}
      />
    );
  }

  return (
    <div className="lesson-shell">
      <div className="lesson-sidebar">
      <header className="lesson-topbar"><Link to="/invata">{ui('web_41553805f957e937')}{levelCode}</Link><div><span>{ui('ui_abf153365567efe1')}{lesson.id}{ui('ui_dbd8b6478643d623')}{courseLessons.length}</span><strong>{lesson.title}</strong></div><span>{lesson.duration}{ui('ui_2e75737a6b582974')}</span></header>
      <section className="lesson-app-progress" aria-label={`Pasul ${step + 1} din ${steps.length}: ${steps[step]}`}>
        <div className="lesson-app-progress__copy">
          <strong>{steps[step]}</strong>
          <span>{ui('web_19ed038df30235c1')}{step + 1}{ui('ui_dbd8b6478643d623')}{steps.length}{ui('ui_a2ba73094f24b2ce')}{lesson.id}</span>
        </div>
        <div className="lesson-app-progress__track" aria-hidden="true"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
      </section>
      <div className="lesson-stepper" aria-label={ui('web_e3e1c3316ed109a5')}>{steps.map((label, index) => <button type="button" key={label} className={`${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`} onClick={() => index <= step && setStep(index)} disabled={index > step}><span>{index < step ? '✓' : index + 1}</span><small>{label}</small></button>)}</div>

      </div>
      <main
        className={`lesson-content lesson-content--step-${step}`}
        ref={lessonContentRef}
        style={{ '--lesson-context-image': `url("${getLessonImage(levelCode, lesson.id)}")` }}
      >
        {step === LESSON_STAGE.RECALL && <RecallFocus key={lesson.uid} lesson={lesson} level={levelCode} onContinue={next} onBack={previous} />}
        {step === LESSON_STAGE.VOICE && <PremiumGate feature="Dialogul vocal cu AI"><VoiceLessonConversation stepNumber={LESSON_STAGE.VOICE + 1} key={`${levelCode}-${lesson.id}-${careerProfile.pathId}`} level={levelCode} lessonId={lesson.id} pathId={careerProfile.pathId} lessonTitle={lesson.title} task={lesson.production?.speakingPrompt} onComplete={recordVoiceComplete} /></PremiumGate>}
        {step === LESSON_STAGE.INTRO && <section className="lesson-intro"><div className="lesson-intro__copy"><p className="lesson-eyebrow">{ui('ui_abf153365567efe1')}{lesson.id}{ui('web_b3829b46b11a82fa')}{levelCode} {course.title}</p><h1>{lesson.title}</h1><p className="lesson-lead">{ui('web_440952ed0d6c41d1')}{lesson.duration}{ui('web_8e223bd114e761f6')}</p></div><div className="lesson-mobile-stats" aria-label={ui('web_b6102723876117b3')}><article><span><LessonMetaIcon type="time"/></span><div><strong>{lesson.duration}{ui('ui_2e75737a6b582974')}</strong><small>{ui('web_d9bfb853c2514b11')}</small></div></article><article><span><LessonMetaIcon type="vocabulary"/></span><div><strong>{lesson.vocabulary.length}{ui('ui_a6619ff79822addd')}</strong><small>{ui('web_a0f17cbedf66213a')}</small></div></article><article><span><LessonMetaIcon type="level"/></span><div><strong>{ui('ui_1450f9b5ea87b98c')}{levelCode}</strong><small>{course.title}</small></div></article></div><div className="objectives"><h2>{ui('ui_b4b20486c63ef174')}</h2>{lesson.objectives.map((objective) => <div key={objective}><span>✓</span><p>{objective}</p></div>)}</div></section>}
        {step === LESSON_STAGE.VOCABULARY && <section><div className="lesson-heading"><p className="lesson-eyebrow">{ui('web_96da2b32f3699d7a')}</p><h1>{ui('web_60d554b8acec0fb1')}</h1><p>{ui('web_fcf973b48ca1310f')}</p></div><div className="vocabulary-grid">{lesson.vocabulary.map(([word, wordTranslation, example, sentenceTranslation, highlight], index) => <article className={`vocabulary-card ${index === vocabularyIndex ? 'mobile-expression-card--active' : ''}`} key={word}><header><div><span className="vocabulary-card__label">{ui('ui_5f8317d29f5a120b')}{String(index + 1).padStart(2, '0')}</span><h2>{word}</h2></div><span className="vocabulary-card__meaning">{wordTranslation}</span></header><div className="vocabulary-card__example"><span>{ui('web_95fba5a0d5fbedb6')}</span><div className="vocabulary-card__example-row"><blockquote lang="no"><HighlightedSentence sentence={example} word={word} highlight={highlight}/></blockquote><CompactSlowAudioButton text={example}/></div></div><button className="vocabulary-card__translation-toggle" type="button" aria-expanded={showVocabularyTranslations[index] === true} onClick={() => setShowVocabularyTranslations((current) => ({ ...current, [index]: !current[index] }))}><LessonMetaIcon type="vocabulary"/>{showVocabularyTranslations[index] ? ui('ui_a558381823af9c41') : 'Vezi traducerea și exemplul'}<span aria-hidden="true">⌄</span></button><div className={`vocabulary-card__translation ${showVocabularyTranslations[index] ? 'is-visible' : ''}`} lang="ro"><span>{ui('web_0049aa51a630b791')}</span><p>{sentenceTranslation}</p></div></article>)}</div><MobileExpressionNavigation current={vocabularyIndex} total={lesson.vocabulary.length} onPrevious={() => vocabularyIndex === 0 ? previous() : setVocabularyIndex((current) => current - 1)} onNext={() => setVocabularyIndex((current) => Math.min(lesson.vocabulary.length - 1, current + 1))} onComplete={() => { setStep(LESSON_STAGE.CAREER); window.scrollTo(0, 0); }}/></section>}
        {step === LESSON_STAGE.CAREER && <section className="career-lesson">
          <div className="lesson-heading career-lesson__heading"><p className="lesson-eyebrow">{ui('web_225e3493c0dc4905')}</p><h1>{ui('web_2d52302ff02be1d3')}</h1><p>{careerModule.coaching}</p></div>
          <div className="career-phrase-grid">{careerModule.phrases.map(([norwegian, romanian, highlight], index) => <article className={index >= careerPhraseIndex * 2 && index < (careerPhraseIndex * 2) + 2 ? 'mobile-expression-card--active' : ''} key={norwegian}><span>{ui('ui_5f8317d29f5a120b')}{index + 1}</span><div className="career-phrase-grid__phrase-row"><h2 lang="no"><HighlightedSentence sentence={norwegian} word={highlight} highlight={highlight}/></h2><CompactSlowAudioButton text={norwegian}/></div><p lang="ro">{romanian}</p></article>)}</div>
          <MobileExpressionNavigation current={careerPhraseIndex} total={Math.ceil(careerModule.phrases.length / 2)} onPrevious={() => careerPhraseIndex === 0 ? previous() : setCareerPhraseIndex((current) => current - 1)} onNext={() => setCareerPhraseIndex((current) => Math.min(Math.ceil(careerModule.phrases.length / 2) - 1, current + 1))} onComplete={() => { setStep(LESSON_STAGE.DIALOGUE); window.scrollTo(0, 0); }} label="grupuri de expresii"/>
        </section>}
        {step === LESSON_STAGE.DIALOGUE && <section><div className="lesson-heading"><p className="lesson-eyebrow">{ui('web_e1f28340b834ce8c')}</p><h1>{ui('web_66d6446469626ba6')}</h1></div><DialogueWalkthrough key={lesson.uid} dialogue={lesson.dialogue}><PremiumGate feature="Asistentul virtual de conversație"><ChatAssistant key={`${levelCode}-${lesson.id}-${careerProfile.pathId}`} level={levelCode} lessonId={lesson.id} pathId={careerProfile.pathId} lessonTitle={lesson.title} /></PremiumGate></DialogueWalkthrough></section>}
        {step === LESSON_STAGE.GRAMMAR && <section><div className="lesson-heading"><p className="lesson-eyebrow">{ui('web_c2b9520d4c1f7a31')}</p><h1>{lesson.grammar.title}</h1>{lesson.grammar.mode === 'review' && <p>{grammarStepDescription(lesson)}</p>}</div><LessonGrammar key={lesson.uid} lesson={lesson} onBack={previous} onContinue={next} /></section>}
        {step === LESSON_STAGE.EXERCISES && <section><div className="lesson-heading"><p className="lesson-eyebrow">{ui('web_16dec167ed57cdf5')}</p><h1>{ui('ui_d1e352bf38a9c55b')}</h1><p>{ui('web_167679f5ff0f28f5')}{lessonExercises.length}{ui('web_a81d8e4f1ebd3e2a')}</p></div><div className="exercise-progress"><span style={{width:`${(answered/lessonExercises.length)*100}%`}}/><small>{answered}{ui('ui_dbd8b6478643d623')}{lessonExercises.length}{ui('web_3d8ffbf17341b22a')}</small></div><div className="lesson-exercise-list">{lessonExercises.map((exercise,index) => <LessonExercise exercise={exercise} index={index} onResult={recordResult} onDraft={saveExerciseDraft} result={answers[index]} response={exerciseResponses[index]} isMobileActive={index === exerciseIndex} key={`${lesson.id}-${index}-${exercise.careerPath || 'general'}`}/>)}</div><MobileExerciseNavigation current={exerciseIndex} total={lessonExercises.length} answeredCurrent={Object.prototype.hasOwnProperty.call(answers, exerciseIndex)} onPrevious={() => { if (exerciseIndex === 0) previous(); else setExerciseIndex((current) => current - 1); window.scrollTo(0, 0); }} onNext={() => { setExerciseIndex((current) => Math.min(lessonExercises.length - 1, current + 1)); window.scrollTo(0, 0); }} onComplete={next}/></section>}
        {step === resultStep && <section className="lesson-result"><div className="result-icon">✓</div><p className="lesson-eyebrow">{ui('web_3e810d7ea4aa813f')}</p><h1>{ui('web_8943fdc6106877e9')}{lesson.title}”</h1><p>{ui('web_2dfe425ac34a8a1b')}{score}{ui('ui_dbd8b6478643d623')}{lessonExercises.length}{ui('web_900dd983b52ee8b9')}</p><div className="result-score"><strong>{Math.round((score/lessonExercises.length)*100)}%</strong><span>{ui('web_7adb4cbd3cfa8c5b')}</span></div><div className="lesson-result__summary"><div><span><LessonMetaIcon type="vocabulary"/></span><strong>{ui('web_88814e05b046f4fa')}</strong><b>{score}/{lessonExercises.length}</b></div><div><span><LessonMetaIcon type="voice"/></span><strong>{voiceCompleted ? 'Dialog vocal finalizat' : 'Dialog vocal de exersat'}</strong><b>{voiceCompleted ? '✓' : '—'}</b></div><div><span><LessonMetaIcon type="level"/></span><strong>{lesson.vocabulary.length}{ui('ui_a6619ff79822addd')}</strong><b>✓</b></div></div>{reviewItems.length > 0 && <div className="lesson-result__review-count"><span>{ui('ui_352b62f7948b0ff4')}</span><strong>{reviewItems.length}</strong></div>}<div className="result-actions">{lesson.id < courseLessons.length ? <button type="button" className="primary" onClick={goNextLesson}>{ui('web_b93a7cbbc14ec58a')}{lesson.id + 1} →</button> : <Link className="primary" to="/invata">{ui('ui_cbd40252ce099626')}</Link>}<button type="button" onClick={() => {setVocabularyIndex(0);setStep(LESSON_STAGE.VOCABULARY);}}>{ui('ui_557f8b7181d3dca5')}</button></div></section>}
      </main>

      {step < resultStep && step !== LESSON_STAGE.GRAMMAR && step !== LESSON_STAGE.RECALL && <footer className={`lesson-navigation ${step === LESSON_STAGE.VOCABULARY || step === LESSON_STAGE.CAREER ? 'lesson-navigation--expressions' : ''} ${step === LESSON_STAGE.EXERCISES ? 'lesson-navigation--exercises' : ''} ${step === LESSON_STAGE.VOICE ? 'lesson-navigation--voice' : ''}`}><button type="button" onClick={previous} disabled={step === LESSON_STAGE.INTRO}>{ui('web_a354f4064be3dfef')}</button><span>{ui('web_19ed038df30235c1')}{step + 1}{ui('ui_dbd8b6478643d623')}{steps.length}</span><button type="button" className="primary" onClick={next} disabled={step === LESSON_STAGE.EXERCISES && !canFinish}>{step === LESSON_STAGE.EXERCISES ? (canFinish ? 'Dialog vocal →' : 'Răspunde la toate întrebările') : step === LESSON_STAGE.VOICE ? 'Finalizează lecția' : 'Continuă →'}</button></footer>}
    </div>
  );
};

const LessonProgram = ({ match }) => {
  const { user } = useAuth();
  const level = String(match?.params?.level || ui('ui_16a36e86f6fed5d4')).toUpperCase();
  const course = courseCatalog[level] || courseCatalog.A1;
  const lesson = course.lessons.find((item) => item.id === Number(match?.params?.lessonId)) || course.lessons[0];
  return <LessonSession key={`${user?.id || 'guest'}-${lesson.uid}`} match={match} />;
};

export default LessonProgram;
