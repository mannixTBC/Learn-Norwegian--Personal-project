import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Hangman.css';
import { randomList } from './Words.js';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzæøå'.split('');

const HangmanFigure = ({ mistake, gameOver }) => {
  const show = (n) => mistake >= n;
  const showCigarette = mistake >= 1;
  const faceHappy = mistake <= 2;
  const faceWorried = mistake === 3;
  const faceScared = mistake >= 4 && !gameOver;
  const faceDead = gameOver;

  return (
    <div className="hangman__figure">
      <svg viewBox="0 0 200 220" className="hangman__svg">
        {/* Gallows */}
        <line x1="30" y1="200" x2="170" y2="200" className="hangman__pole" />
        <line x1="100" y1="20" x2="100" y2="200" className="hangman__pole" />
        <line x1="100" y1="20" x2="160" y2="20" className="hangman__pole" />
        <line x1="160" y1="20" x2="160" y2="45" className="hangman__pole" />

        {/* Rope */}
        {show(1) && (
          <line x1="160" y1="45" x2="160" y2="65" className="hangman__rope hangman__anim-pop" />
        )}

        {/* Head */}
        {show(1) && (
          <g className="hangman__anim-pop">
            <circle cx="160" cy="82" r="18" className="hangman__head" />
            {/* Face */}
            {faceHappy && (
              <>
                <circle cx="155" cy="78" r="2" fill="#1a1a2e" />
                <circle cx="165" cy="78" r="2" fill="#1a1a2e" />
                <path d="M 152 88 Q 160 94 168 88" stroke="#1a1a2e" strokeWidth="2" fill="none" />
              </>
            )}
            {faceWorried && (
              <>
                <circle cx="155" cy="78" r="2" fill="#1a1a2e" />
                <circle cx="165" cy="78" r="2" fill="#1a1a2e" />
                <path d="M 152 90 Q 160 86 168 90" stroke="#1a1a2e" strokeWidth="2" fill="none" />
                <ellipse cx="147" cy="72" rx="3" ry="4" className="hangman__sweat" />
                <ellipse cx="173" cy="72" rx="3" ry="4" className="hangman__sweat" />
              </>
            )}
            {faceScared && (
              <>
                <circle cx="155" cy="78" r="2" fill="#1a1a2e" />
                <circle cx="165" cy="78" r="2" fill="#1a1a2e" />
                <path d="M 152 92 Q 160 88 168 92" stroke="#1a1a2e" strokeWidth="2" fill="none" />
                <ellipse cx="142" cy="68" rx="3" ry="4" className="hangman__sweat" />
                <ellipse cx="178" cy="68" rx="3" ry="4" className="hangman__sweat" />
                <ellipse cx="160" cy="98" rx="3" ry="4" className="hangman__sweat" />
              </>
            )}
            {faceDead && (
              <>
                <line x1="152" y1="76" x2="158" y2="82" stroke="#1a1a2e" strokeWidth="2" />
                <line x1="168" y1="76" x2="162" y2="82" stroke="#1a1a2e" strokeWidth="2" />
                <ellipse cx="160" cy="92" rx="6" ry="4" fill="#1a1a2e" className="hangman__tongue" />
              </>
            )}
            {/* Țigara */}
            {showCigarette && (
              <g className="hangman__cigarette">
                <line x1="168" y1="86" x2="188" y2="84" stroke="#f1f3f5" strokeWidth="3" strokeLinecap="round" />
                <rect x="165" y="82.5" width="5" height="3" rx="1" fill="#e67e22" />
              </g>
            )}
          </g>
        )}

        {/* Body */}
        {show(2) && (
          <line x1="160" y1="100" x2="160" y2="150" className="hangman__body hangman__anim-pop" />
        )}

        {/* Left arm */}
        {show(3) && (
          <line x1="160" y1="110" x2="130" y2="130" className="hangman__limb hangman__anim-pop" />
        )}

        {/* Right arm */}
        {show(4) && (
          <line x1="160" y1="110" x2="190" y2="130" className="hangman__limb hangman__anim-pop" />
        )}

        {/* Left leg */}
        {show(5) && (
          <line x1="160" y1="150" x2="140" y2="190" className="hangman__limb hangman__anim-pop" />
        )}

        {/* Right leg */}
        {show(6) && (
          <line x1="160" y1="150" x2="180" y2="190" className="hangman__limb hangman__anim-pop" />
        )}
      </svg>
      {show(1) && (
        <div className="hangman__emoji">
          {faceHappy && '😊'}
          {faceWorried && '😅'}
          {faceScared && '😰'}
          {faceDead && '💀'}
        </div>
      )}
    </div>
  );
};

class Hangman extends Component {
  static defaultProps = {
    maxWrong: 6,
  };

