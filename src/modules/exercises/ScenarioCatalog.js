import React, { useMemo, useState } from 'react';
import { careerPaths, getCareerPath } from '../../services/careerProfile';
import ScenarioIllustration from './ScenarioIllustration';
import './ScenarioCatalog.css';

export default function ScenarioCatalog({ scenarios, path, flow, mobile = false }) {
  const [tab, setTab] = useState('recommended');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(0);
  const filtered = useMemo(() => {
    const items = scenarios.filter(s => category === 'all' || s.path === category);
    return [...items].sort(tab === 'recommended'
      ? (a, b) => Number(b.path === path.id) - Number(a.path === path.id)
      : (a, b) => a.title.localeCompare(b.title, 'ro'));
  }, [scenarios, category, tab, path.id]);
  const pages = Math.max(1, Math.ceil(filtered.length / 4));
  const currentPage = Math.min(page, pages - 1);
  return <>
    <div className="sc-controls">
      <div className="sc-tabs" role="group" aria-label="Ordinea scenariilor">
        <button type="button" aria-pressed={tab === 'recommended'} onClick={() => { setTab('recommended'); setPage(0); }}>Pentru tine</button>
        <button type="button" aria-pressed={tab === 'all'} onClick={() => { setTab('all'); setPage(0); }}>Toate</button>
      </div>
      <label className="sc-filter"><span className="sc-sr-only">Filtrează situațiile</span>
        <select value={category} onChange={event => { setCategory(event.target.value); setPage(0); }}>
          <option value="all">Toate situațiile</option>
          {careerPaths.filter(p => scenarios.some(s => s.path === p.id)).map(p => <option key={p.id} value={p.id}>{p.shortTitle}</option>)}
        </select>
      </label>
    </div>
    <div className="sc-grid" aria-label="Scenarii disponibile">
      {filtered.slice(currentPage * 4, currentPage * 4 + 4).map(s => <button type="button" className="sc-card conversation-card" key={s.id} onClick={() => flow.choose(s.id)}>
        <ScenarioIllustration scenarioId={s.id} className="sc-card-art" />
        {tab === 'recommended' && s.path === path.id && <span className="sc-recommended">Pentru tine</span>}
        <div className="sc-card-copy"><h2>{s.title}</h2><p>{s.place}</p>
          <span className="sc-card-status">{getCareerPath(s.path).shortTitle}{flow.progress?.[s.id]?.legacy ? ' · Versiune nouă' : flow.progress?.[s.id]?.latest?.endReason === 'success' ? ' · Reușit' : flow.progress?.[s.id] ? ' · De reluat' : ''}</span>
          {!mobile && <span className="sc-card-budget">{s.difficulty.turns} schimburi maximum</span>}
        </div><span className="sc-card-arrow" aria-hidden="true">›</span>
      </button>)}
    </div>
    {!filtered.length && <p className="sc-empty" role="status">Nu sunt scenarii pentru acest filtru.</p>}
    <nav className="sc-pagination" aria-label="Paginile scenariilor">
      <button type="button" aria-label="Pagina anterioară" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>‹</button>
      <span aria-live="polite" aria-atomic="true">{filtered.length ? (currentPage + 1) + ' din ' + pages : '0 scenarii'}</span>
      <button type="button" aria-label="Pagina următoare" disabled={currentPage >= pages - 1} onClick={() => setPage(currentPage + 1)}>›</button>
    </nav>
  </>;
}
