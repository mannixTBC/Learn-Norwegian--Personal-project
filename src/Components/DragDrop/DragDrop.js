import React, {useState} from 'react';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import uuid from 'uuid/v4';

const itemsFromBackEnd = [
    {id:uuid(), content:'first task'},
    {id:uuid(), content:'second task'}
]

const columnsFromBackEnd = {
        [uuid()]:{
            name:'Jeg heter',
            items : []
        },
        [uuid()]:{
            name:'Hun heter Simona og hun har kjopte en ny bill',
            items : []
        },
        [uuid()]:{
            name:'Selecteaza raspunsul corect',
            items : itemsFromBackEnd
        }
};

const onDragEnd = (result, columns, setColumns) => {
    if(!result.destination)return
    const {source, destination} = result
    if(source.droppableId !== destination.droppableId){

        const sourceColumn = columns[source.droppableId];
        const destColumn = columns[destination.droppableId];
        const sourceItems = [...sourceColumn.items];
        const destItems = [...destColumn.items];
        const [removed] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, removed);
        setColumns({
            ...columns,
            [source.droppableId] : {
                ...sourceColumn,
                items: sourceItems
            },
            [destination.droppableId]: {
                ...destColumn,
                items: destItems
            }
        })
    }else{
    const column = columns [source.droppableId];
    const copiedItems = [...column.items];
    const [removed] = copiedItems.splice(source.index, 1);
    copiedItems.splice(destination.index, 0, removed);
    setColumns({
        ...columns,
        [source.droppableId]:{
            ...column,
            items: copiedItems
        }
    })
    }
}

function DragDrop(){
    const [columns, setColumns] = useState(columnsFromBackEnd)

    return(
        <div style={{display:"flex", justifyContent:"left", height:"100%"}}>
            <DragDropContext onDragEnd= {result => onDragEnd(result,columns,setColumns)} >
            {Object.entries(columns).map(([id,column])=>{
                return(
                    <div style= {{display:"flex", flexDirection:"row", alignItems:"center"}}> 
                        <h4>{column.name}</h4>
                        <div style={{margin:8}}>
                    <Droppable droppableId={id} key={id}>
                        {(provided, snapshot) => {
                            return(
                                <div
                                {...provided.droppableProps}
                                ref= {provided.innerRef}
                                style= {{
                                    background:snapshot.isDraggingOver ? 'lighblue' : 'lightgrey',   //  de rezolvat
                                    padding:4,
                                    width: 100,
                                    minHeight: 30
                                }}
                                >
                                    {column.items.map((item,index) => {
                                        return(
                                            <Draggable key={item.id} draggableId = {item.id}index={index} >
                                                    {(provided,snapshot)=>{
                                                        return(<div
                                                        ref = {provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style = {{
                                                            userSelect:'none',
                                                            padding: 3,
                                                            margin: '0 0 8px 0',
                                                            minHeight: '25px',
                                                            backgroundColor: snapshot.isDragging ? '#263B4A' : '#456C86',
                                                            color: 'white',
                                                            ...provided.draggableProps.style
                                                        }}
                                                        >
                                                            {item.content}
                                                        </div>)
                                                    }}
                                            </Draggable>
                                        )
                                    })}
                                    {provided.placeholder}
                                </div>
                            )
                        }}
                    </Droppable>
                    
                    </div>
                    </div>
                )
                
            })}
            </DragDropContext>
            
        </div>
    )
}



export default DragDrop;