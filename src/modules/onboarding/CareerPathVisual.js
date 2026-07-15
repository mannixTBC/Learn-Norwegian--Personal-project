import React from 'react';
import './CareerPathVisual.css';

const icons = {
  transport: <><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
  hospitality: <><path d="M4 17h16" /><path d="M6 15a6 6 0 0 1 12 0" /><path d="M12 6V4" /><path d="M10 4h4" /></>,
  construction: <><path d="m14 5 5 5" /><path d="m12.5 6.5 3-3 5 5-3 3" /><path d="m13 9-8.5 8.5a1.8 1.8 0 0 0 2.5 2.5l8.5-8.5" /></>,
  healthcare: <><path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.8l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z" /><path d="M7 13h3l1.2-3 2 6 1.3-3H17" /></>,
  cleaning: <><path d="m14 4 1 2.5L17.5 8 15 9.5 14 12l-1-2.5L10.5 8 13 6.5Z" /><path d="m6 12 .8 1.8L9 15l-2.2 1.2L6 18l-.8-1.8L3 15l2.2-1.2Z" /><path d="M15.5 15.5 19 19" /><path d="M18 14.5 20.5 17" /></>,
  retail: <><path d="M5 8h14l-1 12H6Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /><path d="M9 13h6" /></>,
  office: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /><path d="m8 10 2 2 4-4 2 2" /></>,
  studies: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v18H7.5A3.5 3.5 0 0 0 4 23Z" /><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v18h4.5A3.5 3.5 0 0 1 20 23Z" /></>,
  family: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /><circle cx="9" cy="13" r="1.5" /><circle cx="15" cy="13" r="1.5" /><path d="M8 18c1-2 7-2 8 0" /></>,
  general: <><path d="M21 12a8 8 0 0 1-8 8H6l-4 2 1.5-4A8 8 0 1 1 21 12Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
};

const CareerPathVisual = ({ pathId, className = '' }) => (
  <span className={`career-path-visual career-path-visual--${pathId} ${className}`.trim()} aria-hidden="true">
    <svg viewBox="0 0 24 24" focusable="false">{icons[pathId] || icons.general}</svg>
  </span>
);

export default CareerPathVisual;
