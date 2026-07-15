import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import {guideArticles} from './guideArticles';
import './DiscoverCards.css';
import './LifeHub.css';

const categories=['Toate','Înainte de plecare','După sosire','Muncă','Viața zilnică','Integrare','Orașe'];
const normalize=(value)=>value.toLocaleLowerCase('ro').normalize('NFD').replace(/[\u0300-\u036f]/g,'');

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
  <header className="library-hero life-library-hero"><p>Ghid practic pentru români</p><h1>Viața în Norvegia, pas cu pas</h1><span>Acte, muncă, locuință, bancă și integrare explicate simplu pentru cei care se mută sau locuiesc deja aici.</span><div><Link to="/viata-in-norvegia/ghid/primii-pasi-roman-norvegia">Vezi primii pași →</Link><small>Verificat în iulie 2026</small></div></header>

  <nav className="life-quick-links" aria-label="Acces rapid"><a href="#articole"><span aria-hidden="true">▤</span>Articole practice</a><Link to="/joburi"><span aria-hidden="true">💼</span>Muncă și documente</Link><Link to="/weather"><span aria-hidden="true">🌦️</span>Vremea</Link><Link to="/news"><span aria-hidden="true">📰</span>Știri</Link></nav>

  <section className="featured-article life-featured"><div><span>Recomandat pentru început · 12 minute</span><h2>Primii pași în Norvegia pentru un cetățean român</h2><p>Înregistrarea UE/SEE, Folkeregisteret, numărul de identificare, skattekort, contul bancar și BankID, explicate în ordine.</p><Link to="/viata-in-norvegia/ghid/primii-pasi-roman-norvegia">Citește articolul →</Link></div><div className="featured-article__visual"><strong>7</strong><span>pași administrativi</span></div></section>

  <section className="article-section" id="articole">
   <div className="article-section__heading"><div><p>Biblioteca practică</p><h2>Informațiile de care ai nevoie</h2></div><span>{articles.length} {articles.length===1?'articol':'articole'}</span></div>
   <label className="life-search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event)=>{setQuery(event.target.value);setShowAll(true)}} placeholder="Ce informație cauți?" aria-label="Caută în articole"/></label>
   <div className="article-filters">{categories.map((item)=><button type="button" className={category===item?'active':''} onClick={()=>selectCategory(item)} key={item}>{item}</button>)}</div>
   <div className={`article-list ${isLimited?'article-list--limited':''}`}>{articles.map((article,index)=><article key={article.slug}><Link className="article-list__card" to={`/viata-in-norvegia/ghid/${article.slug}`} aria-label={`Citește ${article.title}`}><div className="article-list__number">{String(index+1).padStart(2,'0')}</div><div className="article-list__copy"><span>{article.category} · {article.readTime} min</span><h3>{article.title}</h3><p>{article.excerpt}</p></div><strong className="article-list__arrow" aria-hidden="true">→</strong></Link></article>)}</div>
   {articles.length===0&&<div className="life-search-empty"><strong>Nu am găsit un articol.</strong><span>Încearcă „BankID”, „contract”, „locuință” sau „medic”.</span></div>}
   {isLimited&&<button type="button" className="life-show-all" onClick={()=>setShowAll(true)}>Arată toate cele {articles.length} articole <span aria-hidden="true">↓</span></button>}
  </section>

  <section className="life-services" aria-label="Alte informații utile"><Link className="life-service" to="/joburi"><span aria-hidden="true">💼</span><div><h3>Muncă și acte</h3><p>Contract, angajare și sistemul norvegian.</p></div><strong aria-hidden="true">→</strong></Link><Link className="life-service" to="/weather"><span aria-hidden="true">🌦️</span><div><h3>Vremea</h3><p>Condițiile actuale din principalele orașe.</p></div><strong aria-hidden="true">→</strong></Link><Link className="life-service" to="/news"><span aria-hidden="true">📰</span><div><h3>Știri</h3><p>Noutăți recente din Norvegia.</p></div><strong aria-hidden="true">→</strong></Link></section>
 </div>;
};

export default NorwayLifeHub;
