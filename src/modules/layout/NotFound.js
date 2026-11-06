import {ui} from '../../languages/messages.js';
import React from 'react';
import { Link } from 'react-router-dom';
import './SectionHub.css';

const NotFound = () => (
  <div className="section-hub">
    <header className="section-hub__header">
      <p className="section-hub__eyebrow">{ui('web_65ddfd6a48e3abb4')}</p>
      <h1 className="section-hub__title">{ui('web_649c2f13b8f9e7c7')}</h1>
      <p className="section-hub__subtitle">{ui('web_56b34b4a180e66e1')}</p>
    </header>
    <Link className="landing__button landing__button--primary" to="/">{ui('web_73ac6596bbaeb287')}</Link>
  </div>
);

export default NotFound;
