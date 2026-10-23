import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { ExerciseIcon, ExerciseLayout } from '../ExerciseUI';
import { isInstalledAppView } from '../../../services/appExperience';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import { recordStudyActivity } from '../../../services/learningActivity';
import { getVerbSessions, readVerbProgress } from './verbsForLevel';
import { createVerbSession, getKnownReviewVerbs } from './verbPracticeData';
import {
  initVerbSession, verbPracticeReducer, currentVerbFrame, verbSessionSummary,
  readVerbPracticeProgress, recordVerbPracticeCompletion, selectDueVerbReviews,
} from './verbPracticeState';
import './VerbPractice.css';

const phases = ['Descoperă', 'Recunoaște', 'Folosește', 'Reține'];
const statusLabels = { retained: 'Reținut astăzi', repeated: 'Repetat astăzi', helped: 'Cu ajutor', wrong: 'De repetat', unseen: 'De exersat' };
const getStorage = () => { try { return window.localStorage; } catch { return null; } };
const readSessions = (level, count) => readVerbProgress(getStorage(), level, count);

function HighlightedSentence({ sentence, form }) {
  const index = sentence.indexOf(form);
  return <>{index < 0 ? sentence : <>{sentence.slice(0, index)}<mark>{form}</mark>{sentence.slice(index + form.length)}</>}</>;
}

function SessionPicker({ currentDay, sessions, progress, onChoose, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const trigger = document.activeElement;
    dialog?.showModal?.();
    return () => { dialog?.close?.(); if (trigger?.isConnected) trigger.focus(); };
  }, []);
  return <dialog ref={ref} className="verb-practice__sessions" aria-labelledby="verb-sessions-title" onCancel={event => { event.preventDefault(); onClose(); }}>
    <header><div><small>Parcursul tău</small><h2 id="verb-sessions-title">Sesiunile de verbe</h2></div><button type="button" onClick={onClose} aria-label="Închide sesiunile">×</button></header>
    <p>Reia o sesiune parcursă sau continuă de unde ai rămas.</p>
    <div className="verb-practice__session-list">{sessions.map((verbs, index) => {
      const day = index + 1, completed = progress.completed.includes(day);
      return <button type="button" data-session={day} key={day} disabled={day > progress.day} aria-current={day === currentDay ? 'step' : undefined} onClick={() => onChoose(day)}>
        <span>{completed ? '✓' : String(day).padStart(2, '0')}</span><strong>Sesiunea {day}</strong><small>{completed ? 'Parcursă' : day > progress.day ? 'Urmează' : 'Continuă'}</small>
      </button>;
    })}</div>
    <p className="verb-practice__saved-count" role="progressbar" aria-label="Sesiuni parcurse" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress.completed.length / sessions.length * 100)}>{progress.completed.length} din {sessions.length} sesiuni parcurse</p>
  </dialog>;
}

