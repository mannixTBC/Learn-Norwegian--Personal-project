import React from 'react';
import { Link } from 'react-router-dom';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import { wordDiscoveryCatalog } from './wordDiscoveryCatalog';
import './NordicExercises.css';
import './GameFamilies.css';

const missionPaths = ['transport', 'hospitality', 'construction', 'healthcare', 'cleaning', 'retail', 'office', 'studies', 'family', 'general'];
const defaults = {
  quiz: ['drinks', 0], order: ['travel', 2], verbs: ['objects', 0],
  pronunciation: ['places', 8], review: ['places', 4],
};
const normalize = value => String(value || '').normalize('NFC').toLocaleLowerCase('nb-NO').replace(/[.!?,:;„“”«»]/g, '').replace(/^(en|ei|et|å)\s+/u, '').trim();

export function getExerciseArtwork(kind, text = '', pathId = 'general') {
  if (kind === 'missions') return { src: '/images/exercises/mission-scenes.webp', columns: 2, rows: 5, tile: missionPaths.includes(pathId) ? missionPaths.indexOf(pathId) : 9 };
  // Listening must not disclose the answer, and recall cards use a neutral library scene.
  if (kind === 'listen') return null;
  if (!['review', 'verbs'].includes(kind)) {
    const word = normalize(text);
    const exact = wordDiscoveryCatalog.find(item => normalize(item.answer) === word);
    const contextual = exact || [...wordDiscoveryCatalog].sort((a, b) => b.answer.length - a.answer.length).find(item => item.answer.length > 2 && (' ' + word + ' ').includes(' ' + item.answer + ' '));
    if (contextual) return { src: contextual.image, columns: 3, rows: 4, tile: contextual.tile };
  }
  const [sheet, tile] = defaults[kind] || defaults.quiz;
  return { src: `/images/word-discovery/${sheet}.webp`, columns: 3, rows: 4, tile };
}

export function ExerciseArtwork({ kind, text, pathId, className = '' }) {
  const art = getExerciseArtwork(kind, text, pathId);
  if (!art) return null;
  const column = art.tile % art.columns;
  const row = Math.floor(art.tile / art.columns);
  return <div className={'ng-art ' + className} aria-hidden="true"><div style={{ backgroundImage: `url("${art.src}")`, backgroundSize: `${art.columns * 100}% ${art.rows * 100}%`, backgroundPosition: `${column * 100 / (art.columns - 1)}% ${row * 100 / (art.rows - 1)}%` }} /></div>;
}

export function NordicHeader({ title, subtitle, level, onExit, backTo, levelControl, heading = true }) {
  const backIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m10 5-7 7 7 7M3 12h18" /></svg>;
  return <header className="ng-header">
    <div className="ng-brand">
      {onExit ? <button type="button" className="ng-exit" aria-label="Închide sesiunea" onClick={onExit}>{backIcon}</button> : <Link className="ng-exit" aria-label="Înapoi la jocuri" to={backTo || '/jocuri?nivel=' + level}>{backIcon}</Link>}
      <Link to="/dashboard" aria-label="NordLingo — Acasă"><NorwegianFlagIcon className="ng-logo" /></Link>
      {levelControl || <span className="ng-level" aria-label={'Nivel ' + level}>{level}</span>}
    </div>
    {heading && <div className="ng-heading"><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>}
  </header>;
}

export function NordicProgress({ current, total, label = 'Progresul sesiunii', detail }) {
  return <div className="ng-progress"><progress aria-label={label} value={current} max={Math.max(1, total)} /><span>{detail || `${current} / ${total}`}</span></div>;
}
