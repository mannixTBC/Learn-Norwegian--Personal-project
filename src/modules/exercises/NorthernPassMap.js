import React, { useLayoutEffect, useRef, useState } from 'react';
import './NorthernPassMap.css';

// Coordinates are traced on each illustration, including bends between stops.
// The image and overlay share the same full canvas: resizing cannot detach them.
const MAP_ROUTES = {
  portrait: {
    image: '/images/games/realm-of-legends-map.jpg',
    points: [[19,85],[14,79],[13,73],[18,68],[27,63],[29,61],[23,58],[19,55],[22,52],[30,50],[39,48],[47,46],[52,43],[68,40],[83,38],[91,35],[92,33],[85,31],[84,29],[91,27],[92,25],[85,24],[82,22],[85,20],[89,18],[86,16],[81,14]],
    stops: [0,3,8,13,16,18,20,22,24,26],
  },
  landscape: {
    image: '/images/games/realm-of-legends-overview.jpg',
    points: [[18,85],[13,80],[12,73],[15,66],[20,62],[27,64],[34,66],[38,64],[33,62],[26,60],[25,58],[33,55],[40,52],[46,49],[53,47],[62,46],[72,49],[83,54],[90,55],[92,52],[87,49],[79,46],[74,44],[73,42],[80,39],[83,36],[82,33],[82,29],[88,27],[90,25],[85,23],[81,21]],
    stops: [0,3,7,14,15,18,22,25,29,31],
  },
};

function routeSegments(positions) {
  const points = positions.map(([x,y]) => [x*10,y*10]);
  return points.slice(0,-1).map((start,index) => {
    const previous=points[Math.max(0,index-1)], end=points[index+1], next=points[Math.min(points.length-1,index+2)];
    const first=start.map((v,axis)=>v+(end[axis]-previous[axis])/6);
    const second=end.map((v,axis)=>v-(next[axis]-start[axis])/6);
    return ' C '+first.join(' ')+' '+second.join(' ')+' '+end.join(' ');
  });
}

function Route({ route, completedCount, stopCount }) {
  const segments=routeSegments(route.points);
  const start='M '+route.points[0].map(v=>v*10).join(' ');
  const lastStop=Math.min(completedCount,stopCount-1,route.stops.length-1);
  // Slice the same curve, preserving its tangent at the progress boundary.
  const reached=segments.slice(0,route.stops[lastStop] || 0);
  return <svg className="npass-map__route" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
    <path className="npass-map__route-shadow" d={start+segments.join('')} />
    <path className="npass-map__route-ahead" d={start+segments.join('')} />
    {reached.length>0 && <path className="npass-map__route-reached" d={start+reached.join('')} />}
  </svg>;
}

function StopSymbol({ status, number }) {
  if (status === 'completed') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 4 4 8-9" /></svg>;
  
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10V7a4 4 0 0 1 8 0v3" /><rect x="6" y="10" width="12" height="10" rx="3" /><path d="M12 14v2" /></svg>;
}

/** The parent owns selection and progression; this map only presents the route. */
export default function NorthernPassMap({ stops = [], completedCount = 0, selectedId, onSelect, compact = false }) {
  const mapRef = useRef(null);
  const [layout, setLayout] = useState(compact ? 'landscape' : 'portrait');
  useLayoutEffect(() => {
    const element=mapRef.current;
    if (!element) return undefined;
    const measure=()=>{
      const {width,height}=element.getBoundingClientRect();
      if (width && height) setLayout(width/height >= 1.12 ? 'landscape' : 'portrait');
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize',measure);
      return ()=>window.removeEventListener('resize',measure);
    }
    const observer=new ResizeObserver(measure);
    observer.observe(element);
    return ()=>observer.disconnect();
  }, []);
  const route=MAP_ROUTES[layout];
  const finished = Math.min(stops.length, Math.max(0, Math.floor(Number(completedCount) || 0)));
  const current = stops[finished];
  const nameOf = (stop) => stop?.name || stop?.title || stop?.label || 'Popas';
  const description = `${finished} din ${stops.length} popasuri încheiate.${current ? ` Urmează ${nameOf(current)}.` : ' Expediție încheiată.'}`;
  return <div ref={mapRef} data-map-layout={layout} className={`npass-map${compact ? ' npass-map--compact' : ''}`} role={compact ? 'img' : 'group'} aria-label={compact ? `Tărâmul legendelor. ${description}` : 'Popasurile expediției Tărâmul legendelor'}>
    <img className="npass-map__art" src={route.image} alt="" draggable="false" />
    <div className="npass-map__wash" aria-hidden="true" />
    <div className="npass-map__canvas" aria-hidden={compact || undefined}>
      <Route route={route} completedCount={finished} stopCount={stops.length} />
      {stops.map((stop, index) => {
        const normal = route.points[route.stops[index]] || [50,50];
        const status = index < finished ? 'completed' : index === finished ? 'current' : 'future';
        const name = nameOf(stop);
        const statusLabel = status === 'completed' ? 'Încheiat' : status === 'current' ? 'Obstacolul curent' : 'Urmează mai târziu';
        const className = `npass-map__stop npass-map__stop--${status}${selectedId === stop.id ? ' npass-map__stop--selected' : ''}${index >= 7 ? ' npass-map__stop--upper' : ''}${index >= 8 ? ' npass-map__stop--edge' : ''}`;
        const style = { '--stop-x': `${normal[0]}%`, '--stop-y': `${normal[1]}%`, '--label-shift': normal[0] > 75 ? '-80%' : normal[0] < 25 ? '-20%' : '-50%'  };
        const content = <><span className="npass-map__label">{status === 'current' && !compact ? <>{stop.title || name} <span className="legend-label-price">· <img src="/images/games/viking-coin.png" alt="" /> {Number(stop.cost || 0).toLocaleString('ro-RO')}</span></> : name}</span><span className="npass-map__marker"><StopSymbol status={status} number={index + 1} /></span></>;
        return compact
          ? <span key={stop.id} className={className} style={style}>{content}</span>
          : <button key={stop.id} className={className} style={style} type="button" onClick={() => onSelect?.(stop.id)} aria-label={`Popasul ${index + 1}: ${name}. ${statusLabel}.`} aria-pressed={selectedId === stop.id}>{content}</button>;
      })}
    </div>
  </div>;
}
