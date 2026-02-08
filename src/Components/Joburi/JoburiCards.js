import React from 'react';
import Card from '../Exercitii/UI/cardUI';
import '../Exercitii/UI/card-style.css';
import './JoburiCards.css';
import acteIcon from '../Layout/front-page/icons/education.png';
import travelIcon from '../Layout/front-page/icons/travel.jpg';
import newsIcon from '../Layout/front-page/icons/news.jpg';

const JoburiCards = () => {
  return (
    <div className="joburi-cards">
      <Card
        imgsrc={acteIcon}
        title="Acte"
        path="/joburi/acte"
      />
      <Card
        imgsrc={newsIcon}
        title="Cum te angajezi"
        path="/joburi/cum-te-angajezi"
      />
      <Card
        imgsrc={travelIcon}
        title="Ce trebuie să știi înainte să mergi în Norvegia"
        path="/joburi/ce-trebuie-sa-stii"
      />
      <Card
        imgsrc={newsIcon}
        title="Sistemul norvegian"
        path="/joburi/sistemul-norvegian"
      />
    </div>
  );
};

export default JoburiCards;
