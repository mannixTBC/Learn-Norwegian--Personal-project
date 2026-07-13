import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import './Word.css';

export default function Word({ word, index }) {
  return (
    <Draggable draggableId={word.id} index={index}>
      {(provided) => (
        <div
          className="word"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {word.text}
        </div>
      )}
    </Draggable>
  );
}
