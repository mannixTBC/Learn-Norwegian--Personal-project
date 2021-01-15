import React from 'react';
import styled from 'styled-components';
import Task from './task.js';
import {Droppable} from 'react-beautiful-dnd';


const Container = styled.div`
    
    padding-bottom:8px;
    border : 1px solid lightgray;
    border-radius:2px;
    width:220px;
    display:flex;
    flex-direction : column;
`;
const Title = styled.h3`
    padding:8px;
`;
const TasksList = styled.div`
    padding:8px;
    flex-frow:1;
    min-height:100px;
`;



export default class Column extends React.Component{

    render(){
        return (
            <Container>
                <Title> {this.props.column.title} </Title>
                <Droppable droppableId={this.props.column.id}>
                 {(provided)=>(<TasksList {...provided.droppableProps} ref={provided.innerRef}> 
                                    {this.props.tasks.map((task,index)=>{ return <Task key={task.id} task={task} index={index}/> })} 
                                    {provided.placeholder}
                            </TasksList>)}
                </Droppable>
            </Container>

        )
    }

}