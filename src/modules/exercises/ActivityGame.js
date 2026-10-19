import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { courseCatalog } from '../lessons/norwegian-program/lessonContent';
import { getLearningLevel, levelName } from '../lessons/learningLevel';
import { careerPaths, getCareerPath, getCareerProfile } from '../../services/careerProfile';
import { speakNorwegian } from '../../services/norwegianSpeech';
import { saveReviewItem } from '../../services/spacedReview';
import { recordStudyActivity } from '../../services/learningActivity';
import { buildListeningQuestions, buildMissionQuestions, readPracticeProgress, savePracticeProgress } from './practiceActivities';
import { workMissionData } from './workMissionData';
import './ActivityGame.css';

export const ActivityIcon = ({ game, ...props }) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {game === 'listen' ? <><path d="M6 18v-3a10 10 0 0 1 20 0v3" /><rect x="4" y="15" width="6" height="11" rx="3" /><rect x="22" y="15" width="6" height="11" rx="3" /><path d="M14 13v8m4-11v14" /></> : <><rect x="4" y="10" width="24" height="17" rx="4" /><path d="M11 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3M4 17c7 5 17 5 24 0M14 18h4v5h-4z" /></>}
  </svg>
);

const info = {
  listen: { title: 'Ascultă și alege', eyebrow: 'Antrenează-ți urechea', description: 'Prinde sensul, cu fiecare ascultare.', detail: 'Ascultă norvegiana, apoi alege sensul corect. Descoperi textul și traducerea după răspuns.', action: 'Începe să asculți', unit: 'întrebări' },
  missions: { title: 'Misiuni la serviciu', eyebrow: 'Norvegiană în situații reale', description: 'Un pas mai sigur în fiecare conversație.', detail: 'Înțelege cererea, apoi alege replica potrivită. Două provocări pentru fiecare situație din domeniul tău.', action: 'Începe misiunile', unit: 'misiuni' },
};

