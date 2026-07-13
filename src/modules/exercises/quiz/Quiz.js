import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { quizData } from './quizData';
import './Quiz.css';

const Chestionar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const questions = quizData;
  const currentQuestion = questions[currentIndex];
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const handleSelectAnswer = (option) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(option);
  };

  const handleConfirm = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setWrongCount((w) => w + 1);
    }
    setAnsweredCount((a) => a + 1);

    if (currentIndex >= questions.length - 1) {
      setIsFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setSelectedAnswer(null);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setAnsweredCount(0);
    setSelectedAnswer(null);
    setIsFinished(false);
  };

  if (questions.length === 0) {
    return (
      <div className="chestionar">
        <Link to="/invata-limba" className="chestionar__back">← Înapoi la Învață limba</Link>
        <p className="chestionar__empty">Nu există întrebări.</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="chestionar">
        <Link to="/invata-limba" className="chestionar__back">← Înapoi la Învață limba</Link>
        <div className="chestionar__card">
          <div className="chestionar__header">
            <h1 className="chestionar__title">Chestionar</h1>
            <p className="chestionar__subtitle">Testarea s-a încheiat</p>
          </div>
          <div className="chestionar__result">
            <p className="chestionar__score-text">
              Ai răspuns corect la <strong>{correctCount}</strong> din <strong>{questions.length}</strong> întrebări.
            </p>
            <p className="chestionar__stats">
              Corecte: <span className="chestionar__stat--correct">{correctCount}</span>
              {' · '}
              Greșite: <span className="chestionar__stat--wrong">{wrongCount}</span>
            </p>
            <button type="button" className="chestionar__btn chestionar__btn--primary" onClick={handleReset}>
              Încearcă din nou
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chestionar">
      <Link to="/invata-limba" className="chestionar__back">← Înapoi la Învață limba</Link>
      <div className="chestionar__card">
        <div className="chestionar__header">
          <h1 className="chestionar__title">Chestionar</h1>
          <p className="chestionar__subtitle">
            Întrebarea {currentIndex + 1} din {questions.length}
          </p>
        </div>

        <div className="chestionar__body">
          <p className="chestionar__question">{currentQuestion.question}</p>

          <div className="chestionar__options">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                type="button"
                className={`chestionar__option ${selectedAnswer === option ? 'chestionar__option--selected' : ''}`}
                onClick={() => handleSelectAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>

          {answeredCount === 0 && (
            <p className="chestionar__hint">Selectează răspunsul, apoi apasă „Salvează”</p>
          )}

          <div className="chestionar__progress-wrap">
            <div className="chestionar__progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="chestionar__actions">
            <button
              type="button"
              className="chestionar__btn chestionar__btn--secondary"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Înapoi
            </button>
            <button
              type="button"
              className="chestionar__btn chestionar__btn--primary"
              onClick={handleConfirm}
              disabled={selectedAnswer === null}
            >
              Salvează
            </button>
            <button
              type="button"
              className="chestionar__btn chestionar__btn--secondary"
              onClick={handleNext}
              disabled={currentIndex >= questions.length - 1}
            >
              Următorul
            </button>
          </div>

          <div className="chestionar__stats-row">
            <span className="chestionar__stat chestionar__stat--correct">Corecte: {correctCount}</span>
            <span className="chestionar__stat chestionar__stat--wrong">Greșite: {wrongCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chestionar;
