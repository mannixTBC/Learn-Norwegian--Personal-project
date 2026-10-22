import React from 'react';
import './NorthernPassMap.css';

const PORTRAIT_POSITIONS = [
  [12, 91], [29, 83], [46, 75], [63, 66], [46, 58],
  [29, 49], [46, 40], [64, 31], [81, 20], [64, 10],
];

const OVERVIEW_POSITIONS = [
  [5, 90], [16, 83], [27, 74], [39, 64], [51, 53],
  [63, 43], [74, 32], [83, 23], [91, 14], [96, 5],
];

// The return route keeps every touch target reachable in a short, wide map.
const WIDE_POSITIONS = [
  [10, 78], [30, 78], [50, 78], [70, 78], [90, 78],
  [90, 24], [70, 24], [50, 24], [30, 24], [10, 24],
];

function routePath(positions) {
  if (positions.length < 2) return '';
  const points = positions.map(([x, y]) => [x * 10, y * 10]);
  let path = `M ${points[0].join(' ')}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[Math.max(0, index - 1)];
    const start = points[index];
    const end = points[index + 1];
    const next = points[Math.min(points.length - 1, index + 2)];
    const first = start.map((value, axis) => value + (end[axis] - previous[axis]) / 6);
    const second = end.map((value, axis) => value - (next[axis] - start[axis]) / 6);
    path += ` C ${first.join(' ')} ${second.join(' ')} ${end.join(' ')}`;
  }
  return path;
}

function Route({ positions, completedCount, variant }) {
  const reached = positions.slice(0, Math.min(positions.length, completedCount + 1));
  return <svg className={`npass-map__route npass-map__route--${variant}`} viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
    <path className="npass-map__route-shadow" d={routePath(positions)} />
    <path className="npass-map__route-ahead" d={routePath(positions)} />
    {reached.length > 1 && <path className="npass-map__route-reached" d={routePath(reached)} />}
  </svg>;
}

function StopSymbol({ status, number }) {
  if (status === 'completed') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 4 4 8-9" /></svg>;
  if (status === 'current') return <span aria-hidden="true">{number}</span>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10V7a4 4 0 0 1 8 0v3" /><rect x="6" y="10" width="12" height="10" rx="3" /><path d="M12 14v2" /></svg>;
}

/** The parent owns selection and progression; this map only presents the route. */
export default function NorthernPassMap({ stops = [], completedCount = 0, selectedId, onSelect, compact = false }) {
  const finished = Math.min(stops.length, Math.max(0, Math.floor(Number(completedCount) || 0)));
  const current = stops[finished];
  const nameOf = (stop) => stop?.name || stop?.title || stop?.label || 'Popas';
  const description = `${finished} din ${stops.length} popasuri încheiate.${current ? ` Urmează ${nameOf(current)}.` : ' Expediție încheiată.'}`;
  const portrait = PORTRAIT_POSITIONS.slice(0, stops.length);
  const overview = OVERVIEW_POSITIONS.slice(0, stops.length);
  const wide = WIDE_POSITIONS.slice(0, stops.length);

  return <div className={`npass-map${compact ? ' npass-map--compact' : ''}`} role={compact ? 'img' : 'group'} aria-label={compact ? `Trecătoarea Nordului. ${description}` : 'Popasurile expediției Trecătoarea Nordului'}>
    <img className="npass-map__art" src={compact ? '/images/games/northern-pass-overview.webp' : '/images/games/northern-pass-map.webp'} alt="" draggable="false" />
    <div className="npass-map__wash" aria-hidden="true" />
    <div className="npass-map__canvas" aria-hidden={compact || undefined}>
      <Route positions={compact ? overview : portrait} completedCount={finished} variant="portrait" />
      {!compact && <Route positions={wide} completedCount={finished} variant="wide" />}
      {stops.map((stop, index) => {
        const normal = (compact ? OVERVIEW_POSITIONS : PORTRAIT_POSITIONS)[index] || [50, 50];
        const horizontal = WIDE_POSITIONS[index] || normal;
        const status = index < finished ? 'completed' : index === finished ? 'current' : 'future';
        const name = nameOf(stop);
        const statusLabel = status === 'completed' ? 'Încheiat' : status === 'current' ? 'Obstacolul curent' : 'Urmează mai târziu';
        const className = `npass-map__stop npass-map__stop--${status}${selectedId === stop.id ? ' npass-map__stop--selected' : ''}${index >= 7 ? ' npass-map__stop--upper' : ''}${index >= 8 ? ' npass-map__stop--edge' : ''}`;
        const style = { '--stop-x': `${normal[0]}%`, '--stop-y': `${normal[1]}%`, '--stop-wide-x': `${horizontal[0]}%`, '--stop-wide-y': `${horizontal[1]}%` };
        const content = <><span className="npass-map__label">{name}</span><span className="npass-map__marker"><StopSymbol status={status} number={index + 1} /></span></>;
        return compact
          ? <span key={stop.id} className={className} style={style}>{content}</span>
          : <button key={stop.id} className={className} style={style} type="button" onClick={() => onSelect?.(stop.id)} aria-label={`Popasul ${index + 1}: ${name}. ${statusLabel}.`} aria-pressed={selectedId === stop.id}>{content}</button>;
      })}
    </div>
  </div>;
}
