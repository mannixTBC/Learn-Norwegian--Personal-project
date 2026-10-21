import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import { saveReviewItem } from '../../../services/spacedReview';
import { CURRICULUM_VERSION } from '../curriculumMetadata';
import './CurriculumPractice.css';

const RecallAudioIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7Z" /></svg>;
const RecallChevronIcon = ({ expanded }) => <svg viewBox="0 0 24 24" aria-hidden="true" className={expanded ? 'is-expanded' : ''}><path d="m6 9 6 6 6-6" /></svg>;
const RecallSaveIcon = ({ saved }) => <svg viewBox="0 0 24 24" aria-hidden="true">{saved ? <path d="m5 12 4 4 10-10" /> : <><path d="M19 8a7.5 7.5 0 1 0 0 8" /><path d="M19 3v5h-5" /></>}</svg>;

export const CurriculumRecall = ({ lesson, level, standalone = false }) => {
  const [revealed, setRevealed] = useState({});
  const [saved, setSaved] = useState({});
  const hasRecall = lesson.recycledVocabulary.length > 0;
  if (!hasRecall && !standalone) return null;

  return <section className={`curriculum-practice curriculum-recall${standalone ? ' curriculum-recall--standalone' : ''}`} aria-label={hasRecall ? 'Reamintește-ți expresiile cunoscute' : 'Pregătește-te pentru prima lecție'}>
    {standalone ? <header className="curriculum-recall__heading">
      <span className="curriculum-practice__label">{hasRecall ? 'Reamintire · 3–5 minute' : 'Pregătire · Prima lecție'}</span>
      <h1>Înainte de ceva nou</h1>
      <p>{hasRecall ? 'Spune sensul cu voce tare, apoi verifică. Expresiile cunoscute te vor ajuta în lecția de azi.' : 'Începem de la zero, în ritmul tău.'}</p>
    </header> : <><span className="curriculum-practice__label">Înainte de ceva nou · 3–5 minute</span><h2>Îți amintești aceste expresii?</h2><p>Spune sensul fără să citești traducerea. Reutilizează-le în dialog sau în sarcina practică a acestei lecții.</p></>}
    {hasRecall ? <>
      <div className="curriculum-recall__cards">{lesson.recycledVocabulary.map(({ entry, lessonTitle, lessonUid }, index) => <article className="curriculum-recall__card" key={`${lessonUid}-${entry[0]}`}><small>Din „{lessonTitle}”</small><strong lang="nb">{entry[0]}</strong><button type="button" className="curriculum-recall__audio" onClick={() => speakNorwegian(entry[0])} aria-label={`Ascultă ${entry[0]}`}>{standalone ? <RecallAudioIcon /> : '▷ Ascultă'}</button><button type="button" className="curriculum-recall__reveal" aria-expanded={Boolean(revealed[index])} onClick={() => setRevealed((values) => ({ ...values, [index]: !values[index] }))}><span>{revealed[index] ? 'Ascunde sensul' : 'Verifică sensul'}</span>{standalone && <RecallChevronIcon expanded={Boolean(revealed[index])} />}</button>{revealed[index] && <p className="curriculum-recall__meaning" lang="ro">{entry[1]}</p>}<button type="button" className="curriculum-recall__save" disabled={saved[index]} onClick={() => {
      saveReviewItem({ id: `${lesson.uid}-recall-${index}`, level, lessonId: lesson.id, source: 'curriculum-recall', prompt: `Ce înseamnă „${entry[0]}”?`, answer: entry[1] });
      setSaved((values) => ({ ...values, [index]: true }));
    }}>{standalone && <RecallSaveIcon saved={Boolean(saved[index])} />}<span>{saved[index] ? 'Adăugat în recapitulare ✓' : 'Mai am nevoie să repet'}</span></button></article>)}</div>
      {standalone && <p className="curriculum-recall__note">Fără punctaj. Alege ce vrei să mai repeți, apoi continuă lecția.</p>}
    </> : <article className="curriculum-recall__first-lesson">
      <span className="curriculum-recall__first-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5.5c3-.9 5.7-.3 8 1.7v12c-2.3-2-5-2.6-8-1.7ZM20 5.5c-3-.9-5.7-.3-8 1.7v12c2.3-2 5-2.6 8-1.7Z" /></svg></span>
      <h2>Construim prima ta bază</h2>
      <p>Nu ai încă expresii din lecțiile anterioare de repetat. Începem cu primele cuvinte, pe care le vei întâlni apoi în exemple și conversații.</p>
      <h3>În această lecție vei descoperi:</h3>
      <dl>{lesson.vocabulary.slice(0, 2).map(([word, translation]) => <div key={word}><dt lang="nb">{word}</dt><dd lang="ro">{translation}</dd></div>)}</dl>
      <p className="curriculum-recall__first-note">Nu trebuie să le știi deja. Continuă când ești pregătit.</p>
    </article>}
  </section>;
};

export const CurriculumReading = ({ lesson }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [answer, setAnswer] = useState('');
  if (!lesson.reading) return null;
  return <section className="curriculum-practice curriculum-reading"><span className="curriculum-practice__label">Lectură și interpretare</span><h2 lang="nb">{lesson.reading.title}</h2><div className="curriculum-reading__text" lang="nb">{lesson.reading.text}</div><h3 lang={lesson.reading.questionLanguage}>{lesson.reading.question}</h3><label>Răspunsul tău<textarea rows={3} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Identifică ideea și sprijină răspunsul cu un fragment din text." /></label><button type="button" aria-expanded={showAnswer} onClick={() => setShowAnswer((value) => !value)}>{showAnswer ? 'Ascunde reperul' : 'Compară cu un răspuns-reper'}</button>{showAnswer && <div className="curriculum-reading__answer"><strong lang={lesson.reading.answerLanguage}>{lesson.reading.answer}</strong><p>{lesson.reading.explanation}</p></div>}</section>;
};

export const CurriculumProduction = ({ lesson, level }) => {
  const { user } = useAuth();
  const key = `curriculum_${CURRICULUM_VERSION}_${user?.id || 'guest'}_${lesson.uid}_draft`;
  const [text, setText] = useState(() => localStorage.getItem(key) || '');
  const [criteria, setCriteria] = useState({});
  if (!lesson.production) return null;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return <section className="curriculum-practice curriculum-production"><span className="curriculum-practice__label">Transfer · scriere și vorbire · {level}</span><h2>Folosește ceea ce ai învățat</h2><h3>Scrie în cuvintele tale</h3><p>{lesson.production.writingPrompt}</p><label>Textul tău în norvegiană<textarea lang="nb" rows={level.startsWith('C') ? 9 : 5} value={text} onChange={(event) => { setText(event.target.value); localStorage.setItem(key, event.target.value); }} placeholder="Construiește un răspuns propriu; reutilizează expresiile lecțiilor anterioare." /></label><small>{words} {words === 1 ? 'cuvânt' : 'cuvinte'} · ciornă păstrată pe acest dispozitiv</small><h3>Spune cu voce tare</h3><p>{lesson.production.speakingPrompt}</p><fieldset><legend>Verifică-ți răspunsul</legend>{lesson.production.criteria.map((criterion, index) => <label key={criterion}><input type="checkbox" checked={Boolean(criteria[index])} onChange={(event) => setCriteria((values) => ({ ...values, [index]: event.target.checked }))} />{criterion}</label>)}</fieldset><p className="curriculum-production__note">Aceste criterii te ajută să-ți revizuiești textul și exprimarea orală. Sarcina deschisă se evaluează separat de scorul exercițiilor cu răspuns fix.</p></section>;
};
