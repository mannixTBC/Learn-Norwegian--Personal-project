import React from 'react';
import Chestionar1 from '../Components/Chestionar/chestionar1';
import styled from 'styled-components';


const Chestionar = styled(Chestionar1)`
    display:flex;
`

const Gramatica = () =>{
    return(
        <div>
            <h1>Gramatica</h1>
            <Chestionar/>
        </div>
    )
}

export default Gramatica;