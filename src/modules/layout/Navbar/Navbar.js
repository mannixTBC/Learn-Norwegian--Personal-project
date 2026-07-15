import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import NorwegianFlagIcon from './NorwegianFlagIcon';
import { useAuth } from '../../auth/AuthContext';
import './Navbar.css';

const navigation = [
  { to: '/dashboard', label: 'Profil' },
  { to: '/invata', label: 'Învață' },
  { to: '/descopera', label: 'Descoperă' },
  { to: '/viata-in-norvegia', label: 'Viața în Norvegia' },
];

const UserAvatar = ({ user, menu = false }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const avatarUrl = user && !user.isGuest ? user.avatarUrl : '';
  const variantClass = menu ? ' navbar__avatar--menu' : '';

  useEffect(() => {
    setImageFailed(false);
  }, [avatarUrl]);

  if (avatarUrl && !imageFailed) {
    return (
      <img
        className={`navbar__avatar navbar__avatar--photo${variantClass}`}
        src={avatarUrl}
        alt={`Fotografia de profil pentru ${user.name}`}
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
      />
    );
  }

  if (user && user.isGuest) {
    return (
      <span className={`navbar__avatar navbar__avatar--guest${variantClass}`} aria-label="Profil de vizitator">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="3.25" />
          <path d="M5.5 20c.5-4.1 2.7-6.2 6.5-6.2s6 2.1 6.5 6.2" />
        </svg>
      </span>
    );
  }

  return (
    <span className={`navbar__avatar navbar__avatar--initial${variantClass}`} aria-label={`Profil pentru ${user.name}`}>
      {user.name.charAt(0).toUpperCase()}
    </span>
  );
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navbarRef = useRef(null);
  const toggleRef = useRef(null);
  const { user, logout } = useAuth();
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const closeOnOutsideClick = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) setMenuOpen(false);
    };

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        window.requestAnimationFrame(() => toggleRef.current && toggleRef.current.focus());
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="navbar" ref={navbarRef}>
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
          <div className="navbar__mobile-account">
            {user ? (
              <>
                <Link className="navbar__mobile-user" to="/dashboard" onClick={closeMenu} aria-label="Deschide profilul">
                  <UserAvatar user={user} menu />
                  <div>
                    <small>{user.isGuest ? 'Mod vizitator' : 'Contul tău'}</small>
                    <strong>{user.name}</strong>
                  </div>
                </Link>
                <button type="button" className="navbar__mobile-logout" onClick={() => { logout(); closeMenu(); }}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M10 5H6.8A1.8 1.8 0 0 0 5 6.8v10.4A1.8 1.8 0 0 0 6.8 19H10M14.5 8.5 18 12l-3.5 3.5M9 12h9" />
                  </svg>
                  <span>Deconectare</span>
                </button>
              </>
            ) : (
              <Link className="navbar__mobile-login" to="/autentificare" onClick={closeMenu}>Conectare</Link>
            )}
          </div>
        </nav>

        <div className="navbar__account">
          {user ? <><Link className="navbar__user" to="/dashboard" onClick={closeMenu} aria-label="Deschide profilul"><UserAvatar user={user} /><div><small>{user.isGuest ? 'Mod anonim' : 'Conectat'}</small><strong>{user.name}</strong></div></Link><button type="button" className="navbar__logout" onClick={() => { logout(); closeMenu(); }}>Ieșire</button></> : <Link className="navbar__login" to="/autentificare" onClick={closeMenu}>Conectare</Link>}
        </div>

        <button
          ref={toggleRef}
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
      {menuOpen && <div className="navbar__backdrop" aria-hidden="true" />}
    </>
  );
}
