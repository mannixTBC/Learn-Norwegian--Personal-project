import {ui} from '../../../languages/messages.js';
import RecallFocus from './RecallFocus';
import DialogueWalkthrough from './DialogueWalkthrough';
import {lessonNextPractice} from './lessonNextPractice';
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import PremiumGate from '../../premium/PremiumGate';
import ChatAssistant from '../../chat/ChatAssistant';
import VoiceLessonConversation from '../../chat/VoiceLessonConversation';
import { LessonMetaIcon, HighlightedSentence } from './lessonParts';
import LessonAppExercise from './LessonAppExercise';
import { getLessonImage } from '../lessonVisuals';

import LessonGrammar, { grammarStepDescription } from './LessonGrammar';
import { LESSON_STAGE } from './lessonFlow';
import './LessonProgramApp.css';

/* Pașii aplicației împart aceeași atmosferă; ilustrația contextuală
   însoțește introducerea și rezultatul. Web-ul folosește LessonProgram. */

const PlayIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5Z" /></svg>;
const PauseIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5h2.8v13H8Zm5.2 0H16v13h-2.8Z" /></svg>;
const BookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5c3.2-.9 5.8-.3 8 1.7v12c-2.2-2-4.8-2.6-8-1.7ZM20 5.5c-3.2-.9-5.8-.3-8 1.7v12c2.2-2 4.8-2.6 8-1.7Z" /></svg>
);
const CheckIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;

/* Meniul principal este separat de navigarea între întrebări. */
const AppHeader = ({ title, step, totalSteps, lessonId, levelCode, onMenu }) => (
  <header className="lapp-header">
    <div className="lapp-header__row">
      <strong className="lapp-header__title">{levelCode}{ui('ui_a2ba73094f24b2ce')}{lessonId}</strong>
      <button type="button" className="lapp-header__menu" onClick={onMenu} aria-label={ui('web_dd49a5e5e1cc47c0')}>{ui('web_bfc19840d73e2643')}</button>
    </div>
    <div className="lapp-header__track" role="progressbar" aria-label={ui('web_e3e1c3316ed109a5')} aria-valuetext={`${title}, pasul ${step + 1} din ${totalSteps}`} aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={totalSteps}>
      <span style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
    </div>
    <p className="lapp-header__meta">{ui('web_19ed038df30235c1')}{step + 1}{ui('ui_dbd8b6478643d623')}{totalSteps}</p>
  </header>
);

/* Zona de titlu cu ilustrația contextuală sus-dreapta, ca în referințe. */
const StepHeading = ({ eyebrow, title, sub, art, large }) => (
  <div className={`lapp-heading ${large ? 'lapp-heading--large' : ''}`}>
    {art && <img className="lapp-heading__art" src={art} alt="" aria-hidden="true" />}
    {eyebrow && <p className="lapp-eyebrow">{eyebrow}</p>}
    <h1>{title}</h1>
    {sub && <p className="lapp-heading__sub">{sub}</p>}
  </div>
);

/* Rândul audio: cerc teal + undă sonoră animată cât timp se aude. */
const AudioWave = ({ text, label, slow, size }) => {
  const [playing, setPlaying] = useState(false);
  const play = async () => {
    if (playing) return;
    setPlaying(true);
    try { await speakNorwegian(text, { voice: 'female', slow, waitForEnd: true }); } finally { setPlaying(false); }
  };
  return (
    <div className={`lapp-audio ${playing ? 'is-playing' : ''} ${size ? `lapp-audio--${size}` : ''}`}>
      <button type="button" className="lapp-audio__circle" onClick={play} aria-label={`Ascultă: ${text}`}>
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <span className="lapp-audio__bars" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => <i key={i} style={{ height: `${6 + ((i * 41) % 20)}px`, animationDelay: `${(i % 7) * 95}ms` }} />)}
      </span>
      {label && <small className="lapp-audio__label">{label}</small>}
    </div>
  );
};

const AppChip = ({ children }) => <span className="lapp-chip">{children}</span>;

/* Bara fixă cu butoanele conturate + CTA, ca în referințe. */
const AppBar = ({ onBack, backDisabled, primaryLabel, onPrimary, primaryDisabled, primarySolid }) => (
  <footer className="lapp-bar">
    <button type="button" className="lapp-bar__back" onClick={onBack} disabled={backDisabled}>{ui('web_a354f4064be3dfef')}</button>
    <button type="button" className={`lapp-bar__primary ${primarySolid ? 'is-solid' : ''}`} onClick={onPrimary} disabled={primaryDisabled}>{primaryLabel} →</button>
  </footer>
);

