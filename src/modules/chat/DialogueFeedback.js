import {ui} from '../../languages/messages.js';
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
    <h3>{ui('web_6133986a11e111a9')}</h3>
    <p>{ui('web_6fb8efbc8aae05a9')}</p>
    <ul>{(learning.goals || []).map((goal) => <li key={goal.id}>
      <span>{goal.label}</span><strong data-status={goal.status}>{labels[goal.status] || labels.unpractised}</strong>
    </li>)}</ul>
    {(learning.reviewCandidates || []).map((item, index) => <div className="dialogue-feedback__review" key={`${item.original}-${item.corrected}`}>
      <p>{ui('web_19229a2b6080bec5')}<span lang="nb">„{item.original}”</span>{ui('web_b41fb07938004f91')}<strong lang="nb">{item.corrected}</strong>.</p>
      <p>{item.explanation}</p>
      <button type="button" disabled={saved[index]} onClick={() => save(item, index)}>
        {saved[index] ? 'Salvat pentru recapitulare' : 'Da, am spus asta · Salvează în recapitulare'}
      </button>
      {!saved[index] && <small>{ui('web_2b1cf9afd27b7dd1')}</small>}
    </div>)}
    {error && <p role="alert">{error}</p>}
  </div>;
}
