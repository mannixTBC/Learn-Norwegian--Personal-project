import React, { useRef, useState } from 'react';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import { ExerciseIcon } from '../ExerciseUI';
import { shufflePractice } from '../practiceGameData';
import './Challenge30.css';

const ChallengeDragDrop = ({ verbs, onComplete }) => {
  const [pool, setPool] = useState(() => shufflePractice(verbs.map((verb, index) => ({ ...verb, id: index }))));
  const [slots, setSlots] = useState({});
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const verified = useRef(false);
  const assigned = new Set(Object.values(slots));
  const assign = (index) => {
    if (checked) return;
    setSlots((current) => {
      const next = { ...current };
      if (selected === null) delete next[index];
      else next[index] = selected;
      return next;
    });
    setSelected(null);
  };
  const check = () => {
    if (verified.current || Object.keys(slots).length !== verbs.length) return;
    verified.current = true;
    const correct = verbs.filter((verb, index) => pool.find((word) => word.id === slots[index])?.romanian === verb.romanian).length;
    setScore(correct); setChecked(true); setSelected(null);
    if (correct === verbs.length) onComplete?.();
  };
  const reset = () => { verified.current = false; setSlots({}); setSelected(null); setChecked(false); setScore(0); setPool((items) => shufflePractice(items)); };
  if (!verbs.length) return <p className="challenge30__empty">Alege o sesiune cu verbe disponibile.</p>;
  return <section className="challenge-drag" aria-label="Asociază verbele cu sensul lor">
    <h3>Găsește perechile</h3><p className="challenge-drag__inst" id="verb-match-instructions">Atinge un verb, apoi traducerea lui. Atinge o pereche pentru a o modifica.</p>
    <div className="ng-match-board"><div className="challenge-drag__pool" aria-label="Verbe în norvegiană">{pool.map((verb) => <div className={'challenge-drag__token ' + (assigned.has(verb.id) ? 'is-assigned' : selected === verb.id ? 'is-selected' : '')} key={verb.id}><button type="button" lang="nb" aria-pressed={selected === verb.id} disabled={checked || assigned.has(verb.id)} onClick={() => setSelected((value) => value === verb.id ? null : verb.id)}>{verb.norwegian}</button><button type="button" className="challenge-audio-mini" onClick={() => speakNorwegian(verb.norwegian)} aria-label={'Ascultă ' + verb.norwegian}><ExerciseIcon name="listen" /></button></div>)}</div>

    <div className="challenge-drag__slots">{verbs.map((verb, index) => {
      const word = pool.find((item) => item.id === slots[index]);
      const correct = word?.romanian === verb.romanian;
      return <div className={'challenge-drag__slot ' + (checked ? correct ? 'is-correct' : 'is-wrong' : '')} key={index}><button type="button" className="challenge-drag__target" aria-describedby="verb-match-instructions" disabled={checked || (selected === null && !word)} onClick={() => assign(index)}><strong>{verb.romanian}</strong><span lang="nb">{word ? word.norwegian : selected !== null ? 'Așază verbul aici' : 'Alege mai întâi un verb'}</span><b aria-hidden="true">{checked ? correct ? '✓' : '↻' : word ? '×' : '+'}</b></button>{checked && !correct && <p>Răspuns corect: <strong lang="nb">{verb.norwegian}</strong></p>}</div>;
    })}</div>
    </div>
    <p className="challenge-drag__selection" role="status">{selected !== null ? 'Ai ales „' + pool.find((verb) => verb.id === selected).norwegian + '”. Atinge sensul potrivit.' : checked ? 'Compară perechile și repetă ce a fost dificil.' : 'Alege un verb pentru a începe.'}</p>
    <div className="challenge-drag__actions"><button type="button" className="exercise-primary" onClick={check} disabled={checked || Object.keys(slots).length !== verbs.length}>Verifică perechile</button><button type="button" className="exercise-secondary" onClick={reset}>Reîncearcă</button></div>
    {checked && <div className={'challenge-drag__result ' + (score === verbs.length ? 'is-complete' : '')} role="status">{score} din {verbs.length} perechi corecte</div>}
  </section>;
};
export default ChallengeDragDrop;
