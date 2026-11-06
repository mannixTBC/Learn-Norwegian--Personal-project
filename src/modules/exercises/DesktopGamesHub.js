import {ui} from '../../languages/messages.js';
import React from 'react';
import {Link} from 'react-router-dom';
import {ExerciseIcon,ExerciseLevelSelect} from './ExerciseUI';
import './DesktopGamesHub.css';
export default function DesktopGamesHub({level,reviewStats={}}){
 const query='?nivel='+encodeURIComponent(level);
 const items=[
  ['verbs',ui('ui_b3e5917f6637de1c'),'Compară formele și aplică regulile în exerciții.','/gramatica'],
  ['review',ui('ui_fe74dd05d0e5825f'),'Sumare de lecții și exercițiile de repetat.','/recapitulare-azi'],
  ['quiz',ui('ui_514c1d17b6a01039'),'Amintește-ți, aplică regula și răspunde fără model.','/recapitulare-activa'],
  ['word',ui('ui_a60eba1190b8698d'),'Asociază imaginea cu sensul și descoperă literele.','/hangman'],
  ['listen',ui('ui_b58cf3ae7c001d99'),'Zece întrebări adaptate lecțiilor parcurse.','/asculta-si-alege'],
  ['order',ui('ui_4b69d2a3ce71a3d6'),'Ordonează cuvintele și învață din indicii.','/drag'],
  ['quiz','Vocabular','Învață sensul cuvintelor și expresiilor în context.','/chestionar'],
  ['pronunciation','Pronunție','Ascultă, înregistrează-te și verifică pronunția.','/pronuntie'],
  ['verbs','Caiet de verbe','Compară timpurile și alege forma potrivită.','/challenge30'],
  ['order','Misiuni la serviciu','Aplică expresiile în situații din traseul tău profesional.','/misiuni-la-serviciu'],
 ];
 return <section className="desktop-games-hub" aria-label={ui('web_c3b769b17a3333f5')}>
  <header className="desktop-games-hub__heading"><div><span className="desktop-games-hub__eyebrow">{ui('web_efaf664062411237')}</span><h1>{ui('ui_56e2f4a1b2800215')}</h1><p>{ui('web_d2d25522e7b13290')}</p></div><ExerciseLevelSelect level={level}/></header>
  <div className="desktop-games-hub__overview"><article className="desktop-games-hub__recommendation"><div><h2>{ui('web_5059591e785127c0')}</h2><p>{ui('web_6ed41aa60de9d661')}</p><Link className="desktop-games-hub__primary" to={'/studio'+query}>{ui('web_3cce0466821b8a17')}</Link></div><span className="desktop-games-hub__feature-icon"><ExerciseIcon name="pronunciation"/></span></article><aside className="desktop-games-hub__consolidate"><h2>{ui('ui_352b62f7948b0ff4')}</h2><strong>{reviewStats.due||0}{ui('web_a7ce9cf77f8ddd15')}</strong><p>{ui('web_b5d7357f9f098e6f')}</p><Link to={'/recapitulare'+query}>{ui('web_8b1f92fbeb75e589')}</Link></aside></div>
  <div className="desktop-games-hub__section-heading"><h2>{ui('web_064ae5e16b3de01a')}</h2><span>{ui('ui_1450f9b5ea87b98c')}{level}</span></div>
  <div className="desktop-games-hub__grid">{items.map(([icon,title,description,to])=><Link className={'desktop-games-hub__card desktop-games-hub__card--'+icon} key={to} to={to+query}><span className="desktop-games-hub__icon"><ExerciseIcon name={icon}/></span><div><h3>{title}</h3><p>{description}</p></div><span aria-hidden="true">→</span><span className="desktop-games-hub__card-action">{ui('web_d1726ab2143b1299')}</span></Link>)}</div>
 </section>;
}
