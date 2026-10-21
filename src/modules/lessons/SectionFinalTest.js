import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { courseCatalog } from './norwegian-program/lessonContent';
import { CURRICULUM_VERSION } from './curriculumMetadata';
import { buildSectionTest, sectionTestSummary, SECTION_TEST_VERSION } from './sectionAssessment';
import { isCompleteAnswer, correctAnswerText, givenAnswerText } from './curriculumAssessment';
import { lessonExerciseSentence } from './norwegian-program/lessonExerciseContent';
import { speakNorwegian } from '../../services/norwegianSpeech';
import { saveReviewItem } from '../../services/spacedReview';
import './SectionFinalTest.css';

const fresh = () => ({ stage: 'intro', index: 0, answers: {}, practical: ['', ''], self: {} });
function Session({ section, level, user }) {
  const test = useMemo(() => buildSectionTest(section), [section]);
  const key = `section-test-${CURRICULUM_VERSION}-${SECTION_TEST_VERSION}-${user?.id || 'guest'}-${section.id}`;
  const [state, setState] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved && ['intro', 'questions', 'practical', 'result'].includes(saved.stage) && Number.isInteger(saved.index) && saved.index >= 0 && saved.index < (saved.stage === 'questions' ? 6 : 2) && saved.answers && Array.isArray(saved.practical) && saved.practical.length === 2 && saved.practical.every(x => typeof x === 'string')) return { ...saved, self: saved.self || {} };
    } catch (_) { /* Start fresh if storage is unavailable. */ }
    return fresh();
  });
  const [storageError, setStorageError] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [reviewIndex, setReviewIndex] = useState(null);
  const audio = useRef(null);
  const heading = useRef(null);
  const finishing = useRef(false);
  const update = patch => setState(s => ({ ...s, ...patch }));
  const summary = sectionTestSummary(test.questions, state.answers);
  const question = test.questions[state.index];
  const answer = state.answers[question?.id];
  const home = `/invata?nivel=${level}`;
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch (_) { setStorageError(true); } }, [key, state]);
  useEffect(() => { heading.current?.focus(); setAudioError(''); return () => audio.current?.abort(); }, [state.stage, state.index, reviewIndex]);
  const setAnswer = value => update({ answers: { ...state.answers, [question.id]: value } });
  const listen = async text => {
    audio.current?.abort(); const controller = new AbortController(); audio.current = controller; setAudioError('');
    try { const result = await speakNorwegian(text, { signal: controller.signal }); if (!controller.signal.aborted && !result.ok) setAudioError('Audio indisponibil. Încearcă din nou.'); }
    catch (_) { if (!controller.signal.aborted) setAudioError('Audio indisponibil. Încearcă din nou.'); }
  };
  const finish = () => {
    if (finishing.current || !test.questions.every(q => isCompleteAnswer(q, state.answers[q.id])) || !state.practical.every(t => t.trim())) return;
    finishing.current = true;
    try {
      summary.wrong.forEach(q => saveReviewItem({ id: q.id, level, lessonId: q.lessonId, lessonUid: q.lessonUid, source: 'section-test', prompt: q.type === 'audio' ? `Ce înseamnă „${q.audioText}”?` : [q.prompt, lessonExerciseSentence(q)].filter(Boolean).join(' '), answer: correctAnswerText(q) }));
    } catch (_) { setStorageError(true); }
    update({ stage: 'result', index: 0 });
    finishing.current = false;
  };
  const next = () => {
    if (state.stage === 'questions') update(state.index < 5 ? { index: state.index + 1 } : { stage: 'practical', index: 0 });
    else if (state.index === 0) update({ index: 1 }); else finish();
  };
  const back = () => {
    if (state.index > 0) update({ index: state.index - 1 });
    else update(state.stage === 'practical' ? { stage: 'questions', index: 5 } : { stage: 'intro', index: 0 });
  };
  const progress = state.stage === 'intro' ? 0 : state.stage === 'result' ? 100 : ((state.stage === 'practical' ? 6 : 0) + state.index) / 8 * 100;
  const reviewing = reviewIndex !== null ? summary.wrong[reviewIndex] : null;
  return <div className="section-test"><div className="st-shell">
    <header className="st-header"><Link to={home} aria-label="Salvează și închide testul">×</Link><div><strong><svg className="st-shield" viewBox="0 0 24 26" aria-hidden="true"><path d="M12 2 21 5v8c0 5-5 9-9 11-4-2-9-6-9-11V5Z"/><path d="m8 12 3 3 5-6"/></svg>Test final</strong><small>Secțiunea {section.number} · {section.title}</small></div><span>{level}</span></header>
    <div className="st-progress-area"><div className="st-track" role="progressbar" aria-label="Progresul testului" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>{Array.from({ length: 8 }, (_, i) => <span key={i} className={i < progress / 12.5 ? 'is-complete' : i === progress / 12.5 && state.stage !== 'intro' && state.stage !== 'result' ? 'is-current' : ''}/>)}</div><p className="st-progress-caption">{state.stage === 'intro' ? 'Pregătire' : state.stage === 'result' ? 'Rezultatul tău' : state.stage === 'questions' ? `Întrebarea ${state.index + 1} din 6` : `Situație practică · ${state.index + 1} din 2`}</p></div>
    <main className="st-content">
      {storageError && <p role="status">Salvarea locală nu este disponibilă. Păstrează pagina deschisă până termini.</p>}
      {state.stage === 'intro' && <><span className="st-tag">Verifică ce poți folosi</span><h1 ref={heading} tabIndex={-1}>{section.title}</h1><p>{section.outcome}</p><div className="st-facts"><span>6 întrebări</span><span>1 situație practică</span><span>{level.startsWith('C') ? '12–18' : level.startsWith('B') ? '10–15' : '7–10'} min · estimat</span></div><div className="st-card"><h2>Ce verificăm</h2>{section.lessons.filter(l => l.kind !== 'consolidation').map(l => <p key={l.uid}>✓ {l.title}</p>)}</div><p>Poți reveni la răspunsuri. Corectările apar la final, iar sarcina practică se autoevaluează separat.</p><small>Progresul se păstrează pe acest dispozitiv.</small><button className="st-primary" onClick={() => update({ stage: 'questions', index: 0 })}>Începe testul</button></>}
      {state.stage === 'questions' && <><small>Întrebarea {state.index + 1} din 6</small><span className="st-tag">{question.category}</span><h1 ref={heading} tabIndex={-1}>{question.prompt}</h1>{question.instruction && <p>{question.instruction}</p>}{question.context && <p>{question.context.description}</p>}{question.type === 'fill' && lessonExerciseSentence(question) && <p className="st-sentence" lang="nb">{lessonExerciseSentence(question)}</p>}{question.type === 'audio' && <button className="st-audio" onClick={() => listen(question.audioText)}>▷ Ascultă fraza</button>}{audioError && <p role="status">{audioError}</p>}
        {(question.type === 'choice' || question.type === 'audio') && <div className="st-options">{question.options.map((option, i) => <button key={i} className={answer === i ? 'is-selected' : ''} aria-pressed={answer === i} onClick={() => setAnswer(i)}><span className="st-option-letter" aria-hidden="true">{String.fromCharCode(65 + i)}</span><span className="st-option-text">{option}</span><span className="st-option-radio" aria-hidden="true"/></button>)}</div>}
        {question.type === 'fill' && <label className="st-label">Răspunsul tău<input lang="nb" autoComplete="off" spellCheck={false} value={typeof answer === 'string' ? answer : ''} onChange={e => setAnswer(e.target.value)} /></label>}
        {question.type === 'order' && <><div className="st-built" aria-label="Propoziția ta">{(answer || []).map((word, i) => <button key={i} onClick={() => setAnswer(answer.filter((_, n) => n !== i))}>{question.words[word]}</button>)}{!answer?.length && <span>Atinge cuvintele în ordinea potrivită.</span>}</div><div className="st-words">{question.words.map((word, i) => <button key={i} disabled={(answer || []).includes(i)} onClick={() => setAnswer([...(answer || []), i])}>{word}</button>)}</div></>}
      </>}
      {state.stage === 'practical' && <><small>Situație practică · Intervenția {state.index + 1} din 2</small><span className="st-tag">Aplică expresiile secțiunii</span><h1 ref={heading} tabIndex={-1}>{section.mission}</h1><p>Completează două momente din această situație. Folosește date fictive.</p><div className="st-card"><small>Interlocutorul spune</small><p lang="nb">{test.practical[state.index].cue}</p></div><p><strong>Tu transmiți:</strong> {test.practical[state.index].intent}</p><label className="st-label">Replica ta în norvegiană<textarea lang="nb" rows={3} spellCheck={false} value={state.practical[state.index]} onChange={e => update({ practical: state.practical.map((t, i) => i === state.index ? e.target.value : t) })}/></label><small>Fără punctaj automat. La final compari cu un exemplu.</small></>}
      {state.stage === 'result' && <>{reviewing ? <><span className="st-tag">Recapitulare · {reviewIndex + 1} din {summary.wrong.length}</span><h1 ref={heading} tabIndex={-1}>{reviewing.prompt}</h1><div className="st-card"><small>Răspunsul tău</small><p>{givenAnswerText(reviewing, state.answers[reviewing.id])}</p><small>Răspuns corect</small><p lang="nb"><strong>{correctAnswerText(reviewing)}</strong></p><p>{reviewing.explanation}</p></div><Link to={`/curs/${level.toLowerCase()}/${reviewing.lessonId}`}>Revezi lecția: {reviewing.lessonTitle}</Link><button className="st-primary" onClick={() => setReviewIndex(reviewIndex + 1 < summary.wrong.length ? reviewIndex + 1 : null)}>{reviewIndex + 1 < summary.wrong.length ? 'Următoarea explicație' : 'Înapoi la rezultat'}</button></> : <><span className="st-emblem" aria-hidden="true">✓</span><h1 ref={heading} tabIndex={-1}>Secțiune încheiată</h1><p className="st-score">{summary.correct} din 6 răspunsuri corecte</p><small>Scorul întrebărilor obiective</small><div className="st-card">{summary.groups.map(g => <div className="st-skill" key={g.label}><span>{g.label}</span><strong>{g.correct}/{g.total}</strong><progress value={g.correct} max={g.total}/></div>)}</div><h2>Ai reușit în acest test</h2><p>{summary.groups.filter(g => g.correct === g.total).map(g => g.label).join(' · ') || 'Ai identificat ce merită consolidat. Reia explicațiile în ritmul tău.'}</p>{summary.wrong.length > 0 && <div className="st-recommend"><strong>De repetat</strong>{[...new Map(summary.wrong.map(q => [q.lessonId, q])).values()].map(q => <Link key={q.lessonId} to={`/curs/${level.toLowerCase()}/${q.lessonId}`}>{q.lessonTitle} →</Link>)}</div>}
        <details className="st-card"><summary>Sarcina practică · Autoevaluare</summary><p>Compară sensul și formularea. Exemplul este o variantă posibilă, nu singurul răspuns corect.</p>{test.practical.map((p,i) => <div className="st-self" key={i}><strong>Intervenția {i+1}</strong><p>Tu: {state.practical[i]}</p><p lang="nb">Exemplu: {p.model}</p><label><input type="checkbox" checked={!!state.self[i]} onChange={e => update({ self: { ...state.self, [i]: e.target.checked } })}/>Am transmis sensul cerut.</label></div>)}</details>
        {summary.wrong.length > 0 && <button className="st-primary" onClick={() => setReviewIndex(0)}>{summary.wrong.length === 1 ? 'Revezi greșeala' : `Revezi cele ${summary.wrong.length} greșeli`}</button>}<Link className="st-primary" to={home}>Continuă cursul</Link><button className="st-secondary" onClick={() => setState(fresh())}>Reia testul</button></> }</>}
    </main>
    {(state.stage === 'questions' || state.stage === 'practical') && <footer className="st-footer"><p>{state.stage === 'questions' ? 'Răspunsurile se evaluează la final.' : 'Sarcina practică se autoevaluează separat.'}</p><button onClick={back}>Înapoi</button><button className="st-primary" disabled={state.stage === 'questions' ? !isCompleteAnswer(question, answer) : !state.practical[state.index].trim()} onClick={next}>{state.stage === 'practical' && state.index === 1 ? 'Vezi rezultatul' : 'Continuă'}</button></footer>}
  </div></div>;
}
export default function SectionFinalTest({ match }) {
  const { user } = useAuth();
  const level = String(match.params.level).toUpperCase();
  const section = courseCatalog[level]?.sections.find(s => s.id === match.params.sectionId);
  if (!section) return <div className="section-test"><h1>Secțiune negăsită</h1><Link to="/invata">Înapoi la curs</Link></div>;
  return <Session key={`${user?.id || 'guest'}-${section.id}`} section={section} level={level} user={user}/>;
}
