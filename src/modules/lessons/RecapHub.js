import React, {useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {getLearningLevel} from './learningLevel';
import {courseCatalog} from './norwegian-program/lessonContent';
import {ExerciseLevelSelect} from '../exercises/ExerciseUI';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import MobileAppNav from '../layout/MobileAppNav';
import './RecapHub.css';
const choices=[
 {id:'lessons',title:'Sumar lecții',description:'Ideile esențiale din lecțiile tale.',path:'/sumar-lectii'},
 {id:'verbs',title:'Verbe',description:'Repetă formele și folosirea verbelor.',path:'/challenge30'},
 {id:'words',title:'Descoperă cuvântul',description:'Amintește-ți cuvintele prin joc.',path:'/hangman'},
];
function RecapHeader({level,summary=false}){
 return <><header className="recap-top"><Link className="recap-back" to={(summary?'/recapitulare-azi':'/jocuri')+'?nivel='+level} aria-label={summary?'Înapoi la recapitulare':'Înapoi la practică'}>‹</Link><Link className="recap-logo" to="/dashboard" aria-label="NordLingo - Acasă"><NorwegianFlagIcon/></Link><ExerciseLevelSelect level={level}/></header><div className="recap-heading"><h1>{summary?'Sumar lecții':'Recapitulare'}</h1><p>{summary?'Revezi ideile esențiale, în ritmul tău.':'Alege ce vrei să repeți astăzi.'}</p></div></>;
}
export default function RecapHub(){
 const {search}=useLocation(),level=getLearningLevel(search);
 return <section className="exercise-screen recap-page recap-hub"><RecapHeader level={level}/><div className="recap-choices">{choices.map((choice,i)=><Link className="recap-choice" key={choice.id} to={choice.path+'?nivel='+level} aria-labelledby={'recap-'+choice.id}><svg className="recap-art" viewBox={`${i*724} 0 724 724`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><image href="/images/recap/cards.png" width="2172" height="724"/></svg><div className="recap-choice-copy"><h2 id={'recap-'+choice.id}>{choice.title}</h2><p>{choice.description}</p></div></Link>)}</div><MobileAppNav activeLevel={level} activeSection="games"/></section>;
}
function SummaryContent({level}){
 const lessons=courseCatalog[level]?.lessons||[];
 const [selected,setSelected]=useState(String(lessons[0]?.id||''));
 const lesson=lessons.find(item=>String(item.id)===selected);
 return <><label className="recap-lesson-picker">Alege lecția<select value={selected} onChange={e=>setSelected(e.target.value)}>{lessons.map(item=><option value={item.id} key={item.id}>{item.id}. {item.title}</option>)}</select></label>{lesson?<article className="recap-lesson"><h2>{lesson.title}</h2>{lesson.objectives?.length>0&&<><h3>Idei esențiale</h3><ul>{lesson.objectives.map((text,i)=><li key={i}>{text}</li>)}</ul></>}{lesson.grammar?.rule&&<><h3>{lesson.grammar.title||'Gramatică'}</h3><p>{lesson.grammar.rule}</p></>}{lesson.vocabulary?.length>0&&<><h3>Vocabular</h3><dl>{lesson.vocabulary.map(([norwegian,translation],i)=><div key={i}><dt lang="nb">{norwegian}</dt><dd>{translation}</dd></div>)}</dl></>}</article>:<p role="status">Nu sunt lecții pentru acest nivel.</p>}<Link className="recap-review-link" to={'/recapitulare?nivel='+level}>Revezi expresiile de repetat</Link></>;
}
export function LessonSummary(){const {search}=useLocation(),level=getLearningLevel(search);return <section className="exercise-screen recap-page recap-summary"><RecapHeader level={level} summary/><SummaryContent key={level} level={level}/><MobileAppNav activeLevel={level} activeSection="games"/></section>;}
