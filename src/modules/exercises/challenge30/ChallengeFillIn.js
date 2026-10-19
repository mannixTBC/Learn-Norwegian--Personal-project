import React, { useRef, useState } from 'react';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import { normalizePracticeAnswer, shufflePractice } from '../practiceGameData';
import './Challenge30.css';

const ChallengeFillIn = ({ verbs, onComplete }) => {
  const shuffle = shufflePractice;
  const verified = useRef(false);
  const [items, setItems] = useState(() =>
    shuffle(verbs).map((v, i) => ({ ...v, answer: '', id: `fill-${i}-${v.norwegian}` }))
  );
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(null);

  const handleChange = (id, value) => {
    if (checked) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, answer: value } : item))
    );
  };

  const handleCheck = () => {
    if (verified.current || items.some((item) => !item.answer.trim())) return;
    verified.current = true;
    let correct = 0;
    items.forEach((item) => {
      const normalized = normalizePracticeAnswer;
      if (normalized(item.answer) === normalized(item.norwegian)) correct++;
    });
    setScore(correct);
    setChecked(true);
    if (correct === verbs.length && onComplete) onComplete();
  };

  const handleReset = () => {
    verified.current = false;
    setItems(shuffle(verbs).map((v, i) => ({ ...v, answer: '', id: `fill-${i}-${v.norwegian}` })));
    setChecked(false);
    setScore(null);
  };

  if (verbs.length === 0) {
    return <p className="challenge30__empty">Nu există verbe pentru această zi.</p>;
  }

  return (
    <div className="challenge-fill">
      <p className="challenge-fill__inst">
        Scrie verbul în norvegiană pentru fiecare traducere în română.
      </p>
      <ul className="challenge-fill__list">
        {items.map((item) => (
          <li key={item.id} className="challenge-fill__item">
            <span className="challenge-fill__romanian">{item.romanian}</span>
            <span className="challenge-fill__arrow">→</span>
            <input
              type="text"
              className={`challenge-fill__input ${checked ? (normalizePracticeAnswer(item.answer) === normalizePracticeAnswer(item.norwegian) ? 'challenge-fill__input--correct' : 'challenge-fill__input--wrong') : ''}`}
              aria-label={`Scrie în norvegiană: ${item.romanian}`}
              aria-invalid={checked && normalizePracticeAnswer(item.answer) !== normalizePracticeAnswer(item.norwegian)}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              lang="nb"
              value={item.answer}
              onChange={(e) => handleChange(item.id, e.target.value)}
              placeholder="verb norvegian"
              disabled={checked}
            />
            {checked && normalizePracticeAnswer(item.answer) !== normalizePracticeAnswer(item.norwegian) && (
              <span className="challenge-fill__correct-answer">{item.norwegian}</span>
            )}
            {checked && <button className="challenge-audio-mini" type="button" onClick={() => speakNorwegian(item.norwegian)} aria-label={`Ascultă ${item.norwegian}`}>▶</button>}
          </li>
        ))}
      </ul>
      <div className="challenge-fill__actions">
        <button
          type="button"
          className="challenge-fill__btn"
          onClick={handleCheck}
          disabled={checked || items.some((i) => !i.answer.trim())}
        >
          Verifică
        </button>
        <button type="button" className="challenge-fill__btn challenge-fill__btn--reset" onClick={handleReset}>
          Resetează
        </button>
      </div>
      {checked && (
        <div role="status" className={`challenge-fill__result ${score === verbs.length ? 'challenge-fill__result--win' : ''}`}>
          Scor: {score} / {verbs.length}
        </div>
      )}
    </div>
  );
};

export default ChallengeFillIn;
