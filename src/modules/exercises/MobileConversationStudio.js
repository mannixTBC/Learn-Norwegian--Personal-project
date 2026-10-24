import NaturalConversationExercise from './NaturalConversationExercise';
import ScenarioProgress from './ScenarioProgressSummary';
import React from 'react';
import { Link } from 'react-router-dom';
import { getCareerPath } from '../../services/careerProfile';
import { ExerciseArtwork } from './NordicExerciseUI';
import { ExerciseLevelSelect } from './ExerciseUI';
import MobileAppNav from '../layout/MobileAppNav';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import './MobileConversationStudio.css';

function Icon({ name = 'message' }) {
  const paths = {
    back: <path d="m14 5-7 7 7 7"/>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
    message: <><path d="M21 11a8 8 0 0 1-8 8H8l-5 3 1-6a8 8 0 1 1 17-5Z"/><path d="M8 10h8m-8 4h5"/></>,
    list: <><path d="M9 6h12M9 12h12M9 18h12"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1.2.7-1.7 1.2-1.7 2.7m0 3h.01"/></>,
    user: <><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></>,
    history: <><path d="M3 11a9 9 0 1 1 2 7M3 4v7h7m2-5v6l4 2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.message}</svg>;
}
function Artwork({ scenario, compact = false }) {
  return <div className={'mc-scene' + (compact ? ' mc-scene--compact' : '')}>{scenario.id === 'cafe-order' ? <img className="scenario-cafe-photo" src="/images/voice/nora-cafe.png" alt=""/> : <><ExerciseArtwork kind="missions" pathId={scenario.path}/><img className="scenario-scene-nora" src="/images/voice/nora-avatar.webp" alt=""/></>}<span>{scenario.place}</span></div>;
}

export default function MobileConversationStudio({ level, path, scenarios, selected, flow, hint, setHint,
  inputRef, bottomRef, resultRef, errorRef, loginUrl, blocked, restoring, remaining }) {
  if (selected) return <NaturalConversationExercise key={selected.id + level} mobile={true} {...{ level, selected, flow, hint, setHint, inputRef, bottomRef, resultRef, errorRef, loginUrl, blocked, restoring, remaining }}/>;

  return <main className={'conversation-studio conversation-studio--app mobile-conversation ' + (selected ? 'mobile-conversation--exercise' : 'mobile-conversation--catalog')}>
    <header className="conversation-heading mc-topbar">
      <Link className="mc-back" to={'/jocuri?nivel=' + level} aria-label="Înapoi la jocuri"><Icon name="back"/></Link><Link className="mc-brand" to="/dashboard" aria-label="Nordlingo — Acasă"><NorwegianFlagIcon/></Link><ExerciseLevelSelect level={level}/>
    </header>
    <>
      <div className="conversation-title mc-catalog-title"><p>VORBEȘTE ÎN SITUAȚII REALE</p><h1>Scenarii practice</h1><span>Intră în rol. Găsește cuvintele. Exersează cu Nora.</span></div>
      <div className="conversation-section"><h2>Alege o situație</h2><span>{level} · {path.shortTitle}</span></div>
      <div className="conversation-catalog mc-catalog">{scenarios.map(s => <button className="conversation-card mc-card" key={s.id} onClick={() => flow.choose(s.id)}>
        <Artwork scenario={s}/><div className="mc-card-copy"><small>{s.path === path.id ? 'PENTRU TRASEUL TĂU' : getCareerPath(s.path).shortTitle}</small><h2>{s.title}</h2><p>{s.place}</p><ScenarioProgress progress={flow.progress?.[s.id]} scenario={s}/><footer><span>{level} · {s.difficulty.turns} schimburi maximum</span><b>Începe <Icon name="arrow"/></b></footer></div>
      </button>)}</div>
      <p className="conversation-note">Poți alege oricare dintre situații, indiferent de traseul tău.</p><MobileAppNav activeLevel={level} activeSection="games"/>
    </>
  </main>;
}
