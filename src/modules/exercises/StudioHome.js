import {ui} from '../../languages/messages.js';
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
 return <section className="conversation-studio studio-design studio-home" aria-label={ui('ui_627177131244717f')}>
 <StudioHeader level={level}/>
 <div className="studio-options">
 <article className="studio-option"><NordicStudioArtwork scene="cafe" className="studio-option-art"/><div><h2>{ui('ui_cec5dce802740a64')}</h2><p>{ui('web_d0a07eaadb07258a')}</p></div><Link className="studio-primary" to={'/scenarii?nivel='+level}>{ui('web_b9b7ddadeac6112d')}<span aria-hidden="true">→</span></Link></article>
 <article className="studio-option"><NordicStudioArtwork scene="nora" className="studio-option-art"/><div><h2>{ui('ui_3139a37ef376409e')}</h2><p>{ui('web_bc8e74513ff52b2a')}</p></div><Link className="studio-primary" to={'/studio?nivel='+level+'&mod=liber'}>{ui('web_036dd8e18a9ce81d')}<span aria-hidden="true">→</span></Link></article>
 </div><MobileAppNav activeLevel={level} activeSection="games"/>
 </section>;
}
