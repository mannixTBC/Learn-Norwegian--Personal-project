import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import './Challenge30.css';
import './AudioControls.css';

const ChallengeDragDrop = ({ verbs, onComplete }) => {
  const [slots, setSlots] = useState(() =>
    verbs.map((v, i) => ({ romanian: v.romanian, id: `slot-${i}`, matchedId: null }))
  );
  const [pool, setPool] = useState(() =>
    verbs.map((v, i) => ({ ...v, id: `n-${i}` }))
  );
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(null);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const onDragEnd = (result) => {
    if (!result.destination || checked) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === 'pool') {
      const slotIndex = parseInt(destination.droppableId.replace('slot-', ''), 10);
      if (isNaN(slotIndex)) return;

      const word = pool.find((w) => w.id === draggableId);
      if (!word) return;

      setSlots((prev) => {
        const next = [...prev];
        const oldIdx = next.findIndex((s) => s.matchedId === draggableId);
        if (oldIdx >= 0) next[oldIdx] = { ...next[oldIdx], matchedId: null };

        const currentInSlot = next[slotIndex].matchedId;
        if (currentInSlot) {
          const oldSlotIdx = next.findIndex((s) => s.matchedId === currentInSlot);
          if (oldSlotIdx >= 0) next[oldSlotIdx] = { ...next[oldSlotIdx], matchedId: null };
        }

        next[slotIndex] = { ...next[slotIndex], matchedId: draggableId };
        return next;
      });
    } else if (source.droppableId.startsWith('slot-')) {
      const slotIndex = parseInt(source.droppableId.replace('slot-', ''), 10);
      if (isNaN(slotIndex)) return;

      if (destination.droppableId === 'pool') {
        setSlots((prev) => {
          const next = [...prev];
          next[slotIndex] = { ...next[slotIndex], matchedId: null };
          return next;
        });
      } else {
        const destSlotIndex = parseInt(destination.droppableId.replace('slot-', ''), 10);
        if (isNaN(destSlotIndex)) return;

        setSlots((prev) => {
          const next = [...prev];
          const movingId = prev[slotIndex].matchedId;
          const destCurrent = prev[destSlotIndex].matchedId;

          next[slotIndex] = { ...next[slotIndex], matchedId: destCurrent };
          next[destSlotIndex] = { ...next[destSlotIndex], matchedId: movingId };
          return next;
        });
      }
    }
  };

  const handleCheck = () => {
    let correct = 0;
    slots.forEach((slot) => {
      const word = pool.find((w) => w.id === slot.matchedId);
      if (word && slot.romanian === word.romanian) correct++;
    });
    setScore(correct);
    setChecked(true);
    if (correct === verbs.length && onComplete) onComplete();
  };

  const handleReset = () => {
    setSlots(verbs.map((v, i) => ({ romanian: v.romanian, id: `slot-${i}`, matchedId: null })));
    setPool(shuffle(verbs).map((v, i) => ({ ...v, id: `n-${i}` })));
    setChecked(false);
    setScore(null);
  };

  const poolWords = pool.filter((w) => !slots.some((s) => s.matchedId === w.id));

  if (verbs.length === 0) {
    return <p className="challenge30__empty">Nu există verbe pentru această zi.</p>;
  }

  return (
    <div className="challenge-drag">
      <p className="challenge-drag__inst">Trage verbele norvegiene în boxul cu traducerea corectă.</p>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="challenge-drag__board">
          <Droppable droppableId="pool">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="challenge-drag__pool"
              >
                <span className="challenge-drag__pool-label">Norvegiană</span>
                {poolWords.map((v, index) => (
                  <Draggable key={v.id} draggableId={v.id} index={index}>
                    {(p) => (
                      <div
                        ref={p.innerRef}
                        {...p.draggableProps}
                        {...p.dragHandleProps}
                        className="challenge-drag__word"
                      >
                        <span>{v.norwegian}</span><button className="challenge-audio-mini" type="button" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); speakNorwegian(v.norwegian); }} aria-label={`Ascultă ${v.norwegian}`}>▶</button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="challenge-drag__slots">
            {slots.map((slot, index) => (
              <Droppable key={slot.id} droppableId={`slot-${index}`}>
                {(provided) => {
                  const word = slot.matchedId ? pool.find((w) => w.id === slot.matchedId) : null;
                  const isCorrect = checked && word && slot.romanian === word.romanian;
                  const isIncorrect = checked && (!word || slot.romanian !== word.romanian);
                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`challenge-drag__slot ${isCorrect ? 'challenge-drag__slot--correct' : ''} ${isIncorrect ? 'challenge-drag__slot--incorrect' : ''}`}
                    >
                      <span className="challenge-drag__slot-label">{slot.romanian}</span>
                      {word ? (
                        <Draggable draggableId={word.id} index={0}>
                          {(p) => (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                              className="challenge-drag__word"
                            >
                              <span>{word.norwegian}</span><button className="challenge-audio-mini" type="button" onMouseDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); speakNorwegian(word.norwegian); }} aria-label={`Ascultă ${word.norwegian}`}>▶</button>
                            </div>
                          )}
                        </Draggable>
                      ) : (
                        <div className="challenge-drag__slot-placeholder">← trage aici</div>
                      )}
                      {checked && (isCorrect || isIncorrect) && (
                        <span className={`challenge-drag__sign ${isCorrect ? 'challenge-drag__sign--correct' : 'challenge-drag__sign--incorrect'}`}>
                          {isCorrect ? '✓' : '✗'}
                        </span>
                      )}
                      {provided.placeholder}
                    </div>
                  );
                }}
              </Droppable>
            ))}
          </div>
        </div>
      </DragDropContext>

      <div className="challenge-drag__actions">
        <button
          type="button"
          className="challenge-drag__btn"
          onClick={handleCheck}
          disabled={checked || slots.some((s) => !s.matchedId)}
        >
          Verifică
        </button>
        <button type="button" className="challenge-drag__btn challenge-drag__btn--reset" onClick={handleReset}>
          Resetează
        </button>
      </div>

      {checked && (
        <div className={`challenge-drag__result ${score === verbs.length ? 'challenge-drag__result--win' : ''}`}>
          Scor: {score} / {verbs.length}
        </div>
      )}
    </div>
  );
};

export default ChallengeDragDrop;
