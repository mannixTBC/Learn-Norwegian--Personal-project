import {ui} from '../../languages/messages.js';
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
 <header className="travel-hero"><div><p>{ui('web_73d57b04ef28a3e1')}</p><h1>{ui('web_368b34079cad0590')}</h1><span>{ui('web_16a2493fd6447949')}</span><a href="#experiente">{ui('web_a687573aecc0f8f4')}</a></div></header>
 <section className="travel-intro"><p>{ui('web_cfc7ea9c02c041b5')}</p><h2>{ui('web_6b67a909f8f76f20')}</h2><span>{ui('web_33edbf19223b6116')}<Link to="/viata-in-norvegia">{ui('web_51c6452e504c9e6b')}</Link></span></section>
 <nav className="travel-mobile-nav" aria-label={ui('web_1c4168338f5ee28e')}><a href="#experiente">{ui('web_c22a6f049691f73d')}</a><a href="#locuri">{ui('web_652e279f2c5a7260')}</a><a href="#comunitate">{ui('web_68c9a9dd7450a238')}</a></nav>
 <section className="experience-grid" id="experiente">{experiences.map((item)=><Link className={`experience-card experience-card--${item.image}`} to={item.to} key={item.to}><div><span>{item.tag}</span><h2>{item.title}</h2><p>{item.text}</p><b>{ui('web_144842cc02c59296')}</b></div></Link>)}</section>
 <section className="places-section" id="locuri"><div className="travel-section-heading"><p>{ui('web_c8e73dbe9fd06cc1')}</p><h2>{ui('web_049e35f8743a880c')}</h2><span>{ui('web_ef106aa71ff8957d')}</span></div><div className="places-grid" ref={placesGridRef} onScroll={handlePlacesScroll}>{places.map(([name,text],index)=>{const guide=cityGuides[name]||'alegerea-orasului';return <article key={name}><span>{String(index+1).padStart(2,'0')}</span><h3>{name}</h3><p>{text}</p><Link to={`/viata-in-norvegia/ghid/${guide}`}>{ui('web_c5fa7a4775c1e07d')}{name} →</Link></article>})}</div><div className="places-dots" aria-label={ui('web_344712bae9c89ed1')}>{places.map(([name],index)=><button type="button" key={name} className={activePlace===index?'active':''} onClick={()=>showPlace(index)} aria-label={`Arată ${name}`} aria-current={activePlace===index?'true':undefined}/>)}</div></section>
 <section className="social-section" id="comunitate"><div className="travel-section-heading"><p>{ui('web_19d209a60b516232')}</p><h2>{ui('web_ed226931669821c6')}</h2><span>{ui('web_d2cdc581249256c7')}</span></div><div className="social-grid">{social.map(([title,text,icon],index)=><article className={openSocial===index?'is-open':''} key={title}><button type="button" onClick={()=>setOpenSocial(openSocial===index?-1:index)} aria-expanded={openSocial===index}><span className="social-icon" aria-hidden="true">{icon}</span><h3>{title}</h3><span className="social-chevron" aria-hidden="true">⌄</span></button><p>{text}</p></article>)}</div></section>
 </div>;
};
export default DiscoverCards;
