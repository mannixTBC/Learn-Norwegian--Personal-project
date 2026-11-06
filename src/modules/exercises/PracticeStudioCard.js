import {ui} from '../../languages/messages.js';
import React from 'react';
import { Link } from 'react-router-dom';
import { ExerciseIcon } from './ExerciseUI';
import './PracticeOverview.css';

const reference = '/images/practice/ivory-reference.png';
function Bubble() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M21 11a9 9 0 0 1-13 8l-5 2 2-5A9 9 0 1 1 21 11Z"/></svg>; }

export default function PracticeStudioCard({ level }) {
  return (
    <section className="practice-studio" aria-labelledby="practice-studio-title">
      <Link className="practice-studio-entry" to={'/studio?nivel='+level} aria-labelledby="practice-studio-title"/>
      <svg className="practice-studio-scene" preserveAspectRatio="xMaxYMid slice" viewBox="64 720 393 221" aria-hidden="true"><defs><linearGradient id="practice-scene-reveal"><stop offset="0" stopColor="black"/><stop offset=".535" stopColor="black"/><stop offset=".64" stopColor="white"/><stop offset="1" stopColor="white"/></linearGradient><mask id="practice-scene-mask"><rect x="64" y="720" width="393" height="221" fill="url(#practice-scene-reveal)"/><rect x="76" y="876" width="312" height="53" rx="13" fill="black"/></mask></defs><image href={reference} width="1461" height="1076" mask="url(#practice-scene-mask)"/></svg>
      <div className="practice-studio-copy"><span className="practice-eyebrow">{ui('web_7bb2c326b7f5a41d')}</span><h2 id="practice-studio-title">{ui('web_949651d1951d4ec5')}<br/>{ui('ui_844efdee0cd2f266')}</h2><p>{ui('ui_457f1440e6cea6e5')}</p></div>
      <div className="practice-studio-actions"><Link className="practice-studio-action" to={'/scenarii?nivel='+level}><Bubble/>{ui('ui_cec5dce802740a64')}</Link><Link className="practice-studio-action practice-studio-action--free" to={'/studio?nivel='+level+'&mod=liber'}><ExerciseIcon name="pronunciation"/>{ui('ui_3139a37ef376409e')}</Link></div>
    </section>
  );
}
