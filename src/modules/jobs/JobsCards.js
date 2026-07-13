import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { workAndDocumentsArticles } from '../discover/guideArticles';
import './JobsCards.css';

const filters = ['Toate', 'Acte și început', 'Muncă', 'Orașe'];

const articleGroup = (article) => {
  if (article.category === 'Orașe') return 'Orașe';
  if (article.category === 'Muncă') return 'Muncă';
  return 'Acte și început';
};

const groupIcon = {
  'Acte și început': '✓',
  Muncă: '↗',
  Orașe: '⌂',
};

const JobsCards = () => {
  const [activeFilter, setActiveFilter] = useState('Toate');
  const visibleArticles = useMemo(
    () => workAndDocumentsArticles.filter(
      (article) => activeFilter === 'Toate' || articleGroup(article) === activeFilter,
    ),
    [activeFilter],
  );

  return (
    <main className="work-hub">
      <section className="work-hub__hero">
        <div className="work-hub__hero-copy">
          <span className="work-hub__eyebrow">Ghid practic pentru români</span>
          <h1>Muncă și acte în Norvegia</h1>
          <p>
            De la primul contract și înregistrarea la autorități până la alegerea
            orașului în care vrei să lucrezi.
          </p>
        </div>
        <div className="work-hub__route" aria-label="Pașii principali">
          <div><strong>01</strong><span>Pregătește plecarea</span></div>
          <div><strong>02</strong><span>Rezolvă actele</span></div>
          <div><strong>03</strong><span>Începe munca</span></div>
        </div>
      </section>

      <section className="work-hub__library">
        <div className="work-hub__library-head">
          <div>
            <span className="work-hub__eyebrow">Biblioteca ta</span>
            <h2>Informații clare, într-un singur loc</h2>
          </div>
          <span className="work-hub__count">
            {visibleArticles.length} {visibleArticles.length === 1 ? 'articol' : 'articole'}
          </span>
        </div>

        <div className="work-hub__filters" aria-label="Filtrează articolele">
          {filters.map((filter) => (
            <button
              className={filter === activeFilter ? 'is-active' : ''}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="work-hub__grid">
          {visibleArticles.map((article, index) => {
            const group = articleGroup(article);
            return (
              <Link
                className="work-article-card"
                key={article.slug}
                to={`/joburi/ghid/${article.slug}`}
              >
                <div className="work-article-card__top">
                  <span className={`work-article-card__icon work-article-card__icon--${group === 'Muncă' ? 'work' : group === 'Orașe' ? 'city' : 'docs'}`}>
                    {groupIcon[group]}
                  </span>
                  <span className="work-article-card__number">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <span className="work-article-card__category">{group}</span>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <div className="work-article-card__footer">
                  <span>{article.readTime} min de citit</span>
                  <strong aria-hidden="true">→</strong>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default JobsCards;
