import React from 'react';
import './Footer.css';

/** Subsolul paginii — afișat pe toate rutele */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__meta">
          <span>© {currentYear}</span>
          <span className="footer__separator" aria-hidden="true">•</span>
          <span>Creat de Mannix</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