  constructor(props) {
    super(props);
    this.state = {
      mistake: 0,
      guessed: new Set(),
      list: randomList(),
      score: 0,
      round: 1,
    };
  }

  handleGuess = (e) => {
    const letter = e.target.value;
    const word = this.state.list[0];
    const isCorrect = word.toLowerCase().includes(letter);

    this.setState((st) => ({
      guessed: new Set([...st.guessed, letter]),
      mistake: st.mistake + (isCorrect ? 0 : 1),
    }));
  };

  guessedWord = () => {
    const word = this.state.list[0];
    return word.split('').map((letter) =>
      this.state.guessed.has(letter.toLowerCase()) ? letter : '_'
    );
  };

  resetGame = () => {
    this.setState((st) => {
      const finishedRound5 = st.round === 5;
      return {
        mistake: 0,
        guessed: new Set(),
        list: randomList(),
        score: finishedRound5 ? 0 : st.score,
        round: finishedRound5 ? 1 : st.round + 1,
      };
    });
  };

  componentDidUpdate(prevProps, prevState) {
    const { mistake, guessed, list } = this.state;
    const { maxWrong } = this.props;
    const word = list[0];
    const gameOver = mistake >= maxWrong;
    const guessedDisplay = word.split('').map((letter) =>
      guessed.has(letter.toLowerCase()) ? letter : '_'
    ).join('').replace(/\s/g, '');
    const isWinner = guessedDisplay === word;

    const prevWord = prevState.list[0];
    const prevGuessed = prevState.guessed;
    const prevDisplay = prevWord.split('').map((letter) =>
      prevGuessed.has(letter.toLowerCase()) ? letter : '_'
    ).join('').replace(/\s/g, '');
    const prevIsWinner = prevDisplay === prevWord;

    if (isWinner && !prevIsWinner) {
      const points = 10 + (maxWrong - mistake) * 2;
      this.setState((st) => ({ score: st.score + points }));
    }

    if (gameOver && !isWinner) {
      if (this.resetTimeout) clearTimeout(this.resetTimeout);
      this.resetTimeout = setTimeout(() => {
        this.resetGame();
        this.resetTimeout = null;
      }, 2000);
    }
  }

  componentWillUnmount() {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
  }

  render() {
    const { list, mistake, guessed } = this.state;
    const { maxWrong } = this.props;
    const word = list[0];
    const hint = list[1];
    const gameOver = mistake >= maxWrong;
    const guessedDisplay = this.guessedWord().join(' ');
    const isWinner = guessedDisplay.replace(/\s/g, '') === word;

    return (
      <div className="hangman">
        <Link to="/invata-limba" className="hangman__back">
          ← Înapoi la Învață limba
        </Link>

        <div className="hangman__card">
          <header className="hangman__header">
            <h1 className="hangman__title">Spânzurătoarea</h1>
            <p className="hangman__subtitle">Ghici cuvântul în norvegiană</p>
          </header>

          <div className="hangman__body">
            <div className="hangman__meta">
              <span className="hangman__score">Punctaj: {this.state.score}</span>
              <span className="hangman__round">Runda {this.state.round} / 5</span>
              <span className="hangman__attempts">
                Încercări greșite: {mistake} / {maxWrong}
              </span>
            </div>

            <HangmanFigure mistake={mistake} gameOver={gameOver} />

            <div className="hangman__hint">
              <p>{hint}</p>
            </div>

            <div className="hangman__word">
              {guessedDisplay}
            </div>

            {(gameOver || isWinner) && (
              <div className={`hangman__result hangman__result--${isWinner ? 'win' : 'lose'}`}>
                {isWinner ? 'Ai câștigat!' : 'Ai pierdut!'}
                {isWinner && (
                  <p className="hangman__points">+{10 + (maxWrong - mistake) * 2} puncte</p>
                )}
                {gameOver && (
                  <p className="hangman__answer">Cuvântul era: <strong>{word}</strong></p>
                )}
                {gameOver && (
                  <p className="hangman__auto-reset">
                    {this.state.round === 5 ? 'Runda încheiată – Punctajul se resetează...' : 'Se încarcă un cuvânt nou...'}
                  </p>
                )}
                {isWinner && (
                  <button type="button" className="hangman__reset" onClick={this.resetGame}>
                    {this.state.round === 5 ? 'Final runde – Începe din nou' : 'Următorul cuvânt'}
                  </button>
                )}
              </div>
            )}

            {!gameOver && !isWinner && (
              <div className="hangman__letters">
                {ALPHABET.map((letter) => (
                  <button
                    type="button"
                    key={letter}
                    className="hangman__letter"
                    value={letter}
                    onClick={this.handleGuess}
                    disabled={guessed.has(letter)}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Hangman;
