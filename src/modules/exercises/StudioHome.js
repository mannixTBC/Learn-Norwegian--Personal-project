import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getLearningLevel } from '../lessons/learningLevel';
import MobileAppNav from '../layout/MobileAppNav';
import StudioArtwork from './StudioArtwork';
import StudioHeader from './StudioHeader';
import './StudioDesign.css';
export default function StudioHome() {
  const location=useLocation(), level=getLearningLevel(location.search);
  const free=new URLSearchParams(location.search).get('mod')==='liber';
  return <section className={'conversation-studio studio-design studio-home'+(free?' studio-free':'')}>
    <StudioHeader level={level} back={free?'/studio?nivel='+level:null}/>
    <div className="studio-heading"><StudioArtwork scene={free?"fjord":"studioHeader"} className="studio-heading-art"/><h1>{free?'Dialog liber':<>Studio de<br/>conversație</>}</h1><p>{free?'Vorbim în ritmul tău.':'Vorbește norvegiană, în ritmul tău.'}</p></div>
    {free?<div className="studio-nora-intro"><StudioArtwork scene="avatar"/><div><strong>Nora</strong><p>Vorbim în ritmul tău.</p></div></div>:<StudioArtwork className="studio-hero"/>}
    {free?<div className="studio-free-notice" role="status"><h2>În curând, dialog liber cu Nora</h2><p>Dialogul liber nu este încă disponibil. Până atunci, poți vorbi cu Nora în situațiile practice.</p><Link className="studio-primary" to={'/scenarii?nivel='+level}>Alege o situație <span aria-hidden="true">›</span></Link><Link className="studio-text-link" to={'/studio?nivel='+level}>Înapoi la studio</Link></div>:
    <div className="studio-options">
      <article className="studio-option"><StudioArtwork scene="situations"/><div><h2>Situații practice</h2><p>Exersează conversații<br/>din viața reală.</p></div><div className="studio-tags"><span>Zi de zi</span><span>La serviciu</span></div><Link className="studio-primary" to={'/scenarii?nivel='+level}>Alege o situație <span aria-hidden="true">›</span></Link></article>
      <article className="studio-option"><StudioArtwork scene="microphone"/><div><h2>Dialog liber</h2><p>Povestește cu Nora<br/>despre ce ai pe minte.</p></div><Link className="studio-primary" to={'/studio?nivel='+level+'&mod=liber'}>Vorbește cu Nora <span aria-hidden="true">›</span></Link></article>
    </div>}
    {!free&&<MobileAppNav activeLevel={level} activeSection="games"/>}
  </section>;
}
