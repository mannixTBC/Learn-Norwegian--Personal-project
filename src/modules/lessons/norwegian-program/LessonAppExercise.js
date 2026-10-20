import React, { useEffect, useRef, useState } from 'react';
import { speakNorwegian } from '../../../services/norwegianSpeech';

const normalize = (value) => value.normalize('NFC').trim().toLocaleLowerCase('nb-NO').replace(/\s+/g, ' ');

const BookmarkIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4Z" /></svg>;
const SpeakerIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m11 5-5 4H3v6h3l5 4ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" /></svg>;
const matchText = (text) => normalize(text).replace(/[.!?]+$/, '');

export default function LessonAppExercise({ exercise, vocabulary = [], index, onResult, onContinue, result, response }) {
  const [value, setValue] = useState(response?.value || '');
  const [wordIndexes, setWordIndexes] = useState(response?.wordIndexes || []);
  const [gapAnswers, setGapAnswers] = useState(response?.gapAnswers || []);
  const [outcome, setOutcome] = useState(typeof result === 'boolean' ? result : null);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState('');
  const audioController = useRef(null);
  const submitted = useRef(typeof result === 'boolean');
  const continuing = useRef(false);
  const heading = useRef(null);
  const checked = outcome !== null;
  const words = wordIndexes.map((position) => exercise.words?.[position]);
  const correctAnswer = exercise.type === 'choice' ? exercise.options[exercise.answer] : Array.isArray(exercise.answer) ? exercise.answer.join(' ') : exercise.answer;
  const spokenAnswer = exercise.type === 'choice'
    ? vocabulary.find(([norwegian, romanian]) => [norwegian, romanian].some((text) => matchText(text) === matchText(correctAnswer)))?.[0]
    : exercise.type === 'gaps' ? exercise.sentence.split('___').map((part, position) => part + (exercise.answer[position] || '')).join('') : correctAnswer;
  const complete = exercise.type === 'choice' ? value !== ''
    : exercise.type === 'fill' ? Boolean(value.trim())
      : exercise.type === 'order' ? wordIndexes.length === exercise.words.length
        : gapAnswers.length === exercise.answer.length && gapAnswers.every(Boolean);

  useEffect(() => { heading.current?.focus(); }, []);
  useEffect(() => () => audioController.current?.abort(), []);

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

  const submit = (choice = value) => {
    if (submitted.current || (exercise.type === 'choice' ? choice === '' : !complete)) return;
    const correct = exercise.type === 'choice' ? Number(choice) === exercise.answer
      : exercise.type === 'fill' ? normalize(value) === normalize(exercise.answer)
        : exercise.type === 'order' ? words.join(' ') === exercise.answer.join(' ')
          : gapAnswers.every((answer, position) => answer === exercise.answer[position]);
    submitted.current = true;
    setValue(choice);
    setOutcome(correct);
    onResult(index, correct, exercise, { value: choice, wordIndexes, gapAnswers });
  };
  const continueExercise = () => {
    if (!submitted.current || continuing.current) return;
    continuing.current = true;
    audioController.current?.abort();
    onContinue();
  };

  return (
    <div className="lapp-exercise">
      <h2 ref={heading} tabIndex={-1}>{exercise.prompt}</h2>
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
      {exercise.type === 'fill' && <form onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <label className="lapp-answer-label" htmlFor={`lesson-answer-${index}`}>Răspunsul tău</label>
        <input className="answer-input" id={`lesson-answer-${index}`} value={value} disabled={checked} lang="nb" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} onChange={(event) => setValue(event.target.value)} placeholder="Scrie în norvegiană" />
        {!checked && <button className="check-button" type="submit" disabled={!complete}>Confirmă răspunsul <span aria-hidden="true">→</span></button>}
      </form>}
      {exercise.type === 'order' && <>
        <div className="sentence-builder" aria-label="Propoziția ta">{words.length ? words.map((word, position) => <button type="button" disabled={checked} key={wordIndexes[position]} aria-label={`Elimină ${word}`} onClick={() => !submitted.current && setWordIndexes((all) => all.filter((_, item) => item !== position))}>{word}</button>) : <span>Atinge cuvintele în ordinea corectă.</span>}</div>
        <div className="word-bank" aria-label="Cuvinte disponibile">{exercise.words.map((word, position) => <button type="button" disabled={checked || wordIndexes.includes(position)} key={position} onClick={() => { if (!submitted.current) setWordIndexes((all) => all.includes(position) ? all : [...all, position]); }}>{word}</button>)}</div>
      </>}
      {exercise.type === 'gaps' && <div className="gap-exercise">
        <p className="lapp-answer-label">Atinge un cuvânt pentru a completa propoziția.</p>
        <div className="gap-sentence">{exercise.sentence.split('___').map((part, position, parts) => <React.Fragment key={position}><span>{part}</span>{position < parts.length - 1 && <button type="button" className={`gap-slot${gapAnswers[position] ? ' gap-slot--filled' : ''}`} disabled={checked} aria-label={gapAnswers[position] ? `Elimină ${gapAnswers[position]}` : `Spațiul liber ${position + 1}`} onClick={() => !submitted.current && setGapAnswers((all) => all.map((word, item) => item === position ? '' : word))}>{gapAnswers[position] || <span className="gap-slot__placeholder" aria-hidden="true" />}</button>}</React.Fragment>)}</div>
        <div className="gap-word-bank">{exercise.options.map((option) => <button type="button" disabled={checked || gapAnswers.includes(option)} key={option} onClick={() => {
          if (submitted.current) return;
          setGapAnswers((all) => {
            if (all.includes(option)) return all;
            const nextAnswers = Array.from({ length: exercise.answer.length }, (_, position) => all[position] || '');
            const empty = nextAnswers.findIndex((word) => !word);
            if (empty >= 0) nextAnswers[empty] = option;
            return nextAnswers;
          });
        }}>{option}</button>)}</div>
      </div>}
      {!checked && ['order', 'gaps'].includes(exercise.type) && <button className="check-button" type="button" disabled={!complete} onClick={() => submit()}>{exercise.type === 'order' ? 'Confirmă ordinea' : 'Confirmă răspunsul'} <span aria-hidden="true">→</span></button>}
      {!checked && exercise.type === 'choice' && <p className="lapp-exercise__hint">Atinge răspunsul. Se verifică imediat.</p>}
      {checked && <div className={`lapp-exercise__feedback ${outcome ? 'is-correct' : 'is-wrong'}`} role="status" aria-live="polite">
        <strong><span className="lapp-exercise__feedback-icon" aria-hidden="true">{outcome ? '✓' : '!'}</span>{outcome ? 'Exact! Ai reținut bine.' : 'Să reținem diferența'}</strong>
        {!outcome && <p className="lapp-exercise__answer">Răspuns corect: <b>{correctAnswer}</b></p>}
        <p>{exercise.explanation}</p>
        {spokenAnswer && <button className="lapp-exercise__listen" type="button" onClick={playAnswer} disabled={playing} aria-label="Ascultă răspunsul corect"><SpeakerIcon />{playing ? 'Se redă…' : 'Ascultă'}</button>}
        {audioError && <p role="alert">{audioError}</p>}
        {!outcome && <small><BookmarkIcon /> Salvat la Recapitulare</small>}
      </div>}
      {checked ? <footer className="lapp-exercise__footer"><button type="button" onClick={continueExercise}>Continuă <span aria-hidden="true">→</span></button></footer>
        : <p className="lapp-exercise__review-note"><BookmarkIcon /> Greșelile se salvează la Recapitulare.</p>}
    </div>
  );
}
