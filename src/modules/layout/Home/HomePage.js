import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const sections = [
  { to: '/invata', icon: '📘', title: 'Învață norvegiana', text: 'Lecții, exerciții, pronunție și recapitulare într-un singur traseu.' },
  { to: '/descopera', icon: '🏔️', title: 'Descoperă', text: 'Natură, tradiții și cultura Norvegiei.' },
  { to: '/viata-in-norvegia', icon: '🧭', title: 'Viața în Norvegia', text: 'Muncă, acte, vreme și știri într-un singur loc.' },
];

const HomePage = () => (
  <div className="landing">
    <section className="landing__hero">
      <div className="landing__hero-content">
        <p className="landing__eyebrow">Limba și viața în Norvegia</p>
        <h1 className="landing__title">Construiește-ți drumul spre Norvegia</h1>
        <p className="landing__subtitle">Învață norvegiana pas cu pas și găsește informațiile practice de care ai nevoie.</p>
        <div className="landing__actions">
          <Link to="/invata" className="landing__button landing__button--primary">Începe să înveți</Link>
          <Link to="/viata-in-norvegia" className="landing__button landing__button--secondary">Explorează ghidurile</Link>
        </div>
      </div>
    </section>

    <section className="landing__sections" aria-labelledby="landing-sections-title">
      <div className="landing__section-heading">
        <p className="landing__eyebrow landing__eyebrow--dark">Alege direcția</p>
        <h2 id="landing-sections-title">Totul este mai ușor de găsit</h2>
      </div>
      <div className="landing__cards">
        {sections.map((section) => (
          <Link to={section.to} className="landing-card" key={section.to}>
            <span className="landing-card__icon">{section.icon}</span>
            <h3>{section.title}</h3>
            <p>{section.text}</p>
            <span className="landing-card__action">Deschide →</span>
          </Link>
        ))}
      </div>
    </section>
  </div>
);

export default HomePage;
