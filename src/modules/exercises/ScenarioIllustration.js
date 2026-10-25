import React from 'react';
import './ScenarioIllustration.css';

// The supplied atlas has uneven row heights. Use its actual cell boundaries,
// and SVG slice scaling to crop each scene without stretching or adjacent tiles.
const tiles = {
  nora: 0, studio: 1, 'bus-delay': 2, 'hotel-booking': 3,
  'team-plan': 4, 'cafe-order': 5, 'site-materials': 6, 'care-comfort': 7,
  'cleaning-plan': 8, 'shop-exchange': 9, 'study-meeting': 10, 'kindergarten-plan': 11,
};
const rowEdges = [0, 330, 651, 1024];
export default function ScenarioIllustration({ scenarioId, className = '' }) {
  const tile = tiles[scenarioId] ?? tiles.studio;
  const row = Math.floor(tile / 4);
  const x = (tile % 4) * 384;
  const y = rowEdges[row];
  const height = rowEdges[row + 1] - y;
  return <svg className={'scenario-illustration ' + className}
    viewBox={[x, y, 384, height].join(' ')} preserveAspectRatio="xMidYMid slice"
    aria-hidden="true" focusable="false">
    <image href="/images/voice/scenario-illustrations.png" width="1536" height="1024" />
  </svg>;
}
