import React,{useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import './TravelDiscover.css';

const experiences=[
 {to:'/descopera/fiorduri',tag:'Natură',title:'Fiordurile Norvegiei',text:'Peisaje spectaculoase, trasee și locuri pe care merită să le descoperi.',image:'fjord'},
 {to:'/descopera/aurore-boreale',tag:'Experiențe',title:'Aurorele boreale',text:'Când, unde și cum poți vedea unul dintre cele mai impresionante fenomene naturale.',image:'aurora'},
 {to:'/descopera/dreptul-la-natura',tag:'În aer liber',title:'Dreptul la natură',text:'Cum te bucuri responsabil de drumeții, camping și natură prin allemannsretten.',image:'nature'},
 {to:'/descopera/traditii',tag:'Cultură',title:'Tradiții norvegiene',text:'Sărbători, obiceiuri și expresii culturale care te ajută să înțelegi țara.',image:'culture'},
];
const social=[['Dugnad','O activitate voluntară făcută împreună cu vecinii, școala sau asociația. Este și o ocazie bună să cunoști oameni.','🤝'],['Friluftsliv','Viața în aer liber este importantă pentru mulți norvegieni: plimbări, schi, cabane și timp petrecut în natură.','🌲'],['Kafé și bibliotecă','Bibliotecile, cafenelele și casele de cultură găzduiesc activități locale și grupuri de conversație.','☕'],['Sport și voluntariat','Cluburile sportive și organizațiile locale sunt unele dintre cele mai naturale locuri pentru a construi relații.','⚽']];
const places=[['Oslo','Muzee, cartiere diverse, insule și acces rapid la pădure.'],['Bergen','Bryggen, munți, ploaie și punct de plecare spre fiorduri.'],['Trondheim','Istorie, viață studențească și catedrala Nidaros.'],['Tromsø','Natură arctică, noapte polară și soarele de la miezul nopții.'],['Stavanger','Oraș vechi, coastă și acces spre Preikestolen.'],['Lofoten','Sate pescărești, plaje nordice și trasee spectaculoase.']];
const cityGuides={'Oslo':'mutarea-in-oslo','Bergen':'mutarea-in-bergen','Tromsø':'mutarea-in-tromso'};

const DiscoverCards=()=>{
 const [openSocial,setOpenSocial]=useState(0);
 const [activePlace,setActivePlace]=useState(0);
 const placesGridRef=useRef(null);

 const handlePlacesScroll=()=>{
  const grid=placesGridRef.current;
  if(!grid||grid.scrollWidth===grid.clientWidth)return;
  const progress=grid.scrollLeft/(grid.scrollWidth-grid.clientWidth);
  setActivePlace(Math.round(progress*(places.length-1)));
 };

 const showPlace=(index)=>{
  const card=placesGridRef.current?.children[index];
  card?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'start'});
  setActivePlace(index);
 };

 return <div className="travel-discover">
 <header className="travel-hero"><div><p>Explorează Norvegia</p><h1>Natură, călătorii și viață socială</h1><span>Descoperă locurile, obiceiurile și experiențele care fac viața în Norvegia mai interesantă.</span><a href="#experiente">Începe explorarea ↓</a></div></header>
 <section className="travel-intro"><p>Dincolo de acte și muncă</p><h2>Cunoaște țara în care trăiești</h2><span>Pentru informații despre mutare, bancă, locuință și proceduri administrative, mergi la <Link to="/viata-in-norvegia">Viața în Norvegia →</Link></span></section>
 <nav className="travel-mobile-nav" aria-label="Navigare în pagina Descoperă"><a href="#experiente">Natură</a><a href="#locuri">Orașe</a><a href="#comunitate">Comunitate</a></nav>
 <section className="experience-grid" id="experiente">{experiences.map((item)=><Link className={`experience-card experience-card--${item.image}`} to={item.to} key={item.to}><div><span>{item.tag}</span><h2>{item.title}</h2><p>{item.text}</p><b>Descoperă →</b></div></Link>)}</section>
 <section className="places-section" id="locuri"><div className="travel-section-heading"><p>Idei de călătorie</p><h2>Locuri de explorat</h2><span>Fiecare regiune are propriul ritm, climă și caracter.</span></div><div className="places-grid" ref={placesGridRef} onScroll={handlePlacesScroll}>{places.map(([name,text],index)=>{const guide=cityGuides[name]||'alegerea-orasului';return <article key={name}><span>{String(index+1).padStart(2,'0')}</span><h3>{name}</h3><p>{text}</p><Link to={`/viata-in-norvegia/ghid/${guide}`}>Descoperă {name} →</Link></article>})}</div><div className="places-dots" aria-label="Alege un oraș">{places.map(([name],index)=><button type="button" key={name} className={activePlace===index?'active':''} onClick={()=>showPlace(index)} aria-label={`Arată ${name}`} aria-current={activePlace===index?'true':undefined}/>)}</div></section>
 <section className="social-section" id="comunitate"><div className="travel-section-heading"><p>Viață socială</p><h2>Cum intri mai ușor în comunitate</h2><span>Relațiile apar adesea prin activități repetate și interese comune.</span></div><div className="social-grid">{social.map(([title,text,icon],index)=><article className={openSocial===index?'is-open':''} key={title}><button type="button" onClick={()=>setOpenSocial(openSocial===index?-1:index)} aria-expanded={openSocial===index}><span className="social-icon" aria-hidden="true">{icon}</span><h3>{title}</h3><span className="social-chevron" aria-hidden="true">⌄</span></button><p>{text}</p></article>)}</div></section>
 <section className="travel-cta"><div><p>Ai nevoie de informații practice?</p><h2>Actele, munca și locuința sunt acum într-un singur loc.</h2></div><Link to="/viata-in-norvegia">Deschide Viața în Norvegia →</Link></section>
 </div>;
};
export default DiscoverCards;
