import {ui} from '../../languages/messages.js';
import {courseLocalStorage as localStorage} from '../../languages/storage.js';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { courseCatalog } from '../../content/activeContent.js';
import { getLearningLevel } from '../lessons/learningLevel';
import { useAuth } from '../auth/AuthContext';
import { speakNorwegian } from '../../services/norwegianSpeech';
import { saveReviewItem } from '../../services/spacedReview';
import { recordStudyActivity } from '../../services/learningActivity';
import { ExerciseLayout } from './ExerciseUI';
import { createPracticeQuestions, normalizePracticeAnswer, saveGameProgress, shufflePractice } from '../../content/features/games.js';
import './PracticeGame.css';
import {createSentenceSession, sentenceHint} from '../../content/features/sentences.js';
import {readCourseProgress} from '../../services/curriculumProgress';
import PracticePuzzleView from './PracticePuzzleView';
import WordDiscovery, { WordDiscoveryResult } from './WordDiscovery';
import {createWordSpellingSession} from '../../content/features/spelling.js';
import { createVocabularySession } from './vocabularyFlow';

const gameInfo = {
  quiz: { title: 'Vocabular', subtitle: 'Alege sensul potrivit.' },
  order: { title: 'Propoziții', subtitle: 'Atinge cuvintele în ordine.' },
  word: { title: ui('ui_a60eba1190b8698d'), subtitle: 'Pornește de la sens și găsește expresia în norvegiană.' },
};