const ActivityGame = ({ game }) => {
  const { user } = useAuth();
  const location = useLocation();
  const history = useHistory();
  const requestedLevel = getLearningLevel(location.search);
  const missionLevels = ['A1', 'A2', 'B1', 'B2'];
  const limitedMissions = game === 'missions' && !missionLevels.includes(requestedLevel);
  const level = limitedMissions ? 'B2' : requestedLevel;
  const details = info[game];
  const [pathId, setPathId] = useState(() => getCareerProfile(user)?.pathId || 'general');
  const [mode, setMode] = useState('words');
  const [lessonId, setLessonId] = useState('all');
  const [length, setLength] = useState(game === 'listen' ? 5 : 3);
  const [screen, setScreen] = useState('setup');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState([]);
  const [retry, setRetry] = useState(false);
  const [audioStatus, setAudioStatus] = useState('idle');
  const [heard, setHeard] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [showExit, setShowExit] = useState(false);
  const audioController = useRef(null);
  const answered = useRef(false);
  const completed = useRef(false);
  const startedAt = useRef(0);
  const headingRef = useRef(null);
  const exitContinueRef = useRef(null);
  const settings = { game, level, pathId, userId: user?.id || 'guest' };
  const progress = readPracticeProgress(localStorage, settings);
  const path = getCareerPath(pathId);
  const question = questions[current];
  const listeningCount = useMemo(() => game === 'listen' ? buildListeningQuestions({
    lessons: courseCatalog[level].lessons, level, mode, lessonId, length: Infinity, random: () => 0,
  }).length : 0, [game, level, mode, lessonId]);
  const correctCount = results.filter((item) => item.correct).length;
  const mistakes = results.filter((item) => !item.correct);
  const needsAudio = question?.kind === 'listen';
  const audioBusy = audioStatus === 'loading' || audioStatus === 'playing';

  useEffect(() => () => audioController.current?.abort(), []);
  useEffect(() => {
    if (screen === 'setup') return undefined;
    window.scrollTo({ top: 0, behavior: 'instant' });
    headingRef.current?.focus();
    if (screen !== 'play') return undefined;
    const preventLoss = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', preventLoss);
    return () => window.removeEventListener('beforeunload', preventLoss);
  }, [screen, current]);

  useEffect(() => {
    if (!showExit) return undefined;
    exitContinueRef.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') { setShowExit(false); headingRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showExit]);

  const stopAudio = () => { audioController.current?.abort(); audioController.current = null; setAudioStatus('idle'); };
  const resetQuestion = () => { stopAudio(); answered.current = false; setSelected(null); setChecked(false); setHeard(false); };
  const begin = (nextQuestions, isRetry = false) => {
    if (!nextQuestions.length) { setSetupError('Nu sunt suficiente răspunsuri distincte. Alege toate lecțiile sau alt tip de ascultare.'); return; }
    resetQuestion(); setQuestions(nextQuestions); setCurrent(0); setResults([]); setRetry(isRetry); completed.current = false;
    startedAt.current = Date.now(); setSetupError(''); setScreen('play');
  };
  const start = () => begin(game === 'listen'
    ? buildListeningQuestions({ lessons: courseCatalog[level].lessons, level, mode, lessonId, length })
    : buildMissionQuestions({ scenes: workMissionData[pathId], level, pathId, count: length }));

  const play = async (slow = false, text = question.audioText || question.quote || question.answer) => {
    stopAudio();
    const controller = new AbortController();
    audioController.current = controller;
    setAudioStatus('loading');
    try {
      const result = await speakNorwegian(text, { slow, waitForEnd: true, signal: controller.signal,
        onPlaybackStart: () => { if (!controller.signal.aborted) setAudioStatus('playing'); } });
      if (controller.signal.aborted) return;
      setAudioStatus(result.ok ? 'idle' : 'error');
      if (result.ok) setHeard(true);
    } catch (_) { if (!controller.signal.aborted) setAudioStatus('error'); }
  };

  const verify = () => {
    if (answered.current || selected === null || (needsAudio && !heard)) return;
    answered.current = true; stopAudio();
    const correct = selected === question.answer;
    setChecked(true);
    setResults((previous) => [...previous, { question, given: selected, correct }]);
    if (!correct) saveReviewItem({ id: question.id, level, lessonId: question.lessonId, source: game === 'listen' ? 'listening-game' : 'work-missions',
      prompt: question.kind === 'listen' ? `Ce înseamnă „${question.audioText}”?`
        : `${question.context} ${question.kind === 'intent' ? `Ce ți se cere: „${question.quote}”?` : question.task}`,
      answer: question.answer });
  };

  const next = () => {
    if (!checked || !answered.current) return;
    if (current < questions.length - 1) { resetQuestion(); setCurrent((index) => index + 1); return; }
    if (completed.current) return;
    completed.current = true; stopAudio();
    if (!retry) savePracticeProgress(localStorage, settings, results);
    recordStudyActivity({ type: game === 'listen' ? 'listening-game' : 'work-missions', level,
      minutes: Math.max(1, Math.round((Date.now() - startedAt.current) / 60000)),
      score: Math.round(correctCount / questions.length * 100), words: game === 'listen' && mode === 'words' ? correctCount : 0,
      ...(game === 'missions' ? { pathId } : {}), retry });
    setScreen('result');
  };

  const changeLevel = (value) => {
    const query = new URLSearchParams(location.search); query.set('nivel', value);
    history.replace({ pathname: location.pathname, search: query.toString() }); setLessonId('all'); setSetupError('');
  };
  const backLink = <Link className="activity-game__back" to={`/jocuri?nivel=${level}`}><span aria-hidden="true">←</span> Jocuri și exerciții</Link>;

  if (screen === 'setup') return (
    <div className={`activity-game activity-game--${game}`}>
      {backLink}
      {limitedMissions && <p className="activity-pool-note">Misiunile profesionale au momentan conținut A1–B2. Această sesiune folosește nivelul B2; lecțiile și ascultarea sunt disponibile și la C1–C2.</p>}
      <header className="activity-hero">
        <div className="activity-hero__copy"><span className="activity-eyebrow">{details.eyebrow}</span><h1>{details.title}</h1><p>{details.description}</p>
          <div className="activity-hero__tags"><span>{level} · {levelName[level]}</span><span>{game === 'listen' ? '2–4 minute' : length === 1 ? '1–2 minute' : '3–5 minute'}</span><span>În ritmul tău</span></div>
        </div>
        <div className="activity-hero__art"><i /><i /><i /><ActivityIcon game={game} /></div>
      </header>
      <div className="activity-setup">
        <section className="activity-panel" aria-labelledby="activity-config-title">
          <div className="activity-section-title"><span>01</span><div><h2 id="activity-config-title">Pregătește-ți sesiunea</h2><p>{details.detail}</p></div></div>
          <div className="activity-fields">
            <label>Nivelul tău<select value={level} onChange={(event) => changeLevel(event.target.value)}>{(game === 'missions' ? missionLevels : Object.keys(levelName)).map((value) => <option value={value} key={value}>{value} · {levelName[value]}</option>)}</select></label>
            {game === 'listen' ? <label>Conținut din<select value={lessonId} onChange={(event) => setLessonId(event.target.value)}><option value="all">Toate lecțiile nivelului {level}</option>{courseCatalog[level].lessons.map((lesson) => <option value={lesson.id} key={lesson.id}>{lesson.id}. {lesson.title}</option>)}</select></label>
              : <label>Domeniul misiunilor<select value={pathId} onChange={(event) => setPathId(event.target.value)}>{careerPaths.map((career) => <option value={career.id} key={career.id}>{career.title}</option>)}</select></label>}
          </div>
          {game === 'listen' ? <fieldset className="activity-options"><legend>Ce vrei să asculți?</legend><div className="activity-options__grid">{[['words', 'Cuvinte și expresii', 'Recunoaște vocabularul din lecții.', 'Aa'], ['dialogue', 'Replici din conversații', 'Urmărește sensul unei propoziții.', '“ ”']].map(([value, title, text, symbol]) => <button type="button" aria-pressed={mode === value} className={mode === value ? 'selected' : ''} onClick={() => setMode(value)} key={value}><span aria-hidden="true">{symbol}</span><strong>{title}</strong><small>{text}</small><b aria-hidden="true">{mode === value ? '✓' : '+'}</b></button>)}</div></fieldset>
            : <div className="activity-career"><span aria-hidden="true">{path.icon}</span><div><strong>{path.title}</strong><p>{path.description}</p></div></div>}
          <fieldset className="activity-length"><legend>{game === 'listen' ? 'Câte întrebări?' : 'Câte misiuni?'}</legend><div>{(game === 'listen' ? [5, 10] : [1, 3]).map((value) => <button type="button" aria-pressed={length === value} className={length === value ? 'selected' : ''} onClick={() => setLength(value)} key={value}><strong>{value}</strong> {game === 'missions' && value === 1 ? 'misiune' : details.unit}{game === 'missions' && <small>{value * 2} provocări</small>}</button>)}</div></fieldset>
          {game === 'listen' && <p className="activity-pool-note">{listeningCount ? `Sesiunea ta: ${Math.min(length, listeningCount)} întrebări din selecția aleasă.` : 'Alege altă lecție pentru a avea suficiente răspunsuri distincte.'}</p>}
          {setupError && <p role="alert" className="activity-error">{setupError}</p>}
          <button className="activity-primary activity-start" type="button" disabled={game === 'listen' && !listeningCount} onClick={start}>{details.action}<span aria-hidden="true">→</span></button>
        </section>
        <aside className="activity-guide"><span className="activity-eyebrow">Un obicei mic. Un pas înainte.</span><h2>{game === 'listen' ? 'Mai întâi auzi. Apoi înțelegi.' : 'Exersează aici. Folosește în viața reală.'}</h2>
          <ol>{(game === 'listen' ? ['Ascultă în ritm normal sau mai lent.', 'Alege sensul și verifică răspunsul.', 'Descoperă expresia și revino la greșeli.'] : ['Citește situația din domeniul ales.', 'Înțelege cererea și alege replica.', 'Vezi explicația și repetă ce a fost dificil.']).map((text, index) => <li key={text}><span>{index + 1}</span>{text}</li>)}</ol>
          <div className="activity-personal-best"><span>{progress.sessions ? 'Cel mai bun rezultat' : 'Prima ta sesiune'}</span><strong>{progress.sessions ? `${progress.best}%` : 'Un început bun'}</strong><small>{progress.sessions ? `${progress.sessions} ${progress.sessions === 1 ? 'sesiune' : 'sesiuni'} · ${level}${game === 'missions' ? ` · ${path.shortTitle}` : ''}` : 'Fără cronometru. Poți relua oricând.'}</small></div>
        </aside>
      </div>
    </div>
  );

  if (screen === 'result') return (
    <div className={`activity-game activity-game--${game}`}>
      {backLink}
      <section className="activity-result">
        <span className="activity-result__icon" aria-hidden="true">{mistakes.length ? '↗' : '✓'}</span><span className="activity-eyebrow">{retry ? 'Recapitulare încheiată' : 'Sesiune încheiată'} · {level}</span>
        <h1 ref={headingRef} tabIndex={-1}>{mistakes.length ? 'Fiecare încercare te duce înainte.' : 'Ai prins toate răspunsurile!'}</h1>
        <p>{correctCount} din {questions.length} răspunsuri corecte{game === 'missions' ? ` · ${path.shortTitle}` : ''}</p>
        <div className="activity-result__score"><strong>{Math.round(correctCount / questions.length * 100)}<small>%</small></strong><span>{retry ? 'la repetarea greșelilor' : 'în această sesiune'}</span></div>
        <p>{mistakes.length ? 'Greșelile sunt salvate pentru recapitulare. Le poți exersa din nou chiar acum.' : 'Continuă cu o sesiune nouă ca să consolidezi ce ai învățat.'}</p>
        <div className="activity-result__actions">{mistakes.length > 0 && <button type="button" className="activity-primary" onClick={() => begin(mistakes.map((item) => item.question), true)}>Repetă greșelile ({mistakes.length})</button>}<button type="button" className={mistakes.length ? 'activity-secondary' : 'activity-primary'} onClick={() => setScreen('setup')}>Sesiune nouă</button></div>
      </section>
      <section className="activity-review" aria-label="Răspunsurile sesiunii"><h2>Ce iei cu tine din sesiune</h2>{results.map(({ question: item, given, correct }) => <article className={correct ? 'correct' : 'wrong'} key={item.id}><span aria-hidden="true">{correct ? '✓' : '↻'}</span><div><small>{correct ? 'Corect' : 'De repetat'} · {item.topic}</small><h3 lang={item.kind === 'listen' || item.kind === 'intent' ? 'nb' : 'ro'}>{item.audioText || item.quote || item.context}</h3>{!correct && <p>Ai ales: {given}</p>}<p><strong lang={item.kind === 'reply' ? 'nb' : 'ro'}>{item.answer}</strong></p></div></article>)}</section>
    </div>
  );

  return (
    <div className={`activity-game activity-game--${game} activity-game--playing`}>
      <header className="activity-session-bar"><button type="button" className="activity-close" aria-label="Închide sesiunea" onClick={() => { stopAudio(); setShowExit(true); }}>×</button><div><span>{details.title} · {level}</span><div className="activity-progress" role="progressbar" aria-label="Progresul sesiunii" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={results.length}><i style={{ width: `${results.length / questions.length * 100}%` }} /></div></div><strong>{current + 1}<small> / {questions.length}</small></strong></header>
      <section className="activity-question" aria-labelledby="activity-question-title">
        <div className="activity-question__meta"><span>{retry ? 'Repetă greșelile' : game === 'listen' ? question.topic : `Misiunea ${question.mission} · ${question.title}`}</span><span>{game === 'listen' ? mode === 'words' ? 'Cuvinte și expresii' : 'Conversații' : question.kind === 'intent' ? '01 · Înțelege' : '02 · Răspunde'}</span></div>
        <h1 id="activity-question-title" ref={headingRef} tabIndex={-1}>{question.prompt}</h1>
        {game === 'missions' && <div className="activity-scene"><ActivityIcon game="missions" /><div><small>Situația ta</small><p>{question.context}</p></div></div>}
        {question.kind === 'intent' && <blockquote className="activity-quote"><small>Ți se spune</small><p lang="nb">„{question.quote}”</p><button type="button" className="activity-text-button" onClick={() => play()} disabled={audioBusy}>▷ Ascultă cererea</button></blockquote>}
        {question.kind === 'reply' && <p className="activity-task">{question.task}</p>}
        {needsAudio && <div className={`activity-listen ${audioBusy ? 'is-playing' : ''}`}><div className="activity-soundwave" aria-hidden="true">{Array.from({ length: 19 }, (_, index) => <i style={{ '--bar': `${12 + ((index * 17) % 37)}px`, '--delay': `${index * 45}ms` }} key={index} />)}</div><button type="button" className="activity-listen__play" onClick={() => audioBusy ? stopAudio() : play()} aria-label={audioBusy ? 'Oprește redarea' : 'Ascultă înregistrarea'}><span aria-hidden="true">{audioBusy ? 'Ⅱ' : '▶'}</span>{audioStatus === 'loading' ? 'Se încarcă…' : audioStatus === 'playing' ? 'Se redă…' : heard ? 'Ascultă din nou' : 'Ascultă înregistrarea'}</button><button type="button" className="activity-text-button" onClick={() => play(true)} disabled={audioBusy}>Ascultă mai lent</button><p>{heard ? 'Alege sensul care se potrivește.' : 'Ascultă până la capăt, apoi alege răspunsul.'}</p></div>}
        {audioStatus === 'error' && <div className="activity-error" role="alert">Sunetul nu a putut fi redat. Verifică internetul și încearcă din nou.{!needsAudio && ' Poți continua și citind textul.'}<button type="button" onClick={() => play()}>Reîncearcă redarea</button></div>}
        <div className="activity-choices" role="group" aria-label="Alege răspunsul">{question.options.map((option, index) => {
          const optionState = checked ? option === question.answer ? 'correct' : option === selected ? 'wrong' : '' : selected === option ? 'selected' : '';
          return <button type="button" aria-pressed={selected === option} className={optionState} disabled={checked || (needsAudio && !heard)} onClick={() => setSelected(option)} key={option}><span className="activity-choice-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span lang={question.kind === 'reply' ? 'nb' : 'ro'}>{option}</span><b aria-hidden="true">{optionState === 'correct' ? '✓' : optionState === 'wrong' ? '×' : selected === option ? '●' : ''}</b></button>;
        })}</div>
        {checked && <div role="status" className={`activity-feedback ${selected === question.answer ? 'correct' : 'wrong'}`}><span aria-hidden="true">{selected === question.answer ? '✓' : '↻'}</span><div><h2>{selected === question.answer ? 'Exact, ai înțeles!' : 'Reține pentru data viitoare'}</h2><p>{question.explanation}</p>{question.kind === 'reply' && <button className="activity-text-button" type="button" onClick={() => play(false, question.answer)} disabled={audioBusy}>▷ Ascultă replica potrivită</button>}</div></div>}
      </section>
      <footer className="activity-session-actions"><span>{checked ? selected === question.answer ? 'Încă un pas înainte.' : 'O vei putea repeta la final.' : needsAudio && !heard ? 'Începe prin a asculta.' : 'Alege un răspuns, apoi verifică.'}</span><button className="activity-primary" type="button" disabled={!checked && (selected === null || (needsAudio && !heard))} onClick={checked ? next : verify}>{checked ? current === questions.length - 1 ? 'Vezi rezultatul' : 'Continuă' : 'Verifică răspunsul'}<span aria-hidden="true">→</span></button></footer>
      {showExit && <div className="activity-dialog-backdrop"><section className="activity-dialog" role="dialog" aria-modal="true" aria-labelledby="activity-exit-title" onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const buttons = event.currentTarget.querySelectorAll('button');
        if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[buttons.length - 1].focus(); }
        else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) { event.preventDefault(); buttons[0].focus(); }
      }}><h2 id="activity-exit-title">Ieși din sesiune?</h2><p>Scorul se salvează la final. Greșelile deja verificate rămân în recapitulare.</p><button ref={exitContinueRef} className="activity-primary" type="button" onClick={() => { setShowExit(false); headingRef.current?.focus(); }}>Continuă sesiunea</button><button className="activity-secondary" type="button" onClick={() => { setShowExit(false); setScreen('setup'); }}>Ieși la configurare</button></section></div>}
    </div>
  );
};

export default ActivityGame;