const AppExpressionBar = ({ current, total, onBack, onNext, onComplete, nextLabel, nextDisabled = false, completeLabel = ui('ui_5fc4497d148a38a8') }) => (<>
  <div className="lapp-expression-progress" aria-live="polite">
    <span>{current + 1}{ui('ui_dbd8b6478643d623')}{total}</span>
    <div aria-hidden="true">{Array.from({ length: total }, (_, i) => <i className={i === current ? 'is-active' : ''} key={i} />)}</div>
  </div>
  <footer className="lapp-bar lapp-bar--dots">
    <button type="button" className="lapp-bar__back" onClick={onBack} aria-label={current === 0 ? 'Etapa anterioară' : 'Elementul anterior'}>{ui('web_a354f4064be3dfef')}</button>
    <button
      type="button"
      className="lapp-bar__next is-solid"
      onClick={current === total - 1 ? onComplete : onNext}
      disabled={nextDisabled}
    >
      {current === total - 1 ? completeLabel : nextLabel} →
    </button>
  </footer>
</>);

const LessonAppView = (props) => {
  const {
    step, steps, lesson, course, levelCode, courseLessons, lessonExercises, careerModule, careerPathId, voiceCompleted,
    vocabularyIndex, careerPhraseIndex, exerciseIndex, answers, exerciseResponses,
    contentRef, resultStep,
    setVocabularyIndex, setCareerPhraseIndex, setExerciseIndex,
    next, previous, goNextLesson, onRecordResult, onDraftExercise,
  } = props;
  const history = useHistory();
  const recommended = lessonNextPractice(levelCode, lesson.id);
  const art = getLessonImage(levelCode, lesson.id);
  const score = Object.values(answers).filter(Boolean).length;
  const answered = Object.keys(answers).length;
  const percentage = Math.round((score / lessonExercises.length) * 100);
  const reviewCount = Object.values(answers).filter((value) => !value).length;
  const careerPages = Math.ceil(careerModule.phrases.length / 2);

  return (
    <div className={`lesson-shell lapp lapp--step-${step}${step === LESSON_STAGE.EXERCISES ? ' lapp--exercises' : ''}${step === resultStep ? ' lapp--result' : ''}`}>
      <AppHeader title={steps[step]} step={step} totalSteps={steps.length} lessonId={lesson.id} levelCode={levelCode}
        onMenu={() => history.push('/dashboard')} />

      <main className="lapp-content" ref={contentRef}>
        {step === LESSON_STAGE.INTRO && (
          <section className="lapp-intro">
            <StepHeading large eyebrow="Descoperă și folosește" title={lesson.title} sub={`O lecție practică de aproximativ ${lesson.duration} minute.`} art={art} />
            <div className="lapp-stats" aria-label={ui('web_b6102723876117b3')}>
              <article><span><LessonMetaIcon type="time" /></span><div><strong>{lesson.duration}{ui('ui_2e75737a6b582974')}</strong><small>{ui('web_d9bfb853c2514b11')}</small></div></article>
              <article><span><LessonMetaIcon type="vocabulary" /></span><div><strong>{lesson.vocabulary.length}{ui('ui_a6619ff79822addd')}</strong><small>{ui('web_a0f17cbedf66213a')}</small></div></article>
              <article><span><LessonMetaIcon type="level" /></span><div><strong>{ui('ui_1450f9b5ea87b98c')}{levelCode}</strong><small>{course.title}</small></div></article>
            </div>
            <div className="lapp-objectives">
              <h2>{ui('ui_b4b20486c63ef174')}</h2>
              {lesson.objectives.map((objective) => <div key={objective}><span><CheckIcon /></span><p>{objective}</p></div>)}
            </div>
          </section>
        )}

        {step === LESSON_STAGE.RECALL && (
          <section className="lapp-stage--recall">
            <RecallFocus key={lesson.uid} lesson={lesson} level={levelCode} onContinue={next} onBack={previous} />
          </section>
        )}

        {step === LESSON_STAGE.VOCABULARY && (
          <section>
            <StepHeading title={ui('ui_2fafa1921fabaa27')} sub="Ascultă, observă și reține." />
            {lesson.vocabulary.map(([word, wordTranslation, example, sentenceTranslation, highlight], index) => index !== vocabularyIndex ? null : (
              <article className="lapp-card lapp-vocab" key={word}>
                <div className="lapp-card__top">
                  <AppChip>{index + 1}{ui('ui_dbd8b6478643d623')}{lesson.vocabulary.length}</AppChip>

                </div>
                <h2 lang="no">{word}</h2>
                <p className="lapp-vocab__sub">{wordTranslation}</p>
                <AudioWave text={word} />
                <div className="lapp-vocab__example">
                  <p lang="no"><HighlightedSentence sentence={example} word={word} highlight={highlight} /></p>
                  <div className="lapp-vocab__translation is-visible" lang="ro">{sentenceTranslation}</div>
                </div>
              </article>
            ))}
            <AppExpressionBar current={vocabularyIndex} total={lesson.vocabulary.length} nextLabel="Următoarea"
              onBack={() => vocabularyIndex === 0 ? previous() : setVocabularyIndex((c) => c - 1)}
              onNext={() => setVocabularyIndex((c) => Math.min(lesson.vocabulary.length - 1, c + 1))}
              onComplete={next} />
          </section>
        )}

        {step === LESSON_STAGE.CAREER && (
          <section>
            <StepHeading title={ui('ui_25b33dc32bbfc234')} sub={careerModule.coaching} />
            <div className="lapp-career">
              {careerModule.phrases.map(([norwegian, romanian, highlight], index) => {
                const visible = index >= careerPhraseIndex * 2 && index < careerPhraseIndex * 2 + 2;
                return visible ? (
                  <article className="lapp-card lapp-career__card" key={norwegian}>
                    <div className="lapp-card__top"><AppChip>{ui('web_686c54ce7647a12a')}</AppChip></div>
                    <h2 lang="no"><HighlightedSentence sentence={norwegian} word={highlight} highlight={highlight} /></h2>
                    <div className="lapp-career__row">
                      <p lang="ro">{romanian}</p>
                      <AudioWave text={norwegian} size="sm" />
                    </div>
                  </article>
                ) : null;
              })}
            </div>
            <AppExpressionBar current={careerPhraseIndex} total={careerPages} nextLabel="Următoarea"
              onBack={() => careerPhraseIndex === 0 ? previous() : setCareerPhraseIndex((c) => c - 1)}
              onNext={() => setCareerPhraseIndex((c) => Math.min(careerPages - 1, c + 1))}
              onComplete={next} />
          </section>
        )}

        {step === LESSON_STAGE.DIALOGUE && (
          <section>
            <StepHeading title={ui('ui_af2a38b0b1c6704a')} sub="Ascultă dialogul și descoperă cum se leagă replicile." />
            <DialogueWalkthrough key={lesson.uid} dialogue={lesson.dialogue}>
              <PremiumGate feature="Asistentul virtual de conversație">
                <ChatAssistant key={`${levelCode}-${lesson.id}-${careerPathId}-app`} level={levelCode} lessonId={lesson.id} pathId={careerPathId} lessonTitle={lesson.title} />
              </PremiumGate>
            </DialogueWalkthrough>
          </section>
        )}

        {step === LESSON_STAGE.GRAMMAR && (
          <section>
            <StepHeading title={lesson.grammar.mode === 'review' ? 'Trei repere de recapitulare' : 'Două repere utile'} sub={lesson.grammar.mode === 'review' ? grammarStepDescription(lesson) : undefined} />
            <LessonGrammar key={lesson.uid} lesson={lesson} onBack={previous} onContinue={next} />
          </section>
        )}

        {step === LESSON_STAGE.EXERCISES && (
          <section className="lapp-practice">
            <header className="lapp-practice__intro">
              <div><p className="lapp-practice__topic">{ui('ui_abf153365567efe1')}{lesson.id} · {lesson.title}</p><h1>{ui('web_e822cd57defdda7f')}</h1></div>
            </header>
            <div className="lapp-practice__progress" role="progressbar" aria-label={ui('web_df7d707446ecf152')} aria-valuemin={0} aria-valuemax={lessonExercises.length} aria-valuenow={answered}>
              <span>{ui('web_d3526d8dd6340992')}{exerciseIndex + 1}/{lessonExercises.length}</span>
              <div aria-hidden="true">{lessonExercises.map((_, i) => <i className={answers[i] !== undefined ? 'is-done' : i === exerciseIndex ? 'is-current' : ''} key={i} />)}</div>
            </div>
            <LessonAppExercise
              key={`${lesson.id}-${exerciseIndex}-${lessonExercises[exerciseIndex].careerPath || 'general'}`}
              exercise={lessonExercises[exerciseIndex]}
              vocabulary={lesson.vocabulary}
              index={exerciseIndex}
              onResult={onRecordResult}
              onDraft={onDraftExercise}
              result={answers[exerciseIndex]}
              response={exerciseResponses?.[exerciseIndex]}
              onPrevious={() => exerciseIndex === 0 ? previous() : setExerciseIndex((current) => current - 1)}
              onContinue={() => exerciseIndex < lessonExercises.length - 1 ? setExerciseIndex((c) => c + 1) : next()}
            />
          </section>
        )}

        {step === LESSON_STAGE.VOICE && (
          <section>
            <PremiumGate feature="Dialogul vocal cu AI">
              <VoiceLessonConversation
                stepNumber={LESSON_STAGE.VOICE + 1}
                key={`${levelCode}-${lesson.id}-${careerPathId}-app`}
                level={levelCode}
                lessonId={lesson.id}
                pathId={careerPathId}
                lessonTitle={lesson.title} task={lesson.production?.speakingPrompt}
                onComplete={props.onVoiceComplete}
              />
            </PremiumGate>
          </section>
        )}

        {step === resultStep && (
          <section className="lapp-result">
            <div className="lapp-result__hero">
              <img className="lapp-result__art" src={art} alt="" aria-hidden="true" />
              <div className="lapp-result__badge" aria-hidden="true"><CheckIcon /></div>
              <h1>{ui('web_eda3acf227afbb60')}</h1>
              <p className="lapp-result__sub">{ui('web_e0e174f4b71ee252')}{lesson.title}”.</p>
            </div>
            <div className="lapp-statscard">
              <div><span><LessonMetaIcon type="vocabulary" /></span><strong>{score}{ui('ui_dbd8b6478643d623')}{lessonExercises.length}<small>{ui('web_702671d980da1c42')}</small>{reviewCount > 0 && <small className="lapp-result__inline-review">{reviewCount}{ui('ui_6c402b7bd2698673')}</small>}</strong><b>{percentage}%</b></div>
              <div><span><LessonMetaIcon type="voice" /></span><strong>{voiceCompleted ? 'Dialog vocal finalizat' : 'Dialog vocal de exersat'}</strong><b>{voiceCompleted ? '✓' : '—'}</b></div>
              <button type="button" className="lapp-result__vocabulary" onClick={() => props.onReviewVocabulary()}><span><BookIcon /></span><strong>{ui('ui_557f8b7181d3dca5')}</strong><b aria-hidden="true">→</b></button>
            </div>
            <section className="lapp-next-practice" aria-label={ui('web_33135ce4cf748a2c')}>
              <h2>{ui('web_886034be8997b615')}</h2>
              {recommended.scenario && <Link to={'/scenarii?nivel='+levelCode+'&scenariu='+encodeURIComponent(recommended.scenario.id)+'&porneste=1'}><strong>{ui('web_dbd53375b71ce918')}</strong><small>{recommended.scenario.title}</small><span aria-hidden="true">→</span></Link>}
              <Link to={'/hangman?nivel='+levelCode}><strong>{ui('ui_a60eba1190b8698d')}</strong><small>{ui('web_9b5f3ed4cc37f36f')}</small><span aria-hidden="true">→</span></Link>
              {recommended.verb && <Link to={'/challenge30?nivel='+levelCode+'&lectie='+lesson.id+'&verb='+encodeURIComponent(recommended.verb.id)}><strong>{ui('web_ed28d9de1e9670a5')}</strong><small>{recommended.verb.infinitive} · {recommended.verb.translation}</small><span aria-hidden="true">→</span></Link>}
            </section>
            <div className="lapp-result__actions">
              {lesson.id < courseLessons.length
                ? <button type="button" className="is-solid" onClick={goNextLesson}>{ui('web_0c63f3dbd676b83a')}</button>
                : <Link className="is-solid" to="/invata">{ui('ui_cbd40252ce099626')}</Link>}
            </div>
          </section>
        )}
      </main>

      {step < resultStep && step !== LESSON_STAGE.GRAMMAR && step !== LESSON_STAGE.RECALL && step !== LESSON_STAGE.VOCABULARY && step !== LESSON_STAGE.CAREER && step !== LESSON_STAGE.EXERCISES && (
        <AppBar onBack={previous} backDisabled={step === LESSON_STAGE.INTRO}
          primaryLabel={step === LESSON_STAGE.INTRO ? ui('ui_54609dd4c72877da') : step === LESSON_STAGE.VOICE ? 'Finalizează lecția' : ui('ui_5fc4497d148a38a8')}
          onPrimary={next} primarySolid />
      )}
    </div>
  );
};

export default LessonAppView;
