import React, { useMemo, useState } from 'react';
import { getCareerPath } from '../../services/careerProfile';
import StudioSceneArtwork from './StudioSceneArtwork';

const featured = ['cafe-order', 'shop-exchange', 'team-plan', 'bus-delay', 'care-comfort'];
const names = { 'cafe-order': 'La cafenea', 'shop-exchange': 'La magazin', 'team-plan': 'La serviciu', 'bus-delay': 'În autobuz', 'care-comfort': 'În îngrijire' };

export default function ScenarioCatalog({ scenarios, flow, level, path }) {
  const [page, setPage] = useState(0);
  const activePath = getCareerPath(path?.id);
  const filtered = useMemo(() => scenarios.filter(s => s.path === activePath.id).sort((a, b) => {
    const ai = featured.indexOf(a.id), bi = featured.indexOf(b.id);
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
  }), [scenarios, activePath.id]);
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const currentPage = Math.min(page, pages - 1);
  const visible = filtered.slice(currentPage * 6, currentPage * 6 + 6);

  return <>
    <p className="sc-path">Traseul tău: <strong>{activePath.shortTitle}</strong></p>
    <div className="sc-grid" aria-label="Scenarii disponibile">{visible.map(s =>
      <button type="button" key={s.id} className="sc-card conversation-card" onClick={() => flow.choose(s.id, true)}>
        <StudioSceneArtwork scenarioId={s.id} pathId={s.path} className="sc-card-art" />
        <div className="sc-card-copy"><h2>{names[s.id] || s.title}<span aria-hidden="true">›</span></h2><p>{level} · {s.difficulty?.turns <= 5 ? '3' : '5'} min</p>{flow.progress?.[s.id] && <span className="sc-card-status">{flow.progress[s.id].latest?.endReason === 'success' ? '✓ Reușit' : 'De reluat'}</span>}</div>
      </button>
    )}</div>
    {!filtered.length && <p className="sc-empty" role="status">Nu sunt încă situații practice pentru traseul tău la acest nivel.</p>}
    <nav className="sc-pagination" aria-label="Paginile scenariilor" hidden={pages === 1}>
      <button type="button" aria-label="Pagina anterioara" disabled={!currentPage} onClick={() => setPage(currentPage - 1)}>‹</button>
      <span aria-live="polite">{currentPage + 1} din {pages}</span>
      <button type="button" aria-label="Pagina urmatoare" disabled={currentPage >= pages - 1} onClick={() => setPage(currentPage + 1)}>›</button>
    </nav>
  </>;
}
