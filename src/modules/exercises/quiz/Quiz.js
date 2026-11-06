import {ui} from '../../../languages/messages.js';
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
        <Link to="/invata-limba" className="chestionar__back">{ui('web_8e575762fa7dae5e')}</Link>
        <p className="chestionar__empty">{ui('web_85ea7dc2b4e9940e')}</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="chestionar">
        <Link to="/invata-limba" className="chestionar__back">{ui('web_8e575762fa7dae5e')}</Link>
        <div className="chestionar__card">
          <div className="chestionar__header">
            <h1 className="chestionar__title">{ui('web_88fc523885ff8734')}</h1>
            <p className="chestionar__subtitle">{ui('web_fd8b6c3fb79d5361')}</p>
          </div>
          <div className="chestionar__result">
            <p className="chestionar__score-text">{ui('web_2dfe425ac34a8a1b')}<strong>{correctCount}</strong>{ui('ui_dbd8b6478643d623')}<strong>{questions.length}</strong>{ui('web_900dd983b52ee8b9')}</p>
            <p className="chestionar__stats">{ui('web_3d29833568013ecb')}<span className="chestionar__stat--correct">{correctCount}</span>
              {' · '}{ui('web_4d02a9081e156176')}<span className="chestionar__stat--wrong">{wrongCount}</span>
            </p>
            <button type="button" className="chestionar__btn chestionar__btn--primary" onClick={handleReset}>{ui('web_a09d291920163176')}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chestionar">
      <Link to="/invata-limba" className="chestionar__back">{ui('web_8e575762fa7dae5e')}</Link>
      <div className="chestionar__card">
        <div className="chestionar__header">
          <h1 className="chestionar__title">{ui('web_88fc523885ff8734')}</h1>
          <p className="chestionar__subtitle">{ui('web_d3526d8dd6340992')}{currentIndex + 1}{ui('ui_dbd8b6478643d623')}{questions.length}
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
            <p className="chestionar__hint">{ui('web_013c2f3d8f5bf449')}</p>
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
            >{ui('ui_43d3098298b6c977')}</button>
            <button
              type="button"
              className="chestionar__btn chestionar__btn--primary"
              onClick={handleConfirm}
              disabled={selectedAnswer === null}
            >{ui('web_761a3ee3fc998031')}</button>
            <button
              type="button"
              className="chestionar__btn chestionar__btn--secondary"
              onClick={handleNext}
              disabled={currentIndex >= questions.length - 1}
            >{ui('ui_3432e94fd956d7b4')}</button>
          </div>

          <div className="chestionar__stats-row">
            <span className="chestionar__stat chestionar__stat--correct">{ui('web_3d29833568013ecb')}{correctCount}</span>
            <span className="chestionar__stat chestionar__stat--wrong">{ui('web_4d02a9081e156176')}{wrongCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chestionar;
