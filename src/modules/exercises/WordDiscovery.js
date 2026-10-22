import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import { getStudySummary } from '../../services/learningActivity';
import './WordDiscovery.css';

const rows = ['QWERTYUIOP', 'ASDFGHJKLÅ', 'ZXCVBNMÆØ'];
const lettersOf = text => Array.from(text.normalize('NFC').toLocaleUpperCase('nb-NO')).filter(char => /\p{L}/u.test(char));
const Icon = ({ name }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{name === 'bulb' ? <><path d="M9 18h6m-5 3h4M8.5 14.5a6 6 0 1 1 7 0C14.6 15.2 15 17 15 18H9c0-1 .4-2.8-.5-3.5Z"/></> : name === 'menu' ? <path d="M4 5h16M4 12h16M4 19h16"/> : name === 'back' ? <path d="m10 5-7 7 7 7M3 12h18"/> : <path fill="currentColor" stroke="none" d="M13 1c1 6-4 6-2 11 2-1 3-3 3-5 5 4 7 8 4 12-2 4-10 5-13 0-3-5 1-10 4-13-1 4 0 5 1 5-1-4 3-6 3-10Z"/>}</svg>;

export default function WordDiscovery({ question, current, total, level, checked, onResolve, onNext, onSpeak }) {
  const [guessed, setGuessed] = useState([]);
  const [last, setLast] = useState('');
  const resolved = useRef(false);
  const guessedRef = useRef([]);
  const letters = lettersOf(question.answer);
  const wrong = guessed.filter(letter => !letters.includes(letter)).length;
  const remaining = Math.max(0, 3 - wrong);
  const won = letters.every(char => guessed.includes(char));
  const streak = Math.max(0, Number(getStudySummary().streak) || 0);
  const words = question.answer.normalize('NFC').split(/\s+/);
  const longest = Math.max(...words.map(word => Array.from(word).length));
  const choose = letter => {
    if (!letter || checked || resolved.current || guessedRef.current.includes(letter)) return;
    const next = [...guessedRef.current, letter];
    guessedRef.current = next;
    setGuessed(next); setLast(letter);
    const complete = letters.every(char => next.includes(char));
    const exhausted = next.filter(char => !letters.includes(char)).length >= 3;
    if (complete || exhausted) { resolved.current = true; onResolve(complete, next.join(' ')); }
  };
  useEffect(() => {
    const keydown = event => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.target?.closest?.('input,textarea,select')) return;
      const letter = event.key.toLocaleUpperCase('nb-NO').normalize('NFC');
      if (letter.length === 1 && /\p{L}/u.test(letter)) { event.preventDefault(); choose(letter); }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  });
  const tile = Number.isInteger(question.tile) ? question.tile : 0;
  return <section className={'word-discovery' + (checked ? ' word-discovery--checked' : '')} aria-label="Descoperă cuvântul">
    <header className="wd-brand wd-brand--game">
      <Link to="/dashboard" aria-label="NordLingo — Acasă"><NorwegianFlagIcon className="wd-logo"/></Link>
      <span className="wd-streak" aria-label={streak + ' zile consecutive'}><Icon name="flame"/>{streak}</span>
    </header>
    <Link className="wd-back" to={'/jocuri?nivel=' + level}><Icon name="back"/><span>Provocarea zilei</span></Link>
    <div className="wd-heading"><h1>Descoperă cuvântul</h1><p>Găsește cuvântul norvegian</p></div>
    <div className="wd-progress"><span className="wd-hearts" aria-label={remaining + ' încercări rămase'}>{[0,1,2].map(i => <span aria-hidden="true" key={i} className={i >= remaining ? 'empty' : ''}>♥</span>)}</span><progress aria-label={'Cuvântul ' + (current + 1) + ' din ' + total} value={current + 1} max={total}/><span>{remaining} {remaining === 1 ? 'încercare' : 'încercări'}</span></div>
    <article className="wd-card" style={{ '--wd-letter-count': longest, '--wd-word-length': Array.from(question.answer).length }}>
      <div className="wd-art" aria-hidden="true"><div className="wd-art__painting" style={{backgroundImage:`url("${question.image || '/images/word-discovery/home.webp'}")`, backgroundPosition:`${tile % 3 * 50}% ${Math.floor(tile / 3) * 100 / 3}%`}}/></div>
      <span className="wd-category">{question.category || 'VOCABULAR'}</span>
      <h2>{question.prompt}</h2>
      <div className={'wd-words' + (longest > 8 ? ' wd-words--long' : '')} aria-label="Cuvântul de descoperit" lang="nb">{words.map((word,i) => <span className="wd-word" key={i}>{Array.from(word).map((char,j) => {
        const letter = char.toLocaleUpperCase('nb-NO');
        const visible = !/\p{L}/u.test(char) || checked || guessed.includes(letter);
        return <span className={'wd-slot' + (!visible ? ' wd-slot--hidden' : '') + (checked && !guessed.includes(letter) ? ' revealed' : '')} key={j}>{visible ? char.toLocaleUpperCase('nb-NO') : <span className="wd-slot__line" aria-label="literă ascunsă"/>}</span>;
      })}</span>)}</div>
    </article>
    <div className="wd-controls" aria-live="polite">{checked ? <><strong>{won ? '✓ Ai descoperit cuvântul!' : 'Reține: ' + question.answer}</strong><div><button type="button" onClick={onSpeak}>Ascultă</button><button type="button" onClick={onNext}>{current === total - 1 ? 'Vezi rezultatul' : 'Continuă'} →</button></div></> : <button type="button" className="wd-hint" onClick={() => choose(letters.find(char => !guessed.includes(char)))}><Icon name="bulb"/><span>Indiciu</span></button>}</div>
    <div className="wd-keyboard" role="group" aria-label="Tastatură norvegiană">{rows.map(row => <div className="wd-key-row" key={row}>{Array.from(row).map(letter => <button type="button" key={letter} aria-label={letter} disabled={checked || guessed.includes(letter)} className={(guessed.includes(letter) ? letters.includes(letter) ? 'found' : 'missed' : '') + (last === letter ? ' last' : '')} onClick={() => choose(letter)}>{letter}</button>)}</div>)}</div>
  </section>;
}


export function WordDiscoveryResult({ level, score, results, onRestart, onRetry }) {
  const mistakes = results.filter(result => !result.correct);
  return <section className="word-discovery word-discovery--result">
    <header className="wd-brand"><Link to={'/jocuri?nivel=' + level} aria-label="Înapoi la jocuri"><Icon name="back"/></Link><Link to="/dashboard"><NorwegianFlagIcon className="wd-logo"/></Link><span className="wd-streak">{level}</span></header>
    <div className="wd-heading"><h1>Sesiune încheiată</h1><p>{mistakes.length ? 'Fiecare cuvânt contează' : 'Le-ai descoperit pe toate!'}</p></div>
    <article className="wd-result-card"><span className="wd-result-star" aria-hidden="true">✦</span><h2>{score} din {results.length}</h2><p>Cuvinte descoperite</p><div className="wd-result-words">{results.map(result => <span lang="nb" key={result.question.id} className={result.correct ? 'correct' : 'wrong'}>{result.correct ? '✓' : '↻'} {result.question.answer}</span>)}</div><div className="wd-result-actions">{mistakes.length > 0 && <button type="button" onClick={onRetry}>Repetă greșelile ({mistakes.length})</button>}<button type="button" onClick={onRestart}>Sesiune nouă →</button><Link to={'/jocuri?nivel=' + level}>Înapoi la jocuri</Link></div></article>
  </section>;
}
