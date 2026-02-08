import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import './articleDetail.css';

const STORAGE_KEY = 'news_articles';
const PLACEHOLDER = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop';

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

const translateLongText = async (text) => {
  const chunkSize = 450;
  const chunks = [];
  let remaining = text;
  while (remaining.length > 0) {
    let chunk = remaining.slice(0, chunkSize);
    const lastSpace = chunk.lastIndexOf(' ');
    if (lastSpace > chunkSize * 0.6) {
      chunk = chunk.slice(0, lastSpace + 1);
      remaining = remaining.slice(lastSpace + 1);
    } else {
      remaining = remaining.slice(chunk.length);
    }
    if (chunk.trim()) chunks.push(chunk.trim());
  }
  const translated = [];
  for (let i = 0; i < chunks.length; i++) {
    const t = await translateText(chunks[i], 'ro');
    translated.push(t || chunks[i]);
  }
  return translated.join(' ');
};

const ArticleDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const article = location.state && location.state.article;

  const [displayArticle, setDisplayArticle] = useState(article);
  const [fullContent, setFullContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentError, setContentError] = useState(null);
  const [translatedContent, setTranslatedContent] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState(null);

  useEffect(() => {
    if (!displayArticle && id) {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const articles = JSON.parse(stored);
          const idx = parseInt(id, 10);
          if (!isNaN(idx) && articles[idx]) {
            setDisplayArticle(articles[idx]);
          }
        }
      } catch (e) {
        console.warn(e);
      }
    }
  }, [id, displayArticle]);

  useEffect(() => {
    const art = displayArticle;
    if (!art || !art.url) return;

    setLoadingContent(true);
    setContentError(null);

    const jinaUrl = `https://r.jina.ai/${art.url}`;

    fetch(jinaUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Nu s-a putut încărca articolul');
        return res.text();
      })
      .then((text) => {
        const lines = text.split('\n');
        let start = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('#') || lines[i].trim().length > 50) {
            start = i;
            break;
          }
        }
        const content = lines.slice(start).join('\n').trim();
        if (content.length > 100) {
          setFullContent(content);
        } else {
          setFullContent(null);
        }
      })
      .catch((err) => {
        setContentError(err.message || 'Eroare la încărcare');
        setFullContent(null);
      })
      .finally(() => setLoadingContent(false));
  }, [displayArticle]);

  const handleTranslate = async () => {
    if (!fullContent || translating) return;
    setTranslating(true);
    setTranslateError(null);
    try {
      const translated = await translateLongText(fullContent);
      setTranslatedContent(translated);
    } catch (e) {
      setTranslateError('Eroare la traducere. Verifică conexiunea. Pentru limită mai mare (50000 car/zi), adaugă REACT_APP_MYMEMORY_EMAIL=email@exemplu.com în .env.local');
    } finally {
      setTranslating(false);
    }
  };

  if (!displayArticle) {
    return (
      <div className="article-detail">
        <div className="article-detail__not-found">
          <h2>Articolul nu a fost găsit</h2>
          <Link to="/news" className="article-detail__back">Înapoi la știri</Link>
        </div>
      </div>
    );
  }

  const title = displayArticle.titleRo || displayArticle.title || displayArticle.titleOriginal;
  const description = displayArticle.descriptionRo || displayArticle.description || displayArticle.descriptionOriginal || displayArticle.titleOriginal;
  const source = displayArticle.source;
  const date = displayArticle.date;
  const image = displayArticle.image;
  const url = displayArticle.url;

  const bodyToShow = translatedContent || fullContent || description;

  return (
    <div className="article-detail">
      <article className="article-detail__content">
        <Link to="/news" className="article-detail__back">
          ← Înapoi la știri
        </Link>

        <header className="article-detail__header">
          <span className="article-detail__source">{source}</span>
          <time className="article-detail__date">{date}</time>
        </header>

        <h1 className="article-detail__title">{title}</h1>

        {image && (
          <div className="article-detail__image-wrapper">
            <img
              src={image}
              alt={title}
              className="article-detail__image"
              onError={(e) => { e.target.src = PLACEHOLDER; }}
            />
          </div>
        )}

        <div className="article-detail__body">
          {loadingContent && (
            <p className="article-detail__loading">Se încarcă articolul complet...</p>
          )}

          {contentError && !fullContent && (
            <p className="article-detail__error">{contentError}</p>
          )}

          {bodyToShow && (
            <>
              <div className="article-detail__text">
                {bodyToShow.split('\n\n').map((para, i) => (
                  <p key={i}>{para.replace(/\n/g, ' ')}</p>
                ))}
              </div>
              {fullContent && !translatedContent && (
                <>
                  <button
                    type="button"
                    className="article-detail__translate-btn"
                    onClick={handleTranslate}
                    disabled={translating}
                  >
                    {translating ? 'Se traduce...' : 'Traduce în română'}
                  </button>
                  {translateError && (
                    <p className="article-detail__error" style={{ marginTop: '12px' }}>{translateError}</p>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="article-detail__original"
          >
            Citește pe sursa originală →
          </a>
        )}
      </article>
    </div>
  );
};

export default ArticleDetail;
