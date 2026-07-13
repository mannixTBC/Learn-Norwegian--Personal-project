import React from 'react';
import { Link } from 'react-router-dom';
import '../common/Article.css';

const Fiorduri = () => (
  <article className="articol-stiri">
    <Link to="/descopera" className="articol-stiri__back">← Înapoi la Descoperă</Link>
    <div className="articol-stiri__card">
      <div className="articol-stiri__header">
        <p className="articol-stiri__meta">Curiozitate · Natură</p>
        <h1 className="articol-stiri__title">Fiordurile – sculpturi ale gheții</h1>
        <p className="articol-stiri__lead">
          Norvegia are peste 1000 de fiorduri. Aceste văi inundate de mare sunt create de ghețari în ultima eră glaciară și oferă peisaje de neuitat.
        </p>
      </div>
      <div className="articol-stiri__body">
        <section>
          <h2>Cum s-au format?</h2>
          <p>
            Fiordurile s-au format acum mii de ani, când ghețarii au sculptat văi adânci în munți. La dezgheț, apa oceanului a inundat aceste canale, creând brațe de mare lungi și înguste, înconjurate de pereți verticali de stâncă.
          </p>
        </section>
        <section>
          <h2>Cele mai cunoscute</h2>
          <p>
            <strong>Geirangerfjord</strong> și <strong>Nærøyfjord</strong> sunt pe lista UNESCO. <strong>Sognefjord</strong> este cel mai lung (204 km) și cel mai adânc (1300 m). <strong>Hardangerfjord</strong> e vestit pentru livezi înflorite în primăvară. <strong>Lysefjord</strong> oferă Preikestolen (Pulpitura) – o stâncă plată de 600 m deasupra apei.
          </p>
        </section>
        <section>
          <h2>Vestlandet – țara fiordurilor</h2>
          <p>
            Regiunea vestică (Bergen, Stavanger, Flåm) este inima fiordurilor. Mulți turiști fac croaziere, drumeții sau călătorii cu tren (Bergen Railway, Flåm Railway) pentru a le admira. Vara e sezonul cel mai popular, dar toamna aduce culori spectaculoase.
          </p>
        </section>
      </div>
    </div>
  </article>
);

export default Fiorduri;
