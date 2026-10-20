import React, { useState } from 'react';
import { saveReviewItem } from '../../services/spacedReview';
import './DialogueFeedback.css';

export default function DialogueFeedback({ learning, level, lessonId }) {
  const [saved, setSaved] = useState({});
  const [error, setError] = useState('');
  if (!learning) return null;
  const labels = { independent: 'Exersat', supported: 'Cu ajutor', unpractised: 'De exersat' };
  const save = (item, index) => {
    try {
      saveReviewItem({
        id: `dialogue-${level}-${lessonId}-${item.original}-${item.corrected}`,
        level, lessonId, source: 'dialogue',
        prompt: `Reformulează corect: „${item.original}”`, answer: item.corrected,
        explanation: item.explanation,
      });
      setSaved((current) => ({ ...current, [index]: true }));
      setError('');
    } catch (_) { setError('Nu am putut salva expresia. Încearcă din nou.'); }
  };
  return <div className="dialogue-feedback">
    <h3>Ce ai exersat</h3>
    <p>Rezultatul acestei practici arată ce ai folosit în conversație.</p>
    <ul>{(learning.goals || []).map((goal) => <li key={goal.id}>
      <span>{goal.label}</span><strong data-status={goal.status}>{labels[goal.status] || labels.unpractised}</strong>
    </li>)}</ul>
    {(learning.reviewCandidates || []).map((item, index) => <div className="dialogue-feedback__review" key={`${item.original}-${item.corrected}`}>
      <p>Ai spus <span lang="nb">„{item.original}”</span>. Forma de exersat: <strong lang="nb">{item.corrected}</strong>.</p>
      <p>{item.explanation}</p>
      <button type="button" disabled={saved[index]} onClick={() => save(item, index)}>
        {saved[index] ? 'Salvat pentru recapitulare' : 'Da, am spus asta · Salvează în recapitulare'}
      </button>
      {!saved[index] && <small>Dacă transcrierea nu corespunde cu ce ai spus, lasă expresia nesalvată.</small>}
    </div>)}
    {error && <p role="alert">{error}</p>}
  </div>;
}
