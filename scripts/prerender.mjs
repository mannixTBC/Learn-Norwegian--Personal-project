import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const projectRoot = resolve(import.meta.dirname, '..');
const clientDir = resolve(projectRoot, 'dist');
const serverDir = resolve(projectRoot, 'dist-ssr');
const serverEntry = ['entry-server.js', 'entry-server.mjs']
  .map((name) => resolve(serverDir, name))
  .find(existsSync);

if (!serverEntry) throw new Error('Nu am găsit build-ul SSR în dist-ssr.');

const { render, getPrerenderRoutes, getSeoForPath, getSitemapRoutes } = await import(pathToFileURL(serverEntry));
const template = readFileSync(resolve(clientDir, 'index.html'), 'utf8');
const configuredSiteUrl = process.env.URL || process.env.VITE_SITE_URL || 'https://nordlingo.net';
const siteUrl = configuredSiteUrl.replace(/\/$/, '');

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const seoHead = (route) => {
  const seo = getSeoForPath(route);
  const canonicalUrl = `${siteUrl}${seo.canonicalPath || route}`;
  const robots = seo.index === false ? 'noindex, nofollow' : 'index, follow';
  const imageUrl = `${siteUrl}/branding/nordlingo-selected-color.png`;
  return [
    '<!--seo-head-start-->',
    `    <title>${escapeHtml(seo.title)}</title>`,
    `    <meta name="description" content="${escapeHtml(seo.description)}" />`,
    `    <meta name="robots" content="${robots}" />`,
    `    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    `    <meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `    <meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `    <meta property="og:type" content="${seo.type || 'website'}" />`,
    `    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `    <meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
    '    <meta property="og:locale" content="ro_RO" />',
    '    <meta name="twitter:card" content="summary_large_image" />',
    '<!--seo-head-end-->',
  ].join('\n');
};

const createPage = (route) => template
  .replace(/<!--seo-head-start-->[\s\S]*?<!--seo-head-end-->/, seoHead(route))
  .replace('<!--app-html-->', render(route));

const writeRoute = (route) => {
  const outputPath = route === '/'
    ? resolve(clientDir, 'index.html')
    : resolve(clientDir, route.replace(/^\//, ''), 'index.html');
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, createPage(route), 'utf8');
};

getPrerenderRoutes().forEach(writeRoute);
writeFileSync(resolve(clientDir, '404.html'), createPage('/pagina-inexistenta'), 'utf8');

const sitemapUrls = [...new Set(getSitemapRoutes())]
  .map((route) => `  <url><loc>${escapeHtml(`${siteUrl}${route}`)}</loc></url>`)
  .join('\n');
writeFileSync(
  resolve(clientDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`,
  'utf8',
);

writeFileSync(
  resolve(clientDir, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
  'utf8',
);

rmSync(serverDir, { recursive: true, force: true });
console.log(`Prerender finalizat pentru ${getPrerenderRoutes().length} rute publice.`);
