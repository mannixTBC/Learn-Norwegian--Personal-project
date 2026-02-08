import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import './column.css';

export default function Column({ droppableId, title, isEmpty, children }) {
  return (
    <div className={`column ${isEmpty ? 'column--empty' : ''}`}>
      <h3 className="column-title">{title}</h3>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <div
            className="column-dropzone"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {children}
            {provided.placeholder}
            {isEmpty && <span className="column-hint">Trage cuvinte aici</span>}
          </div>
        )}
      </Droppable>
    </div>
  );
}
