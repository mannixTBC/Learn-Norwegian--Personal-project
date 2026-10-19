import React, { useEffect, useRef, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { courseCatalog } from './norwegian-program/lessonContent';
import { getLearningLevel } from './learningLevel';
import { curriculumLevels, curriculumPacing } from './curriculumMetadata';
import { courseProgressKey, finalTestKey, lessonResumeKey, readCourseProgress } from '../../services/curriculumProgress';
import { getReviewStats } from '../../services/spacedReview';
import { getCareerPath, getCareerProfile } from '../../services/careerProfile';
import { useAuth } from '../auth/AuthContext';
import MobileAppNav from '../layout/MobileAppNav';
import './CurriculumHub.css';

const readStep = (level, id, user) => {
  try { return Math.max(0, Math.min(7, Number(JSON.parse(localStorage.getItem(`${lessonResumeKey(level, id, user)}_voice_v1`))) || 0)); }
  catch (_) { return 0; }
};

const LearningHub = () => {
  const { user } = useAuth();
  const location = useLocation();
  const history = useHistory();
  const activeLevel = getLearningLevel(location.search);
  const course = courseCatalog[activeLevel];
  const progress = readCourseProgress(activeLevel, user, course.lessons);
  const next = course.lessons.find((lesson) => !progress.completed.includes(lesson.id));
  const [openSection, setOpenSection] = useState(next?.sectionId || course.sections[0].id);
  const levelTabs = useRef([]);
  const complete = new Set(progress.completed);
  const stepCount = course.lessons.reduce((total, lesson) => total + (complete.has(lesson.id) ? 7 : readStep(activeLevel, lesson.id, user)), 0);
  const percent = Math.round(stepCount / (course.lessons.length * 7) * 100);
  const vocabularyCount = course.lessons.reduce((total, lesson) => total + lesson.introducedVocabulary.length, 0);
  const path = getCareerPath(getCareerProfile(user)?.pathId);
  const review = getReviewStats(activeLevel);
  const best = Number(localStorage.getItem(finalTestKey(activeLevel, 'best', user))) || 0;
  const legacyKey = activeLevel === 'A1' ? 'lesson_prog_progress' : `lesson_prog_progress_${activeLevel.toLowerCase()}`;
  const hasLegacyProgress = localStorage.getItem(legacyKey) && !localStorage.getItem(courseProgressKey(activeLevel, user));

  useEffect(() => {
    localStorage.setItem('norwegian_active_level', activeLevel);
    setOpenSection(next?.sectionId || course.sections[0].id);
  }, [activeLevel]);

  const selectLevel = (level) => {
    const query = new URLSearchParams(location.search); query.set('nivel', level);
    history.replace({ pathname: location.pathname, search: query.toString() });
  };
  const navigateLevels = (event, index) => {
    const destination = { ArrowRight: (index + 1) % curriculumLevels.length, ArrowLeft: (index + curriculumLevels.length - 1) % curriculumLevels.length, Home: 0, End: curriculumLevels.length - 1 }[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    selectLevel(curriculumLevels[destination].code);
    levelTabs.current[destination]?.focus();
  };

  return <div className="curriculum-hub">
    <header className="curriculum-intro">
      <div><span className="curriculum-eyebrow">Un traseu care se construiește cu tine</span><h1>De la primele cuvinte<br />la idei exprimate cu precizie.</h1><p>Șase niveluri. Lecții legate între ele. Aceleași expresii revin în situații noi, până când le poți folosi singur.</p></div>
      <div className="curriculum-progress"><span>Parcursul tău · {activeLevel}</span><strong>{percent}<small>%</small></strong><div role="progressbar" aria-label={`Progres ${activeLevel}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><i style={{ width: `${percent}%` }} /></div><p>{complete.size} din {course.lessons.length} lecții finalizate</p></div>
    </header>
    <div className="curriculum-levels" role="tablist" aria-label="Nivelurile programei">
      {curriculumLevels.map((level, index) => <button type="button" role="tab" aria-selected={activeLevel === level.code} tabIndex={activeLevel === level.code ? 0 : -1} ref={(element) => { levelTabs.current[index] = element; }} onKeyDown={(event) => navigateLevels(event, index)} aria-controls="curriculum-level-panel" id={`curriculum-tab-${level.code}`} className={activeLevel === level.code ? 'active' : ''} onClick={() => selectLevel(level.code)} key={level.code}><strong>{level.code}</strong><span>{level.title}</span></button>)}
    </div>
    {hasLegacyProgress && <p className="curriculum-history">Programa a fost reorganizată. Istoricul tău de studiu este păstrat; noul traseu are propriul progres.</p>}
    <section id="curriculum-level-panel" role="tabpanel" aria-labelledby={`curriculum-tab-${activeLevel}`}>
      <div className="curriculum-level-heading"><div><span className="curriculum-eyebrow">{activeLevel} · {course.title}</span><h2>Ce vei putea face</h2><p>{course.outcome}</p></div><div className="curriculum-metrics"><span><strong>{course.sections.length}</strong> secțiuni</span><span><strong>{course.lessons.length}</strong> lecții și misiuni</span><span><strong>{vocabularyCount}</strong> expresii introduse</span></div></div>
      {next && <Link className="curriculum-continue" to={`/curs/${activeLevel.toLowerCase()}/${next.id}`}><span><small>{readStep(activeLevel, next.id, user) ? 'Continuă de unde ai rămas' : 'Următorul pas'} · Secțiunea {next.sectionNumber}</small><strong>{next.title}</strong><em>{next.duration} min · {next.kind === 'consolidation' ? 'Consolidare, fără vocabular nou obligatoriu' : `${next.introducedVocabulary.length} expresii noi · ${next.recycledVocabulary.length} reactivări`}</em></span><b aria-hidden="true">→</b></Link>}
      <div className="curriculum-sections">
        {course.sections.map((section) => {
          const completed = section.lessons.filter((lesson) => complete.has(lesson.id)).length;
          const expanded = openSection === section.id;
          return <section className={`curriculum-section ${expanded ? 'is-open' : ''}`} key={section.id}>
            <button type="button" className="curriculum-section__toggle" aria-expanded={expanded} aria-controls={`curriculum-section-${activeLevel}-${section.id}`} onClick={() => setOpenSection(expanded ? null : section.id)}><span className="curriculum-section__number">{completed === section.lessons.length ? '✓' : String(section.number).padStart(2, '0')}</span><span><small>Secțiunea {section.number} · {completed}/{section.lessons.length} parcurse</small><strong>{section.title}</strong><em>{section.outcome}</em></span><b aria-hidden="true">{expanded ? '−' : '+'}</b></button>
            <div id={`curriculum-section-${activeLevel}-${section.id}`} hidden={!expanded}>
              <ol className="curriculum-lessons">{section.lessons.map((lesson) => <li className={lesson.kind === 'consolidation' ? 'is-mission' : ''} key={lesson.uid}><Link to={`/curs/${activeLevel.toLowerCase()}/${lesson.id}`}><span className={`curriculum-lesson-node ${complete.has(lesson.id) ? 'is-complete' : ''}`}>{complete.has(lesson.id) ? '✓' : String(lesson.id).padStart(2, '0')}</span><span><small>{lesson.kind === 'consolidation' ? 'Misiune de consolidare' : `Lecția ${lesson.positionInSection} din secțiune`} · {lesson.duration} min</small><strong>{lesson.title}</strong><em>{lesson.kind === 'consolidation' ? 'Reunești cele trei lecții în aceeași situație.' : `${lesson.introducedVocabulary.length} expresii noi · ${lesson.recycledVocabulary.length} expresii reamintite`}</em></span><b aria-hidden="true">›</b></Link></li>)}</ol>
              <div className="curriculum-section__mission"><span>La finalul secțiunii</span><p>{section.mission}</p></div>
            </div>
          </section>;
        })}
      </div>
      <section className="curriculum-pace"><span className="curriculum-eyebrow">Ritmul tău de învățare</span><h2>Învață. Reamintește-ți. Folosește.</h2><ol><li><strong>01 · Reactivare</strong><span>Începi cu expresii din lecțiile anterioare.</span></li><li><strong>02 · Un pas nou</strong><span>Adaugi un grup mic de expresii și o structură.</span></li><li><strong>03 · Transfer</strong><span>Le folosești în dialog, scris și vorbit.</span></li><li><strong>04 · Consolidare</strong><span>La fiecare trei lecții rezolvi o misiune cumulativă.</span></li></ol><p>{curriculumPacing.daily} {curriculumPacing.cycle}</p><small>{curriculumPacing.scope}</small></section>
      <section className="curriculum-assessment"><div><small>La finalul nivelului {activeLevel}</small><h2>Evaluează ce poți folosi</h2><p>Întrebări din toate cele șase secțiuni, urmate de o sarcină scrisă și una orală cu criterii de autoevaluare.</p>{best > 0 && <span>Cel mai bun rezultat la exerciții: {best}%</span>}</div><Link to={`/test-final/${activeLevel.toLowerCase()}`}>Deschide evaluarea →</Link></section>
    </section>
    <footer className="curriculum-tools"><Link to={`/alege-directia?redirect=${encodeURIComponent(`/invata?nivel=${activeLevel}`)}`}><small>Direcția ta</small><strong>{path.shortTitle}</strong><span>Adaptează contexte de practică →</span></Link><Link to={`/recapitulare?nivel=${activeLevel}`}><small>Repetare spațiată</small><strong>{review.due ? `${review.due} expresii de repetat` : 'Recapitularea ta'}</strong><span>Revino la ce ai învățat →</span></Link><Link to={`/pronuntie?nivel=${activeLevel}`}><small>Ascultare și pronunție</small><strong>Expresiile acestui nivel</strong><span>Ascultă și repetă →</span></Link></footer>
    <MobileAppNav activeLevel={activeLevel} />
  </div>;
};

export default LearningHub;
