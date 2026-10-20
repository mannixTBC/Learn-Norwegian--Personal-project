import React, { useState } from 'react';
import { speakNorwegian } from '../../../services/norwegianSpeech';

/* Părți comune între lecția de web și cea din aplicația instalată.
   Mutate din LessonProgram.js fără schimbări de comportament. */

export const AudioButton = ({ text, slow = false, voice = 'male', label }) => (
  <button className="audio-button" type="button" onClick={() => speakNorwegian(text, { slow, voice })} aria-label={`Ascultă ${slow ? 'lent ' : ''}: ${text}`}>
    <span role="img" aria-hidden="true">🔊</span>{label || (slow ? 'Lent' : 'Ascultă')}
  </button>
);

const femaleSpeakers = new Set(['anna', 'ana', 'nora', 'ida', 'sara', 'mia']);
const maleSpeakers = new Set(['lars', 'erik', 'mihai', 'radu', 'andrei', 'alex', 'dan', 'ola']);

export const getDialogueVoice = (speaker, index) => {
  const normalizedSpeaker = speaker.toLocaleLowerCase().trim();
  if (femaleSpeakers.has(normalizedSpeaker)) return 'female';
  if (maleSpeakers.has(normalizedSpeaker)) return 'male';
  return index % 2 === 0 ? 'female' : 'male';
};

export const DialoguePlayIcon = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <path d="M6.5 18.5v-5a9.5 9.5 0 0 1 19 0v5" />
    <path d="M6.5 17.5h3.2v7H7.8c-.7 0-1.3-.6-1.3-1.3Zm19 0h-3.2v7h1.9c.7 0 1.3-.6 1.3-1.3Z" />
    <path d="M13.2 13.1v6l5.1-3Z" className="dialogue-play-button__play" />
  </svg>
);

