import {ui} from '../../languages/messages.js';
import React from 'react';
import { Link } from 'react-router-dom';
import '../common/Article.css';

const CeTrebuieSaStii = () => {
  return (
    <article className="articol-stiri">
      <Link to="/joburi" className="articol-stiri__back">{ui('web_c7324323e36e32f0')}</Link>
      <div className="articol-stiri__card">
        <div className="articol-stiri__header">
          <p className="articol-stiri__meta">{ui('web_4986391416f152c4')}</p>
          <h1 className="articol-stiri__title">{ui('web_dd34e8a3b7a57e89')}</h1>
          <p className="articol-stiri__lead">{ui('web_af9d04899dd9fe70')}</p>
        </div>
        <div className="articol-stiri__body">
        <section>
          <h2>{ui('web_9daf8cd9c532454b')}</h2>
          <p>{ui('web_16c21c2ff865aad1')}</p>
          <p>
            <strong>{ui('web_245bd4bb3f6ae733')}</strong>{ui('web_dd3179193d2ca45b')}</p>
          <p>
            <strong>{ui('web_7ceee72c340b2bf0')}</strong>{ui('web_a3e0403965ffb46f')}</p>
          <p>
            <strong>{ui('web_d2c7cf647780b7c2')}</strong>{ui('web_94303b940e5c6c1d')}</p>
        </section>

        <section>
          <h2>{ui('web_75641b2352b7eaa7')}</h2>
          <p>{ui('web_6ace78de87650d6a')}</p>
          <p>
            <strong>{ui('web_f35f07b675e9e92d')}</strong>{ui('web_b28309b09b6f06e6')}</p>
          <p>
            <strong>{ui('web_10a76b9f2eaa6364')}</strong>{ui('web_65562a4adcd79298')}</p>
          <p>{ui('web_20987064798a4150')}</p>
        </section>

        <section>
          <h2>{ui('web_e08e85b36d36608a')}</h2>
          <p>{ui('web_a348fc40be187a5c')}</p>
          <p>
            <strong>{ui('web_fa240ebdc9a25e0e')}</strong>{ui('web_e33d8908d60589f1')}</p>
          <p>
            <strong>{ui('web_d2d1c821474d4878')}</strong>{ui('web_4ca1dc70844d3587')}</p>
          <p>
            <strong>{ui('web_659857aa208cb7e4')}</strong>{ui('web_3ad9752d97d86141')}</p>
          <p>
            <strong>{ui('web_d1bab30d33de47ba')}</strong>{ui('web_698c13d8aa38b8ad')}</p>
          <p>
            <strong>{ui('web_e2da1fcce90f8b88')}</strong>{ui('web_06c23063b36ab3fd')}</p>
          <p>{ui('web_71dc09d67b989fd3')}</p>
        </section>

        <section>
          <h2>{ui('web_5664eaffbe9a7b99')}</h2>
          <p>
            <strong>{ui('web_2b14c02b6bcee487')}</strong>{ui('web_01e3fd12494b4498')}</p>
          <p>
            <strong>{ui('web_943b814bb879e11a')}</strong>{ui('web_a68f75d8921ee8a9')}</p>
          <p>
            <strong>{ui('web_c34f4ba5a32846b5')}</strong>{ui('web_7235f8c422b176a6')}</p>
          <p>
            <strong>{ui('web_0212e4d1bcedca83')}</strong>{ui('web_9683f59f9c4215c2')}</p>
          <p>
            <strong>{ui('web_242afce229973616')}</strong>{ui('web_d07d39267166e6fe')}</p>
          <p>
            <strong>{ui('web_4995e14a10c845c0')}</strong>{ui('web_2a26497e56eefbf7')}</p>
        </section>
        </div>
      </div>
    </article>
  );
};

export default CeTrebuieSaStii;
