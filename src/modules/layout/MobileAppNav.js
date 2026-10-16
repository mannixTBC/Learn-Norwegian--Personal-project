import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MobileAppNav.css';

const icons = {
  home: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 11 8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1Z" /></svg>,
  lessons: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5.5c3.2-.7 5.7 0 7.5 1.7v12c-1.8-1.7-4.3-2.4-7.5-1.7ZM19.5 5.5c-3.2-.7-5.7 0-7.5 1.7v12c1.8-1.7 4.3-2.4 7.5-1.7Z" /></svg>,
  games: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 9h8a5 5 0 0 1 4.8 3.6l1 3.6a2.8 2.8 0 0 1-4.7 2.7L15.2 17H8.8l-1.9 1.9a2.8 2.8 0 0 1-4.7-2.7l1-3.6A5 5 0 0 1 8 9Z" /><path d="M7 12v4M5 14h4M16.5 13h.1M18.5 15h.1" /></svg>,
  account: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.25" /><path d="M5.5 20c.5-4.1 2.7-6.2 6.5-6.2s6 2.1 6.5 6.2" /></svg>,
};

const MobileAppNav = ({ activeLevel }) => {
  const location = useLocation();
  const storedLevel = typeof window !== 'undefined' ? window.localStorage.getItem('norwegian_active_level') : '';
  const level = activeLevel || (/^(A1|A2|B1|B2)$/.test(storedLevel) ? storedLevel : 'A1');
  const items = [
    { id: 'home', label: 'Acasă', to: '/dashboard', active: location.pathname === '/dashboard' },
    { id: 'lessons', label: 'Lecții', to: `/invata?nivel=${level}`, active: ['/invata', '/invata-limba'].includes(location.pathname) },
    { id: 'games', label: 'Jocuri', to: `/jocuri?nivel=${level}`, active: false },
    { id: 'account', label: 'Cont', to: '/cont', active: location.pathname === '/cont' },
  ];

  return (
    <nav className="mobile-app-nav" aria-label="Navigația aplicației">
      {items.map((item) => (
        <Link className={item.active ? 'active' : ''} to={item.to} aria-current={item.active ? 'page' : undefined} key={item.id}>
          <span className="mobile-app-nav__icon">{icons[item.id]}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default MobileAppNav;
