import React, { useEffect, useRef, useState } from 'react';
import { getLessonVisual } from '../lessons/lessonVisuals';
import { speakPronunciationModel } from '../../services/azurePronunciationSpeech';

export function CathedralIcon({ name }) {
  const paths = {
    mic: <><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M6 11a6 6 0 0 0 12 0m-6 6v4m-3 0h6" /></>,
    listen: <><path d="m11 4-6 5H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /></>,
    slow: <><circle cx="12" cy="12" r="8" /><path d="m12 12 4-4M7 17h10" /></>,
    retry: <><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" /></>,
    headphones: <><path d="M4 14v-3a8 8 0 0 1 16 0v3" /><rect x="3" y="12" width="4" height="8" rx="2" /><rect x="17" y="12" width="4" height="8" rx="2" /></>,
    book: <><path d="M12 6v15M3 4c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 2-2-2-5-3-9-2Z" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.mic}</svg>;
}

export function CathedralDialog({ title, onClose, children, footer }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const trigger = document.activeElement;
    dialog.showModal();
    return () => { dialog.close(); if (trigger?.isConnected) trigger.focus(); };
  }, []);
  return <dialog ref={ref} className="cathedral-dialog" aria-label={title} onCancel={event => { event.preventDefault(); onClose(); }}>
    <header><h2>{title}</h2><button type="button" onClick={onClose} aria-label="Închide">×</button></header>
    <div className="cathedral-dialog__body">{children}</div>
    {footer && <footer>{footer}</footer>}
  </dialog>;
}

export function CathedralPager({ page, pages, onChange }) {
  return <div className="cathedral-pager">
    <button type="button" disabled={page === 0} onClick={() => onChange(page - 1)} aria-label="Pagina anterioară">‹</button>
    <span>Pagina {page + 1} din {pages}</span>
    <button type="button" disabled={page + 1 >= pages} onClick={() => onChange(page + 1)} aria-label="Pagina următoare">›</button>
  </div>;
}

export function useShortVoiceScreen() {
  const [short, setShort] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-height: 440px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-height: 440px)');
    const update = () => setShort(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return short;
}

function WordFeedback({ words }) {
  return <div className="cathedral-word-feedback">{words.map((item, index) => <span className={`is-${item.status}`} key={index}>
    <strong lang="nb">{item.expected}</strong><small>{item.status === 'correct' ? 'Clar' : item.status === 'close' ? 'Aproape' : item.status === 'missing' ? 'Lipsă' : 'De repetat'}</small>
    {item.spoken && item.spoken !== item.expected && <small lang="nb">Ai spus: {item.spoken}</small>}
  </span>)}</div>;
}

