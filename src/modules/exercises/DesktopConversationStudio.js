import NaturalConversationExercise from './NaturalConversationExercise';
import ScenarioIllustration from './ScenarioIllustration';
import ScenarioProgress from './ScenarioProgressSummary';
import React from 'react';
import { Link } from 'react-router-dom';
import { getCareerPath } from '../../services/careerProfile';
import { ExerciseLevelSelect } from './ExerciseUI';
import './DesktopConversationStudio.css';

function Icon({ name = 'message' }) {
  const paths = {
    message: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/><path d="M8 11h8m-8 4h5"/></>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
    back: <path d="m14 6-6 6 6 6"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    context: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6m-6 5h6m-6 5h4"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1.2.7-1.7 1.2-1.7 2.7m0 3h.01"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.message}</svg>;
}
function Panorama({ scenario, small = false }) {
  return <div className={'dc-panorama' + (small ? ' dc-panorama--small' : '')} aria-hidden="true">
    <ScenarioIllustration scenarioId={scenario.id}/>
    <span className="dc-scene-label">{scenario.place}</span>
  </div>;
}

export default function DesktopConversationStudio({ level, path, scenarios, selected, flow, hint, setHint,
  bottomRef, inputRef, resultRef, errorRef, loginUrl, blocked, restoring, remaining }) {
  if (selected) return <NaturalConversationExercise key={selected.id + level} mobile={false} {...{ level, selected, flow, hint, setHint, inputRef, bottomRef, resultRef, errorRef, loginUrl, blocked, restoring, remaining }}/>;

  return <main className={'conversation-studio desktop-conversation ' + (selected ? 'desktop-conversation--exercise' : 'desktop-conversation--catalog')}>
    <header className="conversation-heading dc-topbar">
      <Link className="dc-back" to={'/jocuri?nivel=' + level}><Icon name="back"/>Jocuri și exerciții</Link><span className="dc-topbar-meta">Practică în situații reale</span>
    </header>
    <>
      <div className="conversation-title dc-catalog-title"><div><p>CONVERSAȚII ÎN LUMEA REALĂ</p><h1>Studio de conversație</h1><span>Intră în rol și exersează norvegiana în ritmul tău.</span></div><ExerciseLevelSelect level={level}/></div>
      <div className="conversation-section"><h2>Alege o situație</h2><span>Recomandate pentru traseul tău: {path.shortTitle}</span></div>
      <div className="conversation-catalog dc-catalog">{scenarios.map(s => <button key={s.id} className="conversation-card dc-card" onClick={() => flow.choose(s.id)}>
        <Panorama scenario={s} small/><div className="dc-card-copy"><small>{s.path === path.id ? 'PENTRU TRASEUL TĂU' : getCareerPath(s.path).shortTitle}</small><h2>{s.title}</h2><p>{s.place}</p><ScenarioProgress progress={flow.progress?.[s.id]} scenario={s}/><footer><span>{level} · {s.difficulty.turns} schimburi maximum</span><b>Începe <Icon name="arrow"/></b></footer></div>
      </button>)}</div>
      <p className="conversation-note">Poți exersa oricare dintre situații, indiferent de traseul ales.</p>
    </>
  </main>;
}
