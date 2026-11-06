import {ui} from '../../languages/messages.js';
import React from 'react';
import {Link,useLocation} from 'react-router-dom';
import {getLearningLevel} from './learningLevel';
import {courseCatalog} from '../../content/activeContent.js';
import {ExerciseLevelSelect} from '../exercises/ExerciseUI';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import MobileAppNav from '../layout/MobileAppNav';
import './RecapHub.css';
import GrammarGuide,{grammarLinks} from './grammar/GrammarGuide';
import SummaryNotebook from './SummaryNotebook';
const recapChoices=[
 {id:'mistakes',title:ui('ui_3a5833ca5f1bef01'),description:'Revino la lucrurile care cer puțină practică.',path:'/recapitulare',art:2},
 {id:'lessons',title:'Sumar lecții',description:'Ideile esențiale din lecțiile tale.',path:'/sumar-lectii'},
];
const grammarChoices=[{id:'verbs',title:ui('ui_0ab5702e18c47e05'),description:'Repetă formele și folosirea verbelor.',path:'/challenge30',art:1},];
function ChoiceCards({choices,level}){
 return <div className="recap-choices">{choices.map(choice=><Link className="recap-choice" key={choice.id} to={choice.path+'?nivel='+level} aria-labelledby={'recap-'+choice.id}><svg className="recap-art" viewBox={`${(choice.art||0)*724} 0 724 724`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><image href="/images/recap/cards.png" width="2172" height="724"/></svg><div className="recap-choice-copy"><h2 id={'recap-'+choice.id}>{choice.title}</h2><p>{choice.description}</p></div></Link>)}</div>;
}
function RecapHeader({level,summary=false}){
 return <><header className="recap-top"><Link className="recap-back" to={(summary?'/recapitulare-azi':'/jocuri')+'?nivel='+level} aria-label={summary?ui('web_c7e546dfc24c2221'):ui('ui_18c234c09d63bb77')}>‹</Link><Link className="recap-logo" to="/dashboard" aria-label={ui('web_c5ac94a4335cbea9')}><NorwegianFlagIcon/></Link><ExerciseLevelSelect level={level}/></header></>;
}
export default function RecapHub(){
 const {search}=useLocation(),level=getLearningLevel(search);
 return <section className="exercise-screen recap-page recap-hub"><RecapHeader level={level}/><ChoiceCards choices={recapChoices} level={level}/><MobileAppNav activeLevel={level} activeSection="games"/></section>;
}
export function LessonSummary(){const {search}=useLocation(),level=getLearningLevel(search);return <section className="exercise-screen recap-page recap-summary"><RecapHeader level={level} summary/><SummaryNotebook key={level} level={level}/><MobileAppNav activeLevel={level} activeSection="games"/></section>;}
export function GrammarPage(){
 const {search}=useLocation(),level=getLearningLevel(search),id=new URLSearchParams(search).get('lectie');
 if(new URLSearchParams(search).has('capitol'))return <GrammarGuide level={level}/>;
 const lesson=courseCatalog[level]?.lessons.find(item=>String(item.id)===id);
 if(!lesson)return <section className="exercise-screen recap-page recap-hub recap-grammar"><RecapHeader level={level}/><div className="recap-heading"><h1>{ui('ui_b3e5917f6637de1c')}</h1></div><div className="grammar-menu">{[...grammarChoices,...grammarLinks].map(c=><Link key={c.id} to={c.path+'?nivel='+level+(c.id==='verbs'?'':'&capitol='+c.id)}><strong>{c.title}</strong><small>{c.description}</small></Link>)}</div><MobileAppNav activeLevel={level} activeSection="games"/></section>;
 return <section className="exercise-screen recap-page recap-grammar"><RecapHeader level={level} summary/><div className="recap-heading"><h1>{ui('ui_b3e5917f6637de1c')}</h1>{lesson&&<p>{ui('ui_abf153365567efe1')}{lesson.id} · {lesson.title}</p>}</div><article className="recap-lesson">{lesson?<><h2>{lesson.grammar?.title||'Regula lecției'}</h2><p>{lesson.grammar?.rule||'Această lecție nu are o regulă de gramatică separată.'}</p></>:<p>{ui('ui_9b6a601a26a4a7f0')}</p>}</article>{lesson&&<Link className="recap-review-link" to={'/sumar-lectii?nivel='+level+'&lectie='+lesson.id}>{ui('ui_c3b2023d337199ce')}</Link>}<MobileAppNav activeLevel={level} activeSection="games"/></section>;
}
