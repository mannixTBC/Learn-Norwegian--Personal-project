import React from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { learningLevels } from '../lessons/learningLevel';
import './ExerciseUI.css';
import { NordicHeader } from './NordicExerciseUI';

const paths = {
  quiz: <><rect x="5" y="3" width="14" height="18" rx="3" /><path d="m8 8 1 1 2-2m-3 6 1 1 2-2m3-4h2m-2 6h2M8 18h8" /></>,
  order: <><rect x="3" y="4" width="7" height="5" rx="1.5" /><rect x="14" y="15" width="7" height="5" rx="1.5" /><path d="M10 6.5h5a3 3 0 0 1 3 3V12m-2-2 2 2 2-2M14 17.5H9a3 3 0 0 1-3-3V12m-2 2 2-2 2 2" /></>,
  word: <><circle cx="10" cy="10" r="6" /><path d="m14.5 14.5 6 6M8 12l2-5 2 5m-3.2-1.5h2.4" /></>,
  verbs: <><path d="M3 5c4-1 7 0 9 2 2-2 5-3 9-2v14c-4-1-7 0-9 2-2-2-5-3-9-2ZM12 7v14" /></>,
  pronunciation: <><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M6 11a6 6 0 0 0 12 0m-6 6v4m-3 0h6" /></>,
  review: <><path d="M5 7a8 8 0 1 1-1 8M3 3v5h5m4-1v5l3 2" /></>,
  listen: <><path d="M4 13v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="11" width="4" height="9" rx="2" /><rect x="17" y="11" width="4" height="9" rx="2" /><path d="M10 10v6m4-8v10" /></>,
  missions: <><rect x="3" y="7" width="18" height="14" rx="3" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13c5 4 13 4 18 0m-11 1h4v4h-4z" /></>,
  games: <><path d="M7 7h10a4 4 0 0 1 3.8 3l1 6a2.5 2.5 0 0 1-4.3 2L15 16H9l-2.5 2A2.5 2.5 0 0 1 2.2 16l1-6A4 4 0 0 1 7 7Z" /><path d="M7 10v4m-2-2h4m7-1h.1m2 2h.1" /></>,
};

export const ExerciseIcon = ({ name, ...props }) => <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>{paths[name] || paths.games}</svg>;

export const ExerciseLevelSelect = ({ level, levels = learningLevels, onChange }) => {
  const history = useHistory();
  const location = useLocation();
  const change = (value) => {
    if (onChange) { onChange(value); return; }
    const query = new URLSearchParams(location.search);
    query.set('nivel', value);
    localStorage.setItem('norwegian_active_level', value);
    history.replace({ pathname: location.pathname, search: query.toString() });
  };
  return <label className="exercise-level-select"><span>Nivel</span><select aria-label="Nivel de practică" value={level} onChange={(event) => change(event.target.value)}>{levels.map((code) => <option value={code} key={code}>{code}</option>)}</select></label>;
};

const CourseExerciseLayout = ({ title, description, icon, level, className = '', compact = false, allowLevelChange = false, onExit, backTo, backLabel, children }) => (
  <div className={'exercise-screen ' + className}>
    <header className="exercise-topbar">
      {onExit ? <button type="button" className="exercise-back" onClick={onExit} aria-label="Închide sesiunea"><span aria-hidden="true">×</span><strong>{title}</strong></button> : <Link className="exercise-back" to={backTo || '/jocuri?nivel=' + level}><span aria-hidden="true">←</span><strong>{backLabel || (compact ? title : 'Jocuri și exerciții')}</strong></Link>}
      {allowLevelChange ? <ExerciseLevelSelect level={level} /> : <span className="exercise-level-badge">{level}</span>}
    </header>
    {!compact && <div className="exercise-intro"><span className="exercise-intro__icon"><ExerciseIcon name={icon} /></span><div><h1>{title}</h1>{description && <p>{description}</p>}</div></div>}
    {children}
  </div>
);

export const ExerciseLayout = ({ title, description, icon, level, className = '', compact = false, allowLevelChange = false, onExit, backTo, backLabel, children }) => className.split(' ').includes('final-test') ? <CourseExerciseLayout {...{title, description, icon, level, className, compact, allowLevelChange, onExit, backTo, backLabel, children}} /> : (
  <div className={'exercise-screen nordic-exercise nordic-exercise--' + (icon || 'games') + ' ' + className}>
    <NordicHeader title={title} subtitle={description} level={level} onExit={onExit} backTo={backTo} heading={!compact} levelControl={allowLevelChange ? <ExerciseLevelSelect level={level} /> : undefined} />
    {children}
  </div>
);

export const ExerciseLessonSelect = ({ course, value, onChange, label = 'Conținutul sesiunii', all = true }) => <label className="exercise-field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{all && <option value="all">Toate lecțiile · {course.code}</option>}{course.sections.map((section) => <optgroup key={section.id} label={'Secțiunea ' + section.number + ' · ' + section.title}>{section.lessons.map((lesson) => <option key={lesson.uid} value={lesson.id}>{lesson.id + '. ' + lesson.title}</option>)}</optgroup>)}</select></label>;