const PracticeSession = ({ game, level, user }) => {
  const course = courseCatalog[level];
  const info = gameInfo[game];
  const history = useHistory();
  const createSession = () => game === 'quiz' ? createVocabularySession(course.lessons) : game === 'order' ? createSentenceSession(course.lessons, readCourseProgress(level,user,course.lessons)) : game === 'word' ? createWordSpellingSession(course.lessons,readCourseProgress(level,user,course.lessons)) : shufflePractice(createPracticeQuestions(course.lessons,game,'normal')).slice(0,5);
  const [screen, setScreen] = useState('game');
  const [questions, setQuestions] = useState(createSession);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selected, setSelected] = useState([]);
  const [checked, setChecked] = useState(false);
  const [orderHint,setOrderHint]=useState(null);
  const failedResponse=useRef(null);
  const [results, setResults] = useState([]);
  const [retry, setRetry] = useState(false);
  const questionTitle = useRef(null);
  const audioController = useRef(null);
  const answered = useRef(false);
  const moving = useRef(false);
  const finished = useRef(false);
  const startedAt = useRef(Date.now());
  const question = questions[current];
  const score = results.filter((result) => result.correct).length;
  const mistakes = results.filter((result) => !result.correct || result.helped);
  const given = game === 'order' && question ? selected.map((index) => question.words[index]).join(' ') : answer;
  const completeAnswer = game === 'order' ? selected.length === question?.words.length : Boolean(answer.trim());
  const isCorrect = (value = given) => (question.acceptedAnswers || [question.answer]).some((accepted) => normalizePracticeAnswer(value) === normalizePracticeAnswer(accepted));

  useEffect(() => {
    moving.current = false;
    audioController.current?.abort();
    window.scrollTo?.({ top: 0, behavior: 'auto' });
    questionTitle.current?.focus();
  }, [screen, current]);
  useEffect(() => () => audioController.current?.abort(), []);

  const playAnswer = () => {
    audioController.current?.abort();
    const controller = new AbortController();
    audioController.current = controller;
    void speakNorwegian(question.answer, { signal: controller.signal });
  };

  const resetAnswer = () => { answered.current = false; failedResponse.current=null;setOrderHint(null); setAnswer(''); setSelected([]); setChecked(false); };
  const begin = (pool, isRetry = false) => {
    if (!pool.length) return;
    resetAnswer(); setRetry(isRetry); setQuestions(pool); setCurrent(0); setResults([]); setScreen('game'); finished.current = false; startedAt.current = Date.now();
  };
  const start = () => begin(createSession());
  const verify = (choice) => {
    const revealed = game === 'quiz' && question.type === 'text' && choice === null;
    const immediateChoice = game === 'quiz' && question.type === 'choice' && typeof choice === 'string';
    if (answered.current || (!revealed && (immediateChoice ? !question.options.includes(choice) : !completeAnswer))) return;
    answered.current = true;
    const response = revealed ? '' : immediateChoice ? choice : given;
    if (immediateChoice || revealed) setAnswer(response);
    const correct = !revealed && isCorrect(response);
    if (game === 'order' && !correct && failedResponse.current === null) {
      failedResponse.current = normalizePracticeAnswer(response);
      setOrderHint({...sentenceHint(question, selected), response: failedResponse.current});
      answered.current = false;
      return;
    }
    if (game === 'order' && !correct && failedResponse.current === normalizePracticeAnswer(response)) {
      answered.current = false;
      return;
    }
    const helped = game === 'order' && failedResponse.current !== null;
    setChecked(true); setResults((all) => [...all, { question, correct, helped, given: response }]);
    if (!correct || helped) saveReviewItem({ id: 'practice-' + level + '-' + question.id, level, lessonId: question.lessonId, source: 'practice', prompt: question.prompt, answer: question.answer });
  };
  const next = () => {
    if (!checked || moving.current) return;
    moving.current = true;
    if (current < questions.length - 1) { resetAnswer(); setCurrent((value) => value + 1); return; }
    if (finished.current) return;
    finished.current = true;
    if (!retry) saveGameProgress(localStorage, game, level, user?.id, results);
    recordStudyActivity({ type: 'practice-' + game, level, userId: user?.id || 'guest', minutes: Math.max(1, Math.round((Date.now() - startedAt.current) / 60000)), score: Math.round(score / questions.length * 100), retry });
    setScreen('result');
  };

  if (screen === 'result' && game === 'word') return <WordDiscoveryResult level={level} score={score} results={results} onRestart={start} onRetry={() => begin(mistakes.map(item => item.question), true)} />;

  if (screen === 'result') return <ExerciseLayout className="practice-game" level={level} icon={game} title={info.title} compact>
    <section className="game-result"><span className="game-result__icon" aria-hidden="true">{mistakes.length ? '↗' : '✓'}</span><p>{ui('web_77320365d5488158')}{level}</p><h1 ref={questionTitle} tabIndex={-1}>{mistakes.length ? 'Încă un pas înainte' : 'Le-ai rezolvat pe toate!'}</h1><div className="game-result__score">{Math.round(score / results.length * 100)}<small>%</small></div><p>{score}{ui('ui_dbd8b6478643d623')}{results.length}{ui('ui_9872b8021dcbf076')}</p>{game === 'order' && results.some(item=>item.helped) && <p>{results.filter(item=>item.correct&&item.helped).length}{ui('web_fc9813130efacfc0')}</p>}<div className="game-result__actions">{mistakes.length > 0 && <button type="button" className="exercise-primary" onClick={() => begin(mistakes.map((item) => item.question), true)}>{game === 'order' ? 'Repetă propozițiile' : 'Repetă greșelile'} ({mistakes.length})</button>}<button type="button" className={mistakes.length ? 'exercise-secondary' : 'exercise-primary'} onClick={start}>{ui('ui_3bbd5edf7ea5fe1b')}</button><Link to={'/jocuri?nivel=' + level}>{ui('web_4d841d600c45fb73')}</Link></div></section>
    {mistakes.length > 0 && <section className="mistake-summary"><h2>{ui('ui_352b62f7948b0ff4')}</h2>{mistakes.map((result) => <article key={result.question.id}><span>{result.question.prompt}</span><strong lang={game === 'quiz' && result.question.type === 'choice' ? 'ro' : 'nb'}>{result.question.answer}</strong></article>)}</section>}
  </ExerciseLayout>;

  if (!question) return <ExerciseLayout className="practice-game" level={level} title={info.title} icon={game}><p role="alert">{ui('ui_5f25d058014542b5')}</p><Link to={'/jocuri?nivel=' + level}>{ui('web_4d841d600c45fb73')}</Link></ExerciseLayout>;

  if (game === 'word') return <WordDiscovery key={current + '-' + question.id} question={question} current={current} total={questions.length} level={level} checked={checked} onSpeak={playAnswer} onNext={next} onResolve={(correct, given, helped=false) => {
    if (answered.current) return;
    answered.current = true;
    setChecked(true);
    setResults(all => [...all, { question, correct, helped, given }]);
    if (!correct || helped) saveReviewItem({ id: 'practice-' + level + '-' + question.id, level, lessonId: question.lessonId, source: 'practice', prompt: question.prompt, answer: question.answer });
  }} />;

  const playPrompt = () => {
    audioController.current?.abort();
    const controller = new AbortController();
    audioController.current = controller;
    void speakNorwegian(question.word || question.answer, { signal: controller.signal });
  };
  return <PracticePuzzleView game={game} level={level} info={info} question={question} current={current} total={questions.length} score={score} headingRef={questionTitle} answer={answer} setAnswer={setAnswer} selected={selected} setSelected={setSelected} orderHint={orderHint} checked={checked} correct={checked && isCorrect()} completeAnswer={completeAnswer} onVerify={verify} onNext={next} onExit={() => history.push('/jocuri?nivel=' + level)} onSpeak={playPrompt} />;
};

const PracticeGame = ({ game }) => {
  const { user } = useAuth();
  const location = useLocation();
  const level = getLearningLevel(location.search);
  return <PracticeSession key={(user?.id || 'guest') + '-' + level + '-' + game} game={game} level={level} user={user} />;
};
export default PracticeGame;
