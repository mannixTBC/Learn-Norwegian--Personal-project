import React from 'react';
import Card from '../common/Card';
import '../common/Card.css';
import './JobsCards.css';
import imgActe from '../layout/Home/icons/education.png';
import imgAngajare from '../layout/Home/icons/learn.jpg';
import imgNorvegia from '../layout/Home/icons/travel.jpg';
import imgSistem from '../layout/Home/icons/news.jpg';

/** Pagina cu carduri pentru secțiunea „Utile” (joburi și viața în Norvegia) */
const JobsCards = () => (
  <div className="joburi-cards">
    <div className="joburi-cards__header">
      <h1 className="joburi-cards__title">Utile</h1>
      <p className="joburi-cards__subtitle">Ghiduri practice pentru viața și munca în Norvegia</p>
    </div>
    <div className="joburi-cards__grid">
      <Card imgsrc={imgActe} title="Acte" path="/joburi/acte" description="Documentele necesare pentru ședere și muncă în Norvegia." />
      <Card imgsrc={imgAngajare} title="Cum te angajezi" path="/joburi/cum-te-angajezi" description="Pași concreți pentru a găsi un job în Norvegia." />
      <Card imgsrc={imgNorvegia} title="Ce trebuie să știi" path="/joburi/ce-trebuie-sa-stii" description="Informații esențiale înainte de a pleca în Norvegia." />
      <Card imgsrc={imgSistem} title="Sistemul norvegian" path="/joburi/sistemul-norvegian" description="Cum funcționează birocrația și serviciile digitale." />
    </div>
  </div>
);

export default JobsCards;
