import React from 'react';
import Steag from './norway.png';
import styled from 'styled-components';


const Container = styled.div`
    margin-left:auto;
`

const NorwegianFlagIcon = ({ className }) => {
    return(
        <Container className={className}>
            <img src={Steag} alt="NorvegiaTa" />
        </Container>
    )
}


export default NorwegianFlagIcon;