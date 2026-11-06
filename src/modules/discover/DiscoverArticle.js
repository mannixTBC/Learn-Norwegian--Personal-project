import {ui} from '../../languages/messages.js';
import React from 'react';
import { Link } from 'react-router-dom';
import articles, { articleList } from './discoverArticles';
import './DiscoverArticle.css';
import './DiscoverArticleExtended.css';

const DiscoverArticle = ({ articleKey }) => {
  const article = articles[articleKey];
  const related = articleList.filter((item) => item.key !== articleKey).slice(0, 3);
  const checklistTitleId = `${articleKey}-checklist-title`;

  return (
    <div className="discover-article">
      <div className="discover-article__topbar">
        <Link to="/descopera" className="discover-article__back">{ui('web_08576f3305596198')}</Link>
        <span>{article.readTime}{ui('web_bbc40dd05c138f77')}</span>
      </div>

      <header className="discover-article__hero" style={{ backgroundImage: `url(${article.image})` }}>
        <div className="discover-article__hero-content">
          <p>{article.category}</p>
          <h1>{article.title}</h1>
          <span>{article.lead}</span>
        </div>
        {article.imageAlt && <p className="discover-article__image-alt">{article.imageAlt}</p>}
      </header>

      <section className="discover-article__stats" aria-label={ui('web_3f7ee7f8840f6ac1')}>
        {article.stats.map((stat) => (
          <div key={stat.value}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <div className="discover-article__layout">
        <aside className="discover-article__aside">
          <p>{ui('web_0b92348f403c3c86')}</p>
          <nav aria-label={ui('web_84c70634cfe90722')}>
            {article.sections.map((section, index) => (
              <a href={`#sectiunea-${index + 1}`} key={section.title}>
                <span>{section.number}</span>{section.title}
              </a>
            ))}
          </nav>
          <div className="discover-article__fact">
            <small>{article.factLabel}</small>
            <p>{article.fact}</p>
          </div>
        </aside>

        <article className="discover-article__content">
          {article.opening && (
            <section className="discover-article__opening">
              <div className="discover-article__opening-copy">
                <p>{article.opening.eyebrow}</p>
                <h2>{article.opening.title}</h2>
                {article.opening.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <div className="discover-article__opening-highlights">
                {article.opening.highlights.map(([title, text], index) => (
                  <div key={title}><span>{String(index + 1).padStart(2, '0')}</span><strong>{title}</strong><p>{text}</p></div>
                ))}
              </div>
            </section>
          )}

          <section className="discover-article__quick">
            {article.quick.map(([title, text]) => (
              <div key={title}>
                <h2>{title}</h2>
                <p>{text}</p>
              </div>
            ))}
          </section>

          {article.sections.map((section, index) => (
            <section className="discover-article__section" id={`sectiunea-${index + 1}`} key={section.title}>
              <div className="discover-article__section-title">
                <span>{section.number}</span>
                <h2>{section.title}</h2>
              </div>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.callout && <blockquote>{section.callout}</blockquote>}
              {section.bullets && (
                <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>
              )}
            </section>
          ))}

          {article.checklist && (
            <section className="discover-article__checklist" aria-labelledby={checklistTitleId}>
              <div>
                <p>{article.checklistEyebrow || 'Înainte să pleci'}</p>
                <h2 id={checklistTitleId}>{article.checklistTitle || 'Checklist pentru un oaspete bun'}</h2>
                <span>{article.checklistDescription || 'Șase verificări simple care păstrează libertatea și pentru cei care vin după tine.'}</span>
              </div>
              <ul>{article.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          )}

          <section className="discover-article__language">
            <div>
              <p>{ui('web_23c4573e1ce8fff1')}</p>
              <h2>{ui('web_33eb94bdb9ada871')}</h2>
            </div>
            <dl>
              {article.words.map(([word, meaning]) => (
                <div key={word}><dt>{word}</dt><dd>{meaning}</dd></div>
              ))}
            </dl>
          </section>

          <footer className="discover-article__sources">
            <p>{ui('web_463e9620c6a9badb')}</p>
            {article.sources.map(([label, url]) => (
              <a href={url} target="_blank" rel="noopener noreferrer" key={url}>{label} ↗</a>
            ))}
          </footer>
        </article>
      </div>

      <section className="discover-article__related">
        <div><p>{ui('web_32988e5668a75edd')}</p><h2>{ui('web_477d30f2fc644e21')}</h2></div>
        <div className="discover-article__related-grid">
          {related.map((item) => (
            <Link to={item.path} key={item.key} style={{ backgroundImage: `url(${item.image})` }}>
              <span>{item.category.split(' · ')[0]}</span>
              <h3>{item.title}</h3>
              <b>{ui('web_d30e6cf14a983ac3')}</b>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DiscoverArticle;
