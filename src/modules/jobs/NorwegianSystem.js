import {ui} from '../../languages/messages.js';
import React from 'react';
import { Link } from 'react-router-dom';
import '../common/Article.css';

const SistemulNorvegian = () => {
  return (
    <article className="articol-stiri">
      <Link to="/joburi" className="articol-stiri__back">{ui('web_c7324323e36e32f0')}</Link>
      <div className="articol-stiri__card">
        <div className="articol-stiri__header">
          <p className="articol-stiri__meta">{ui('web_f6100136aa35aeda')}</p>
          <h1 className="articol-stiri__title">{ui('web_aafbcdb1883ee130')}</h1>
          <p className="articol-stiri__lead">{ui('web_1e804543d3a38bbb')}</p>
        </div>
        <div className="articol-stiri__body">
        <section>
          <h2>{ui('web_2c41c9e91f2d8911')}</h2>
          <p>{ui('web_1f3ef72a5d1c1ed9')}</p>
          <p>{ui('web_6eee8379259a8a04')}</p>
          <p>{ui('web_f4eb91bb6a3bd1a1')}</p>
        </section>

        <section>
          <h2>{ui('web_f2c766de8b4063ad')}</h2>
          <p>
            <strong>{ui('web_a4caeac1df71d541')}</strong>{ui('web_1b6413001c0acfd4')}</p>
          <p>
            <strong>{ui('web_a9eb35e6b9ebd375')}</strong>{ui('web_2a59d834deb66f39')}</p>
          <p>{ui('web_6ee43a5d28ab4588')}</p>
        </section>

        <section>
          <h2>{ui('web_b3667f19a72bcbab')}</h2>
          <p>
            <strong>{ui('web_4f69f28f7aba34cd')}</strong>{ui('web_54a0b0c19d5bfabc')}</p>
          <p>{ui('web_cc4567cabdf0c618')}</p>
          <p>{ui('web_c08adf5c75ec8f5b')}</p>
          <p>{ui('web_20598ab308e88057')}</p>
        </section>

        <section>
          <h2>{ui('web_016317907a1db4ee')}</h2>
          <p>
            <strong>{ui('web_f69e7bb0d4da9f35')}</strong>{ui('web_f62ce21548306308')}<strong>{ui('web_1648920909fd1225')}</strong>{ui('web_1d773bed0d45ad3b')}</p>
          <p>{ui('web_b8e02dc7a7c5b391')}</p>
        </section>

        <section>
          <h2>{ui('web_2ffa491bf66f3834')}</h2>
          <p>{ui('web_85a4d000c5724f6a')}</p>
        </section>
        </div>
      </div>
    </article>
  );
};

export default SistemulNorvegian;
