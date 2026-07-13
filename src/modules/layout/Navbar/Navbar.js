import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import NorwegianFlagIcon from './NorwegianFlagIcon';
import { useAuth } from '../../auth/AuthContext';
import './Navbar.css';

const navigation = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/invata', label: 'Învață' },
  { to: '/descopera', label: 'Descoperă' },
  { to: '/viata-in-norvegia', label: 'Viața în Norvegia' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo" onClick={closeMenu}>
          <NorwegianFlagIcon className="navbar__logo-icon" />
          <span>NorvegiaTa</span>
        </Link>

        <nav
          id="main-navigation"
          className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}
          aria-label="Navigație principală"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="nav-link"
              activeClassName="nav-link--active"
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__account">
          {user ? <><div className="navbar__user"><span>{user.isGuest ? 'V' : user.name.charAt(0).toUpperCase()}</span><div><small>{user.isGuest ? 'Mod anonim' : 'Conectat'}</small><strong>{user.name}</strong></div></div><button type="button" className="navbar__logout" onClick={() => { logout(); closeMenu(); }}>Ieșire</button></> : <Link className="navbar__login" to="/autentificare" onClick={closeMenu}>Conectare</Link>}
        </div>

        <button
          type="button"
          className={`navbar__toggle ${menuOpen ? 'navbar__toggle--open' : ''}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Închide meniul' : 'Deschide meniul'}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