function SessionRunner({ level, userId, day, sessions, progress, onChoose, onComplete, app }) {
  const history = useHistory();
  const scope = useMemo(() => ({ userId, level }), [userId, level]);
  const [session] = useState(() => {
    const memory = readVerbPracticeProgress(getStorage(), scope);
    const known = getKnownReviewVerbs({ level, day, progress });
    const due = selectDueVerbReviews(memory, known, { limit: 2 });
    const candidates = [...known.filter(item => memory.verbs[item.id]?.needsReview), ...due, ...known.slice().reverse()];
    const reviewVerbs = [...new Map(candidates.map(item => [item.id, item])).values()].slice(0, 2);
    return createVerbSession({ level, day, progress, reviewVerbs });
  });
  const [state, dispatch] = useReducer(verbPracticeReducer, session, initVerbSession);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [audioStatus, setAudioStatus] = useState('');
  const [playing, setPlaying] = useState(false);
  const [editing, setEditing] = useState(false);
  const processed = useRef(new Set());
  const root = useRef(null), heading = useRef(null), input = useRef(null), audio = useRef(null);
  const frame = currentVerbFrame(state);
  const summary = verbSessionSummary(state);
  const result = state.view === 'result';
  const q = frame?.question, verb = frame?.verb;
  const checked = !!frame?.checked, value = frame?.response || '';
  const phase = result ? 3 : frame?.type === 'intro' ? 0 : { meaning: 1, context: 2, recall: 3 }[q?.phase];
  const frameKey = frame?.key;

  useEffect(() => { setEditing(false); }, [frameKey, checked, result]);

  const saveCompletion = () => {
    const memory = recordVerbPracticeCompletion(getStorage(), scope, state);
    const saved = onComplete(summary, state.retry);
    setSaveError(!memory.saved || !saved);
  };
  useEffect(() => {
    if (!state.completionId || !state.completionCount || processed.current.has(state.completionId)) return;
    processed.current.add(state.completionId);
    saveCompletion();
  }, [state.completionId, state.completionCount]); // Completion IDs guard duplicate checks and revisiting the result.
  useEffect(() => {
    audio.current?.abort();
    setPlaying(false); setAudioStatus('');
    const card = root.current?.querySelector('.verb-practice__card');
    if (card) card.scrollTop = 0;
    heading.current?.focus({ preventScroll: !app || window.innerHeight >= 560 });
    return () => audio.current?.abort();
  }, [frameKey, result]);
  useEffect(() => {
    if (!app || !window.visualViewport) return;
    const viewport = window.visualViewport;
    const update = () => root.current?.style.setProperty('--verb-viewport', Math.round(viewport.height) + 'px');
    update(); viewport.addEventListener('resize', update);
    return () => viewport.removeEventListener('resize', update);
  }, [app]);

  const action = type => dispatch({ type, frameKey });
  const listen = async () => {
    if (!verb || playing) return;
    audio.current?.abort(); audio.current = new AbortController();
    const controller = audio.current;
    setPlaying(true); setAudioStatus('Se pregătește modelul audio…');
    try {
      const response = await speakNorwegian(verb.example, { signal: controller.signal, waitForEnd: true, onPlaybackStart: () => setAudioStatus('Ascultă și repetă în ritmul tău.') });
      if (controller.signal.aborted) return;
      setAudioStatus(response?.ok ? '' : 'Modelul audio nu este disponibil momentan. Poți continua.');
    } catch { if (!controller.signal.aborted) setAudioStatus('Modelul audio nu este disponibil momentan. Poți continua.'); }
    finally { if (!controller.signal.aborted) setPlaying(false); }
  };
  const primary = () => {
    if (result) {
      if (summary.weakIds.length) dispatch({ type: 'START_RETRY' });
      else if (day < sessions.length) onChoose(day + 1);
      else history.push('/jocuri?nivel=' + level);
    } else action(frame.type === 'intro' || checked ? 'NEXT' : 'CHECK');
  };
  const primaryLabel = result ? summary.weakIds.length ? 'Repetă verbele' : day < sessions.length ? 'Sesiunea următoare' : 'Înapoi la Jocuri'
    : frame?.type === 'intro' ? frame.number === frame.total ? 'Începe exercițiile' : 'Următorul verb'
      : checked ? frame.number === frame.total ? 'Vezi rezultatul' : 'Continuă' : 'Verifică';
  const hasResponse = q?.options ? !!value : !!value.trim();
  const formInstruction = q?.prompt || 'Scrie doar verbul lipsă, la prezent.';
  const missingSentence = q?.sentence?.split('___');
  const dense = result ? session.verbs.some(item => item.norwegian.length > 18)
    : frame?.type === 'intro' ? verb.norwegian.length > 18 || verb.example.length > 60
      : (q?.sentence?.length || 0) + (q?.translation?.length || 0) > 120 || q?.answer?.length > 18;

  return <section ref={root} onFocus={event => { if (event.target.id === 'verb-answer') setEditing(true); }} className={'verb-practice verb-practice--' + (app ? 'app' : 'web')} aria-label="Sesiune de verbe" data-writing={editing && !checked} data-view={result ? 'result' : frame?.type}>
    {app && <header className="verb-practice__top"><Link to={'/jocuri?nivel=' + level}><span aria-hidden="true">←</span> Jocuri</Link><img src="/branding/nordlingo-selected-color.png" alt="NordLingo" width="145" height="49" /><span className="verb-practice__level" aria-label={'Nivel ' + level}>{level}</span></header>}
    <div className="verb-practice__banner"><div>{app && <h1>Verbe</h1>}<button type="button" data-action="sessions" onClick={() => setPickerOpen(true)} aria-haspopup="dialog" aria-label="Alege sesiunea de verbe">Sesiunea {day} · {session.title}<span aria-hidden="true">⌄</span></button></div><ExerciseIcon name="verbs" /></div>
    <ol className="verb-practice__route" aria-label="Etapele sesiunii">{phases.map((label, index) => <li key={label} className={result || index < phase ? 'is-done' : index === phase ? 'is-active' : ''} aria-current={!result && index === phase ? 'step' : undefined}>{label}</li>)}</ol>
    <section className="verb-practice__card" aria-label={result ? 'Rezultatul sesiunii' : 'Exercițiul curent'} data-question-id={q?.id} data-phase={q?.phase} data-dense={dense} data-kind={result ? 'result' : frame?.type}>
      {result ? <div className="verb-practice__result">
        <div className="verb-practice__meta"><span>{state.retry ? 'Repetare încheiată' : 'Sesiune încheiată'}</span><span>{level}</span></div>
        <h2 ref={heading} tabIndex={-1}>Ai făcut încă un pas.</h2>
        <p className="verb-practice__score">{summary.correct} din {summary.total} răspunsuri corecte{summary.helped > 0 ? ' · ' + summary.helped + ' cu ajutor' : ''}</p>
        <div className="verb-practice__results">{session.verbs.map(item => {
          const outcome = summary.verbs.find(entry => entry.verbId === item.id)?.status || 'unseen';
          return <div className="verb-practice__result-row" data-verb-id={item.id} key={item.id}><div><strong lang="nb">{item.norwegian} <span aria-hidden="true">→</span> {item.form}</strong><small>{item.romanian}</small></div><span className={'verb-practice__status is-' + outcome}>{statusLabels[outcome]}</span></div>;
        })}</div>
        <p className="verb-practice__summary-note">{summary.weakIds.length ? 'Verbele mai dificile revin la repetare. Le vei revedea și în sesiunile următoare.' : 'Revino în zilele următoare ca să consolidezi verbele.'}{session.reviewVerbs.length > 0 && <span>Ai reluat și {session.reviewVerbs.map(item => item.form).join(', ')} din sesiunile anterioare.</span>}{state.retry && <span>Scorul primei încercări rămâne păstrat.</span>}</p>
        {saveError && <div className="verb-practice__save-error" role="alert">Progresul nu a putut fi salvat.<button type="button" onClick={saveCompletion}>Salvează din nou</button></div>}
      </div> : <>
        <div className="verb-practice__meta"><span>{frame.type === 'intro' ? 'Descoperă' : state.retry ? 'Repetare' : 'Exersează'} · {frame.number} din {frame.total}</span><span>{frame.type === 'intro' ? 'Verb nou' : q.old ? 'Din urmă' : { meaning: 'Sens', context: 'Context', recall: 'Memorie' }[q.phase]}</span></div>
        {frame.type === 'intro' ? <>
          <div className="verb-practice__discovery"><h2 ref={heading} tabIndex={-1} lang="nb">{verb.norwegian}</h2><p className="verb-practice__meaning">{verb.romanian}</p><div className="verb-practice__form-pair"><span lang="nb">{verb.norwegian}</span><span aria-hidden="true">→</span><strong lang="nb">{verb.form}</strong><small>{verb.formLabel}</small></div><div className="verb-practice__example"><p lang="nb"><HighlightedSentence sentence={verb.example} form={verb.form} /></p><p>{verb.translation}</p><button type="button" className="verb-practice__audio" disabled={playing} onClick={listen}><ExerciseIcon name="listen" />{playing ? 'Ascultă…' : 'Ascultă propoziția'}</button><small role="status">{audioStatus}</small></div></div>
          <div className="verb-practice__feedback is-neutral"><ExerciseIcon name="review" /><p>{verb.formLabel === 'infinitiv' ? 'Reține expresia întreagă și felul în care se leagă în propoziție.' : 'La prezent, forma verbului rămâne aceeași pentru toate persoanele.'}</p></div>
        </> : <>
          <h2 ref={heading} tabIndex={-1} className="verb-practice__question-title">{q.phase === 'meaning' ? q.prompt : q.old ? 'Îți mai amintești?' : q.phase === 'context' ? 'Alege verbul potrivit' : 'Scrie din memorie'}</h2>
          {q.sentence && <><p className="verb-practice__intention">{q.translation}</p><p className="verb-practice__sentence" lang="nb">{missingSentence[0]}<span className="verb-practice__blank">{checked ? q.answer : '…'}</span>{missingSentence.slice(1).join('___')}</p></>}
          {q.options ? <div className="verb-practice__choices" role="group" aria-label="Alege răspunsul">{q.options.map((option, index) => <button type="button" data-choice={option} key={option} aria-pressed={value === option} disabled={checked} className={checked ? option === q.answer ? 'is-correct' : value === option ? 'is-wrong' : '' : ''} onClick={() => dispatch({ type: 'SET_RESPONSE', value: option, frameKey })}><span aria-hidden="true">{checked && option === q.answer ? '✓' : checked && value === option ? '×' : String.fromCharCode(65 + index)}</span>{option}</button>)}</div>
            : <div className="verb-practice__writing"><label htmlFor="verb-answer">{formInstruction}</label><input ref={input} id="verb-answer" aria-label="Verbul lipsă" lang="nb" type="text" value={value} onChange={event => dispatch({ type: 'SET_RESPONSE', value: event.target.value, frameKey })} onKeyDown={event => { if (event.key === 'Enter' && hasResponse && !checked) { event.preventDefault(); action('CHECK'); } }} disabled={checked} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} placeholder="Verbul în norvegiană" /><div className="verb-practice__helper"><span>{frame.hinted ? 'Prima literă: ' + q.answer[0] + '…' : 'Fără variante de răspuns'}</span><button type="button" data-action="hint" disabled={checked || frame.hinted} onClick={() => { action('USE_HINT'); input.current?.focus(); }}>{frame.hinted ? 'Cu ajutor' : 'Indiciu'}</button></div></div>}
          <div className={'verb-practice__feedback ' + (checked ? frame.record.correct ? 'is-correct' : 'is-wrong' : 'is-neutral')} role={checked ? 'status' : undefined}>
            <span aria-hidden="true">{checked ? frame.record.correct ? '✓' : '↻' : '·'}</span><div>{checked ? <><strong>{frame.record.correct ? frame.record.helped ? 'Corect, cu ajutor.' : 'Corect!' : 'Reține forma potrivită.'}</strong><p lang={q.phase === 'meaning' ? undefined : 'nb'}>{q.phase === 'meaning' ? q.infinitive + ' — ' + q.answer : q.sentence.replace('___', q.answer)}</p>{(!frame.record.correct || frame.record.helped) && <small>{!frame.record.correct ? 'Verbul va reveni la repetare.' : 'Îl vei revedea fără indiciu.'}</small>}</> : <p>{q.old ? 'Un verb cunoscut, într-o situație nouă.' : q.phase === 'meaning' ? 'Alege sensul, apoi verifică.' : q.phase === 'context' ? 'Sensul în română te ajută să alegi verbul.' : 'Folosește sensul propoziției ca să îți amintești forma.'}</p>}</div>
          </div>
        </>}
      </>}
    </section>
    <footer className="verb-practice__footer"><button type="button" data-action="previous" disabled={!result && state.cursor === 0} onClick={() => action('BACK')}><span aria-hidden="true">←</span> Înapoi</button><button type="button" data-action="primary" disabled={!result && frame?.type !== 'intro' && !checked && !hasResponse} onClick={primary}>{primaryLabel}<span aria-hidden="true">→</span></button></footer>
    {pickerOpen && <SessionPicker {...{ sessions, progress }} currentDay={day} onChoose={value => { setPickerOpen(false); onChoose(value); }} onClose={() => setPickerOpen(false)} />}
  </section>;
}

