import {ui} from '../../languages/messages.js';
import React from 'react';
import { Link } from 'react-router-dom';
import '../common/Article.css';

const Acte = () => {
  return (
    <article className="articol-stiri">
      <Link to="/joburi" className="articol-stiri__back">{ui('web_c7324323e36e32f0')}</Link>
      <div className="articol-stiri__card">
        <div className="articol-stiri__header">
          <p className="articol-stiri__meta">{ui('web_6f12412380f8dfaf')}</p>
          <h1 className="articol-stiri__title">{ui('web_70afc0c85fb45c9c')}</h1>
          <p className="articol-stiri__lead">{ui('web_a62ac09ed7a8531c')}</p>
        </div>
        <div className="articol-stiri__body">
        <section>
          <h2>{ui('web_8ca2582c329da76b')}</h2>
          <p>
            <strong>{ui('web_73e17eaa7317b470')}</strong>{ui('web_68669b670b95e811')}<strong>{ui('web_8b7fe38c74f492f2')}</strong>{ui('web_97824e315d2a0d43')}</p>
        </section>

        <section>
          <h2>{ui('web_2d4e391fa4f22015')}</h2>
          <p>{ui('web_f6a6b16a9a07ca21')}<strong>{ui('web_ae8e809085c74aad')}</strong>{ui('web_d4649942ab6d7491')}</p>
          <p>{ui('web_e18f847e308d3c07')}</p>
        </section>

        <section>
          <h2>{ui('web_937fe31db87538ef')}</h2>
          <p>
            <strong>{ui('web_a9eb35e6b9ebd375')}</strong>{ui('web_70d77a4644f7055b')}</p>
          <p>
            <strong>{ui('web_a4caeac1df71d541')}</strong>{ui('web_b774d83ff64ea270')}</p>
        </section>

        <section>
          <h2>{ui('web_15c6c23c59f00ccd')}</h2>
          <p>
            <strong>{ui('web_15c6c23c59f00ccd')}</strong>{ui('web_bee5da792d9a7daf')}</p>
        </section>

        <section>
          <h2>{ui('web_d9bd419c2c97cb90')}</h2>
          <p>
            <strong>{ui('web_0f5fed1791e0ff94')}</strong>{ui('web_d49a53657e23c3e4')}</p>
          <p>
            <strong>{ui('web_97f273ae2bd986a1')}</strong>{ui('web_103e2b1b383747fd')}</p>
        </section>

        <section>
          <h2>{ui('web_ee132c8ed613d9c3')}</h2>
          <p>
            <strong>{ui('web_17b606642ecac94d')}</strong>{ui('web_0ce402b6f208af93')}</p>
          <p>
            <strong>{ui('web_55dbac3b4fab7c80')}</strong>{ui('web_3b83a0cf435b8a40')}</p>
          <p>
            <strong>{ui('web_86db6d70a99073d8')}</strong>{ui('web_11d5832ab7d8cca9')}</p>
        </section>

        <section>
          <h2>{ui('web_c844efdcf2ecda01')}</h2>
          <p>{ui('web_695fb8cf0024e011')}</p>
        </section>
        </div>
      </div>
    </article>
  );
};

export default Acte;
