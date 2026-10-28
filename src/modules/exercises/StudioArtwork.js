import React from 'react';
// Illustration regions from the approved reference. Interface content is real HTML.
const crops = { studioHeader:[350,213,127,140], hero:[53,358,425,195], avatar:[554,283,85,80], situations:[77,578,126,100], microphone:[80,798,122,90], fjord:[826,219,117,130], result:[1240,202,184,164] };
export default function StudioArtwork({scene='hero',className=''}) {
  return <svg className={'studio-art '+className} viewBox={crops[scene].join(' ')} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><image href="/images/studio/reference.png" width="1476" height="1066"/></svg>;
}