export default function VerbPractice({ level, userId }) {
  const app = isInstalledAppView();
  const sessions = useMemo(() => getVerbSessions(level), [level]);
  const [progress, setProgress] = useState(() => readSessions(level, sessions.length));
  const [day, setDay] = useState(() => readSessions(level, sessions.length).day);
  const recorded = useRef(new Set());
  const complete = (summary, retry) => {
    let saved = true;
    const latest = readSessions(level, sessions.length);
    const next = { day: Math.max(latest.day, Math.min(day + 1, sessions.length)), completed: [...new Set([...latest.completed, day])].sort((a, b) => a - b) };
    try { getStorage().setItem('challenge_verbs_progress_' + level.toLowerCase(), JSON.stringify(next)); } catch { saved = false; }
    setProgress(next);
    if (!recorded.current.has(day)) {
      try {
        recordStudyActivity({ type: 'verbs', level, userId, minutes: 3, session: day, words: 3, score: Math.round(summary.correct / summary.total * 100) });
        recorded.current.add(day);
      } catch { saved = false; }
    }
    return saved;
  };
  const runner = <SessionRunner key={level + '-' + day} {...{ level, userId, day, sessions, progress, app }} onChoose={setDay} onComplete={complete} />;
  return app ? runner : <ExerciseLayout className="challenge30" level={level} title="Verbele de astăzi" description="Descoperă sensul, folosește verbele în propoziții și scrie din memorie." icon="verbs" allowLevelChange>{runner}</ExerciseLayout>;
}
