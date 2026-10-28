import './NordicChoice.css';
import React, { useEffect, useRef, useState } from 'react';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import { lessonExerciseAnswer, lessonExerciseSentence } from './lessonExerciseContent';
import useLessonExercise, { normalizeLessonAnswer } from './useLessonExercise';
import './LessonExerciseFeedback.css';

const BookmarkIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4Z" /></svg>;
const SpeakerIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m11 5-5 4H3v6h3l5 4ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" /></svg>;
const matchText = (text) => normalizeLessonAnswer(text).replace(/[.!?]+$/, '');

export default function LessonAppExercise({ exercise, vocabulary = [], index, onResult, onContinue, onPrevious, onDraft, result, response }) {
  const { value, wordIndexes, gapAnswers, words, outcome, reviewing, practicing, checked, complete, singleGap, manualCheck, submitted, updateDraft, submit, repeatWrongAnswer, addOrderWord, removeOrderWord, placeGapAnswer, clearGapAnswer } = useLessonExercise({ exercise, index, onResult, onDraft, result, response });
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const audioController = useRef(null);
  const continuing = useRef(false);
  const heading = useRef(null);
  const feedback = useRef(null);
  const feedbackTrigger = useRef(null);
  const feedbackContinue = useRef(null);
  const feedbackTitleId = `lesson-feedback-title-${index}`;
  const sentence = lessonExerciseSentence(exercise);
  const correctAnswer = lessonExerciseAnswer(exercise);
  const spokenAnswer = exercise.type === 'choice'
    ? vocabulary.find(([norwegian, romanian]) => [norwegian, romanian].some((text) => matchText(text) === matchText(correctAnswer)))?.[0]
    : correctAnswer;
  const formId = `lesson-answer-form-${index}`;
  const formattedOrder = checked && outcome && exercise.answerSentence ? exercise.answerSentence.split(/\s+/) : [];

  useEffect(() => { heading.current?.focus(); }, []);
  useEffect(() => () => audioController.current?.abort(), []);
  useEffect(() => {
    if (checked) setFeedbackOpen(true);
  }, [checked]);
  useEffect(() => {
    const modal = feedback.current;
    if (feedbackOpen && checked) {
      if (!modal?.open) modal?.showModal?.();
      feedbackContinue.current?.focus();
    } else if (modal?.open) modal.close();
  }, [feedbackOpen, checked]);

  const closeFeedback = () => {
    setFeedbackOpen(false);
    audioController.current?.abort();
    audioController.current = null;
    setPlaying(false);
    feedbackTrigger.current?.focus();
  };
  const repeatExercise = () => {
    if (outcome !== false) return;
    setFeedbackOpen(false);
    audioController.current?.abort();
    audioController.current = null;
    setPlaying(false);
    setAudioError('');
    repeatWrongAnswer();
    heading.current?.focus();
  };

  const playAnswer = async () => {
    if (!spokenAnswer || audioController.current) return;
    const controller = new AbortController();
    audioController.current = controller;
    setPlaying(true);
    setAudioError('');
    try {
      const audio = await speakNorwegian(spokenAnswer, { signal: controller.signal, waitForEnd: true });
      if (!controller.signal.aborted && audio?.ok === false && !audio.cancelled) setAudioError('Nu am putut reda răspunsul. Încearcă din nou.');
    } catch (_) {
      if (!controller.signal.aborted) setAudioError('Nu am putut reda răspunsul. Încearcă din nou.');
    } finally {
      if (!controller.signal.aborted) setPlaying(false);
      if (audioController.current === controller) audioController.current = null;
    }
  };

  const continueExercise = () => {
    if (!submitted.current || continuing.current) return;
    continuing.current = true;
    audioController.current?.abort();
    onContinue();
  };
  const previousExercise = () => {
    if (!onPrevious || continuing.current) return;
    continuing.current = true;
    audioController.current?.abort();
    onPrevious();
  };

  return (
    <div className={`lapp-exercise${exercise.type === 'choice' ? ' nordic-choice' : ''}${checked ? ' is-checked' : ''}`}>
      {practicing ? <p className="lapp-exercise__reviewed">Repetare · scorul primei încercări se păstrează.</p> : reviewing && <p className="lapp-exercise__reviewed">Răspuns deja verificat</p>}
      {exercise.type === 'choice' ? <div className="nordic-choice__prompt">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M26 14c0 6-5 10-11 10H9l-6 4 2-8a10 10 0 0 1-2-6C3 8 8 4 15 4s11 4 11 10Z" /><circle cx="10" cy="14" r="1" /><circle cx="15" cy="14" r="1" /><circle cx="20" cy="14" r="1" /></svg>
        <div><span>Alege răspunsul potrivit</span><h2 ref={heading} tabIndex={-1}>{exercise.prompt}</h2></div>
      </div> : <h2 ref={heading} tabIndex={-1}>{exercise.prompt}</h2>}
      {exercise.instruction && <p className="lapp-exercise__instruction">{exercise.instruction}</p>}
      {exercise.type === 'choice' && <div className="lapp-options" role="group" aria-label="Variante de răspuns">
        {exercise.options.map((option, position) => {
          const selected = value !== '' && Number(value) === position;
          const correct = checked && position === exercise.answer;
          const wrong = checked && selected && !correct;
          return <button type="button" disabled={checked} aria-pressed={selected} className={correct ? 'is-correct' : wrong ? 'is-wrong' : selected ? 'is-selected' : ''} onClick={() => updateDraft({ value: String(position) })} key={`${position}-${option}`}>
            <span className="lapp-option__letter" aria-hidden="true">{String.fromCharCode(65 + position)}</span>
            <span className="lapp-option__text">{option}</span>
            {!checked && selected && <span className="nordic-choice__selected" aria-hidden="true">●</span>}
            {(correct || wrong) && <span className="lapp-option__mark" aria-label={correct ? 'Răspuns corect' : 'Răspunsul tău, incorect'}>{correct ? '✓' : '×'}</span>}
          </button>;
        })}
      </div>}
      {exercise.type === 'fill' && <form id={formId} onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <div className={`lapp-exercise__card${checked ? outcome ? ' is-correct' : ' is-wrong' : ''}`}>
          <label className={sentence ? 'sr-only' : 'lapp-answer-label'} htmlFor={`lesson-answer-${index}`}>Cuvântul lipsă</label>
          <div className={sentence ? 'lapp-exercise__inline-sentence' : ''} lang="nb">
            {sentence && <span>{sentence.split('___')[0]}</span>}
            <input className={`answer-input${sentence ? ' answer-input--inline' : ''}`} id={`lesson-answer-${index}`} value={value} disabled={checked} aria-invalid={checked && !outcome ? true : undefined} lang="nb" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} onChange={(event) => updateDraft({ value: event.target.value })} placeholder={sentence ? '…' : 'Scrie în norvegiană'} />
            {sentence && <span>{sentence.split('___').slice(1).join('___')}</span>}
          </div>
        </div>
        {!checked && <p className="lapp-exercise__hint">Scrie cuvântul, apoi verifică răspunsul.</p>}
      </form>}
      {exercise.type === 'order' && <>
        <div className="lapp-exercise__card">
          {exercise.dialogueCue && <p className="lapp-exercise__dialogue" lang="nb">{exercise.dialogueCue}</p>}
          <div className="sentence-builder" aria-label="Propoziția ta">{words.map((word, position) => <button type="button" disabled={checked} key={wordIndexes[position]} aria-label={checked ? word : `Elimină ${word}`} onClick={() => removeOrderWord(position)}>{formattedOrder.length === exercise.answer.length ? formattedOrder[position] : word}{!checked && <span aria-hidden="true">×</span>}</button>)}{Array.from({ length: Math.max(0, exercise.words.length - wordIndexes.length) }, (_, position) => <span className="lapp-exercise__word-slot" key={`empty-${position}`} aria-hidden="true" />)}</div>
          <div className="word-bank" aria-label="Cuvinte disponibile">{exercise.words.map((word, position) => <button type="button" disabled={checked || wordIndexes.includes(position)} key={position} onClick={() => addOrderWord(position)}>{word}</button>)}</div>
        </div>
        {!checked && <p className="lapp-exercise__hint">Atinge cuvintele în ordine. Atinge un cuvânt ales pentru a-l elimina.</p>}
      </>}
      {exercise.type === 'gaps' && <div className="lapp-exercise__card gap-exercise">
        {exercise.context && <div className="lapp-exercise__context"><span>{exercise.context.title}</span><p>{exercise.context.description}</p></div>}
        {exercise.translation && <p className="lapp-exercise__meaning">Spune: „{exercise.translation}”</p>}
        <div className="gap-sentence" lang="nb">{exercise.sentence.split('___').map((part, position, parts) => <React.Fragment key={position}><span>{part}</span>{position < parts.length - 1 && <button type="button" className={`gap-slot${gapAnswers[position] ? ' gap-slot--filled' : ''}${checked ? outcome ? ' is-correct' : ' is-wrong' : ''}`} disabled={checked} aria-label={gapAnswers[position] ? checked ? gapAnswers[position] : `Elimină ${gapAnswers[position]}` : `Spațiul liber ${position + 1}`} onClick={() => clearGapAnswer(position)}>{gapAnswers[position] || <span className="gap-slot__placeholder" aria-hidden="true" />}</button>}</React.Fragment>)}</div>
        <div className="gap-word-bank" aria-label="Cuvinte disponibile">{exercise.options.map((option) => <button type="button" disabled={checked || gapAnswers.includes(option)} className={checked && exercise.answer.includes(option) ? 'is-correct' : checked && gapAnswers.includes(option) ? 'is-wrong' : ''} key={option} onClick={() => placeGapAnswer(option)}>{option}</button>)}</div>
        {!checked && <p className="lapp-exercise__hint">{singleGap ? 'Atinge varianta potrivită. Se verifică imediat.' : 'Completează toate spațiile, apoi verifică răspunsul.'}</p>}
      </div>}
      {!checked && exercise.type === 'choice' && exercise.hint && <details className="nordic-choice__hint"><summary>Indiciu</summary><p>{exercise.hint}</p></details>}
      <dialog ref={feedback} className="lapp-exercise__feedback-dialog" aria-labelledby={feedbackTitleId} onCancel={() => setFeedbackOpen(false)} onClose={closeFeedback}>
      {checked && <div className={`lapp-exercise__feedback ${outcome ? 'is-correct' : 'is-wrong'}`}>
        <button className="lapp-exercise__feedback-close" type="button" onClick={() => setFeedbackOpen(false)} aria-label="Închide rezultatul">×</button>
        <div className="lapp-exercise__feedback-heading">
          <strong id={feedbackTitleId}><span className="lapp-exercise__feedback-icon" aria-hidden="true">{outcome ? '✓' : '!'}</span>{outcome ? practicing ? 'Ai corectat răspunsul!' : 'Exact! Ai reținut bine.' : 'Să reținem diferența'}</strong>
          {!outcome && <small className="lapp-exercise__saved"><BookmarkIcon /> Salvat la Recapitulare</small>}
        </div>
        {(!outcome || exercise.type !== 'choice') && <p className="lapp-exercise__answer">{!outcome && 'Răspuns corect: '}<b lang={exercise.type === 'choice' ? undefined : 'nb'}>{correctAnswer}</b></p>}
        {exercise.translation && <p>{exercise.translation}</p>}
        <p>{exercise.explanation}</p>
        {spokenAnswer && <button className="lapp-exercise__listen" type="button" onClick={playAnswer} disabled={playing} aria-label="Ascultă răspunsul corect"><SpeakerIcon />{playing ? 'Se redă…' : 'Ascultă'}</button>}
        {audioError && <p role="alert">{audioError}</p>}
        <div className="lapp-exercise__feedback-actions">
          {!outcome && <button className="lapp-exercise__repeat" type="button" onClick={repeatExercise}><span aria-hidden="true">↻</span> Repetă</button>}
          <button ref={feedbackContinue} className="lapp-exercise__primary lapp-exercise__modal-continue" type="button" onClick={continueExercise}>{reviewing ? 'Următorul' : 'Continuă'} <span aria-hidden="true">→</span></button>
        </div>
      </div>}
      </dialog>
      {!checked && <p className="lapp-exercise__review-note"><BookmarkIcon /> Greșelile se salvează la Recapitulare.</p>}
      <footer className="lapp-exercise__footer"><div className={`lapp-exercise__navigation${checked ? ' has-feedback' : ''}`}>
        <button className="lapp-exercise__back" type="button" onClick={previousExercise} disabled={!onPrevious} aria-label={index === 0 ? 'Etapa anterioară' : 'Exercițiul anterior'}><span aria-hidden="true">←</span> Înapoi</button>
        {checked && <button ref={feedbackTrigger} className="lapp-exercise__feedback-trigger" type="button" onClick={() => setFeedbackOpen(true)} aria-label="Vezi rezultatul răspunsului" aria-haspopup="dialog"><span aria-hidden="true">ⓘ</span></button>}
        {checked ? <button className="lapp-exercise__primary" type="button" onClick={continueExercise}>{reviewing ? 'Următorul' : 'Continuă'} <span aria-hidden="true">→</span></button>
          : (manualCheck || exercise.type === 'choice') && (exercise.type === 'fill' ? <button className="lapp-exercise__primary" type="submit" form={formId} disabled={!complete}>Verifică răspunsul <span aria-hidden="true">→</span></button>
            : <button className="lapp-exercise__primary" type="button" disabled={!complete} onClick={() => submit()}>{exercise.type === 'order' ? 'Verifică ordinea' : exercise.type === 'choice' ? 'Verifică' : 'Verifică răspunsul'} <span aria-hidden="true">→</span></button>)}
      </div></footer>
    </div>
  );
}
