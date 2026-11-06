import {ui} from '../../languages/messages.js';
import React, { useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { courseCatalog } from '../../content/activeContent.js';
import { getLearningLevel } from '../lessons/learningLevel';
import { ExerciseLevelSelect, ExerciseLessonSelect } from '../exercises/ExerciseUI';
import PronunciationLab from './PronunciationLab';
import { CathedralDialog } from './PronunciationCathedral';
import './Pronunciation.css';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import './PronunciationCathedral.css';
import './PronunciationNordic.css';
import './PronunciationPractice.css';

const PronunciationSession = ({ level }) => {
  const rewardAttemptsRef = useRef(new Set());
  const course = courseCatalog[level];
  const [activeLesson, setActiveLesson] = useState('1');
  const [activePhrase, setActivePhrase] = useState(0);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const lesson = course.lessons.find((item) => item.id === Number(activeLesson)) || course.lessons[0];
  const phrases = useMemo(() => lesson.vocabulary.map(([word, meaning, example, translation]) => ({ word, meaning, example, translation })), [lesson]);
  const chooseLesson = (id) => { setActiveLesson(id); setActivePhrase(0); setLibraryOpen(false); };
  const openPhrase = (index) => {
    setActivePhrase(index);
    setLibraryOpen(false);
  };
  return <section className="exercise-screen pronunciation-practice" aria-label={ui('ui_efcec15f0e8e3101')}>
    <header className="practice-voice-top"><Link to={'/jocuri?nivel='+level} aria-label={ui('ui_18c234c09d63bb77')}>‹</Link><Link to="/dashboard" aria-label={ui('web_c5ac94a4335cbea9')}><NorwegianFlagIcon/></Link><ExerciseLevelSelect level={level}/></header>
    <button type="button" className="practice-voice-progress" aria-label={ui('ui_170b8c6d52117b7b')} aria-haspopup="dialog" onClick={()=>setLibraryOpen(true)}><span>{activePhrase+1}{ui('ui_dbd8b6478643d623')}{phrases.length}</span><progress value={activePhrase+1} max={phrases.length}/></button>
    <PronunciationLab key={level+'-'+lesson.uid+'-'+activePhrase} phrase={phrases[activePhrase]} phraseIndex={activePhrase} level={level} lessonId={lesson.id} rewardAttemptsRef={rewardAttemptsRef} appearance="practice" lessonTitle={lesson.title} onPrevious={()=>setActivePhrase(index=>Math.max(0,index-1))} onNext={()=>setActivePhrase(index=>Math.min(phrases.length-1,index+1))} lastPhrase={activePhrase===phrases.length-1}/>
    {libraryOpen&&<CathedralDialog title={ui('ui_f6db2e1988b4d752')} onClose={()=>setLibraryOpen(false)}><ExerciseLessonSelect course={course} value={activeLesson} onChange={chooseLesson} label="Alege lecția" all={false}/><div className="practice-voice-library">{phrases.map((item,index)=><button type="button" key={index} onClick={()=>openPhrase(index)} aria-current={index===activePhrase?'true':undefined}><strong lang="nb">{item.example}</strong><span>{item.translation}</span></button>)}</div></CathedralDialog>}
  </section>;

};
const Pronunciation = () => {
  const {user}=useAuth();
  const {search}=useLocation();
  const level=getLearningLevel(search);
  return <PronunciationSession key={(user?.id||'guest')+'-'+level} level={level}/>;
};
export default Pronunciation;
