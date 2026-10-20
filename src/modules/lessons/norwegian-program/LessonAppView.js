import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import PremiumGate from '../../premium/PremiumGate';
import ChatAssistant from '../../chat/ChatAssistant';
import VoiceLessonConversation from '../../chat/VoiceLessonConversation';
import { LessonMetaIcon, HighlightedSentence, DialogueAudioButton, SpeakerAvatar, getDialogueVoice, DialogueLineAudioButton } from './lessonParts';
import LessonAppExercise from './LessonAppExercise';
import { getLessonImage } from '../lessonVisuals';
import { CurriculumRecall, CurriculumReading, CurriculumProduction } from './CurriculumPractice';
import './LessonProgramApp.css';

/* Vizualizarea lecției pentru aplicația instalată — replică ecranele
   de referință „La cafenea”. Web-ul folosește JSX-ul din LessonProgram. */

const PlayIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5Z" /></svg>;
const PauseIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5h2.8v13H8Zm5.2 0H16v13h-2.8Z" /></svg>;
const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={filled ? 'is-filled' : ''}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);
const BookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5c3.2-.9 5.8-.3 8 1.7v12c-2.2-2-4.8-2.6-8-1.7ZM20 5.5c-3.2-.9-5.8-.3-8 1.7v12c2.2-2 4.8-2.6 8-1.7Z" /></svg>
);
const ChevronIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9.5 6 6 6-6" /></svg>;
const CheckIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;

/* Meniul principal este separat de navigarea între întrebări. */
const AppHeader = ({ title, step, totalSteps, lessonId, onMenu }) => (
  <header className="lapp-header">
    <div className="lapp-header__row">
      {onMenu ? <>
        <div className="lapp-header__copy"><strong className="lapp-header__title">{title}</strong><span className="lapp-header__meta">Pasul {step + 1} din {totalSteps} · Lecția {lessonId}</span></div>
        <button type="button" className="lapp-header__menu" onClick={onMenu} aria-label="Meniu principal">Meniu</button>
      </> : <>
        <Link to="/invata" className="lapp-header__back" aria-label="Înapoi la curs">←</Link>
        <strong className="lapp-header__title">{title}</strong>
        <span className="lapp-header__meta">Pasul {step + 1} din {totalSteps} · Lecția {lessonId}</span>
      </>}
    </div>
    <div className="lapp-header__track" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={totalSteps}>
      <span style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
    </div>
  </header>
);