export default function PronunciationCathedral({ phrase, level, lessonId, status, elapsed, result, error, audioUrl, bestScore, attempts, onRecord, onStop, onRetry }) {
  const artwork = getLessonVisual(level, lessonId);
  const [panel, setPanel] = useState(null);
  const [tab, setTab] = useState('score');
  const [page, setPage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState('');
  const audioRef = useRef(null);
  const short = useShortVoiceScreen();
  const busy = ['requesting', 'processing', 'analyzing'].includes(status);
  const recording = status === 'recording';
  const resultTitle = result ? ({ excellent: 'Pronunție clară', good: 'Foarte bine', practice: 'Mai exersăm', retry: 'Mai încearcă' }[result.feedback.tone] || result.feedback.title) : '';
  const label = recording ? 'Oprește înregistrarea' : status === 'requesting' ? 'Pregătim microfonul…' : busy ? 'Se analizează…' : 'Începe înregistrarea';
  const words = result?.alignment.filter(item => item.expected) || [];
  const wordsPerPage = short ? 4 : 8;
  const transcript = result?.transcript.split(/\s+/).filter(Boolean) || [];
  const pageSize = tab === 'words' ? wordsPerPage : 24;
  const pages = Math.max(1, Math.ceil((tab === 'words' ? words.length : tab === 'transcript' ? transcript.length : 1) / pageSize));
  const open = value => { setPanel(value); setPage(0); setTab('score'); };
  const stopPlayback = () => { audioRef.current?.pause(); setPlaying(false); };
  const model = slow => { stopPlayback(); speakPronunciationModel(phrase.example, slow ? { slow:true } : undefined); };
  const playback = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { setPlaybackError(''); audioRef.current.play().then(() => setPlaying(true)).catch(() => { setPlaybackError('Nu am putut reda înregistrarea. Încearcă din nou.'); open('playback'); }); }
  };
  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, [audioUrl]);
  useEffect(() => { setPage(0); }, [short]);

  return <section className={`cathedral-lab cathedral-lab--${status}${phrase.example.length > 120 ? ' cathedral-lab--long' : ''}`} aria-labelledby="cathedral-phrase">
    <img className="nordic-pronunciation-art" data-theme={artwork.theme} src={artwork.theme === 'cafe' ? '/images/lessons/pronunciation-warm-cafe.webp' : artwork.src} alt={artwork.alt} />
    <article className="cathedral-quote">
      <div className="cathedral-quote__label"><span>1 · Ascultă modelul</span><button type="button" onClick={() => open('about')} aria-label="Despre exercițiu și cel mai bun scor">i</button></div>
      <div className="cathedral-quote__text"><blockquote id="cathedral-phrase" lang="nb">{phrase.example}</blockquote><p lang="ro">{phrase.translation}</p></div>
      <div className="cathedral-model-actions">
        <button type="button" disabled={recording || busy} onClick={() => model(false)} aria-label="Ascultă modelul"><CathedralIcon name="listen" />Ascultă modelul</button>
        <button type="button" disabled={recording || busy} onClick={() => model(true)} aria-label="Ascultă mai lent"><CathedralIcon name="slow" />Mai lent</button>
        <button type="button" className="cathedral-translation" onClick={() => open('translation')} aria-label="Vezi traducerea">RO</button>
      </div>
    </article>
    <div className="cathedral-workspace">
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} />}
      {result ? <div className="cathedral-result" aria-live="polite">
        <button type="button" className="cathedral-result__heading" onClick={() => open('result')} aria-label={`Scor ${result.score} din 100. ${result.feedback.title}. Vezi rezultatul și detaliile`}><span className="cathedral-score">{result.score}</span><span><strong>{resultTitle}</strong><small>Rezultat și detalii →</small></span></button>
        <div className="cathedral-focus-words" aria-label="Cuvinte de repetat">{result.focusWords.length ? result.focusWords.slice(0, 3).map((item, index) => <span key={index} lang="nb">{item.expected}</span>) : <span className="is-clear">Fraza este clară</span>}</div>
        <div className="cathedral-result__actions"><button type="button" onClick={() => { stopPlayback(); onRetry(); }}><CathedralIcon name="retry" />Repetă</button>{audioUrl && <button type="button" onClick={playback} aria-pressed={playing}><CathedralIcon name="headphones" />{playing ? 'Pauză' : 'Vocea mea'}</button>}</div>
      </div> : <div className="cathedral-recorder">
        <p className="nordic-recorder-instruction">Repetă propoziția după model.</p>
        <div className="cathedral-wave" aria-hidden="true">{[8,14,23,12,19,27,12,20,9].map((height,index) => <span key={index} style={{ '--bar': index, '--height': `${height}px` }} />)}</div>
        <button type="button" className={`cathedral-record${recording ? ' is-recording' : ''}${busy ? ' is-busy' : ''}`} onClick={() => { if (recording) onStop(); else { stopPlayback(); onRecord(); } }} disabled={busy} aria-label={label} aria-pressed={recording}>{recording ? <span className="cathedral-stop" /> : <CathedralIcon name="mic" />}</button>
        <div className="cathedral-recorder__copy" aria-live="polite"><strong>{recording ? `Înregistrare · 0:${String(elapsed).padStart(2,'0')}` : busy ? label : error ? 'Înregistrarea nu a putut fi finalizată' : 'Înregistrează'}</strong><span>{recording ? 'Apasă pentru a opri · max. 0:30' : status === 'requesting' ? 'Permite accesul la microfon.' : busy ? 'Îți pregătim feedbackul.' : error ? <button type="button" onClick={() => open('error')} className="cathedral-text-button">Detalii și ajutor →</button> : 'Spune fraza, apoi oprește înregistrarea.'}</span></div>
        {audioUrl && status === 'error' && <button type="button" className="cathedral-voice-replay" onClick={playback}><CathedralIcon name="headphones" />{playing ? 'Pauză' : 'Vocea mea'}</button>}
      </div>}
    </div>
    {panel && <CathedralDialog title={panel === 'result' ? 'Rezultatul pronunției' : panel === 'translation' ? 'Traducerea frazei' : panel === 'error' || panel === 'playback' ? 'Ajutor audio' : 'Exersează cu vocea ta'} onClose={() => setPanel(null)} footer={panel === 'result' && pages > 1 ? <CathedralPager page={page} pages={pages} onChange={setPage} /> : null}>
      {panel === 'translation' && <><blockquote lang="nb">{phrase.example}</blockquote><p>{phrase.translation}</p></>}
      {panel === 'about' && <><p>Ascultă modelul normal sau lent, apoi înregistrează aceeași frază. Poți înregistra cel mult 30 de secunde.</p><div className="cathedral-about-score"><strong>{bestScore ? `${bestScore}%` : '—'}</strong><span>Cel mai bun scor · {level}<small>{attempts.length} încercări salvate local</small></span></div><p>Scorul este orientativ și nu influențează progresul lecțiilor.</p><p>Înregistrarea este folosită pentru evaluare și nu este păstrată în aplicație.</p>{audioUrl && <button type="button" onClick={playback}>{playing ? 'Pauză' : 'Ascultă ultima înregistrare'}</button>}</>}
      {(panel === 'error' || panel === 'playback') && <><p role="alert">{panel === 'error' ? error : playbackError}</p><p>Poți folosi în continuare „Ascultă” și „Lent”.</p>{audioUrl && <button type="button" onClick={playback}>{playing ? 'Pauză' : 'Ascultă înregistrarea'}</button>}</>}
      {panel === 'result' && result && <>
        <div className="cathedral-tabs" role="group" aria-label="Detaliile rezultatului">{[['score','Scor'],['words','Cuvinte'],['transcript','Transcriere']].map(([value,title]) => <button type="button" key={value} aria-pressed={tab === value} onClick={() => { setTab(value); setPage(0); }}>{title}</button>)}</div>
        {tab === 'score' && <><h3>{result.feedback.title}</h3><p>{result.feedback.text}</p><div className="cathedral-metrics"><div><span>Claritate</span><strong>{result.accuracy}%</strong></div><div><span>Frază completă</span><strong>{result.completeness}%</strong></div><div><span>Fluență</span><strong>{result.rhythm}%</strong></div></div><p className="cathedral-note">Scor orientativ · {result.score} din 100</p></>}
        {tab === 'words' && <WordFeedback words={words.slice(page * wordsPerPage,(page + 1) * wordsPerPage)} />}
        {tab === 'transcript' && <><p>Ce am recunoscut automat:</p><blockquote lang="nb">{transcript.slice(page * 24,(page + 1) * 24).join(' ')}</blockquote></>}
      </>}
    </CathedralDialog>}
  </section>;
}
