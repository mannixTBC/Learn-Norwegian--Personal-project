import React from 'react';
import { Link } from 'react-router-dom';
import '../common/Article.css';

const AuroreBoreale = () => (
  <article className="articol-stiri">
    <Link to="/descopera" className="articol-stiri__back">← Înapoi la Descoperă</Link>
    <div className="articol-stiri__card">
      <div className="articol-stiri__header">
        <p className="articol-stiri__meta">Curiozitate · Nord</p>
        <h1 className="articol-stiri__title">Aurore boreale – dansul luminilor în cer</h1>
        <p className="articol-stiri__lead">
          Nordlys, cum le numesc norvegienii, sunt unul dintre cele mai spectaculoase fenomene naturale de pe pământ. Iată câteva lucruri fascinante despre ele.
        </p>
      </div>
      <div className="articol-stiri__body">
        <section>
          <h2>Ce sunt aurorele boreale?</h2>
          <p>
            Aurorele boreale (nordlys) apar când particulele solare încărcate electric intră în atmosfera terestră și colidează cu gazele – în special oxigenul și azotul. Rezultatul: cortine de lumină verde, albastră, violetă sau roșie care se mișcă pe cer pe timp de noapte.
          </p>
        </section>
        <section>
          <h2>Unde și când le vezi în Norvegia?</h2>
          <p>
            Cele mai bune locuri sunt în nord: <strong>Tromsø</strong>, <strong>Lofoten</strong>, <strong>Alta</strong>, <strong>Capul Nord</strong>. Sezonul principal este de la sfârșitul lui septembrie până în martie, când nopțile sunt lungi și cerul e întunecat. Vremea senină și absența poluării luminoase sunt esențiale.
          </p>
        </section>
        <section>
          <h2>Mitul norvegian</h2>
          <p>
            În folclor, nordlys erau considerate coada unei vulpi care alerga prin munți și lustruia zăpada cu coada ei – de aici și expresia „revva” (vulpe) în unele dialecte. Unele legende spun că nu trebuie să faci gesturi sau să șuieri în timpul aurorilor, altfel te vor „lua” – o superstiție care persistă în unele zone.
          </p>
        </section>
      </div>
    </div>
  </article>
);

export default AuroreBoreale;
