import React from 'react';
import Card from '../Exercitii/UI/cardUI';
import '../Exercitii/UI/card-style.css';
import './DescoperaCards.css';
import travelIcon from '../Layout/front-page/icons/travel.jpg';
import learnIcon from '../Layout/front-page/icons/learn.jpg';
import newsIcon from '../Layout/front-page/icons/news.jpg';
import educationIcon from '../Layout/front-page/icons/education.png';

const DescoperaCards = () => {
  return (
    <div className="descopera-cards">
      <div className="descopera-cards__header">
        <h1 className="descopera-cards__title">Descoperă Norvegia</h1>
        <p className="descopera-cards__subtitle">Curiozități, natură și tradiții</p>
      </div>
      <div className="descopera-cards__grid">
        <Card imgsrc={travelIcon} title="Aurore boreale" path="/descopera/aurore-boreale" description="Nordlys – unde și când să le vezi, mituri și fenomene." />
        <Card imgsrc={learnIcon} title="Fiorduri și natură" path="/descopera/fiorduri" description="Peste 1000 de fiorduri, Geiranger, Sognefjord și Preikestolen." />
        <Card imgsrc={educationIcon} title="Dreptul la natură" path="/descopera/dreptul-la-natura" description="Allemannsretten – drumi, campa și pescui liber în natură." />
        <Card imgsrc={newsIcon} title="Tradiții norvegiene" path="/descopera/traditii" description="17 mai, kos, lutefisk și obiceiuri distinctive." />
      </div>
    </div>
  );
};

export default DescoperaCards;
