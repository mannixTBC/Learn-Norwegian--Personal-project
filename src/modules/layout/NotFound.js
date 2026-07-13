import React from 'react';
import { Link } from 'react-router-dom';
import './SectionHub.css';

const NotFound = () => (
  <div className="section-hub">
    <header className="section-hub__header">
      <p className="section-hub__eyebrow">Eroare 404</p>
      <h1 className="section-hub__title">Pagina nu a fost găsită</h1>
      <p className="section-hub__subtitle">Adresa poate fi greșită sau pagina a fost mutată în noua structură.</p>
    </header>
    <Link className="landing__button landing__button--primary" to="/">Înapoi la pagina principală</Link>
  </div>
);

export default NotFound;
