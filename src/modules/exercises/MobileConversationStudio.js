import React from 'react';
import { Link } from 'react-router-dom';
import NaturalConversationExercise from './NaturalConversationExercise';
import { ExerciseLevelSelect } from './ExerciseUI';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import './MobileConversationStudio.css';
import ScenarioCatalog from './ScenarioCatalog';

export default function MobileConversationStudio(props) {
  const { level, path, scenarios, selected, flow } = props;
  if (selected) return <NaturalConversationExercise key={selected.id + level} {...props} mobile={true}/>;
  return <main className="conversation-studio conversation-studio--app mobile-conversation mobile-conversation--catalog">
    <header className="conversation-heading mc-topbar">
      <Link className="mc-back" to={'/jocuri?nivel=' + level} aria-label="Înapoi la jocuri"><span aria-hidden="true">‹</span><span>Jocuri</span></Link>
      <Link className="sc-brand" to="/dashboard" aria-label="Nordlingo - Acasă"><NorwegianFlagIcon/></Link>
      <ExerciseLevelSelect level={level}/>
    </header>
    <div className="sc-title"><h1>Scenarii practice</h1><p>Alege o situație și vorbește cu Nora.</p></div>
    <ScenarioCatalog key={level + ':' + path.id} {...{ scenarios, path, flow }} mobile={true}/>
  </main>;
}
