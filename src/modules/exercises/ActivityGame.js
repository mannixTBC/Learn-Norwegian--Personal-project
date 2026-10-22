import React, { useEffect, useRef, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { courseCatalog } from '../lessons/norwegian-program/lessonContent';
import { getLearningLevel } from '../lessons/learningLevel';
import { getCareerPath, getCareerProfile } from '../../services/careerProfile';
import { speakNorwegian } from '../../services/norwegianSpeech';
import { saveReviewItem } from '../../services/spacedReview';
import { recordStudyActivity } from '../../services/learningActivity';
import { readCourseProgress } from '../../services/curriculumProgress';
import { buildAdaptiveListeningQuestions, buildMissionQuestions, savePracticeProgress } from './practiceActivities';
import { workMissionData } from './workMissionData';
import { ExerciseLayout } from './ExerciseUI';
import './ActivityGame.css';
import ActivityPlayView from './ActivityPlayView';
import ListeningExpedition, { ListeningExpeditionLayout } from './ListeningExpedition';
import DesktopActivityView from './DesktopActivityView';
import { isInstalledAppView } from '../../services/appExperience';

export const ActivityIcon = ({ game, ...props }) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {game === 'listen' ? <><path d="M6 18v-3a10 10 0 0 1 20 0v3" /><rect x="4" y="15" width="6" height="11" rx="3" /><rect x="22" y="15" width="6" height="11" rx="3" /><path d="M14 13v8m4-11v14" /></> : <><rect x="4" y="10" width="24" height="17" rx="4" /><path d="M11 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3M4 17c7 5 17 5 24 0M14 18h4v5h-4z" /></>}
  </svg>
);

const info = {
  listen: { title: 'Ascultă și alege', eyebrow: 'Antrenează-ți urechea', description: 'Prinde sensul, cu fiecare ascultare.', detail: 'Ascultă norvegiana, apoi alege sensul corect. Descoperi textul și traducerea după răspuns.', action: 'Începe să asculți', unit: 'întrebări' },
  missions: { title: 'Misiuni la serviciu', eyebrow: 'Norvegiană în situații reale', description: 'Un pas mai sigur în fiecare conversație.', detail: 'Înțelege cererea, apoi alege replica potrivită. Două provocări pentru fiecare situație din domeniul tău.', action: 'Începe misiunile', unit: 'misiuni' },
};