export const SpeakerAvatar = ({ voice }) => (
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

export const DialogueAudioButton = ({ dialogue }) => {
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

export const DialogueLineAudioButton = ({ text, voice }) => (
  <button className="dialogue-line-audio-button" type="button" onClick={() => speakNorwegian(text, { voice })} aria-label={`Ascultă replica: ${text}`}>
    <span className="dialogue-line-audio-button__icon" aria-hidden="true"><DialoguePlayIcon /></span>
    <span>Ascultă</span>
  </button>
);

export const CompactSlowAudioButton = ({ text }) => (
  <button className="dialogue-line-audio-button compact-slow-audio-button" type="button" onClick={() => speakNorwegian(text, { voice: 'male', slow: true })} aria-label={`Ascultă lent: ${text}`}>
    <span className="dialogue-line-audio-button__icon" aria-hidden="true"><DialoguePlayIcon /></span>
  </button>
);

export const LessonMetaIcon = ({ type }) => {
  if (type === 'time') return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.25"/><path d="M12 7.5v5l3.25 2"/></svg>;
  if (type === 'level') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18v-4M10 18V9M15 18V6M20 18V3"/></svg>;
  if (type === 'voice') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="4" width="6" height="11" rx="3"/><path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3M9 20h6"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5c3.2-.9 5.8-.3 8 1.7v12c-2.2-2-4.8-2.6-8-1.7ZM20 5.5c-3.2-.9-5.8-.3-8 1.7v12c2.2-2 4.8-2.6 8-1.7Z"/></svg>;
};

export const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* Cardul de exercițiu pentru lecția web. */
export const LessonExercise = ({ exercise, index, onResult, isMobileActive }) => {
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
  const canCheck = exercise.type === 'choice' || exercise.type === 'fill'
    ? Boolean(value)
    : exercise.type === 'gaps'
      ? gapAnswers.length === exercise.answer.length && gapAnswers.every(Boolean)
      : selectedWords.length > 0;

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
    <div className={`practice-card ${checked ? 'practice-card--checked' : ''} ${isMobileActive ? 'mobile-exercise-card--active' : ''}`}>
      <div className="practice-card__counter">Întrebarea {index + 1}</div>
      <h3>{exercise.prompt}</h3>
      {exercise.type === 'choice' && <div className="choice-list">{exercise.options.map((option, optionIndex) => {
        const selected = value !== '' && Number(value) === optionIndex;
        const stateClass = checked && optionIndex === exercise.answer ? 'is-correct' : checked && selected ? 'is-wrong' : '';
        return <button type="button" disabled={checked} className={`${selected ? 'selected' : ''} ${stateClass}`} onClick={() => setValue(String(optionIndex))} key={option}>{option}</button>;
      })}</div>}
      {exercise.type === 'fill' && <input className="answer-input" value={value} disabled={checked} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && check()} placeholder="Scrie răspunsul aici" />}
      {exercise.type === 'order' && <><div className="sentence-builder">{cleanWords.length ? cleanWords.map((word, i) => <button type="button" disabled={checked} key={`${word}-${i}`} onClick={() => !checked && setSelectedWords((all) => all.filter((_, position) => position !== i))}>{word}</button>) : <span>Apasă cuvintele în ordinea corectă</span>}</div><div className="word-bank">{exercise.words.map((word, i) => <button type="button" disabled={checked || selectedWords.some((entry) => entry.endsWith(`::${i}`))} onClick={() => addWord(word, i)} key={`${word}-${i}`}>{word}</button>)}</div></>}
      {exercise.type === 'gaps' && <div className="gap-exercise"><p className="gap-exercise__hint gap-exercise__hint--pointer">Trage cuvântul în spațiul liber.</p><p className="gap-exercise__hint gap-exercise__hint--touch">Atinge cuvântul pentru a completa propoziția.</p><div className="gap-sentence">{exercise.sentence.split('___').map((sentencePart, sentenceIndex, sentenceParts) => <React.Fragment key={`${sentencePart}-${sentenceIndex}`}><span>{sentencePart}</span>{sentenceIndex < sentenceParts.length - 1 && <button type="button" className={gapAnswers[sentenceIndex] ? 'gap-slot gap-slot--filled' : 'gap-slot'} disabled={checked} onClick={() => clearGapAnswer(sentenceIndex)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); placeGapAnswer(event.dataTransfer.getData('text/plain'), sentenceIndex); }} aria-label={gapAnswers[sentenceIndex] ? `Cuvânt selectat: ${gapAnswers[sentenceIndex]}. Apasă pentru a-l elimina.` : `Spațiul liber ${sentenceIndex + 1}`}>{gapAnswers[sentenceIndex] || <span className="gap-slot__placeholder" aria-hidden="true"/>}</button>}</React.Fragment>)}</div><div className="gap-word-bank">{exercise.options.map((option) => { const used = gapAnswers.includes(option); return <button type="button" draggable={!checked && !used} disabled={checked || used} onClick={() => placeGapAnswer(option)} onDragStart={(event) => event.dataTransfer.setData('text/plain', option)} key={option}>{option}</button>; })}</div></div>}
      {!checked && <button className="check-button" type="button" onClick={check} disabled={!canCheck}>Verifică răspunsul <span aria-hidden="true">→</span></button>}
      {checked && <div className={`answer-feedback ${isCorrect ? 'answer-feedback--correct' : 'answer-feedback--wrong'}`} role="status"><strong>{isCorrect ? 'Corect! Foarte bine.' : 'Mai încearcă o dată.'}</strong><p>{exercise.explanation}</p>{!isCorrect && <p>Răspuns corect: <b>{Array.isArray(exercise.answer) ? exercise.answer.join(' ') : exercise.type === 'choice' ? exercise.options[exercise.answer] : exercise.answer}</b></p>}{!isCorrect && <button type="button" onClick={reset}>Încearcă din nou</button>}</div>}
    </div>
  );
};

export const HighlightedSentence = ({ sentence, word, highlight }) => {
  const term = highlight || word.replace(/^(å|en|ei|et)\s+/i, '');
  if (!term) return sentence;

  const parts = sentence.split(new RegExp(`(${escapeRegExp(term)})`, 'i'));
  return parts.map((part, index) => (
    part.toLocaleLowerCase() === term.toLocaleLowerCase()
      ? <mark className="vocabulary-card__highlight lapp-highlight" key={`${part}-${index}`}>{part}</mark>
      : part
  ));
};
