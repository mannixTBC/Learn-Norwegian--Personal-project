import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import {guideArticles} from './guideArticles';
import './DiscoverCards.css';
import './LifeHub.css';

const categories=['Toate','Înainte de plecare','După sosire','Muncă','Viața zilnică','Integrare','Orașe'];
const NorwayLifeHub=()=>{const[category,setCategory]=useState('Toate');const articles=category==='Toate'?guideArticles:guideArticles.filter((article)=>article.category===category);return <div className="article-library">
 <header className="library-hero life-library-hero"><p>Ghid practic pentru români</p><h1>Viața în Norvegia, pas cu pas</h1><span>Acte, muncă, locuință, bancă și integrare explicate simplu pentru cei care se mută sau locuiesc deja aici.</span><div><Link to="/viata-in-norvegia/ghid/primii-pasi-roman-norvegia">Vezi primii pași →</Link><small>Informații verificate în iulie 2026</small></div></header>
 <nav className="life-quick-links" aria-label="Acces rapid"><a href="#articole">Articole practice</a><Link to="/joburi">Muncă și documente</Link><Link to="/weather">Vremea</Link><Link to="/news">Știri</Link></nav>
 <section className="featured-article"><div><span>Articol esențial · 12 minute</span><h2>Primii pași în Norvegia pentru un cetățean român</h2><p>Înregistrarea UE/SEE, Folkeregisteret, numărul de identificare, skattekort, contul bancar și BankID, explicate în ordine.</p><Link to="/viata-in-norvegia/ghid/primii-pasi-roman-norvegia">Citește articolul →</Link></div><div className="featured-article__visual"><strong>7</strong><span>pași administrativi</span></div></section>
 <section className="article-section" id="articole"><div className="article-section__heading"><div><p>Biblioteca practică</p><h2>Informațiile de care ai nevoie</h2></div><span>{articles.length} {articles.length===1?'articol':'articole'}</span></div><div className="article-filters">{categories.map((item)=><button className={category===item?'active':''} onClick={()=>setCategory(item)} key={item}>{item}</button>)}</div><div className="article-list">{articles.map((article,index)=><article key={article.slug}><div className="article-list__number">{String(index+1).padStart(2,'0')}</div><div><span>{article.category} · {article.readTime} min</span><h3>{article.title}</h3><p>{article.excerpt}</p></div><Link to={`/viata-in-norvegia/ghid/${article.slug}`} aria-label={`Citește ${article.title}`}>Citește →</Link></article>)}</div></section>
 <section className="life-services"><div><span>💼</span><h3>Muncă și acte</h3><p>Contract, angajare și sistemul norvegian.</p><Link to="/joburi">Vezi ghidurile →</Link></div><div><span>🌦️</span><h3>Vremea</h3><p>Condițiile actuale din principalele orașe.</p><Link to="/weather">Vezi vremea →</Link></div><div><span>📰</span><h3>Știri</h3><p>Noutăți recente din Norvegia.</p><Link to="/news">Vezi știrile →</Link></div></section>
 </div>};
export default NorwayLifeHub;
