import React from 'react';
const regions={cafe:[0,105,512,320],nora:[512,0,512,340],avatar:[665,65,180,210],'cafe-order':[1024,0,512,512],'shop-exchange':[0,512,512,512],'team-plan':[512,512,512,512],'bus-delay':[1024,512,512,512]};
export const hasNordicArtwork=id=>Boolean(regions[id]);
export default function NordicStudioArtwork({scene,className=''}){return <svg className={'studio-art '+className} viewBox={(regions[scene]||regions.nora).join(' ')} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><image href="/images/studio/nordic-scenes.png" width="1536" height="1024"/></svg>;}
