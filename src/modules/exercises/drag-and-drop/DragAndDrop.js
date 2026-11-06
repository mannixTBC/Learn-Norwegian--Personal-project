import {ui} from '../../../languages/messages.js';
import React from 'react';
import initialData from './initialData';
import Column from './Column';
import Word from './Word';
import { DragDropContext } from 'react-beautiful-dnd';
import './DragAndDrop.css';

class DragAndDrop extends React.Component {
  state = { ...initialData, score: null, checked: false };

  onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Mutare în aceeași zonă (reordonare)
    if (source.droppableId === destination.droppableId) {
      const ids = source.droppableId === 'words' 
        ? [...this.state.words] 
        : [...this.state.categories[source.droppableId].wordIds];
      const [removed] = ids.splice(source.index, 1);
      ids.splice(destination.index, 0, removed);

      if (source.droppableId === 'words') {
        this.setState({ words: ids });
      } else {
        this.setState({
          categories: {
            ...this.state.categories,
            [source.droppableId]: {
              ...this.state.categories[source.droppableId],
              wordIds: ids,
            },
          },
        });
      }
      return;
    }

    // Mutare între zone diferite
    const startIds = source.droppableId === 'words'
      ? [...this.state.words]
      : [...this.state.categories[source.droppableId].wordIds];
    const finishIds = destination.droppableId === 'words'
      ? [...this.state.words]
      : [...this.state.categories[destination.droppableId].wordIds];

    const [movedId] = startIds.splice(source.index, 1);
    finishIds.splice(destination.index, 0, movedId);

    const newState = { ...this.state };

    if (source.droppableId === 'words') {
      newState.words = startIds;
    } else {
      newState.categories = {
        ...newState.categories,
        [source.droppableId]: {
          ...newState.categories[source.droppableId],
          wordIds: startIds,
        },
      };
    }

    if (destination.droppableId === 'words') {
      newState.words = finishIds;
    } else {
      newState.categories = {
        ...newState.categories,
        [destination.droppableId]: {
          ...newState.categories[destination.droppableId],
          wordIds: finishIds,
        },
      };
    }

    this.setState(newState);
  };

  checkAnswers = () => {
    let correct = 0;
    const { categories, wordMap } = this.state;

    this.state.categoryOrder.forEach((catId) => {
      const cat = categories[catId];
      cat.wordIds.forEach((wordId) => {
        if (wordMap[wordId].category === cat.correctCategory) correct++;
      });
    });

    this.setState({ score: correct, checked: true });
  };

  resetGame = () => {
    this.setState({ ...initialData, score: null, checked: false });
  };

  render() {
    const { words, categories, categoryOrder, wordMap, score, checked } = this.state;

    return (
      <div className="game-container">
        <h1>{ui('web_f5b8f98c44b4e462')}</h1>
        <p className="instructions">{ui('web_71eccbd1ed4eff7c')}</p>

        <DragDropContext onDragEnd={this.onDragEnd}>
          <div className="game-board">
            <Column droppableId="words" title={ui('web_3bd236551c6abf1b')} isEmpty={words.length === 0}>
              {words.map((wordId, index) => (
                <Word key={wordId} word={wordMap[wordId]} index={index} />
              ))}
            </Column>

            <div className="categories">
              {categoryOrder.map((catId) => {
                const cat = categories[catId];
                const catWords = cat.wordIds.map((id) => wordMap[id]);
                return (
                  <Column
                    key={catId}
                    droppableId={catId}
                    title={cat.title}
                    isEmpty={cat.wordIds.length === 0}
                  >
                    {catWords.map((word, index) => (
                      <Word key={word.id} word={word} index={index} />
                    ))}
                  </Column>
                );
              })}
            </div>
          </div>
        </DragDropContext>

        <div className="actions">
          <button onClick={this.checkAnswers} className="btn btn-check">{ui('web_4cd932350dfac851')}</button>
          <button onClick={this.resetGame} className="btn btn-reset">{ui('web_ac95bc9c271af24d')}</button>
        </div>

        {checked && (
          <div className="score">{ui('web_5c69f37879487f8d')}{score} / {Object.keys(wordMap).length}{ui('web_46b0458e0186fc59')}</div>
        )}
      </div>
    );
  }
}

export default DragAndDrop;
