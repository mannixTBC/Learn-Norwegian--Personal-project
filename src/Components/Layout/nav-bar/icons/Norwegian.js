import React from 'react';
import Steag from './norway.png';
import styled from 'styled-components';


const Container = styled.div`
    margin-left:auto;
`

const NorwegianFlagIcon = () => {
    return(
        <Container>
            <img src={Steag} />
        </Container>
    )
}


export default NorwegianFlagIcon;