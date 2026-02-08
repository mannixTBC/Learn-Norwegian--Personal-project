import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { lessons } from './lessonsData';
import './LessonProgram.css';

const STORAGE_KEY = 'lesson_prog_progress';

// Formatează textul: paragrafe separate + dialoguri evidențiate
const FormattedText = ({ text, className = '', isRomanian = false }) => {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
  const paraClass = isRomanian ? 'lesson-prog__para lesson-prog__para--ro' : 'lesson-prog__para';
  const isDialog = (s) =>
    (s.startsWith('«') && s.endsWith('»')) ||
    (s.startsWith('„') && (s.endsWith('"') || s.endsWith('\u201C')));
  // «norvegian» sau „română"
  const dialogRegex = /(«[^»]+»|„[^„]+?["\u201C])/g;
  return (
    <div className={className}>
      {paragraphs.map((para, i) => {
        const parts = para.split(dialogRegex).filter(Boolean);
        return (
          <p key={i} className={paraClass}>
            {parts.map((part, j) =>
              isDialog(part) ? (
                <span key={j} className="lesson-prog__dialog">
                  {part}
                </span>
              ) : (
                part
              )
            )}
          </p>
        );
      })}
    </div>
  );
};

const ExerciseFill = ({ ex, onCorrect }) => {
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false);
  const isCorrect = value.toLowerCase().trim() === ex.answer.toLowerCase().trim();

  const handleCheck = () => {
    setChecked(true);
    if (isCorrect && onCorrect) onCorrect();
  };

  return (
    <div className="lesson-ex__item">
      <p className="lesson-ex__q">{ex.question}</p>
      <div className="lesson-ex__fill-row">
        <input
          type="text"
          className={`lesson-ex__input ${checked ? (isCorrect ? 'lesson-ex__input--ok' : 'lesson-ex__input--err') : ''}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={ex.placeholder}
          disabled={checked}
        />
        {!checked && (
          <button type="button" className="lesson-ex__btn" onClick={handleCheck}>
            Verifică
          </button>
        )}
        {checked && !isCorrect && <span className="lesson-ex__answer">Răspuns: {ex.answer}</span>}
      </div>
    </div>
  );
};

const ExerciseChoice = ({ ex, onCorrect }) => {
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const isCorrect = selected === ex.correct;

  const handleCheck = () => {
    setChecked(true);
    if (isCorrect && onCorrect) onCorrect();
  };

  return (
    <div className="lesson-ex__item">
      <p className="lesson-ex__q">{ex.question}</p>
      <div className="lesson-ex__choices">
        {ex.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className={`lesson-ex__choice ${selected === i ? 'lesson-ex__choice--sel' : ''} ${checked && i === ex.correct ? 'lesson-ex__choice--ok' : ''} ${checked && selected === i && !isCorrect ? 'lesson-ex__choice--err' : ''}`}
            onClick={() => { if (!checked) setSelected(i); }}
          >
            {opt}
          </button>
        ))}
      </div>
      {!checked && (
        <button type="button" className="lesson-ex__btn" onClick={handleCheck} disabled={selected === null}>
          Verifică
        </button>
      )}
    </div>
  );
};

const ExerciseMatch = ({ ex, onCorrect }) => {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matches, setMatches] = useState([]);
  const [checked, setChecked] = useState(false);

  const leftItems = ex.pairs.map((p) => p[0]);
  const rightItems = ex.pairs.map((p) => p[1]).sort(() => Math.random() - 0.5);

  const handleLeft = (i) => {
    if (checked) return;
    setSelectedLeft(i);
    if (selectedRight !== null) {
      const newMatches = [...matches, { left: i, right: selectedRight }];
      setMatches(newMatches);
      setSelectedLeft(null);
      setSelectedRight(null);
      if (newMatches.length === ex.pairs.length) {
        const correct = newMatches.every((m) => ex.pairs[m.left][1] === rightItems[m.right]);
        setChecked(true);
        if (correct && onCorrect) onCorrect();
      }
    }
  };

  const handleRight = (i) => {
    if (checked) return;
    setSelectedRight(i);
    if (selectedLeft !== null) {
      const newMatches = [...matches, { left: selectedLeft, right: i }];
      setMatches(newMatches);
      setSelectedLeft(null);
      setSelectedRight(null);
      if (newMatches.length === ex.pairs.length) {
        const correct = newMatches.every((m) => ex.pairs[m.left][1] === rightItems[m.right]);
        setChecked(true);
        if (correct && onCorrect) onCorrect();
      }
    }
  };

  const matchedLeft = matches.map((m) => m.left);
  const matchedRight = matches.map((m) => m.right);

  return (
    <div className="lesson-ex__item">
      <p className="lesson-ex__q">Potrivește cuvintele:</p>
      <div className="lesson-ex__match">
        <div className="lesson-ex__match-col">
          {leftItems.map((w, i) => (
            <button
              key={i}
              type="button"
              className={`lesson-ex__match-btn ${selectedLeft === i ? 'lesson-ex__match-btn--sel' : ''} ${matchedLeft.includes(i) ? 'lesson-ex__match-btn--done' : ''}`}
              onClick={() => { if (!matchedLeft.includes(i)) handleLeft(i); }}
            >
              {w}
            </button>
          ))}
        </div>
        <span className="lesson-ex__match-arrow">↔</span>
        <div className="lesson-ex__match-col">
          {rightItems.map((w, i) => (
            <button
              key={i}
              type="button"
              className={`lesson-ex__match-btn ${selectedRight === i ? 'lesson-ex__match-btn--sel' : ''} ${matchedRight.includes(i) ? 'lesson-ex__match-btn--done' : ''}`}
              onClick={() => { if (!matchedRight.includes(i)) handleRight(i); }}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const LessonExercises = ({ lesson, onLessonComplete }) => {
  const [completedExercises, setCompletedExercises] = useState(new Set());

  const handleExerciseCorrect = (index) => {
    setCompletedExercises((prev) => {
      const next = new Set(prev);
      next.add(index);
      if (next.size === lesson.exercises.length && onLessonComplete) {
        onLessonComplete();
      }
      return next;
    });
  };

  return (
    <div className="lesson-ex">
      <h2 className="lesson-ex__title">Exerciții – {lesson.title}</h2>
      {lesson.exercises.map((ex, i) => (
        <div key={i}>
          {ex.type === 'fill' && <ExerciseFill ex={ex} onCorrect={() => handleExerciseCorrect(i)} />}
          {ex.type === 'choice' && <ExerciseChoice ex={ex} onCorrect={() => handleExerciseCorrect(i)} />}
          {ex.type === 'match' && <ExerciseMatch ex={ex} onCorrect={() => handleExerciseCorrect(i)} />}
        </div>
      ))}
    </div>
  );
};

const LessonProgram = () => {
  const [currentLesson, setCurrentLesson] = useState(1);
  const [activeTab, setActiveTab] = useState('text');
  const [showRomanian, setShowRomanian] = useState(false);
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { unlocked: 1, completed: [] };
    } catch {
      return { unlocked: 1, completed: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const unlockNext = (lessonId) => {
    setProgress((p) => {
      const newCompleted = p.completed.includes(lessonId) ? p.completed : [...p.completed, lessonId];
      const nextId = Math.min(lessonId + 1, lessons.length);
      const newUnlocked = Math.max(p.unlocked, nextId);
      return { unlocked: newUnlocked, completed: newCompleted };
    });
  };

  const isUnlocked = (id) => id <= progress.unlocked;
  const isCompleted = (id) => progress.completed.includes(id);

  const effectiveLesson = isUnlocked(currentLesson) ? currentLesson : progress.unlocked;
  const lesson = lessons.find((l) => l.id === effectiveLesson);

  if (!lesson) {
    return (
      <div className="lesson-prog">
        <Link to="/invata-limba" className="lesson-prog__back">← Înapoi la Învață limba</Link>
        <p>Lecție negăsită.</p>
      </div>
    );
  }

  return (
    <div className="lesson-prog">
      <Link to="/invata-limba" className="lesson-prog__back">
        ← Înapoi la Învață limba
      </Link>

      <div className="lesson-prog__card">
        <header className="lesson-prog__header">
          <h1 className="lesson-prog__title">Program norvegiană de bază</h1>
          <p className="lesson-prog__subtitle">
            Lecții bazate pe viața de zi cu zi • Termină exercițiile pentru a debloca lecția următoare
          </p>
        </header>

        <div className="lesson-prog__layout">
          <aside className="lesson-prog__sidebar">
            <h3 className="lesson-prog__sidebar-title">Lecții</h3>
            <nav className="lesson-prog__nav">
              {lessons.map((l) => {
                const unlocked = isUnlocked(l.id);
                const completed = isCompleted(l.id);
                return (
                  <button
                    key={l.id}
                    type="button"
                    className={`lesson-prog__nav-item ${effectiveLesson === l.id ? 'lesson-prog__nav-item--active' : ''} ${!unlocked ? 'lesson-prog__nav-item--locked' : ''} ${completed ? 'lesson-prog__nav-item--completed' : ''}`}
                    onClick={() => unlocked && setCurrentLesson(l.id)}
                    disabled={!unlocked}
                  >
                    <span className="lesson-prog__nav-num">
                      {completed ? '✓' : !unlocked ? '🔒' : l.id}
                    </span>
                    <span className="lesson-prog__nav-label-text">{l.title}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="lesson-prog__main">
            <div className="lesson-prog__tabs">
              <button
                type="button"
                className={`lesson-prog__tab ${activeTab === 'text' ? 'lesson-prog__tab--active' : ''}`}
                onClick={() => setActiveTab('text')}
              >
                📖 Citește textul
              </button>
              <button
                type="button"
                className={`lesson-prog__tab ${activeTab === 'exercises' ? 'lesson-prog__tab--active' : ''}`}
                onClick={() => setActiveTab('exercises')}
              >
                ✏️ Exerciții
              </button>
            </div>

            <div className="lesson-prog__body">
          {activeTab === 'text' && (
            <div className="lesson-prog__text">
              <h2 className="lesson-prog__lesson-title">{lesson.title}</h2>
              <div className="lesson-prog__text-content">
                <FormattedText text={lesson.text} />
                <button
                  type="button"
                  className="lesson-prog__toggle"
                  onClick={() => setShowRomanian(!showRomanian)}
                >
                  {showRomanian ? 'Ascunde traducerea' : 'Arată traducerea în română'}
                </button>
                {showRomanian && <FormattedText text={lesson.textRomanian} className="lesson-prog__translation" isRomanian />}
              </div>
            </div>
          )}

          {activeTab === 'exercises' && (
            <LessonExercises
              lesson={lesson}
              onLessonComplete={() => unlockNext(lesson.id)}
            />
          )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LessonProgram;
