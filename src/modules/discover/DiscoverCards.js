import React from 'react';
import {Link} from 'react-router-dom';
import './TravelDiscover.css';

const experiences=[
 {to:'/descopera/fiorduri',tag:'Natură',title:'Fiordurile Norvegiei',text:'Peisaje spectaculoase, trasee și locuri pe care merită să le descoperi.',image:'fjord'},
 {to:'/descopera/aurore-boreale',tag:'Experiențe',title:'Aurorele boreale',text:'Când, unde și cum poți vedea unul dintre cele mai impresionante fenomene naturale.',image:'aurora'},
 {to:'/descopera/dreptul-la-natura',tag:'În aer liber',title:'Dreptul la natură',text:'Cum te bucuri responsabil de drumeții, camping și natură prin allemannsretten.',image:'nature'},
 {to:'/descopera/traditii',tag:'Cultură',title:'Tradiții norvegiene',text:'Sărbători, obiceiuri și expresii culturale care te ajută să înțelegi țara.',image:'culture'},
];
const social=[['Dugnad','O activitate voluntară făcută împreună cu vecinii, școala sau asociația. Este și o ocazie bună să cunoști oameni.'],['Friluftsliv','Viața în aer liber este importantă pentru mulți norvegieni: plimbări, schi, cabane și timp petrecut în natură.'],['Kafé și bibliotecă','Bibliotecile, cafenelele și casele de cultură găzduiesc activități locale și grupuri de conversație.'],['Sport și voluntariat','Cluburile sportive și organizațiile locale sunt unele dintre cele mai naturale locuri pentru a construi relații.']];
const places=[['Oslo','Muzee, cartiere diverse, insule și acces rapid la pădure.'],['Bergen','Bryggen, munți, ploaie și punct de plecare spre fiorduri.'],['Trondheim','Istorie, viață studențească și catedrala Nidaros.'],['Tromsø','Natură arctică, noapte polară și soarele de la miezul nopții.'],['Stavanger','Oraș vechi, coastă și acces spre Preikestolen.'],['Lofoten','Sate pescărești, plaje nordice și trasee spectaculoase.']];
const cityGuides={'Oslo':'mutarea-in-oslo','Bergen':'mutarea-in-bergen','Tromsø':'mutarea-in-tromso'};

const DiscoverCards=()=> <div className="travel-discover">
 <header className="travel-hero"><div><p>Explorează Norvegia</p><h1>Natură, călătorii și viață socială</h1><span>Descoperă locurile, obiceiurile și experiențele care fac viața în Norvegia mai interesantă.</span><a href="#experiente">Începe explorarea ↓</a></div></header>
 <section className="travel-intro"><p>Dincolo de acte și muncă</p><h2>Cunoaște țara în care trăiești</h2><span>Pentru informații despre mutare, bancă, locuință și proceduri administrative, mergi la <Link to="/viata-in-norvegia">Viața în Norvegia →</Link></span></section>
 <section className="experience-grid" id="experiente">{experiences.map((item)=><Link className={`experience-card experience-card--${item.image}`} to={item.to} key={item.to}><div><span>{item.tag}</span><h2>{item.title}</h2><p>{item.text}</p><b>Citește articolul →</b></div></Link>)}</section>
 <section className="places-section"><div className="travel-section-heading"><p>Idei de călătorie</p><h2>Locuri de explorat</h2><span>Fiecare regiune are propriul ritm, climă și caracter.</span></div><div className="places-grid">{places.map(([name,text],index)=><article key={name}><span>{String(index+1).padStart(2,'0')}</span><h3>{name}</h3><p>{text}</p>{cityGuides[name]&&<Link to={`/viata-in-norvegia/ghid/${cityGuides[name]}`}>Vezi ghidul de mutare →</Link>}</article>)}</div></section>
 <section className="social-section"><div className="travel-section-heading"><p>Viață socială</p><h2>Cum intri mai ușor în comunitate</h2><span>Relațiile apar adesea prin activități repetate și interese comune.</span></div><div className="social-grid">{social.map(([title,text])=><article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></section>
 <section className="travel-cta"><div><p>Ai nevoie de informații practice?</p><h2>Actele, munca și locuința sunt acum într-un singur loc.</h2></div><Link to="/viata-in-norvegia">Deschide Viața în Norvegia →</Link></section>
 </div>;
export default DiscoverCards;