const ActivitySession = ({ game }) => {
  const { user } = useAuth();
  const location = useLocation();
  const history = useHistory();
  const requestedLevel = getLearningLevel(location.search);
  const missionLevels = ['A1', 'A2', 'B1', 'B2'];
  const limitedMissions = game === 'missions' && !missionLevels.includes(requestedLevel);
  const level = limitedMissions ? 'B2' : requestedLevel;
  const details = info[game];
  const [pathId] = useState(() => getCareerProfile(user)?.pathId || 'general');
  const createSession = () => game === 'listen'
    ? buildAdaptiveListeningQuestions({ lessons: courseCatalog[level].lessons, level, completed: readCourseProgress(level, user, courseCatalog[level].lessons).completed, length: 10 })
    : buildMissionQuestions({ scenes: workMissionData[pathId], level, pathId, count: 3 }).slice(0, 5);
  const [screen, setScreen] = useState('play');
  const [questions, setQuestions] = useState(createSession);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState([]);
  const [retry, setRetry] = useState(false);
  const [audioStatus, setAudioStatus] = useState('idle');
  const [heard, setHeard] = useState(false);
  const audioController = useRef(null);
  const answered = useRef(false);
  const recorded = useRef(false);
  const completed = useRef(false);
  const startedAt = useRef(Date.now());
  const headingRef = useRef(null);
  const settings = { game, level, pathId, userId: user?.id || 'guest' };
  const path = getCareerPath(pathId);
  const question = questions[current];
  const correctCount = results.filter((item) => item.correct).length;
  const mistakes = results.filter((item) => !item.correct);
  const needsAudio = question?.kind === 'listen';
  const audioBusy = audioStatus === 'loading' || audioStatus === 'playing';
  const ResultLayout = isInstalledAppView() && game === 'listen' ? ListeningExpeditionLayout : ExerciseLayout;

  useEffect(() => () => audioController.current?.abort(), []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    headingRef.current?.focus();
  }, [screen, current]);

  const stopAudio = () => { audioController.current?.abort(); audioController.current = null; setAudioStatus('idle'); };
  const resetQuestion = (preserveResult = false) => { if (!preserveResult) recorded.current = false; stopAudio(); answered.current = false; setSelected(null); setChecked(false); setHeard(false); };
  const begin = (nextQuestions, isRetry = false) => {
    if (!nextQuestions.length) return;
    resetQuestion(); setQuestions(nextQuestions); setCurrent(0); setResults([]); setRetry(isRetry); completed.current = false;
    startedAt.current = Date.now(); setScreen('play');
  };
  const start = () => begin(createSession());

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
    if (!recorded.current) {
      setResults((previous) => [...previous, { question, given: selected, correct }]);
      recorded.current = true;
    }
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
    recordStudyActivity({ type: game === 'listen' ? 'listening-game' : 'work-missions', level, userId: user?.id || 'guest',
      minutes: Math.max(1, Math.round((Date.now() - startedAt.current) / 60000)),
      score: Math.round(correctCount / questions.length * 100), words: game === 'listen' ? results.filter((item) => item.correct && item.question.contentType !== 'dialogue').length : 0,
      ...(game === 'missions' ? { pathId } : {}), retry });
    setScreen('result');
  };

  if (screen === 'result') return (
    <ResultLayout className={`activity-game activity-game--${game}`} title={details.title} icon={game} level={level} requestedLevel={requestedLevel} compact backTo={'/jocuri?nivel=' + requestedLevel}>
      <section className="activity-result">
        <span className="activity-result__icon" aria-hidden="true">{mistakes.length ? '↗' : '✓'}</span><span className="activity-eyebrow">{retry ? 'Recapitulare încheiată' : 'Sesiune încheiată'} · {level}</span>
        <h1 ref={headingRef} tabIndex={-1}>{mistakes.length ? 'Fiecare încercare te duce înainte.' : 'Ai prins toate răspunsurile!'}</h1>
        <p>{correctCount} din {questions.length} răspunsuri corecte{game === 'missions' ? ` · ${path.shortTitle}` : ''}</p>
        <div className="activity-result__score"><strong>{Math.round(correctCount / questions.length * 100)}<small>%</small></strong><span>{retry ? 'la repetarea greșelilor' : 'în această sesiune'}</span></div>
        <p>{mistakes.length ? 'Greșelile sunt salvate pentru recapitulare. Le poți exersa din nou chiar acum.' : 'Continuă cu o sesiune nouă ca să consolidezi ce ai învățat.'}</p>
        <div className="activity-result__actions">{mistakes.length > 0 && <button type="button" className="activity-primary" onClick={() => begin(mistakes.map((item) => item.question), true)}>Repetă greșelile ({mistakes.length})</button>}<button type="button" className={mistakes.length ? 'activity-secondary' : 'activity-primary'} onClick={start}>Sesiune nouă</button></div>
      </section>
      <section className="activity-review" aria-label="Răspunsurile sesiunii"><h2>Ce iei cu tine din sesiune</h2>{results.map(({ question: item, given, correct }) => <article className={correct ? 'correct' : 'wrong'} key={item.id}><span aria-hidden="true">{correct ? '✓' : '↻'}</span><div><small>{correct ? 'Corect' : 'De repetat'} · {item.topic}</small><h3 lang={item.kind === 'listen' || item.kind === 'intent' ? 'nb' : 'ro'}>{item.audioText || item.quote || item.context}</h3>{!correct && <p>Ai ales: {given}</p>}<p><strong lang={item.kind === 'reply' ? 'nb' : 'ro'}>{item.answer}</strong></p></div></article>)}</section>
    </ResultLayout>
  );

  if (!question) return <ExerciseLayout className="activity-game" title={details.title} icon={game} level={level} backTo={'/jocuri?nivel=' + requestedLevel}><p role="alert">Nu sunt întrebări disponibile pentru această sesiune.</p><Link to={'/jocuri?nivel=' + requestedLevel}>Înapoi la jocuri</Link></ExerciseLayout>;

  const PlayView = !isInstalledAppView() ? DesktopActivityView : game === 'listen' ? ListeningExpedition : ActivityPlayView;
  return <PlayView game={game} details={details} level={level} requestedLevel={requestedLevel} limitedMissions={limitedMissions} pathId={pathId} question={question} current={current} total={questions.length} retry={retry} headingRef={headingRef} needsAudio={needsAudio} audioBusy={audioBusy} audioStatus={audioStatus} heard={heard} selected={selected} setSelected={setSelected} checked={checked} play={play} stopAudio={stopAudio} onExit={() => { stopAudio(); history.push('/jocuri?nivel=' + requestedLevel); }} verify={verify} next={next} repeatQuestion={() => { resetQuestion(true); headingRef.current?.focus(); }}/>;
};

const ActivityGame = ({ game }) => {
  const { user } = useAuth();
  const location = useLocation();
  const level = getLearningLevel(location.search);
  return <ActivitySession key={(user?.id || 'guest') + '-' + level + '-' + game} game={game} />;
};
export default ActivityGame;
