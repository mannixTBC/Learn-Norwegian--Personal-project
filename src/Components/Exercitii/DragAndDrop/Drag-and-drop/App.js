import React from 'react';
import initialData from './initial-data';
import Column from './column.js';
import {DragDropContext} from 'react-beautiful-dnd';
import styled from 'styled-components';


const Container = styled.div`
  display:flex;

`



class App extends React.Component {

  state = initialData
  onDragEnd = (result)=>{
    const {destination, source, draggableId} = result;
    if(!destination){
      return
    }
    if(
      destination.droppableId === source.droppableId && 
      destination.index === source.index
    ){
      return
    };
    const start = this.state.columns[source.droppableId];
    const finish = this.state.columns[destination.droppableId];
    if(start === finish){
      const newTaskIds =Array.from(start.taskIds);
      newTaskIds.splice(source.index,1);
      newTaskIds.splice(destination.index,0,draggableId)
  
      const newColumn = {
        ...start,
        taskIds : newTaskIds
      }
  
      const newState = {
        ...this.state,
        columns : {
          ...this.state.columns,
          [newColumn.id]: newColumn,
        }
      }
      this.setState(newState);
    }

    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index,1);

    const newStart = {
      ...start,
      taskIds:startTaskIds,
    }

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index,0,draggableId);

    const newFinish = {
      ...finish,
      taskIds:finishTaskIds,
    }

    
    let correctAnswers = 0;
    finishTaskIds.map((taskId)=>{
      if(this.state.tasks[taskId].description === finish.description)
        {
          correctAnswers +=  1
          console.log(`numarul de alegeri corecte este ${correctAnswers}`)
        }else{
          console.log('raspuns eronat')
        }
        return correctAnswers
    })

    const newState= {
      ...this.state,
      columns:{
        ...this.state.columns,
        [newStart.id]:newStart,
        [newFinish.id]:newFinish,
      }
    }

    
    this.setState(newState);
    

    
    
  }
handleAnswers = (result)=>{
    const {destination, source, draggableId} = result;
    if(!destination){
      return
    }
    if(
      destination.droppableId === source.droppableId && 
      destination.index === source.index
    ){
      return
    };
    const start = this.state.columns[source.droppableId];
    const finish = this.state.columns[destination.droppableId];
  

    const taskIdss = Array.from(finish.taskIds);
    let correctAnswers = 0;
    taskIdss.map((taskId)=>{
      if(this.state.tasks[taskId].description === finish.description)
        {
          correctAnswers +=  1
          console.log(correctAnswers)
        }else{
          console.log('error')
        }
        return correctAnswers
    })
   const newState = {
      ...this.state,
      correctAnswers: correctAnswers,
    }
  }

  render(){
    
    return (<div>
        <h1>Drag the words in the correct tabel</h1>
        <DragDropContext
        onDragEnd={this.onDragEnd}
        >
          <Container>
          {this.state.columnOrder.map((columnId)=> {
          const column = this.state.columns[columnId];
          const tasks = column.taskIds.map((taskId) => this.state.tasks[taskId] );
          return <Column key = {columnId} column={column} tasks ={tasks}/>
          })}
          </Container>
        </DragDropContext>
        <button onClick={this.handleAnswers}>Check answers</button>
        <h3>Correct answers {this.state.correctAnswers}</h3>
        {console.log(this.state)}
        </div>
    )
  }
}

export default App;
