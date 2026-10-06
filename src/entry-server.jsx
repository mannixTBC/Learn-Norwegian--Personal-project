import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { AppContent } from './App';
import { getPrerenderRoutes, getSeoForPath, getSitemapRoutes } from './seo/seoConfig';

export const render = (url) => renderToString(
  <StaticRouter location={url} context={{}}>
    <AppContent />
  </StaticRouter>,
);

export { getPrerenderRoutes, getSeoForPath, getSitemapRoutes };
