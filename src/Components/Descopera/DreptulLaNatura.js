import React from 'react';
import { Link } from 'react-router-dom';
import '../Joburi/articol-stiri.css';

const DreptulLaNatura = () => (
  <article className="articol-stiri">
    <Link to="/descopera" className="articol-stiri__back">← Înapoi la Descoperă</Link>
    <div className="articol-stiri__card">
      <div className="articol-stiri__header">
        <p className="articol-stiri__meta">Curiozitate · Cultură</p>
        <h1 className="articol-stiri__title">Allemannsretten – dreptul la acces în natură</h1>
        <p className="articol-stiri__lead">
          În Norvegia, oricine poate drumi, campa sau pescui în natură – chiar și pe proprietate privată. Este un drept fundamental scris în lege.
        </p>
      </div>
      <div className="articol-stiri__body">
        <section>
          <h2>Ce înseamnă?</h2>
          <p>
            <strong>Allemannsretten</strong> („dreptul tuturor”) permite acces liber în păduri, munți, lacuri și țărm – cu excepția curților și livezilor private. Poți plimba, drumi, campa o noapte (la minimum 150 m de case), culege fructe de pădure și ciuperci. Ideea: natura aparține tuturor.
          </p>
        </section>
        <section>
          <h2>Obligații</h2>
          <p>
            Trebuie să lași totul cum l-ai găsit: nu distruge, nu lăsa gunoi, nu deranja animalele. Focul e permis în locuri sigure, dar interzis în pădure între 15 aprilie și 15 septembrie din cauza riscului de incendiu. Campingul pe termen lung (peste 2 zile) cere acordul proprietarului.
          </p>
        </section>
        <section>
          <h2>De ce în România nu avem așa ceva?</h2>
          <p>
            În Norvegia, tradiția e seculare – oamenii au mers liber în natură pentru vânătoare, pășunat și culegere. Legea din 1957 a oficializat acest drept. În România, proprietatea privată și lipsa unui cadru similar fac imposibil un astfel de acces liber – dar unele țări (Suedia, Finlanda, Scoția) au legi similare.
          </p>
        </section>
      </div>
    </div>
  </article>
);

export default DreptulLaNatura;
