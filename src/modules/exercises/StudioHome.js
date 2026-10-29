import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getLearningLevel } from '../lessons/learningLevel';
import MobileAppNav from '../layout/MobileAppNav';
import NordicStudioArtwork from './NordicStudioArtwork';
import {useAuth} from '../auth/AuthContext';
import StudioHeader from './StudioHeader';
import FreeConversation from './FreeConversation';
import './StudioDesign.css';
export default function StudioHome(){
 const auth=useAuth();
 const location=useLocation(),level=getLearningLevel(location.search);
 if(new URLSearchParams(location.search).get('mod')==='liber')return <FreeConversation key={level+':'+(auth?.user?.id||'guest')} level={level}/>;
 return <section className="conversation-studio studio-design studio-home" aria-label="Studio de conversație">
 <StudioHeader level={level}/>
 <div className="studio-options">
 <article className="studio-option"><NordicStudioArtwork scene="cafe" className="studio-option-art"/><div><h2>Situații practice</h2><p>Conversații pentru viața reală.</p></div><Link className="studio-primary" to={'/scenarii?nivel='+level}>Alege o situație <span aria-hidden="true">→</span></Link></article>
 <article className="studio-option"><NordicStudioArtwork scene="nora" className="studio-option-art"/><div><h2>Dialog liber</h2><p>Vorbește cu Nora în ritmul tău.</p></div><Link className="studio-primary" to={'/studio?nivel='+level+'&mod=liber'}>Vorbește cu Nora <span aria-hidden="true">→</span></Link></article>
 </div><MobileAppNav activeLevel={level} activeSection="games"/>
 </section>;
}
