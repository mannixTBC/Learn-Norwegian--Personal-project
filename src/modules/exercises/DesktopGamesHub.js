import React from 'react';
import {Link} from 'react-router-dom';
import {ExerciseIcon,ExerciseLevelSelect} from './ExerciseUI';
import './DesktopGamesHub.css';
export default function DesktopGamesHub({level,reviewStats={}}){
 const query='?nivel='+encodeURIComponent(level);
 const items=[
  ['verbs','Gramatică','Compară formele și aplică regulile în exerciții.','/gramatica'],
  ['review','Recapitulare','Sumare de lecții și exercițiile de repetat.','/recapitulare-azi'],
  ['quiz','Recapitulare activă','Amintește-ți, aplică regula și răspunde fără model.','/recapitulare-activa'],
  ['word','Descoperă cuvântul','Asociază imaginea cu sensul și descoperă literele.','/hangman'],
  ['listen','Ascultă și alege','Zece întrebări adaptate lecțiilor parcurse.','/asculta-si-alege'],
  ['order','Construiește propoziții','Ordonează cuvintele și învață din indicii.','/drag'],
  ['quiz','Vocabular','Învață sensul cuvintelor și expresiilor în context.','/chestionar'],
  ['pronunciation','Pronunție','Ascultă, înregistrează-te și verifică pronunția.','/pronuntie'],
  ['verbs','Caiet de verbe','Compară timpurile și alege forma potrivită.','/challenge30'],
  ['order','Misiuni la serviciu','Aplică expresiile în situații din traseul tău profesional.','/misiuni-la-serviciu'],
 ];
 return <section className="desktop-games-hub" aria-label="Practică">
  <header className="desktop-games-hub__heading"><div><span className="desktop-games-hub__eyebrow">NORDLINGO · PRACTICĂ</span><h1>Ce vrei să exersezi?</h1><p>Alege o activitate și continuă de la nivelul tău.</p></div><ExerciseLevelSelect level={level}/></header>
  <div className="desktop-games-hub__overview"><article className="desktop-games-hub__recommendation"><div><h2>Conversează cu Nora</h2><p>Exersează situații din viața de zi cu zi sau începe o conversație liberă.</p><Link className="desktop-games-hub__primary" to={'/studio'+query}>Deschide studioul de conversații →</Link></div><span className="desktop-games-hub__feature-icon"><ExerciseIcon name="pronunciation"/></span></article><aside className="desktop-games-hub__consolidate"><h2>De repetat</h2><strong>{reviewStats.due||0} elemente pentru astăzi</strong><p>Consolidează cuvintele și răspunsurile care încă îți dau dificultăți.</p><Link to={'/recapitulare'+query}>Deschide recapitularea →</Link></aside></div>
  <div className="desktop-games-hub__section-heading"><h2>Exerciții și ghiduri</h2><span>Nivel {level}</span></div>
  <div className="desktop-games-hub__grid">{items.map(([icon,title,description,to])=><Link className={'desktop-games-hub__card desktop-games-hub__card--'+icon} key={to} to={to+query}><span className="desktop-games-hub__icon"><ExerciseIcon name={icon}/></span><div><h3>{title}</h3><p>{description}</p></div><span aria-hidden="true">→</span><span className="desktop-games-hub__card-action">Deschide activitatea</span></Link>)}</div>
 </section>;
}
