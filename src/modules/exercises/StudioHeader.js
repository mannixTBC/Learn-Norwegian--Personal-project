import {ui} from '../../languages/messages.js';
import React from 'react';
import { Link } from 'react-router-dom';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import PracticalStudioArtwork from './PracticalStudioArtwork';
import { ExerciseLevelSelect } from './ExerciseUI';
export default function StudioHeader({level,back,onBack,locked=false,practical=false,title,titleId,titleRef}) {
  const Title = titleId ? 'h1' : 'span';
  return <header className="studio-top">
    {onBack?<button type="button" className="studio-back" onClick={onBack} aria-label={ui('web_78da2b3a4cde10e7')}>‹</button>:back?<Link className="studio-back" to={back} aria-label={ui('web_62893a11ba4aa2af')}>‹</Link>:null}
    {title?<Title className="studio-header-title" id={titleId} ref={titleRef} tabIndex={titleRef ? -1 : undefined}>{title}</Title>:<Link className="sc-brand studio-brand" to="/dashboard" aria-label={ui('web_c5ac94a4335cbea9')}>{practical?<PracticalStudioArtwork scene="logo"/>:<NorwegianFlagIcon/>}</Link>}
    {locked?<span className="studio-level">{level}</span>:<ExerciseLevelSelect level={level}/>}
  </header>;
}
