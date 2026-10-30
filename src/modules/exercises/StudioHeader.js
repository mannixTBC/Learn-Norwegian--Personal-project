import React from 'react';
import { Link } from 'react-router-dom';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import PracticalStudioArtwork from './PracticalStudioArtwork';
import { ExerciseLevelSelect } from './ExerciseUI';
export default function StudioHeader({level,back,onBack,locked=false,practical=false,title,titleId,titleRef}) {
  const Title = titleId ? 'h1' : 'span';
  return <header className="studio-top">
    {onBack?<button type="button" className="studio-back" onClick={onBack} aria-label="Înapoi la situații">‹</button>:back?<Link className="studio-back" to={back} aria-label="Înapoi la studio">‹</Link>:null}
    {title?<Title className="studio-header-title" id={titleId} ref={titleRef} tabIndex={titleRef ? -1 : undefined}>{title}</Title>:<Link className="sc-brand studio-brand" to="/dashboard" aria-label="NordLingo - Acasă">{practical?<PracticalStudioArtwork scene="logo"/>:<NorwegianFlagIcon/>}</Link>}
    {locked?<span className="studio-level">{level}</span>:<ExerciseLevelSelect level={level}/>}
  </header>;
}
