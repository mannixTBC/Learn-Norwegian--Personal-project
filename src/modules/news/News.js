import React, { useState, useEffect } from 'react';
import './News.css';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=220&fit=crop';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('ro-RO', options);
};

const getMyMemoryUrl = (text, fromLang, toLang) => {
  const email = process.env.REACT_APP_MYMEMORY_EMAIL;
  const base = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
  return email ? `${base}&de=${encodeURIComponent(email)}` : base;
};

const translateText = async (text, toLang) => {
  if (!text || text.trim().length === 0) return text;
  const tryLang = async (fromLang) => {
    try {
      const res = await fetch(getMyMemoryUrl(text, fromLang, toLang));
      const data = await res.json();
      if (data.quotaFinished) return null;
      if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
    } catch (e) {
      return null;
    }
    return null;
  };
  const fromNorwegian = await tryLang('no');
  if (fromNorwegian) return fromNorwegian;
  const fromEnglish = await tryLang('en');
  return fromEnglish || text;
};

const truncateExcerpt = (text, maxWords = 12) => {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '...' : text;
};

const NewsCard = ({ item }) => {
  const content = (
    <>
      <div className="news-card__image-wrapper">
        <img
          src={item.image || PLACEHOLDER_IMAGE}
          alt={item.title}
          className="news-card__image"
          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
        />
        <span className="news-card__category">{item.source}</span>
      </div>
      <div className="news-card__content">
        <h3 className="news-card__title">{item.title}</h3>
        <p className="news-card__excerpt">{item.description}</p>
        <time className="news-card__date">{item.date}</time>
      </div>
    </>
  );

  return (
    <article className="news-card">
      {item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="news-card__link"
        >
          {content}
        </a>
      ) : (
        <div className="news-card__link">{content}</div>
      )}
    </article>
  );
};

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_GNEWS_API_KEY;

    if (!apiKey) {
      setError('Lipsește cheia API. Adaugă REACT_APP_GNEWS_API_KEY în fișierul .env.local');
      setLoading(false);
      return;
    }

    const fetchAndTranslate = async () => {
      try {
        const res = await fetch(
          `https://gnews.io/api/v4/top-headlines?country=no&max=10&token=${apiKey}`
        );
        const data = await res.json();

        if (data.errors && data.errors.length > 0) {
          throw new Error((data.errors[0] && data.errors[0].message) || 'Eroare la încărcarea știrilor');
        }

        if (data.articles && data.articles.length > 0) {
          const raw = data.articles.map((a) => ({
            id: a.url || Math.random(),
            title: a.title,
            description: a.description || a.title,
            image: a.image,
            url: a.url,
            source: (a.source && a.source.name) || 'Știri',
            date: formatDate(a.publishedAt),
          }));

          setArticles(raw);
          setLoading(false);
          setTranslating(true);

          const translated = await Promise.all(
            raw.map(async (a) => {
              const [titleRo, descRo] = await Promise.all([
                translateText(a.title, 'ro'),
                translateText(truncateExcerpt(a.description, 12), 'ro'),
              ]);
              return {
                ...a,
                title: titleRo || a.title,
                description: descRo || truncateExcerpt(a.description, 12),
              };
            })
          );

          setArticles(translated);
        } else {
          setError('Nu s-au găsit știri.');
        }
      } catch (err) {
        setError(err.message || 'Eroare la încărcarea știrilor. Verifică cheia API.');
      } finally {
        setLoading(false);
        setTranslating(false);
      }
    };

    fetchAndTranslate();
  }, []);

  if (loading) {
    return (
      <div className="news-container">
        <header className="news-header">
          <h1>Știri din Norvegia</h1>
          <p className="news-subtitle">Se încarcă știrile...</p>
        </header>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-container">
        <header className="news-header">
          <h1>Știri din Norvegia</h1>
          <p className="news-subtitle news-error">{error}</p>
          <p className="news-help">
            Pentru știri reale, obține o cheie gratuită la{' '}
            <a href="https://gnews.io/register" target="_blank" rel="noopener noreferrer">
              gnews.io
            </a>{' '}
            și adaugă în proiect: <code>REACT_APP_GNEWS_API_KEY=cheia_ta</code> în fișierul <code>.env.local</code>
          </p>
        </header>
      </div>
    );
  }

  return (
    <div className="news-container">
      <header className="news-header">
        <h1>Știri din Norvegia</h1>
        <p className="news-subtitle">
          Fi la curent cu cele mai recente noutăți din Norvegia. Apasă pe un card pentru a citi articolul complet în limba originală.
          {translating && <span className="news-translating-inline"> Se traduc cardurile...</span>}
        </p>
      </header>

      <div className="news-grid">
        {articles.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default News;
