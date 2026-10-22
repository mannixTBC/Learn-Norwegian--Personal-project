import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { imageReady, visiblePageImages } from './pageImageReadiness';
import './PageLoading.css';

const pageThemes = {
  '/dashboard': 'home',
  '/cont': 'account',
  '/invata': 'lessons',
  '/invata-limba': 'lessons',
};

/** Section navigation only. Lesson steps and exercise transitions never start a loader. */
export default function PageLoading({ contentRef }) {
  const { pathname } = useLocation();
  const [loadingPath, setLoadingPath] = useState(null);
  const theme = pageThemes[pathname];

  useEffect(() => {
    setLoadingPath(null);
    if (!theme) return undefined;
    const controller = new AbortController();
    let cancelled = false;
    let finished = false;
    let showTimer;
    let limitTimer;
    let main;
    let previousBusy;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(showTimer);
      clearTimeout(limitTimer);
      controller.abort();
      if (main) {
        if (previousBusy === null) main.removeAttribute('aria-busy');
        else main.setAttribute('aria-busy', previousBusy);
      }
      if (!cancelled) setLoadingPath(null);
    };
    // Let the destination mount and the browser resolve its responsive backgrounds.
    const frame = requestAnimationFrame(() => {
      main = contentRef.current;
      if (!main || main.querySelector('.session-loading')) { main = null; return; }
      const images = visiblePageImages(main);
      if (!images.length) { main = null; return; }
      previousBusy = main.getAttribute('aria-busy');
      main.setAttribute('aria-busy', 'true');
      showTimer = setTimeout(() => { if (!cancelled) setLoadingPath(pathname); }, 160);
      // Broken or stalled images must not leave a permanent loading indicator.
      limitTimer = setTimeout(finish, 8000);
      Promise.all(images.map(image => imageReady(image, controller.signal))).then(finish);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      finish();
    };
  }, [pathname, theme, contentRef]);

  if (!theme || loadingPath !== pathname) return null;
  return <div className={`page-loading page-loading--${theme}`} role="status" aria-live="polite">
    <span className="page-loading__ring" aria-hidden="true" />
    <span className="page-loading__label">Se încarcă pagina…</span>
  </div>;
}
