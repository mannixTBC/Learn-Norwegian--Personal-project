import React from 'react';
import './NorwegianFlagIcon.css';

const logoImage = '/branding/nordlingo-selected-color.png';

/** Identitatea vizuală NordLingo. */
const NorwegianFlagIcon = ({ className }) => (
  <span className={className}>
    <img src={logoImage} alt="NordLingo" />
  </span>
);

export default NorwegianFlagIcon;
