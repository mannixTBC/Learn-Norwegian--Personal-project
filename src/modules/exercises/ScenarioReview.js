import {ui} from '../../languages/messages.js';
import {courseLocalStorage as localStorage} from '../../languages/storage.js';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import catalog from '../../content/features/scenarios.js';
import { resolvePublicScenario } from './scenarioDifficulty.mjs';
import { getScenarioReviewItems } from './scenarioReviewItems.mjs';

export default function ScenarioReview({ level }) {
  const auth = useAuth();
  const userId = auth?.user?.id;
  const [version, refresh] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => refresh(v => v + 1);
    window.addEventListener('storage', update);
    window.addEventListener('focus', update);
    return () => { window.removeEventListener('storage', update); window.removeEventListener('focus', update); };
  }, []);
  const items = useMemo(() => {
    try {
      const scenarios = catalog.scenarios.map(source => {
        const resolved = resolvePublicScenario(source, catalog.levels, level);
        return { ...resolved.scenario, difficulty: resolved.difficulty };
      });
      return getScenarioReviewItems(localStorage, userId, level, scenarios);
    } catch { return []; }
  }, [userId, level, version]);
  if (!items.length) return null;
  return <details className="recall-scenarios">
    <summary>{ui('web_a0a0b9cd1499b2c0')}{items.length}</summary>
    <p>{ui('web_ee3fd739c4f6a7fe')}</p>
    {items.map(item => <article key={item.id}>
      <h2>{item.title}</h2>
      {item.previouslyCompleted && <p>{ui('web_f0a9da8fc0932169')}</p>}
      <ul>{item.missing.map(goal => <li key={goal}>{goal}</li>)}</ul>
      <Link to={'/scenarii?nivel=' + level + '&scenariu=' + encodeURIComponent(item.id)}>{ui('web_4fb21eeb68b86d90')}</Link>
    </article>)}
  </details>;
}
