import React, { useEffect, useRef, useState } from 'react';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import { lessonExerciseAnswer, lessonExerciseSentence } from './lessonExerciseContent';

const normalize = (value) => value.normalize('NFC').trim().toLocaleLowerCase('nb-NO').replace(/\s+/g, ' ');

const BookmarkIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4Z" /></svg>;
const SpeakerIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m11 5-5 4H3v6h3l5 4ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" /></svg>;
const matchText = (text) => normalize(text).replace(/[.!?]+$/, '');

export default function LessonAppExercise({ exercise, vocabulary = [], index, onResult, onContinue, onPrevious, onDraft, result, response }) {
  const [value, setValue] = useState(() => response?.value ?? (result === true && exercise.type === 'choice' ? String(exercise.answer) : result === true && exercise.type === 'fill' ? exercise.answer : ''));
  const [wordIndexes, setWordIndexes] = useState(() => {
    if (response?.wordIndexes) return response.wordIndexes;
    const indexes = [];
    if (result === true && exercise.type === 'order') exercise.answer.forEach((word) => indexes.push(exercise.words.findIndex((candidate, position) => candidate === word && !indexes.includes(position))));
    return indexes;
  });
  const [gapAnswers, setGapAnswers] = useState(() => response?.gapAnswers || (result === true && exercise.type === 'gaps' ? [...exercise.answer] : []));
  const [outcome, setOutcome] = useState(typeof result === 'boolean' ? result : null);
  const [reviewing] = useState(typeof result === 'boolean');
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState('');
  const audioController = useRef(null);
  const submitted = useRef(typeof result === 'boolean');
  const continuing = useRef(false);
  const heading = useRef(null);
  const feedback = useRef(null);
  const draft = useRef({ value, wordIndexes, gapAnswers });
  const checked = outcome !== null;
  const words = wordIndexes.map((position) => exercise.words?.[position]);
  const sentence = lessonExerciseSentence(exercise);
  const correctAnswer = lessonExerciseAnswer(exercise);
  const spokenAnswer = exercise.type === 'choice'
    ? vocabulary.find(([norwegian, romanian]) => [norwegian, romanian].some((text) => matchText(text) === matchText(correctAnswer)))?.[0]
    : correctAnswer;
  const singleGap = exercise.type === 'gaps' && exercise.answer.length === 1;
  const manualCheck = exercise.type === 'fill' || exercise.type === 'order' || (exercise.type === 'gaps' && !singleGap);
  const formId = `lesson-answer-form-${index}`;
  const formattedOrder = checked && outcome && exercise.answerSentence ? exercise.answerSentence.split(/\s+/) : [];
  const complete = exercise.type === 'choice' ? value !== ''
    : exercise.type === 'fill' ? Boolean(value.trim())
      : exercise.type === 'order' ? wordIndexes.length === exercise.words.length
        : gapAnswers.length === exercise.answer.length && gapAnswers.every(Boolean);

  useEffect(() => { heading.current?.focus(); }, []);
  useEffect(() => () => audioController.current?.abort(), []);
  useEffect(() => {
    if (checked) feedback.current?.scrollIntoView?.({ block: 'nearest', behavior: 'auto' });
  }, [checked]);

  const updateDraft = (patch) => {
    if (submitted.current) return;
    const response = { ...draft.current, ...patch };
    draft.current = response;
    setValue(response.value);
    setWordIndexes(response.wordIndexes);
    setGapAnswers(response.gapAnswers);
    onDraft?.(index, response);
  };
  const addOrderWord = (position) => {
    if (!draft.current.wordIndexes.includes(position)) updateDraft({ wordIndexes: [...draft.current.wordIndexes, position] });
  };
  const removeOrderWord = (position) => updateDraft({ wordIndexes: draft.current.wordIndexes.filter((_, item) => item !== position) });

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

  const submit = (choice = value, nextGaps = gapAnswers) => {
    const ready = exercise.type === 'choice' ? choice !== ''
      : exercise.type === 'gaps' ? nextGaps.length === exercise.answer.length && nextGaps.every(Boolean) : complete;
    if (submitted.current || !ready) return;
    const correct = exercise.type === 'choice' ? Number(choice) === exercise.answer
      : exercise.type === 'fill' ? normalize(value) === normalize(exercise.answer)
        : exercise.type === 'order' ? words.join(' ') === exercise.answer.join(' ')
          : nextGaps.every((answer, position) => answer === exercise.answer[position]);
    submitted.current = true;
    setValue(choice);
    setOutcome(correct);
    onResult(index, correct, exercise, { value: choice, wordIndexes, gapAnswers: nextGaps });
  };
  const placeGapAnswer = (option) => {
    if (submitted.current || draft.current.gapAnswers.includes(option)) return;
    const nextGaps = Array.from({ length: exercise.answer.length }, (_, position) => draft.current.gapAnswers[position] || '');
    const empty = nextGaps.findIndex((word) => !word);
    if (empty < 0) return;
    nextGaps[empty] = option;
    updateDraft({ gapAnswers: nextGaps });
    if (singleGap) submit(value, nextGaps);
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
    <div className="lapp-exercise">
      {reviewing && <p className="lapp-exercise__reviewed">Răspuns deja verificat</p>}
      <h2 ref={heading} tabIndex={-1}>{exercise.prompt}</h2>
      {exercise.instruction && <p className="lapp-exercise__instruction">{exercise.instruction}</p>}
      {exercise.type === 'choice' && <div className="lapp-options" role="group" aria-label="Variante de răspuns">
        {exercise.options.map((option, position) => {
          const selected = value !== '' && Number(value) === position;
          const correct = checked && position === exercise.answer;
          const wrong = checked && selected && !correct;
          return <button type="button" disabled={checked} aria-pressed={selected} className={correct ? 'is-correct' : wrong ? 'is-wrong' : ''} onClick={() => submit(String(position))} key={`${position}-${option}`}>
            <span className="lapp-option__letter" aria-hidden="true">{String.fromCharCode(65 + position)}</span>
            <span className="lapp-option__text">{option}</span>
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
        <div className="gap-sentence" lang="nb">{exercise.sentence.split('___').map((part, position, parts) => <React.Fragment key={position}><span>{part}</span>{position < parts.length - 1 && <button type="button" className={`gap-slot${gapAnswers[position] ? ' gap-slot--filled' : ''}${checked ? outcome ? ' is-correct' : ' is-wrong' : ''}`} disabled={checked} aria-label={gapAnswers[position] ? checked ? gapAnswers[position] : `Elimină ${gapAnswers[position]}` : `Spațiul liber ${position + 1}`} onClick={() => updateDraft({ gapAnswers: draft.current.gapAnswers.map((word, item) => item === position ? '' : word) })}>{gapAnswers[position] || <span className="gap-slot__placeholder" aria-hidden="true" />}</button>}</React.Fragment>)}</div>
        <div className="gap-word-bank" aria-label="Cuvinte disponibile">{exercise.options.map((option) => <button type="button" disabled={checked || gapAnswers.includes(option)} className={checked && exercise.answer.includes(option) ? 'is-correct' : checked && gapAnswers.includes(option) ? 'is-wrong' : ''} key={option} onClick={() => placeGapAnswer(option)}>{option}</button>)}</div>
        {!checked && <p className="lapp-exercise__hint">{singleGap ? 'Atinge varianta potrivită. Se verifică imediat.' : 'Completează toate spațiile, apoi verifică răspunsul.'}</p>}
      </div>}
      {!checked && exercise.type === 'choice' && <p className="lapp-exercise__hint">Atinge răspunsul. Se verifică imediat.</p>}
      {checked && <div ref={feedback} className={`lapp-exercise__feedback ${outcome ? 'is-correct' : 'is-wrong'}`} role="status" aria-live="polite">
        <strong><span className="lapp-exercise__feedback-icon" aria-hidden="true">{outcome ? '✓' : '!'}</span>{outcome ? 'Exact! Ai reținut bine.' : 'Să reținem diferența'}</strong>
        {(!outcome || exercise.type !== 'choice') && <p className="lapp-exercise__answer">{!outcome && 'Răspuns corect: '}<b lang={exercise.type === 'choice' ? undefined : 'nb'}>{correctAnswer}</b></p>}
        {exercise.translation && <p>{exercise.translation}</p>}
        <p>{exercise.explanation}</p>
        {spokenAnswer && <button className="lapp-exercise__listen" type="button" onClick={playAnswer} disabled={playing} aria-label="Ascultă răspunsul corect"><SpeakerIcon />{playing ? 'Se redă…' : 'Ascultă'}</button>}
        {audioError && <p role="alert">{audioError}</p>}
        {!outcome && <small><BookmarkIcon /> Salvat la Recapitulare</small>}
      </div>}
      {!checked && <p className="lapp-exercise__review-note"><BookmarkIcon /> Greșelile se salvează la Recapitulare.</p>}
      <footer className="lapp-exercise__footer"><div className="lapp-exercise__navigation">
        <button className="lapp-exercise__back" type="button" onClick={previousExercise} disabled={!onPrevious} aria-label={index === 0 ? 'Etapa anterioară' : 'Exercițiul anterior'}><span aria-hidden="true">←</span> Înapoi</button>
        {checked ? <button className="lapp-exercise__primary" type="button" onClick={continueExercise}>{reviewing ? 'Următorul' : 'Continuă'} <span aria-hidden="true">→</span></button>
          : manualCheck && (exercise.type === 'fill' ? <button className="lapp-exercise__primary" type="submit" form={formId} disabled={!complete}>Verifică răspunsul <span aria-hidden="true">→</span></button>
            : <button className="lapp-exercise__primary" type="button" disabled={!complete} onClick={() => submit()}>{exercise.type === 'order' ? 'Verifică ordinea' : 'Verifică răspunsul'} <span aria-hidden="true">→</span></button>)}
      </div></footer>
    </div>
  );
}
