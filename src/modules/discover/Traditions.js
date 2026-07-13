import React from 'react';
import { Link } from 'react-router-dom';
import '../common/Article.css';

const Traditii = () => (
  <article className="articol-stiri">
    <Link to="/descopera" className="articol-stiri__back">← Înapoi la Descoperă</Link>
    <div className="articol-stiri__card">
      <div className="articol-stiri__header">
        <p className="articol-stiri__meta">Curiozitate · Cultură</p>
        <h1 className="articol-stiri__title">Tradiții și obiceiuri norvegiene</h1>
        <p className="articol-stiri__lead">
          De la 17 mai (Ziua Constituției) la lutefisk și kos – câteva obiceiuri care definesc Norvegia.
        </p>
      </div>
      <div className="articol-stiri__body">
        <section>
          <h2>17. mai – Nasjonaldagen</h2>
          <p>
            Ziua națională a Norvegiei se sărbătorește cu parade colorate, costume tradiționale (bunad) și multe steaguri. Nu e despre militarism – e despre comunitate și bucurie. Copiii marșăluiesc pe străzi cu orchestre școlare. Mulți norvegieni iau un frikjøtt (carne rece) la prânz și se întâlnesc cu familia și prietenii.
          </p>
        </section>
        <section>
          <h2>Kos – confortul norvegian</h2>
          <p>
            <strong>Kos</strong> (sau koselig) înseamnă cald, confortabil, plăcut – o atmosferă intimă. Un vin la lumina lumânărilor, o plimbare pe zăpadă, o cină cu prietenii – toate pot fi „kos”. Norvegienii valorizează aceste momente simple și se retrag în natură sau acasă pentru a le trăi.
          </p>
        </section>
        <section>
          <h2>Mâncăruri distinctive</h2>
          <p>
            <strong>Lutefisk</strong> – cod tratat cu leșie, mâncat de mulți la Crăciun (gustul e special!). <strong>Brunost</strong> – brânză maro de capră, dulce, pe pâine. <strong>Rakfisk</strong> – pește fermentat (cu miros puternic). <strong>Fårikål</strong> – varză cu miel, felul național de toamnă. <strong>Kvikk Lunsj</strong> – ciocolată asemănătoare cu Kit Kat, esențială la drumeții.
          </p>
        </section>
      </div>
    </div>
  </article>
);

export default Traditii;
