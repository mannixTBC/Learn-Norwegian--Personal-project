import React, { Component } from 'react';
import styled from 'styled-components';
import Draggable from '../Draggble/index';
import Droppable from '../Droppble/index';


const Wrapper = styled.div`
    width:100%;
    padding:32px;
    display:flex;
    justify-content:center;
`

const Item = styled.div`
    padding: 8px;
    color: 555#;
    background-color: white;
    border-radius: 3px;
`

const droppableStyle = {
    backgroundColor: '#555',
    width:'250px',
    height: '400px',
    margin: '32px'

}

const droppableStyleText = {
    backgroundColor: '#555',
    width:'100px',
    height: '20px',
    margin: '5px'

}

const droppableStyleParagraf = {
    backgroundColor: 'white',
    display:'inline-flex'

}



export default class DndTest extends Component{
    render(){
        return(
            <div>
                <Wrapper>
                        
                <div>
                <p style={droppableStyleParagraf}>Jeg kan mange <Droppable id='dr2' style={droppableStyleText}>.</Droppable></p><br/>
                <p>Noen <Droppable id='dr3' style={droppableStyleText}><p>er vanskelig a laere.</p> </Droppable></p>
                <p>Jeg husker ikke alle <Droppable id='dr4' style={droppableStyleText}> i tekstene</Droppable></p>
                </div>       
                <div>      
                        <Droppable id='dr1' style={droppableStyle}>
                            <Draggable id='item1' style={{margin:'8px', color:'red'}}>   Text  </Draggable>
                            <Draggable id='item2' style={{margin:'8px'}}>   Some other Text  </Draggable>
                        </Droppable>

                </div>  
                </Wrapper>
            </div>
        )
    }
}