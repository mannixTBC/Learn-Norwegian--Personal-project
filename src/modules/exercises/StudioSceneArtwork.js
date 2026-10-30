import React from 'react';
import { getScenarioArtwork } from './scenarioArtwork.mjs';

export default function StudioSceneArtwork({ scenarioId, pathId = 'general', className = '' }) {
  const artwork = getScenarioArtwork(scenarioId, pathId);
  return <svg className={'studio-scene-art ' + className}
    viewBox={artwork.viewBox} preserveAspectRatio="xMidYMid slice"
    aria-hidden="true" focusable="false">
    <image href={artwork.src} width={artwork.width} height={artwork.height}/>
  </svg>;
}
