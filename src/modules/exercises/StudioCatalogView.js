import React from 'react';
import NaturalConversationExercise from './NaturalConversationExercise';
import ScenarioCatalog from './ScenarioCatalog';
import StudioHeader from './StudioHeader';
import StudioArtwork from './StudioArtwork';
import MobileAppNav from '../layout/MobileAppNav';
import './StudioDesign.css';
export default function StudioCatalogView({mobile=false,...props}) {
 const {level,path,scenarios,selected,flow,learning,userId}=props;
 if(selected)return <NaturalConversationExercise key={selected.id+level} {...props} mobile={mobile}/>;
 return <section className={'conversation-studio studio-design '+(mobile?'conversation-studio--app mobile-conversation mobile-conversation--catalog':'desktop-conversation desktop-conversation--catalog')}>
  <StudioHeader level={level} back={'/studio?nivel='+level}/>
  <div className="studio-heading sc-title"><StudioArtwork scene="fjord" className="studio-heading-art"/><h1>Situații<br/>practice</h1><p>Exersează conversații din viața reală.</p></div>
  <ScenarioCatalog key={level+':'+path.id+':'+(userId||'guest')} {...{scenarios,path,flow,level,learning,userId,mobile}}/>
  <MobileAppNav activeLevel={level} activeSection="games"/>
 </section>;
}
