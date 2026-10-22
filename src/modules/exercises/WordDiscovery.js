import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import './WordDiscovery.css';

const rows = ['QWERTYUIOPÅ', 'ASDFGHJKLØ', 'ZXCVBNMÆ'];
const lettersOf = (text) => Array.from(text.toLocaleUpperCase('nb-NO')).filter(char => /\p{L}/u.test(char));
export default function WordDiscovery({ question, current, total, level, checked, onResolve, onNext, onSpeak }) {
  const [guessed, setGuessed] = useState([]);
  const [menu, setMenu] = useState(false);
  const letters = lettersOf(question.answer);
  const wrong = guessed.filter(letter => !letters.includes(letter)).length;
  const remaining = Math.max(0, 3 - wrong);
  const choose = (letter) => {
    if (checked || guessed.includes(letter)) return;
    const next = [...guessed, letter];
    setGuessed(next);
    const won = letters.every(char => next.includes(char));
    const lost = next.filter(char => !letters.includes(char)).length >= 3;
    if (won || lost) onResolve(won, next.join(' '));
  };
  useEffect(() => {
    const keydown = event => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.target?.closest?.('input,textarea,select')) return;
      const letter = event.key.toLocaleUpperCase('nb-NO');
      if (letter.length === 1 && /\p{L}/u.test(letter)) { event.preventDefault(); choose(letter); }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  });
  const won = letters.every(char => guessed.includes(char));
  return <section className="word-discovery">
    <header className="wd-brand"><button type="button" aria-label="Meniu" aria-expanded={menu} onClick={() => setMenu(!menu)}>☰</button><Link to="/dashboard"><NorwegianFlagIcon className="wd-logo" /></Link><span>{current + 1}/{total}</span></header>
    {menu && <nav className="wd-menu" aria-label="Meniul jocului"><Link to="/dashboard">Acasă</Link><Link to={'/jocuri?nivel=' + level}>Toate jocurile</Link></nav>}
    <Link className="wd-back" to={'/jocuri?nivel=' + level}>← <span>Provocarea zilei</span></Link>
    <h1>Descoperă cuvântul</h1><p className="wd-subtitle">Găsește cuvântul norvegian</p>
    <div className="wd-progress"><span className="wd-hearts" aria-label={remaining + ' încercări rămase'}>{[0,1,2].map(i => <span key={i} className={i >= remaining ? 'empty' : ''}>♥</span>)}</span><progress aria-label="Progresul sesiunii" value={current} max={total}/><span>{remaining} {remaining === 1 ? 'încercare' : 'încercări'}</span></div>
    <article className="wd-card"><img className="wd-art" src="/images/lessons/a1/04-home-routine.webp" alt=""/><span className="wd-category">VOCABULAR · {level}</span><h2>{question.prompt}</h2><div className="wd-words" aria-label="Cuvântul de descoperit" lang="nb">{question.answer.split(/\s+/).map((word, i) => <span className="wd-word" key={i}>{Array.from(word).map((char, j) => <span className={'wd-slot ' + (checked && !guessed.includes(char.toLocaleUpperCase('nb-NO')) ? 'revealed' : '')} key={j}>{! /\p{L}/u.test(char) || checked || guessed.includes(char.toLocaleUpperCase('nb-NO')) ? char.toLocaleUpperCase('nb-NO') : <span aria-label="literă ascunsă">_</span>}</span>)}</span>)}</div></article>
    <div className="wd-controls" aria-live="polite">{checked ? <><strong>{won ? '✓ Ai descoperit cuvântul!' : 'Reține: ' + question.answer}</strong><div><button type="button" onClick={onSpeak}>Ascultă</button><button type="button" onClick={onNext}>{current === total - 1 ? 'Vezi rezultatul' : 'Continuă'} →</button></div></> : <button type="button" onClick={() => choose(letters.find(char => !guessed.includes(char)))} disabled={!letters.some(char => !guessed.includes(char))}>♧ &nbsp; Indiciu</button>}</div>
    <div className="wd-keyboard" role="group" aria-label="Tastatură norvegiană">{rows.map(row => <div className="wd-key-row" key={row}>{Array.from(row).map(letter => <button type="button" key={letter} aria-label={letter} disabled={checked || guessed.includes(letter)} className={guessed.includes(letter) ? letters.includes(letter) ? 'found' : 'missed' : ''} onClick={() => choose(letter)}>{letter}</button>)}</div>)}</div>
  </section>;
}
