import { guideArticles, workAndDocumentsArticles } from '../modules/discover/guideArticles';

const DEFAULT_DESCRIPTION = 'Învață norvegiana și descoperă Norvegia. Lecții și ghiduri practice create pentru români.';

const staticPages = {
  '/': {
    title: 'Învață norvegiana online pentru români | NordLingo',
    description: 'Învață norvegiana pas cu pas și găsește informații practice despre muncă, acte și viața în Norvegia.',
  },
  '/descopera': {
    title: 'Descoperă Norvegia: natură, cultură și tradiții | NordLingo',
    description: 'Explorează fiordurile, aurora boreală, tradițiile și cultura Norvegiei în ghiduri clare, scrise în română.',
  },
  '/descopera/aurore-boreale': {
    title: 'Aurora boreală în Norvegia: perioadă și destinații | NordLingo',
    description: 'Află când și unde poți vedea aurora boreală în Norvegia și cum să pregătești o experiență reușită.',
  },
  '/descopera/fiorduri': {
    title: 'Fiordurile Norvegiei: ghid de călătorie | NordLingo',
    description: 'Descoperă fiordurile Norvegiei, peisajele lor și regulile practice pentru o călătorie responsabilă.',
  },
  '/descopera/dreptul-la-natura': {
    title: 'Dreptul la natură în Norvegia: regulile allemannsretten',
    description: 'Înțelege regulile norvegiene pentru accesul în natură, campare, foc și protejarea locurilor vizitate.',
  },
  '/descopera/traditii': {
    title: 'Tradiții și obiceiuri norvegiene explicate românilor',
    description: 'Descoperă 17 mai, dugnad, viața la cabană și alte tradiții importante din cultura norvegiană.',
  },
  '/viata-in-norvegia': {
    title: 'Viața în Norvegia: ghid practic pentru români | NordLingo',
    description: 'Ghiduri despre acte, muncă, locuință, bancă, sănătate și integrare pentru românii care se mută în Norvegia.',
  },
  '/joburi': {
    title: 'Muncă în Norvegia pentru români: joburi și acte | NordLingo',
    description: 'Află cum cauți un loc de muncă în Norvegia, ce acte sunt necesare și cum funcționează sistemul norvegian.',
  },
  '/joburi/acte': {
    title: 'Acte necesare pentru muncă în Norvegia | NordLingo',
    description: 'Documentele și pașii principali pentru românii care vor să lucreze și să se stabilească în Norvegia.',
  },
  '/joburi/cum-te-angajezi': {
    title: 'Cum te angajezi în Norvegia: ghid pentru români',
    description: 'Pregătește CV-ul, verifică ofertele și află unde poți găsi locuri de muncă reale în Norvegia.',
  },
  '/joburi/ce-trebuie-sa-stii': {
    title: 'Ce trebuie să știi înainte să lucrezi în Norvegia',
    description: 'Informații practice despre climă, costuri, contracte și adaptare înainte să începi munca în Norvegia.',
  },
  '/joburi/sistemul-norvegian': {
    title: 'D-nummer, BankID și sistemul norvegian explicate simplu',
    description: 'Înțelege D-nummer, personnummer, BankID și serviciile digitale folosite în Norvegia.',
  },
  '/weather': {
    title: 'Vremea în Norvegia: Oslo, Bergen, Tromsø și alte orașe',
    description: 'Verifică vremea actuală în principalele orașe din Norvegia și pregătește-te pentru condițiile locale.',
  },
  '/news': {
    title: 'Știri din Norvegia în limba română | NordLingo',
    description: 'Urmărește cele mai recente știri și subiecte importante din Norvegia, într-un spațiu creat pentru români.',
  },
  '/premium': {
    title: 'NordLingo Premium: curs complet de norvegiană',
    description: 'Descoperă funcțiile Premium NordLingo pentru lecții, pronunție, exerciții și învățare personalizată.',
  },
};

const protectedPrefixes = [
  '/autentificare', '/dashboard', '/alege-directia', '/invata', '/exerseaza',
  '/pronuntie', '/hangman', '/chestionar', '/drag', '/challenge30',
  '/recapitulare', '/test-final', '/curs', '/program-norvegiana',
];

const normalizePath = (pathname = '/') => {
  const clean = pathname.split('?')[0].split('#')[0] || '/';
  return clean !== '/' ? clean.replace(/\/+$/, '') : clean;
};

const guideBySlug = new Map(guideArticles.map((article) => [article.slug, article]));
const workSlugs = new Set(workAndDocumentsArticles.map((article) => article.slug));

export const getSeoForPath = (pathname) => {
  const path = normalizePath(pathname);

  if (path === '/wheather') return { ...staticPages['/weather'], canonicalPath: '/weather' };
  if (path === '/invata-limba') return { title: 'Curs de norvegiană online | NordLingo', description: DEFAULT_DESCRIPTION, canonicalPath: '/invata', index: false };

  const guideMatch = path.match(/^\/(?:viata-in-norvegia|joburi|descopera)\/ghid\/([^/]+)$/);
  if (guideMatch) {
    const article = guideBySlug.get(guideMatch[1]);
    if (!article) return { title: 'Pagina nu a fost găsită | NordLingo', description: DEFAULT_DESCRIPTION, index: false, notFound: true };
    return {
      title: `${article.title} | NordLingo`,
      description: article.excerpt || article.intro || DEFAULT_DESCRIPTION,
      canonicalPath: `/viata-in-norvegia/ghid/${article.slug}`,
      type: 'article',
    };
  }

  if (staticPages[path]) return { ...staticPages[path], canonicalPath: path };

  if (protectedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return { title: 'NordLingo', description: DEFAULT_DESCRIPTION, canonicalPath: path, index: false };
  }

  return {
    title: 'Pagina nu a fost găsită | NordLingo',
    description: 'Pagina căutată nu există sau a fost mutată.',
    canonicalPath: path,
    index: false,
    notFound: true,
  };
};

export const getPrerenderRoutes = () => {
  const routes = Object.keys(staticPages);
  guideArticles.forEach((article) => routes.push(`/viata-in-norvegia/ghid/${article.slug}`));
  workSlugs.forEach((slug) => routes.push(`/joburi/ghid/${slug}`));
  return [...new Set(routes)];
};

export const getSitemapRoutes = () => [
  ...Object.keys(staticPages),
  ...guideArticles.map((article) => `/viata-in-norvegia/ghid/${article.slug}`),
];

export const DEFAULT_SEO_DESCRIPTION = DEFAULT_DESCRIPTION;
