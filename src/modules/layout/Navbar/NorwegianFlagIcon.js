import {ui} from '../../../languages/messages.js';
import React from 'react';
import './NorwegianFlagIcon.css';

const logoImage = '/branding/nordlingo-selected-color.png';

/** Identitatea vizuală NordLingo. */
const NorwegianFlagIcon = ({ className }) => (
  <span className={className}>
    <img src={logoImage} alt={ui('ui_ee728f3245aed708')} />
  </span>
);

export default NorwegianFlagIcon;
