import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { courseCatalog } from '../lessons/norwegian-program/lessonContent';
import { getLearningLevel } from '../lessons/learningLevel';
import { speakPronunciationModel } from '../../services/azurePronunciationSpeech';
import { ExerciseLayout, ExerciseLevelSelect, ExerciseLessonSelect } from '../exercises/ExerciseUI';
import { isInstalledAppView } from '../../services/appExperience';
import PronunciationLab from './PronunciationLab';
import { CathedralDialog, CathedralIcon, CathedralPager, useShortVoiceScreen } from './PronunciationCathedral';
import './Pronunciation.css';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import './PronunciationCathedral.css';
import './PronunciationNordic.css';

function PhraseLibrary({ phrases, activePhrase, onChoose, onClose }) {
  const short = useShortVoiceScreen();
  const pageSize = short ? 2 : 4;
  const [page, setPage] = useState(() => Math.floor(activePhrase / pageSize));
  const pages = Math.max(1, Math.ceil(phrases.length / pageSize));
  const currentPage = Math.min(page, pages - 1);
  useEffect(() => { setPage(Math.floor(activePhrase / pageSize)); }, [activePhrase,pageSize]);
  return <CathedralDialog title="Expresiile lecției" onClose={onClose} footer={<CathedralPager page={currentPage} pages={pages} onChange={setPage} />}>
    <div className="cathedral-library">{phrases.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((item, offset) => {
      const index = currentPage * pageSize + offset;
      return <div key={index} className={index === activePhrase ? 'is-active' : ''}>
        <button type="button" onClick={() => onChoose(index)} aria-current={index === activePhrase ? 'true' : undefined}><small>Expresia {index + 1}</small><strong lang="nb">{item.word}</strong><span>{item.meaning}</span></button>
        <button type="button" onClick={() => speakPronunciationModel(item.example)} aria-label={'Ascultă ' + item.example}><CathedralIcon name="listen" /></button>
      </div>;
    })}</div>
  </CathedralDialog>;
}

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
    if (!isInstalledAppView()) document.getElementById('pronunciation-lab-title')?.scrollIntoView?.({ behavior:'smooth', block:'start' });
  };
  if (!isInstalledAppView()) return <ExerciseLayout className="pronuntie" level={level} title="Pronunție" description="Ascultă o frază, repet-o și exersează în ritmul tău." icon="pronunciation" allowLevelChange>
    <section className="pronuntie__selection"><ExerciseLessonSelect course={course} value={activeLesson} onChange={chooseLesson} label="Alege lecția" all={false} /><div className="pronuntie__phrase-bar" aria-label="Navigare între expresii"><button type="button" onClick={() => setActivePhrase(index => Math.max(0,index - 1))} disabled={activePhrase === 0} aria-label="Expresia anterioară">←</button><span aria-live="polite"><strong>Expresia {activePhrase + 1}</strong><small>din {phrases.length} · Lecția {lesson.id}</small></span><button type="button" onClick={() => setActivePhrase(index => Math.min(phrases.length - 1,index + 1))} disabled={activePhrase === phrases.length - 1} aria-label="Expresia următoare">→</button></div></section>
    <PronunciationLab key={level + '-' + lesson.uid + '-' + activePhrase} phrase={phrases[activePhrase]} phraseIndex={activePhrase} level={level} lessonId={lesson.id} rewardAttemptsRef={rewardAttemptsRef} />
    <details className="pronuntie__library"><summary>Toate cele {phrases.length} expresii ale lecției</summary><div className="pronuntie__grid">{phrases.map((item,index) => <article className={'pronuntie__phrase ' + (activePhrase === index ? 'is-active' : '')} key={index}><div><span>Expresia {index + 1}</span><strong lang="nb">{item.word}</strong><small>{item.meaning}</small></div><p lang="nb">{item.example}</p><div className="pronuntie__actions"><button type="button" onClick={() => speakPronunciationModel(item.example)} aria-label={'Ascultă ' + item.example}>Ascultă</button><button type="button" onClick={() => openPhrase(index)} aria-pressed={activePhrase === index}>Exersează</button></div></article>)}</div></details>
  </ExerciseLayout>;
  return <section className="pronunciation-cathedral pronunciation-nordic" aria-label="Exercițiu de pronunție">
    <header className="cathedral-top"><Link to={'/jocuri?nivel=' + level}><span aria-hidden="true">&#8592;</span> Jocuri</Link><Link className="game-brand-link" to="/dashboard" aria-label="NordLingo - Acasa"><NorwegianFlagIcon className="game-brand-logo" /></Link><ExerciseLevelSelect level={level} /></header>
    <div className="cathedral-heading"><h1>Pronunție <span className="warm-voice-icon" aria-hidden="true"><i /><i /><i /><i /><i /></span></h1><p>Ascultă și exersează<br />în ritmul tău.</p></div>
    <div className="cathedral-lesson"><CathedralIcon name="book" /><ExerciseLessonSelect course={course} value={activeLesson} onChange={chooseLesson} label="Alege lecția" all={false} /></div>
    <PronunciationLab key={level + '-' + lesson.uid + '-' + activePhrase} phrase={phrases[activePhrase]} phraseIndex={activePhrase} level={level} lessonId={lesson.id} rewardAttemptsRef={rewardAttemptsRef} appearance="cathedral" />
    <footer className="cathedral-navigation" aria-label="Navigare între expresii">
      <button type="button" onClick={() => setActivePhrase(index => Math.max(0,index - 1))} disabled={activePhrase === 0} aria-label="Expresia anterioară">‹</button>
      <button className="cathedral-navigation__library" type="button" aria-haspopup="dialog" onClick={() => setLibraryOpen(true)}><span className="nordic-phrase-dots" aria-hidden="true">{phrases.map((_, index) => <i key={index} className={index <= activePhrase ? 'is-active' : ''} />)}</span><strong aria-live="polite">{activePhrase + 1} din {phrases.length}</strong><small>Toate expresiile ↓</small></button>
      {activePhrase < phrases.length - 1 && <button type="button" onClick={() => setActivePhrase(index => Math.min(phrases.length - 1,index + 1))} aria-label="Expresia următoare">Următoarea expresie <span aria-hidden="true">&#8594;</span></button>}
    {activePhrase === phrases.length - 1 && <Link className="nordic-finish" to={'/jocuri?nivel=' + level}>Înapoi la Jocuri →</Link>}
    </footer>
    {libraryOpen && <PhraseLibrary {...{phrases,activePhrase}} onChoose={openPhrase} onClose={() => setLibraryOpen(false)} />}
  </section>;
};
const Pronunciation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const level = getLearningLevel(location.search);
  return <PronunciationSession key={(user?.id || 'guest') + '-' + level} level={level} />;
};
export default Pronunciation;