/* Zona de titlu cu ilustrația contextuală sus-dreapta, ca în referințe. */
const StepHeading = ({ eyebrow, title, sub, art, large }) => (
  <div className={`lapp-heading ${large ? 'lapp-heading--large' : ''}`}>
    <img className="lapp-heading__art" src={art} alt="" aria-hidden="true" />
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

const SaveButton = () => {
  const [saved, setSaved] = useState(false);
  return (
    <button type="button" className={`lapp-save ${saved ? 'is-saved' : ''}`} onClick={() => setSaved((v) => !v)} aria-pressed={saved} aria-label={saved ? 'Elimină din favorite' : 'Salvează în favorite'}>
      <HeartIcon filled={saved} />
    </button>
  );
};

const AppChip = ({ children }) => <span className="lapp-chip">{children}</span>;

/* Bara fixă cu butoanele conturate + CTA, ca în referințe. */
const AppBar = ({ onBack, backDisabled, primaryLabel, onPrimary, primaryDisabled, primarySolid }) => (
  <footer className="lapp-bar">
    <button type="button" className="lapp-bar__back" onClick={onBack} disabled={backDisabled}>← Înapoi</button>
    <button type="button" className={`lapp-bar__primary ${primarySolid ? 'is-solid' : ''}`} onClick={onPrimary} disabled={primaryDisabled}>{primaryLabel} →</button>
  </footer>
);

const AppExpressionBar = ({ current, total, onBack, onNext, onComplete, nextLabel, nextDisabled = false, completeLabel = 'Continuă' }) => (
  <footer className="lapp-bar lapp-bar--dots">
    <button type="button" className="lapp-bar__back" onClick={onBack} aria-label={current === 0 ? 'Etapa anterioară' : 'Elementul anterior'}>← Înapoi</button>
    <div className="lapp-bar__dots" aria-live="polite">
      <span>{current + 1} din {total}</span>
      <div aria-hidden="true">{Array.from({ length: total }, (_, i) => <i className={i === current ? 'is-active' : ''} key={i} />)}</div>
    </div>
    <button
      type="button"
      className={`lapp-bar__next ${current === total - 1 ? 'is-solid' : ''}`}
      onClick={current === total - 1 ? onComplete : onNext}
      disabled={nextDisabled}
    >
      {current === total - 1 ? completeLabel : nextLabel} →
    </button>
  </footer>
);

const LessonAppView = (props) => {
  const {
    step, steps, lesson, course, levelCode, courseLessons, lessonExercises, careerModule, careerPathId, voiceCompleted,
    vocabularyIndex, careerPhraseIndex, exerciseIndex, answers, exerciseResponses, showVocabularyTranslations, showTranslations,
    contentRef, resultStep,
    setVocabularyIndex, setCareerPhraseIndex, setExerciseIndex,
    toggleVocabularyTranslation, toggleTranslation, next, previous, goNextLesson, onRecordResult, onReplayExercises, onDraftExercise,
  } = props;
  const history = useHistory();
  const art = getLessonImage(levelCode, lesson.id);
  const score = Object.values(answers).filter(Boolean).length;
  const answered = Object.keys(answers).length;
  const careerPages = Math.ceil(careerModule.phrases.length / 2);

  return (
    <div className={`lesson-shell lapp${step === 5 ? ' lapp--exercises' : ''}`}>
      <AppHeader title={steps[step]} step={step} totalSteps={steps.length} lessonId={lesson.id}
        onMenu={step === 5 ? () => history.push('/dashboard') : undefined} />

      <main className="lapp-content" ref={contentRef}>
        {step === 0 && (
          <section className="lapp-intro">
            <StepHeading large eyebrow={`Lecția ${lesson.id} · Nivel ${levelCode} ${course.title}`} title={lesson.title} sub={`O lecție practică pe care o poți finaliza în aproximativ ${lesson.duration} minute.`} art={art} />
            <div className="lapp-stats" aria-label="Detaliile lecției">
              <article><span><LessonMetaIcon type="time" /></span><div><strong>{lesson.duration} min</strong><small>Durata lecției</small></div></article>
              <article><span><LessonMetaIcon type="vocabulary" /></span><div><strong>{lesson.vocabulary.length} expresii</strong><small>Vocabular</small></div></article>
              <article><span><LessonMetaIcon type="level" /></span><div><strong>Nivel {levelCode}</strong><small>{course.title}</small></div></article>
            </div>
            {lesson.buildsOn && (
              <aside className="lapp-bridge"><span>Legătura cu ce știi deja</span><p>{lesson.buildsOn}</p></aside>
            )}
            <CurriculumRecall key={lesson.uid} lesson={lesson} level={levelCode} />
            <div className="lapp-objectives">
              <h2>După această lecție vei putea:</h2>
              {lesson.objectives.map((objective) => <div key={objective}><span><CheckIcon /></span><p>{objective}</p></div>)}
            </div>
          </section>
        )}

        {step === 1 && (
          <section>
            <StepHeading eyebrow="Pasul 2" title="Vocabular esențial" sub="Ascultă expresia, observă cuvântul evidențiat și compară traducerea." art={art} />
            {lesson.vocabulary.map(([word, wordTranslation, example, sentenceTranslation, highlight], index) => index !== vocabularyIndex ? null : (
              <article className="lapp-card lapp-vocab" key={word}>
                <div className="lapp-card__top">
                  <AppChip>{index + 1} din {lesson.vocabulary.length}</AppChip>
                  <SaveButton />
                </div>
                <h2 lang="no">{word}</h2>
                <p className="lapp-vocab__sub">{wordTranslation}</p>
                <AudioWave text={word} />
                <div className="lapp-vocab__example">
                  <p lang="no"><HighlightedSentence sentence={example} word={word} highlight={highlight} /></p>
                  <div className={`lapp-vocab__translation ${showVocabularyTranslations[index] ? 'is-visible' : ''}`} lang="ro">{sentenceTranslation}</div>
                </div>
                <button type="button" className="lapp-reveal" aria-expanded={showVocabularyTranslations[index] === true} onClick={() => toggleVocabularyTranslation(index)}>
                  <BookIcon />
                  <span>{showVocabularyTranslations[index] ? 'Ascunde traducerea' : 'Vezi traducerea și exemplul'}</span>
                  <ChevronIcon />
                </button>
              </article>
            ))}
            <AppExpressionBar current={vocabularyIndex} total={lesson.vocabulary.length} nextLabel="Următoarea"
              onBack={() => vocabularyIndex === 0 ? previous() : setVocabularyIndex((c) => c - 1)}
              onNext={() => setVocabularyIndex((c) => Math.min(lesson.vocabulary.length - 1, c + 1))}
              onComplete={next} />
          </section>
        )}

        {step === 2 && (
          <section>
            <StepHeading eyebrow="Pasul 3 · Personalizat" title="Expresii pentru tine" sub={careerModule.coaching} art={art} />
            <div className="lapp-career">
              {careerModule.phrases.map(([norwegian, romanian, highlight], index) => {
                const visible = index >= careerPhraseIndex * 2 && index < careerPhraseIndex * 2 + 2;
                return visible ? (
                  <article className="lapp-card lapp-career__card" key={norwegian}>
                    <div className="lapp-card__top"><AppChip>Personalizat</AppChip></div>
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

        {step === 3 && (
          <section>
            <StepHeading eyebrow="Pasul 4" title="Conversație" sub="Ascultă dialogul și compară cu traducerea." art={art} />
            <div className="lapp-card lapp-dialogue">
              <DialogueAudioButton dialogue={lesson.dialogue} />
              {lesson.dialogue.map(([speaker, text, translation], index) => (
                <article className="lapp-dialogue__line" key={`${speaker}-${index}`}>
                  <div className="lapp-dialogue__speaker"><SpeakerAvatar voice={getDialogueVoice(speaker, index)} /><strong>{speaker}</strong></div>
                  <div className="lapp-dialogue__bubble">
                    <p lang="no">{text}</p>
                    {showTranslations[index] && <small lang="ro">{translation}</small>}
                    <div className="lapp-dialogue__actions">
                      <DialogueLineAudioButton text={text} voice={getDialogueVoice(speaker, index)} />
                      <button type="button" className="lapp-dialogue__translate" onClick={() => toggleTranslation(index)}>{showTranslations[index] ? 'Ascunde' : 'În română'}</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <PremiumGate feature="Asistentul virtual de conversație">
              <ChatAssistant key={`${levelCode}-${lesson.id}-${careerPathId}-app`} level={levelCode} lessonId={lesson.id} pathId={careerPathId} lessonTitle={lesson.title} />
            </PremiumGate>
          </section>
        )}

        {step === 4 && (
          <section>
            <StepHeading eyebrow="Pasul 5" title={lesson.grammar.title} sub="O regulă scurtă, urmată imediat de exemple." art={art} />
            <div className="lapp-card lapp-grammar">
              <div className="lapp-card__top"><AppChip>Regulă</AppChip></div>
              <div className="lapp-grammar__rule">
                <span className="lapp-grammar__aa" aria-hidden="true">Aa</span>
                <p>{lesson.grammar.rule}</p>
              </div>
              {lesson.grammar.examples.map((example) => (
                <div className="lapp-grammar__example" key={example}><span className="is-ok"><CheckIcon /></span><p>{example}</p></div>
              ))}
              <div className="lapp-grammar__example is-wrong"><span className="is-no">×</span><p><strong>Formulare de evitat în acest context: </strong>{lesson.grammar.wrong}</p></div>
            </div>
            <CurriculumReading key={lesson.uid} lesson={lesson} />
            <CurriculumProduction key={`${lesson.uid}-production`} lesson={lesson} level={levelCode} />
          </section>
        )}

        {step === 5 && (
          <section className="lapp-practice">
            <header className="lapp-practice__intro">
              <div><p className="lapp-practice__topic">Lecția {lesson.id} · {lesson.title}</p><h1>Hai să exersăm</h1></div>
            </header>
            <div className="lapp-practice__progress" role="progressbar" aria-label="Întrebări verificate" aria-valuemin={0} aria-valuemax={lessonExercises.length} aria-valuenow={answered}>
              <span>Întrebarea {exerciseIndex + 1}/{lessonExercises.length}</span>
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

        {step === 6 && (
          <section>
            <PremiumGate feature="Dialogul vocal cu AI">
              <VoiceLessonConversation
                key={`${levelCode}-${lesson.id}-${careerPathId}-app`}
                level={levelCode}
                lessonId={lesson.id}
                pathId={careerPathId}
                lessonTitle={lesson.title}
                onComplete={props.onVoiceComplete}
              />
            </PremiumGate>
          </section>
        )}

        {step === resultStep && (
          <section className="lapp-result">
            <div className="lapp-result__badge" aria-hidden="true"><CheckIcon /></div>
            <p className="lapp-eyebrow lapp-eyebrow--center">Lecție finalizată</p>
            <h1>Bravo!</h1>
            <p className="lapp-result__sub">Lecția „{lesson.title}” s-a încheiat cu succes.</p>
            <div className="lapp-ring" role="img" aria-label={`Scorul lecției: ${Math.round((score / lessonExercises.length) * 100)}%`}>
              <strong>{Math.round((score / lessonExercises.length) * 100)}%</strong>
              <span>scorul lecției</span>
            </div>
            <div className="lapp-statscard">
              <div><span><LessonMetaIcon type="vocabulary" /></span><strong>Exerciții corecte</strong><b>{score}/{lessonExercises.length}</b></div>
              <div><span><LessonMetaIcon type="voice" /></span><strong>{voiceCompleted ? 'Dialog vocal finalizat' : 'Dialog vocal de exersat'}</strong><b>{voiceCompleted ? '✓' : '—'}</b></div>
              <div><span><LessonMetaIcon type="level" /></span><strong>Expresii noi</strong><b>{lesson.introducedVocabulary.length}</b></div>
            </div>
            {Object.values(answers).filter((v) => !v).length > 0 && (
              <div className="lapp-review">
                <h2>De repetat</h2>
                <p>Am salvat {Object.values(answers).filter((v) => !v).length} {Object.values(answers).filter((v) => !v).length === 1 ? 'răspuns' : 'răspunsuri'} pentru recapitulare.</p>
                <button type="button" onClick={onReplayExercises}>Repetă exercițiile</button>
              </div>
            )}
            <div className="lapp-result__actions">
              {lesson.id < courseLessons.length
                ? <button type="button" className="is-solid" onClick={goNextLesson}>Continuă cu lecția {lesson.id + 1} →</button>
                : <Link className="is-solid" to="/invata">Înapoi la curs</Link>}
              <button type="button" onClick={() => props.onReviewVocabulary()}><BookIcon /> Revezi vocabularul</button>
            </div>
          </section>
        )}
      </main>

      {step < resultStep && step !== 1 && step !== 2 && step !== 5 && (
        <AppBar onBack={previous} backDisabled={step === 0}
          primaryLabel={step === 6 ? 'Finalizează lecția' : 'Continuă'}
          onPrimary={next} primarySolid />
      )}
    </div>
  );
};

export default LessonAppView;
