import React, { useEffect, useState } from 'react';
import './News.css';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1520769945061-0a448c463865?w=900&h=600&fit=crop';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const translateText = async (text, toLang) => {
  if (!text || text.trim().length === 0) return text;

  const tryLang = async (fromLang) => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, fromLang, toLang }),
      });
      const data = await response.json();
      return response.ok && data.translated ? data.translated : null;
    } catch (error) {
      return null;
    }
  };

  return (await tryLang('no')) || (await tryLang('en')) || text;
};

const truncateExcerpt = (text, maxWords = 18) => {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  return words.length > maxWords ? `${words.slice(0, maxWords).join(' ')}…` : text;
};

const NewsArrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const NewsCard = ({ item, featured = false }) => (
  <article className={`news-card${featured ? ' news-card--featured' : ''}`}>
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="news-card__link">
      <div className="news-card__image-wrapper">
        <img
          src={item.image || PLACEHOLDER_IMAGE}
          alt=""
          className="news-card__image"
          onError={(event) => { event.currentTarget.src = PLACEHOLDER_IMAGE; }}
        />
        <span className="news-card__category">{item.source}</span>
      </div>
      <div className="news-card__content">
        <time className="news-card__date">{item.date}</time>
        <h3 className="news-card__title">{item.title}</h3>
        <p className="news-card__excerpt">{item.description}</p>
        <span className="news-card__action">
          Citește articolul <NewsArrow />
        </span>
      </div>
    </a>
  </article>
);

const NewsState = ({ type, title, message, onRetry }) => (
  <main className="news-page">
    <section className={`news-state news-state--${type}`}>
      <span className="news-state__icon" aria-hidden="true">
        {type === 'loading' ? <i /> : '!'}
      </span>
      <p className="news-eyebrow">Actualitate din Norvegia</p>
      <h1>{title}</h1>
      <p>{message}</p>
      {onRetry && <button type="button" onClick={onRetry}>Încearcă din nou</button>}
    </section>
  </main>
);

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchAndTranslate = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/news/headlines');
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Știrile nu au putut fi încărcate.');
        if (data.errors?.length) throw new Error(data.errors[0]?.message || 'Știrile nu au putut fi încărcate.');
        if (!data.articles?.length) throw new Error('Nu am găsit articole noi momentan.');

        const rawArticles = data.articles.map((article) => ({
          id: article.url || `${article.title}-${article.publishedAt}`,
          title: article.title,
          description: truncateExcerpt(article.description || article.title),
          image: article.image,
          url: article.url,
          source: article.source?.name || 'Știri',
          date: formatDate(article.publishedAt),
        }));

        if (!active) return;
        setArticles(rawArticles);
        setLoading(false);
        setTranslating(true);

        const translatedArticles = await Promise.all(rawArticles.map(async (article) => {
          const [title, description] = await Promise.all([
            translateText(article.title, 'ro'),
            translateText(article.description, 'ro'),
          ]);
          return { ...article, title, description };
        }));

        if (active) setArticles(translatedArticles);
      } catch (requestError) {
        if (active) setError(requestError.message || 'Știrile nu au putut fi încărcate.');
      } finally {
        if (active) {
          setLoading(false);
          setTranslating(false);
        }
      }
    };

    fetchAndTranslate();
    return () => { active = false; };
  }, [requestId]);

  if (loading) {
    return <NewsState type="loading" title="Pregătim știrile zilei" message="Selectăm cele mai recente noutăți din Norvegia." />;
  }

  if (error) {
    return (
      <NewsState
        type="error"
        title="Știrile nu sunt disponibile momentan"
        message={error}
        onRetry={() => setRequestId((value) => value + 1)}
      />
    );
  }

  const [featuredArticle, ...otherArticles] = articles;

  return (
    <main className="news-page">
      <div className="news-shell">
        <header className="news-hero">
          <div className="news-hero__copy">
            <span className="news-eyebrow"><i /> Actualitate din Norvegia</span>
            <h1>Știrile zilei,<br />pe scurt.</h1>
            <p>Descoperă ce se întâmplă în Norvegia și continuă lectura în limba originală.</p>
          </div>
          <div className="news-hero__summary">
            <span>Selecția de astăzi</span>
            <strong>{articles.length}</strong>
            <small>articole recente</small>
          </div>
        </header>

        <section className="news-content" aria-labelledby="news-latest-title">
          <div className="news-heading">
            <div>
              <span>De citit acum</span>
              <h2 id="news-latest-title">Cele mai recente noutăți</h2>
              <p>O selecție actualizată din publicațiile norvegiene.</p>
            </div>
            {translating && <span className="news-translation-status"><i /> Traducem în română</span>}
          </div>

          {featuredArticle && <NewsCard item={featuredArticle} featured />}

          <div className="news-grid">
            {otherArticles.map((article) => <NewsCard key={article.id} item={article} />)}
          </div>
        </section>

        <aside className="news-note">
          <span className="news-note__icon" aria-hidden="true">N</span>
          <div>
            <small>Norvegiana în context</small>
            <h2>Învață din lucruri care se întâmplă acum</h2>
            <p>Deschide articolul original și observă cuvintele pe care le recunoști înainte să folosești traducerea.</p>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default News;
