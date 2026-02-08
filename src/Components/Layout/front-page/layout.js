import React from 'react';
import { Link } from 'react-router-dom';
import './layout.css';
import education from './icons/education.png';
import learn from './icons/learn.jpg';
import news from './icons/news.jpg';
import travel from './icons/travel.jpg';

const Layout = () => {
  return (
    <div className="landing">
      <section className="landing__hero">
        <div className="landing__hero-content">
          <h1 className="landing__title">NorvegiaTa</h1>
          <p className="landing__subtitle">
            De la primul cuvânt la prima zi de muncă – tot ce ai nevoie pentru Norvegia ta
          </p>
          <ul className="landing__features">
            <li>Limbă</li>
            <li>Joburi</li>
            <li>Știri</li>
          </ul>
        </div>
      </section>

      <section className="landing__cards">
        <Link to="/invata-limba" className="landing-card">
          <img src={education} alt="Învață" className="landing-card__img" />
          <span className="landing-card__label">Învață</span>
        </Link>
        <Link to="/invata-limba" className="landing-card">
          <img src={learn} alt="Exerciții" className="landing-card__img" />
          <span className="landing-card__label">Exerciții</span>
        </Link>
        <div className="landing-card landing-card--disabled">
          <img src={travel} alt="Descoperă" className="landing-card__img" />
          <span className="landing-card__label">Descoperă</span>
        </div>
        <Link to="/news" className="landing-card">
          <img src={news} alt="Știri" className="landing-card__img" />
          <span className="landing-card__label">Știri</span>
        </Link>
      </section>
    </div>
  );
};

export default Layout;
