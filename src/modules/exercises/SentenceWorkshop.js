import React, { useEffect, useRef, useState } from 'react';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import { getLearningImage } from './learningImageCatalog';
import './SentenceWorkshop.css';

export default function SentenceWorkshop({ level, question, current, total, headingRef, selected, setSelected, checked, correct, completeAnswer, onVerify, onNext, onExit, onSpeak }) {
  const feedback = useRef(null);
  const [failedImage, setFailedImage] = useState(null);
  const image = getLearningImage(question.imageId);
  const showImage = image && failedImage !== image.src;
  const remaining = question.words.length - selected.length;
  const prompt = question.prompt.replace(/^Construiește\s*:?\s*[„"“]?/iu, '').replace(/[”"]\.?$/u, '');
  useEffect(() => { if (checked) feedback.current?.focus({ preventScroll: true }); }, [checked]);
  return <main className="sentence-workshop">
    <header className="sw-header"><button type="button" onClick={onExit} aria-label="Înapoi la jocuri">←</button><NorwegianFlagIcon className="sw-logo" /><span className="sw-level">{level}</span></header>
    <div className="sw-title"><h1>Propoziții</h1><p>Pune cuvintele în ordine.</p></div>
    <div className="sw-progress"><div role="progressbar" aria-label="Progresul sesiunii" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current + (checked ? 1 : 0)}>{Array.from({ length: total }, (_, index) => <i key={index} className={index < current || (checked && index === current) ? 'done' : index === current ? 'active' : ''} />)}</div><span>{current + 1} din {total}</span></div>
    <section className={'sw-prompt' + (showImage ? ' sw-prompt--illustrated' : '')}>
      <div><small>CONSTRUIEȘTE ÎN NORVEGIANĂ</small><h2 ref={headingRef} tabIndex={-1}>{prompt}</h2></div>
      {showImage && <div className="sw-art" aria-hidden="true"><img src={image.src} alt="" onError={() => setFailedImage(image.src)} style={{ width: `${image.columns * 100}%`, height: `${image.rows * 100}%`, left: `${-(image.tile % image.columns) * 100}%`, top: `${-Math.floor(image.tile / image.columns) * 100}%` }} /></div>}
    </section>
    <section className="sw-compose" aria-label="Propoziția ta"><div className="sw-label"><span>PROPOZIȚIA TA</span><div className="sw-compose-tools">{!checked && <button type="button" className="sw-reset" disabled={!selected.length} onClick={() => setSelected([])}>↻ Reia</button>}<span aria-live="polite">{selected.length} / {question.words.length}</span></div></div>
      <div className={'sw-answer' + (checked ? correct ? ' is-correct' : ' is-wrong' : '')}>{selected.map((wordIndex, position) => <button type="button" key={wordIndex} lang="nb" disabled={checked} aria-label={`Scoate ${question.words[wordIndex]}, poziția ${position + 1}`} onClick={() => setSelected(all => all.filter((_, index) => index !== position))}>{question.words[wordIndex]}</button>)}{!selected.length && <span className="sw-empty">Atinge primul cuvânt de mai jos</span>}{selected.length > 0 && !completeAnswer && <span className="sw-placeholder" aria-hidden="true">···</span>}</div>
    </section>
    {!checked ? <section className="sw-bank" aria-label="Cuvinte disponibile"><h3>CUVINTE DISPONIBILE</h3><div>{question.words.map((word, index) => <button type="button" key={index} lang="nb" disabled={selected.includes(index)} onClick={() => setSelected(all => all.includes(index) ? all : [...all, index])}>{word}</button>)}</div><p>Atinge un cuvânt pentru a-l muta.</p></section> : <section className={'sw-feedback' + (correct ? ' is-correct' : ' is-wrong')} ref={feedback} tabIndex={-1} role="status"><h3>{correct ? '✓ Foarte bine!' : 'Mai încearcă la recapitulare'}</h3><p lang="nb">{question.answer}</p><button type="button" onClick={onSpeak}>♫ Ascultă propoziția</button>{question.explanation && question.explanation !== question.answer && <p className="sw-explanation">{question.explanation}</p>}{!correct && <small>Salvat pentru recapitulare.</small>}</section>}
    <footer className="sw-footer"><button type="button" disabled={!checked && !completeAnswer} onClick={checked ? onNext : () => onVerify()}>{checked ? current === total - 1 ? 'Vezi rezultatul' : 'Continuă →' : 'Verifică'}</button>{!checked && <small>{remaining ? `Mai ai ${remaining} ${remaining === 1 ? 'cuvânt de așezat' : 'cuvinte de așezat'}.` : 'Propoziția este gata de verificare.'}</small>}</footer>
  </main>;
}
