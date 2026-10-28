import React from 'react';

// Reuse the existing watercolor scenes; keep their actual, uneven row boundaries.
const scenes = {
  transport: [12, 8, 490, 262], hospitality: [523, 8, 490, 262],
  construction: [12, 280, 490, 270], healthcare: [523, 280, 490, 270],
  cleaning: [12, 559, 490, 286], retail: [523, 559, 490, 286],
  office: [12, 857, 490, 283], studies: [523, 857, 490, 283],
  family: [12, 1154, 490, 360], general: [523, 1154, 490, 360],
};
const scenarioScenes = {
  'cafe-order': 'general', 'shop-exchange': 'retail', 'team-plan': 'office',
  'care-comfort': 'healthcare', 'bus-delay': 'transport', 'hotel-booking': 'hospitality',
};
export default function StudioSceneArtwork({ scenarioId, pathId = 'general', className = '' }) {
  const scene = scenarioScenes[scenarioId] || pathId;
  return <svg className={'studio-scene-art ' + className}
    viewBox={(scenes[scene] || scenes.general).join(' ')} preserveAspectRatio="xMidYMid slice"
    aria-hidden="true" focusable="false">
    <image href="/images/exercises/mission-scenes.webp" width="1024" height="1536"/>
  </svg>;
}
