import {ui} from '../../../languages/messages.js';
import {courseLocalStorage as localStorage} from '../../../languages/storage.js';
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
      <h1>{ui('web_57137cf8183e61e4')}</h1>
      <p>{hasRecall ? 'Spune sensul cu voce tare, apoi verifică. Expresiile cunoscute te vor ajuta în lecția de azi.' : 'Începem de la zero, în ritmul tău.'}</p>
    </header> : <><span className="curriculum-practice__label">{ui('web_4c93090cb686ec41')}</span><h2>{ui('web_86cc8785ba4d02e7')}</h2><p>{ui('web_f69b5191c124d184')}</p></>}
    {hasRecall ? <>
      <div className="curriculum-recall__cards">{lesson.recycledVocabulary.map(({ entry, lessonTitle, lessonUid }, index) => <article className="curriculum-recall__card" key={`${lessonUid}-${entry[0]}`}><small>{ui('web_8e514bfa6239d81e')}{lessonTitle}”</small><strong lang="nb">{entry[0]}</strong><button type="button" className="curriculum-recall__audio" onClick={() => speakNorwegian(entry[0])} aria-label={`Ascultă ${entry[0]}`}>{standalone ? <RecallAudioIcon /> : '▷ Ascultă'}</button><button type="button" className="curriculum-recall__reveal" aria-expanded={Boolean(revealed[index])} onClick={() => setRevealed((values) => ({ ...values, [index]: !values[index] }))}><span>{revealed[index] ? ui('ui_5713bd57d36ffa68') : 'Verifică sensul'}</span>{standalone && <RecallChevronIcon expanded={Boolean(revealed[index])} />}</button>{revealed[index] && <p className="curriculum-recall__meaning" lang="ro">{entry[1]}</p>}<button type="button" className="curriculum-recall__save" disabled={saved[index]} onClick={() => {
      saveReviewItem({ id: `${lesson.uid}-recall-${index}`, level, lessonId: lesson.id, source: 'curriculum-recall', prompt: `Ce înseamnă „${entry[0]}”?`, answer: entry[1] });
      setSaved((values) => ({ ...values, [index]: true }));
    }}>{standalone && <RecallSaveIcon saved={Boolean(saved[index])} />}<span>{saved[index] ? 'Adăugat în recapitulare ✓' : ui('ui_8efe47bb2c2b5c52')}</span></button></article>)}</div>
      {standalone && <p className="curriculum-recall__note">{ui('web_c2d89727b6bb5a2b')}</p>}
    </> : <article className="curriculum-recall__first-lesson">
      <span className="curriculum-recall__first-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5.5c3-.9 5.7-.3 8 1.7v12c-2.3-2-5-2.6-8-1.7ZM20 5.5c-3-.9-5.7-.3-8 1.7v12c2.3-2 5-2.6 8-1.7Z" /></svg></span>
      <h2>{ui('ui_9ba7d6ca292d8798')}</h2>
      <p>{ui('web_0cb6a05567857a49')}</p>
      <h3>{ui('web_84aa72696ff9932e')}</h3>
      <dl>{lesson.vocabulary.slice(0, 2).map(([word, translation]) => <div key={word}><dt lang="nb">{word}</dt><dd lang="ro">{translation}</dd></div>)}</dl>
      <p className="curriculum-recall__first-note">{ui('web_62aed92eb87271c8')}</p>
    </article>}
  </section>;
};

export const CurriculumReading = ({ lesson }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [answer, setAnswer] = useState('');
  if (!lesson.reading) return null;
  return <section className="curriculum-practice curriculum-reading"><span className="curriculum-practice__label">{ui('web_e42a6f25ad9313e3')}</span><h2 lang="nb">{lesson.reading.title}</h2><div className="curriculum-reading__text" lang="nb">{lesson.reading.text}</div><h3 lang={lesson.reading.questionLanguage}>{lesson.reading.question}</h3><label>{ui('ui_d6e45310ea716363')}<textarea rows={3} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={ui('web_1f15ee2b7fd01fa1')} /></label><button type="button" aria-expanded={showAnswer} onClick={() => setShowAnswer((value) => !value)}>{showAnswer ? 'Ascunde reperul' : 'Compară cu un răspuns-reper'}</button>{showAnswer && <div className="curriculum-reading__answer"><strong lang={lesson.reading.answerLanguage}>{lesson.reading.answer}</strong><p>{lesson.reading.explanation}</p></div>}</section>;
};

export const CurriculumProduction = ({ lesson, level }) => {
  const { user } = useAuth();
  const key = `curriculum_${CURRICULUM_VERSION}_${user?.id || 'guest'}_${lesson.uid}_draft`;
  const [text, setText] = useState(() => localStorage.getItem(key) || '');
  const [criteria, setCriteria] = useState({});
  if (!lesson.production) return null;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return <section className="curriculum-practice curriculum-production"><span className="curriculum-practice__label">{ui('web_a2962cd7d8d89a00')}{level}</span><h2>{ui('web_9ba9e7f5cdfb17eb')}</h2><h3>{ui('web_2942da832098df7c')}</h3><p>{lesson.production.writingPrompt}</p><label>{ui('web_6c25edbea8e348bb')}<textarea lang="nb" rows={level.startsWith('C') ? 9 : 5} value={text} onChange={(event) => { setText(event.target.value); localStorage.setItem(key, event.target.value); }} placeholder="Construiește un răspuns propriu; reutilizează expresiile lecțiilor anterioare." /></label><small>{words} {words === 1 ? 'cuvânt' : 'cuvinte'}{ui('web_5027919c15e05e27')}</small><h3>{ui('web_0b6786ed16947a49')}</h3><p>{lesson.production.speakingPrompt}</p><fieldset><legend>{ui('web_ea906fa32efeb1e6')}</legend>{lesson.production.criteria.map((criterion, index) => <label key={criterion}><input type="checkbox" checked={Boolean(criteria[index])} onChange={(event) => setCriteria((values) => ({ ...values, [index]: event.target.checked }))} />{criterion}</label>)}</fieldset><p className="curriculum-production__note">{ui('web_355c3c2ffee49cf8')}</p></section>;
};
