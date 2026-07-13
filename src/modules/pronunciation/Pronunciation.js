import React from 'react';
import { Link } from 'react-router-dom';
import { Howl } from 'howler';
import { pronunciationData } from './pronunciationData';
import './Pronunciation.css';

const playSound = (src) => {
  const sound = new Howl({ src: [src] });
  sound.play();
};

const Pronunciation = () => (
  <div className="pronuntie">
    <Link to="/invata-limba" className="pronuntie__back">
      ← Înapoi la Învață limba
    </Link>
    <div className="pronuntie__card">
      <h1 className="pronuntie__title">Pronunție</h1>
      <p className="pronuntie__subtitle">Apasă pe icon pentru a asculta pronunția</p>
      <ul className="pronuntie__list">
        {pronunciationData.map((item, i) => (
          <li key={i} className="pronuntie__item">
            <span className="pronuntie__word">{item.word}</span>
            <span className="pronuntie__translation">{item.translation}</span>
            <button
              type="button"
              className="pronuntie__play"
              onClick={() => playSound(item.audio)}
              aria-label="Ascultă pronunția"
            >
              ▶
            </button>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default Pronunciation;
