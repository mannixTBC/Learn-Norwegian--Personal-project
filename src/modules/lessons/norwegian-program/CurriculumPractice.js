import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import { saveReviewItem } from '../../../services/spacedReview';
import { CURRICULUM_VERSION } from '../curriculumMetadata';
import './CurriculumPractice.css';

export const CurriculumRecall = ({ lesson, level }) => {
  const [revealed, setRevealed] = useState({});
  const [saved, setSaved] = useState({});
  if (!lesson.recycledVocabulary.length) return null;
  return <section className="curriculum-practice curriculum-recall" aria-label="Reamintește-ți expresiile cunoscute"><span className="curriculum-practice__label">Înainte de ceva nou · 3–5 minute</span><h2>Îți amintești aceste expresii?</h2><p>Spune sensul fără să citești traducerea. Reutilizează-le în dialog sau în sarcina practică a acestei lecții.</p>
    <div>{lesson.recycledVocabulary.map(({ entry, lessonTitle, lessonUid }, index) => <article key={`${lessonUid}-${entry[0]}`}><small>Din „{lessonTitle}”</small><strong lang="nb">{entry[0]}</strong><button type="button" onClick={() => speakNorwegian(entry[0])} aria-label={`Ascultă ${entry[0]}`}>▷ Ascultă</button><button type="button" aria-expanded={Boolean(revealed[index])} onClick={() => setRevealed((values) => ({ ...values, [index]: !values[index] }))}>{revealed[index] ? 'Ascunde sensul' : 'Verifică sensul'}</button>{revealed[index] && <p>{entry[1]}</p>}<button type="button" disabled={saved[index]} onClick={() => {
      saveReviewItem({ id: `${lesson.uid}-recall-${index}`, level, lessonId: lesson.id, source: 'curriculum-recall', prompt: `Ce înseamnă „${entry[0]}”?`, answer: entry[1] });
      setSaved((values) => ({ ...values, [index]: true }));
    }}>{saved[index] ? 'Adăugat în recapitulare ✓' : 'Mai am nevoie să repet'}</button></article>)}</div>
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
