import React, { useId } from 'react';

const crops = {
  logo: [77, 162, 164, 39],
  landscape: [52, 150, 425, 216],
  'cafe-order': [70, 375, 187, 185],
  'shop-exchange': [275, 375, 187, 185],
  'team-plan': [70, 619, 187, 179],
  'care-comfort': [275, 619, 187, 179],
};
export const hasPracticalArtwork = id => Boolean(crops[id]);
export default function PracticalStudioArtwork({scene, className = ''}) {
  const id = 'practical-art-' + useId().replace(/:/g, '');
  return <svg className={'practical-reference-art ' + className} viewBox={crops[scene].join(' ')}
    preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    {scene === 'landscape' && <defs><clipPath id={id}>
      <path clipRule="evenodd" d="M252 150H477V366H392V322H264V213H252Z M396 158V214H470V158Z"/>
    </clipPath></defs>}
    <image href="/images/studio/practical-reference.png" width="1476" height="1066"
      clipPath={scene === 'landscape' ? 'url(#'+id+')' : undefined}/>
  </svg>;
}
