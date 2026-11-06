import {ui} from '../../languages/messages.js';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { workAndDocumentsArticles } from '../discover/guideArticles';
import './JobsCards.css';

const filters = ['Toate', 'Acte și început', 'Muncă', ui('web_652e279f2c5a7260')];

const articleGroup = (article) => {
  if (article.category === ui('web_652e279f2c5a7260')) return ui('web_652e279f2c5a7260');
  if (article.category === 'Muncă') return 'Muncă';
  return 'Acte și început';
};

const GroupIcon = ({ group }) => {
  if (group === 'Muncă') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7V5.8C8 4.8 8.8 4 9.8 4h4.4c1 0 1.8.8 1.8 1.8V7M4.5 9h15v9.5c0 .8-.7 1.5-1.5 1.5H6c-.8 0-1.5-.7-1.5-1.5V9Zm0 4.5c4.8 2 10.2 2 15 0M10 14h4" /></svg>;
  }
  if (group === ui('web_652e279f2c5a7260')) {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V8l6-3v15m0-9 6-3v12m0-7 4-2v9M7 10h.01M7 14h.01M7 17h.01M13 12h.01M13 16h.01" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5h8l3 3V20H7V4.5Zm8 0V8h3M10 12h5M10 15h5" /><path d="m3.5 12 1.2 1.2 2.2-2.4" /></svg>;
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
          <span className="work-hub__eyebrow"><i />{ui('web_dc7374c94fc5961b')}</span>
          <h1>{ui('web_2792418fe9337114')}</h1>
          <p>{ui('web_33b0d52713e53ca2')}</p>
        </div>
        <div className="work-hub__route" aria-label={ui('web_7d0bfa45bdf44504')}>
          <header><span>{ui('web_3aaba41b5ef3d6ed')}</span><small>{ui('web_3a01a95536cae0ac')}</small></header>
          <div><strong>01</strong><span>{ui('web_e7548a1062e7d443')}</span><i>→</i></div>
          <div><strong>02</strong><span>{ui('web_bdd417dbbf6097e8')}</span><i>→</i></div>
          <div><strong>03</strong><span>{ui('web_b3e481e4c4b90dda')}</span><i>✓</i></div>
        </div>
      </section>

      <section className="work-hub__library">
        <div className="work-hub__library-head">
          <div>
            <span className="work-hub__eyebrow">{ui('web_7b20e7cc11ccd31f')}</span>
            <h2>{ui('web_32d09520b5e408af')}</h2>
          </div>
          <span className="work-hub__count">
            {visibleArticles.length} {visibleArticles.length === 1 ? 'articol' : 'articole'}
          </span>
        </div>

        <div className="work-hub__filters" aria-label={ui('web_583c88e7147113f7')}>
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
                  <span className={`work-article-card__icon work-article-card__icon--${group === 'Muncă' ? 'work' : group === ui('web_652e279f2c5a7260') ? 'city' : 'docs'}`}>
                    <GroupIcon group={group} />
                  </span>
                  <span className="work-article-card__number">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <span className="work-article-card__category">{group}</span>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
                <div className="work-article-card__footer">
                  <span>{article.readTime}{ui('web_5229d3f11aa8e9ef')}</span>
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
