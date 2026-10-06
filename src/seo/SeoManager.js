import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSeoForPath } from './seoConfig';

const upsertMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
};

const upsertCanonical = (href) => {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

const SeoManager = () => {
  const location = useLocation();

  useEffect(() => {
    const seo = getSeoForPath(location.pathname);
    const configuredOrigin = String(import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '');
    const origin = configuredOrigin || window.location.origin;
    const canonicalUrl = `${origin}${seo.canonicalPath || location.pathname}`;
    const imageUrl = `${origin}/branding/nordlingo-selected-color.png`;
    const robots = seo.index === false ? 'noindex, nofollow' : 'index, follow';

    document.title = seo.title;
    upsertCanonical(canonicalUrl);
    upsertMeta('meta[name="description"]', { name: 'description', content: seo.description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robots });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: seo.title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: seo.description });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: seo.type || 'website' });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
  }, [location.pathname]);

  return null;
};

export default SeoManager;
