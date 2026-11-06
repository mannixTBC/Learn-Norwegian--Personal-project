import {ui} from '../../languages/messages.js';
import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import {guideArticles} from './guideArticles';
import './DiscoverCards.css';
import './LifeHub.css';

const categories=['Toate','Înainte de plecare','După sosire','Muncă','Viața zilnică','Integrare',ui('web_652e279f2c5a7260')];
const normalize=(value)=>value.toLocaleLowerCase('ro').normalize('NFD').replace(/[\u0300-\u036f]/g,'');

const ServiceIcon=({type})=>{
 const paths={
  work:<><path d="M5 8.5h14A1.5 1.5 0 0 1 20.5 10v8A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18v-8A1.5 1.5 0 0 1 5 8.5Z"/><path d="M8.5 8.5V6.8A1.8 1.8 0 0 1 10.3 5h3.4a1.8 1.8 0 0 1 1.8 1.8v1.7M3.5 12.5c5.3 2 11.7 2 17 0M10 13.5h4"/></>,
  weather:<><path d="M7.2 17.5h10.1a3.7 3.7 0 0 0 .1-7.4 5.4 5.4 0 0 0-10.3 1.6 2.9 2.9 0 0 0 .1 5.8Z"/><path d="M6.2 7.5 4.8 6.1M10.5 5.7V3.8M4.6 11H2.8"/></>,
  news:<><path d="M5 4.5h12.5A1.5 1.5 0 0 1 19 6v13H6.5A1.5 1.5 0 0 1 5 17.5v-13Z"/><path d="M19 8.5h2v9a1.5 1.5 0 0 1-1.5 1.5H19M8 8h7M8 11h7M8 14h4"/></>,
 };
 return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[type]}</svg>;
};

const NorwayLifeHub=()=>{
 const[category,setCategory]=useState('Toate');
 const[query,setQuery]=useState('');
 const[showAll,setShowAll]=useState(false);
 const normalizedQuery=normalize(query.trim());
 const articles=guideArticles.filter((article)=>{
  const matchesCategory=category==='Toate'||article.category===category;
  const searchable=normalize(`${article.title} ${article.excerpt} ${article.category}`);
  return matchesCategory&&(!normalizedQuery||searchable.includes(normalizedQuery));
 });
 const isLimited=category==='Toate'&&!normalizedQuery&&!showAll&&articles.length>5;

 const selectCategory=(item)=>{
  setCategory(item);
  setShowAll(item!=='Toate');
 };

 return <div className="article-library life-library">
  <header className="library-hero life-library-hero"><p>{ui('web_01676c238569fad3')}</p><h1>{ui('web_ba505dd4b28d73cc')}</h1><span>{ui('web_d601d3c8f63be69d')}</span><div><Link to="/viata-in-norvegia/ghid/primii-pasi-roman-norvegia">{ui('web_80fbbfb716d7e869')}</Link><small>{ui('web_45f55b4a84e51946')}</small></div></header>

  <nav className="life-quick-links" aria-label={ui('web_22a4a2dae38902d3')}><a href="#articole"><span aria-hidden="true">▤</span>{ui('web_ca92bdac27b478e9')}</a><Link to="/joburi"><span aria-hidden="true">💼</span>{ui('web_0a75ff9827cfe8ab')}</Link><Link to="/weather"><span aria-hidden="true">🌦️</span>{ui('ui_10fe23b38f149d99')}</Link><Link to="/news"><span aria-hidden="true">📰</span>{ui('ui_739370da1ce6bf30')}</Link></nav>

  <section className="featured-article life-featured"><div><span>{ui('web_04a04b46e4734230')}</span><h2>{ui('web_a53081e79fa06a28')}</h2><p>{ui('web_389ca8cc3b62591f')}</p><Link to="/viata-in-norvegia/ghid/primii-pasi-roman-norvegia">{ui('web_d30e6cf14a983ac3')}</Link></div><div className="featured-article__visual"><strong>7</strong><span>{ui('web_a6958b8ef0a2f6b3')}</span></div></section>

  <section className="article-section" id="articole">
   <div className="article-section__heading"><div><p>{ui('web_ce46db914cb0e6ea')}</p><h2>{ui('web_2f2c2fc483e0a66e')}</h2></div><span>{articles.length} {articles.length===1?'articol':'articole'}</span></div>
   <label className="life-search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event)=>{setQuery(event.target.value);setShowAll(true)}} placeholder={ui('web_02f72c500e0b720b')} aria-label={ui('web_cf73cfb1bce0ae81')}/></label>
   <div className="article-filters">{categories.map((item)=><button type="button" className={category===item?'active':''} onClick={()=>selectCategory(item)} key={item}>{item}</button>)}</div>
   <div className={`article-list ${isLimited?'article-list--limited':''}`}>{articles.map((article,index)=><article key={article.slug}><Link className="article-list__card" to={`/viata-in-norvegia/ghid/${article.slug}`} aria-label={`Citește ${article.title}`}><div className="article-list__number">{String(index+1).padStart(2,'0')}</div><div className="article-list__copy"><span>{article.category} · {article.readTime}{ui('ui_2e75737a6b582974')}</span><h3>{article.title}</h3><p>{article.excerpt}</p></div><strong className="article-list__arrow" aria-hidden="true">→</strong></Link></article>)}</div>
   {articles.length===0&&<div className="life-search-empty"><strong>{ui('web_99a87df18c4fc0b9')}</strong><span>{ui('web_2d4fceb1ce5a6484')}</span></div>}
   {isLimited&&<button type="button" className="life-show-all" onClick={()=>setShowAll(true)}>{ui('web_736c344c2366bcbd')}{articles.length}{ui('web_4a60759c22b085af')}<span aria-hidden="true">↓</span></button>}
  </section>

  <section className="life-services" aria-labelledby="life-services-title">
   <header className="life-services__heading"><div><span>{ui('web_22a4a2dae38902d3')}</span><h2 id="life-services-title">{ui('web_8bdee9d35c822e31')}</h2></div><p>{ui('web_55a772671ba47958')}</p></header>
   <div className="life-services__grid">
    <Link className="life-service life-service--work" to="/joburi"><span className="life-service__icon"><ServiceIcon type="work"/></span><div><small>{ui('web_81d8b33171b49ec1')}</small><h3>{ui('web_37a4a575590aed2c')}</h3><p>{ui('web_ef57595c79d9854a')}</p><b>{ui('web_654c851f300bfde8')}</b></div><strong aria-hidden="true">→</strong></Link>
    <Link className="life-service life-service--weather" to="/weather"><span className="life-service__icon"><ServiceIcon type="weather"/></span><div><small>{ui('web_635b1dae26a8c252')}</small><h3>{ui('ui_10fe23b38f149d99')}</h3><p>{ui('web_39467ba89f7ad62b')}</p><b>{ui('web_94b0e77a1e091659')}</b></div><strong aria-hidden="true">→</strong></Link>
    <Link className="life-service life-service--news" to="/news"><span className="life-service__icon"><ServiceIcon type="news"/></span><div><small>{ui('web_294e47cdfea0f108')}</small><h3>{ui('ui_739370da1ce6bf30')}</h3><p>{ui('web_46b2150a26c4c993')}</p><b>{ui('web_9fd2852ef401504e')}</b></div><strong aria-hidden="true">→</strong></Link>
   </div>
  </section>
 </div>;
};

export default NorwayLifeHub;
