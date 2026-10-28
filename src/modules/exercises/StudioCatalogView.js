import React from 'react';
import NaturalConversationExercise from './NaturalConversationExercise';
import ScenarioCatalog from './ScenarioCatalog';
import StudioHeader from './StudioHeader';
import PracticalStudioArtwork from './PracticalStudioArtwork';
import { Link } from 'react-router-dom';
import './StudioDesign.css';
export default function StudioCatalogView({mobile=false,...props}) {
 const {level,path,scenarios,selected,flow,learning,userId}=props;
 if(selected)return <NaturalConversationExercise key={selected.id+level} {...props} mobile={mobile}/>;
 return <section className={'conversation-studio studio-design practical-catalog '+(mobile?'conversation-studio--app mobile-conversation mobile-conversation--catalog':'desktop-conversation desktop-conversation--catalog')}>
  <PracticalStudioArtwork scene="landscape" className="practical-catalog-landscape"/>
  <StudioHeader level={level} practical/>
  <div className="studio-heading sc-title"><h1>Situații<br/>practice</h1><p>Exersează conversații din viața reală.</p></div>
  <ScenarioCatalog key={level+':'+path.id+':'+(userId||'guest')} {...{scenarios,path,flow,level,learning,userId,mobile}}/>
  <Link className="studio-text-link practical-back" to={'/studio?nivel='+level}>Înapoi la studio</Link>
 </section>;
}
