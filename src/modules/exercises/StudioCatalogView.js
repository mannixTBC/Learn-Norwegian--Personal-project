import React from 'react';
import NaturalConversationExercise from './NaturalConversationExercise';
import ScenarioCatalog from './ScenarioCatalog';
import StudioHeader from './StudioHeader';
import './StudioDesign.css';
export default function StudioCatalogView({mobile=false,...props}) {
 const {level,path,scenarios,selected,flow,learning,userId}=props;
 if(selected)return <NaturalConversationExercise key={selected.id+level} {...props} mobile={mobile}/>;
 return <section aria-label="Situații practice" className={'conversation-studio studio-design practical-catalog '+(mobile?'conversation-studio--app mobile-conversation mobile-conversation--catalog':'desktop-conversation desktop-conversation--catalog')}>
  <StudioHeader level={level} back={'/studio?nivel='+level} title=""/>
  <ScenarioCatalog key={level+':'+path.id+':'+(userId||'guest')} {...{scenarios,path,flow,level,learning,userId,mobile}}/>
 </section>;
}
