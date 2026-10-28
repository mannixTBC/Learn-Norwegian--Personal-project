import React from 'react';
import NaturalConversationExercise from './NaturalConversationExercise';
import ScenarioCatalog from './ScenarioCatalog';
import StudioHeader from './StudioHeader';
import { Link } from 'react-router-dom';
import './StudioDesign.css';
export default function StudioCatalogView({mobile=false,...props}) {
 const {level,path,scenarios,selected,flow,learning,userId}=props;
 if(selected)return <NaturalConversationExercise key={selected.id+level} {...props} mobile={mobile}/>;
 return <section className={'conversation-studio studio-design practical-catalog '+(mobile?'conversation-studio--app mobile-conversation mobile-conversation--catalog':'desktop-conversation desktop-conversation--catalog')}>
  <StudioHeader level={level} back={'/studio?nivel='+level} title=""/>
  <div className="studio-heading sc-title"><h1>Situații practice</h1><p>Ce vrei să exersezi astăzi?</p><small>Apasă pe o situație și începe să vorbești.</small></div>
  <ScenarioCatalog key={level+':'+path.id+':'+(userId||'guest')} {...{scenarios,path,flow,level,learning,userId,mobile}}/>
  <Link className="studio-text-link practical-back" to={'/studio?nivel='+level}>Înapoi la studio</Link>
 </section>;
}
