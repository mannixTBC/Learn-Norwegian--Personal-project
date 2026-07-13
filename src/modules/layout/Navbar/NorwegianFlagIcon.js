import React from 'react';
import flagImage from './icons/norway.png';
import styled from 'styled-components';
import './NorwegianFlagIcon.css';

const Container = styled.div`
  margin-left: auto;
`;

/** Iconița steagului norvegian din logo */
const NorwegianFlagIcon = ({ className }) => (
  <Container className={className}>
    <img src={flagImage} alt="NorvegiaTa" />
  </Container>
);

export default NorwegianFlagIcon;
