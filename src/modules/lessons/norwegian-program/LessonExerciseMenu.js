import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function LessonExerciseMenu({ steps, level, canFinish, onClose, onSelectStep }) {
  const dialog = useRef(null);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement;
    if (!element?.open) element?.showModal?.();
    return () => {
      element?.close?.();
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  return (
    <dialog ref={dialog} className="lapp-exercise-menu" aria-labelledby="lesson-exercise-menu-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="lapp-exercise-menu__panel">
        <header>
          <h2 id="lesson-exercise-menu-title">{showSteps ? 'Etapele lecției' : 'Meniul lecției'}</h2>
          <button type="button" onClick={onClose} aria-label="Închide meniul" autoFocus>×</button>
        </header>
        <p>Progresul și răspunsurile tale se salvează automat.</p>
        {showSteps ? <>
          <div className="lapp-exercise-menu__steps">
            {steps.map((title, index) => <button type="button" key={title} disabled={index > 5 && !(index === 6 && canFinish)}
              aria-current={index === 5 ? 'step' : undefined} onClick={() => onSelectStep(index)}>
              <span>{index + 1}</span><strong>{title}</strong><small>{index === 5 ? 'Revino' : index < 5 ? 'Revezi' : index === 6 && canFinish ? 'Continuă' : 'Mai târziu'}</small>
            </button>)}
          </div>
          <button type="button" className="lapp-exercise-menu__resume" onClick={() => setShowSteps(false)}>Înapoi la meniu</button>
        </> : <>
          <button type="button" className="lapp-exercise-menu__action" onClick={() => setShowSteps(true)}><strong>Etapele lecției</strong><span>Revezi vocabularul, dialogul sau gramatica.</span></button>
          <Link className="lapp-exercise-menu__action" to={`/invata?nivel=${level}`}><strong>Înapoi la lecții</strong><span>Poți continua mai târziu de unde ai rămas.</span></Link>
          <button type="button" className="lapp-exercise-menu__resume" onClick={onClose}>Continuă exercițiile</button>
        </>}
      </div>
    </dialog>
  );
}
