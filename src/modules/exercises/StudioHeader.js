import React from 'react';
import { Link } from 'react-router-dom';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import { ExerciseLevelSelect } from './ExerciseUI';
export default function StudioHeader({level,back,onBack,locked=false}) {
  return <header className="studio-top">
    {onBack?<button type="button" className="studio-back" onClick={onBack} aria-label="Înapoi la situații">‹</button>:back?<Link className="studio-back" to={back} aria-label="Înapoi la studio">‹</Link>:null}
    <Link className="sc-brand studio-brand" to="/dashboard" aria-label="NordLingo - Acasă"><NorwegianFlagIcon/></Link>
    {locked?<span className="studio-level">{level}</span>:<ExerciseLevelSelect level={level}/>}
  </header>;
}
