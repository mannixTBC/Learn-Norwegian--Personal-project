import React from 'react';
import { Link } from 'react-router-dom';
import articles, { articleList } from './discoverArticles';
import './DiscoverArticle.css';

const DiscoverArticle = ({ articleKey }) => {
  const article = articles[articleKey];
  const related = articleList.filter((item) => item.key !== articleKey).slice(0, 3);

  return (
    <div className="discover-article">
      <div className="discover-article__topbar">
        <Link to="/descopera" className="discover-article__back">← Înapoi la Descoperă</Link>
        <span>{article.readTime} de citit</span>
      </div>

      <header className="discover-article__hero" style={{ backgroundImage: `url(${article.image})` }}>
        <div className="discover-article__hero-content">
          <p>{article.category}</p>
          <h1>{article.title}</h1>
          <span>{article.lead}</span>
        </div>
        <p className="discover-article__image-alt">{article.imageAlt}</p>
      </header>

      <section className="discover-article__stats" aria-label="Repere rapide">
        {article.stats.map((stat) => (
          <div key={stat.value}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <div className="discover-article__layout">
        <aside className="discover-article__aside">
          <p>În acest articol</p>
          <nav aria-label="Cuprinsul articolului">
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

          <section className="discover-article__language">
            <div>
              <p>Norvegiana din articol</p>
              <h2>Patru cuvinte de păstrat</h2>
            </div>
            <dl>
              {article.words.map(([word, meaning]) => (
                <div key={word}><dt>{word}</dt><dd>{meaning}</dd></div>
              ))}
            </dl>
          </section>

          <footer className="discover-article__sources">
            <p>Surse și lectură suplimentară</p>
            {article.sources.map(([label, url]) => (
              <a href={url} target="_blank" rel="noopener noreferrer" key={url}>{label} ↗</a>
            ))}
          </footer>
        </article>
      </div>

      <section className="discover-article__related">
        <div><p>Continuă explorarea</p><h2>Următoarea poveste începe aici</h2></div>
        <div className="discover-article__related-grid">
          {related.map((item) => (
            <Link to={item.path} key={item.key} style={{ backgroundImage: `url(${item.image})` }}>
              <span>{item.category.split(' · ')[0]}</span>
              <h3>{item.title}</h3>
              <b>Citește articolul →</b>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DiscoverArticle;
