import React from 'react';
import './layout.css';
import Imaginesteag from '../images/steag.png';
import styled from 'styled-components';


const NumberCell = styled(Imaginesteag)`
&& {
  width: 100px;
  }
`

const Layout = () => {
    return(
    
        <div  className="imagine">
            <div className="darkbackground textcenter"> <h1 className="text">Invata Limba Norvegiana:
                <li>Vocabular</li>
                <li>Gramatica</li>
                <li>Exercitii</li>  
                            
                </h1></div>
            
            {/* <img alt="imagine" className="steag" src={Imaginesteag}></img> */}
        </div>
        
      
    )
}


export default Layout;