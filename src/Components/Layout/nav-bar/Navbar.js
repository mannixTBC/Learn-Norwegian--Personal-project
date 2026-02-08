import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NorwegianFlagIcon from './icons/Norwegian';
import './nav.css';

const NavLink = ({ to, children, onClick }) => (
  <Link to={to} className="nav-link" onClick={onClick}>
    {children}
  </Link>
);

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__logo-wrap">
          <Link to="/" className="navbar__logo">
            <NorwegianFlagIcon className="navbar__logo-icon" />
            <span>NorvegiaTa</span>
          </Link>
        </div>

        <nav className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}>
          <NavLink to="/invata-limba" onClick={() => setMenuOpen(false)}>Învață limba</NavLink>
          <NavLink to="/descopera" onClick={() => setMenuOpen(false)}>Descoperă</NavLink>
          <NavLink to="/joburi" onClick={() => setMenuOpen(false)}>Joburi</NavLink>
          <NavLink to="/wheather" onClick={() => setMenuOpen(false)}>Vreme</NavLink>
          <NavLink to="/news" onClick={() => setMenuOpen(false)}>Știri</NavLink>
        </nav>

        <div className="navbar__right">
          <button
            type="button"
            className="navbar__toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Meniu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
