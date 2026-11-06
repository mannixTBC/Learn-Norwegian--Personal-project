import {ui} from '../../languages/messages.js';
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
    <header><h2>{title}</h2><button type="button" onClick={onClose} aria-label={ui('ui_b7f0026982e780c3')}>×</button></header>
    <div className="cathedral-dialog__body">{children}</div>
    {footer && <footer>{footer}</footer>}
  </dialog>;
}

export function CathedralPager({ page, pages, onChange }) {
  return <div className="cathedral-pager">
    <button type="button" disabled={page === 0} onClick={() => onChange(page - 1)} aria-label={ui('web_7a48c3070acbf66d')}>‹</button>
    <span>{ui('web_8ca8449cdf7c5edf')}{page + 1}{ui('ui_dbd8b6478643d623')}{pages}</span>
    <button type="button" disabled={page + 1 >= pages} onClick={() => onChange(page + 1)} aria-label={ui('web_37941f7a4c6c1c11')}>›</button>
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
    <strong lang="nb">{item.expected}</strong><small>{item.status === 'correct' ? ui('ui_85ebc7876f8fc9a7') : item.status === 'close' ? ui('ui_cb51bb7d35fbe728') : item.status === 'missing' ? ui('ui_6cf17cf9df64a757') : ui('ui_352b62f7948b0ff4')}</small>
    {item.spoken && item.spoken !== item.expected && <small lang="nb">Ai spus: {item.spoken}</small>}
  </span>)}</div>;
}

export default function PronunciationCathedral({ phrase, level, lessonId, status, elapsed, result, error, audioUrl, bestScore, attempts, onRecord, onStop, onRetry, practice=false, phraseIndex=0, lessonTitle, onPrevious, onNext, lastPhrase }) {
  const artwork = getLessonVisual(level, lessonId);
  const [panel, setPanel] = useState(null);
  const [tab, setTab] = useState('score');
  const [page, setPage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState('');
  const audioRef = useRef(null);
  const held=useRef(false);
  const beginHold=async()=>{if(held.current||busy||recording)return;held.current=true;stopPlayback();await onRecord();if(!held.current)onStop();};
  const endHold=()=>{held.current=false;onStop();};
  const short = useShortVoiceScreen();
  const busy = ['requesting', 'processing', 'analyzing'].includes(status);
  const recording = status === 'recording';
  const resultTitle = result ? ({ excellent: 'Pronunție clară', good: 'Foarte bine', practice: ui('ui_3c03d987b173a837'), retry: 'Mai încearcă' }[result.feedback.tone] || result.feedback.title) : '';
  const label = recording ? ui('ui_6b788923b942b5d9') : status === 'requesting' ? 'Pregătim microfonul…' : busy ? ui('ui_6e5a6789766476d0') : ui('ui_4965f042ac418235');
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
    {!practice && <img className="nordic-pronunciation-art" data-theme={artwork.theme} src={artwork.theme === 'cafe' ? '/images/lessons/pronunciation-warm-cafe.webp' : artwork.src} alt={artwork.alt} />}
    <article className="cathedral-quote">
      <div className="cathedral-quote__label"><span>{practice?lessonTitle:'1 · Ascultă modelul'}</span><button type="button" onClick={() => open('about')} aria-label={ui('web_00b437cb47cceb6c')}>{ui('web_de7d1b721a1e0632')}</button></div>
      {practice&&<img className="practice-voice-cup" src="/images/practice/pronunciation-cup.png" alt="" aria-hidden="true"/>}
      <div className="cathedral-quote__text"><blockquote id="cathedral-phrase" lang="nb">{phrase.example}</blockquote><p lang="ro">{phrase.translation}</p></div>
      <div className="cathedral-model-actions">
        <button type="button" disabled={recording || busy} onClick={() => model(false)} aria-label={ui('web_f0330ca93eadaded')}><CathedralIcon name="listen" />{practice?ui('ui_f1e65126c6a41e7b'):ui('web_f0330ca93eadaded')}</button>
        <button type="button" disabled={recording || busy} onClick={() => model(true)} aria-label={ui('web_929c7c800471390c')}><CathedralIcon name="slow" />{ui('ui_7e65a53eb92be733')}</button>
        <button type="button" className="cathedral-translation" onClick={() => open('translation')} aria-label={ui('web_9023050dfbfd4358')}>{ui('web_0049aa51a630b791')}</button>
      </div>
    </article>
    <div className="cathedral-workspace">
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} />}
      {result ? <div className="cathedral-result" aria-live="polite">
        <button type="button" className="cathedral-result__heading" onClick={() => open('result')} aria-label={`Scor ${result.score} din 100. ${result.feedback.title}. Vezi rezultatul și detaliile`}><span className="cathedral-score">{result.score}</span><span><strong>{resultTitle}</strong><small>{ui('ui_589a932af7f45aa6')}</small></span></button>
        <div className="cathedral-focus-words" aria-label={ui('web_bbc452266d3cac2e')}>{result.focusWords.length ? result.focusWords.slice(0, 3).map((item, index) => <span key={index} lang="nb">{item.expected}</span>) : <span className="is-clear">{ui('web_4c4907cee8de0445')}</span>}</div>
        <div className="cathedral-result__actions"><button type="button" onClick={() => { stopPlayback(); onRetry(); }}><CathedralIcon name="retry" />{ui('ui_b8c341f9756d3352')}</button>{!practice && audioUrl && <button type="button" onClick={playback} aria-pressed={playing}><CathedralIcon name="headphones" />{playing ? 'Pauză' : 'Vocea mea'}</button>}</div>
      </div> : <div className="cathedral-recorder">
        <p className="nordic-recorder-instruction">{ui('ui_e27f2fdcfb39fa2a')}</p>
        <div className="cathedral-wave" aria-hidden="true">{[8,14,23,12,19,27,12,20,9].map((height,index) => <span key={index} style={{ '--bar': index, '--height': `${height}px` }} />)}</div>
        <button type="button" className={`cathedral-record${recording ? ' is-recording' : ''}${busy ? ' is-busy' : ''}`} onPointerDown={practice?event=>{if(event.button!==0)return;event.currentTarget.setPointerCapture(event.pointerId);void beginHold();}:undefined} onPointerUp={practice?endHold:undefined} onPointerCancel={practice?endHold:undefined} onLostPointerCapture={practice?()=>{if(held.current)endHold();}:undefined} onKeyDown={practice?event=>{if(event.key===' '){event.preventDefault();if(!event.repeat)void beginHold();}}:undefined} onKeyUp={practice?event=>{if(event.key===' '){event.preventDefault();endHold();}}:undefined} onBlur={practice?()=>{if(held.current)endHold();}:undefined} onClick={event=>{if(practice&&event.detail!==0)return;if(recording)onStop();else{stopPlayback();onRecord();}}} disabled={busy&&!held.current} aria-label={label} aria-pressed={recording}>{recording ? <span className="cathedral-stop" /> : <CathedralIcon name="mic" />}</button>
        <div className="cathedral-recorder__copy" aria-live="polite"><strong>{recording ? `Înregistrare · 0:${String(elapsed).padStart(2,'0')}` : busy ? label : error ? 'Înregistrarea nu a putut fi finalizată' : practice?ui('ui_366b1ac4a830754e'):'Înregistrează'}</strong><span>{recording ? (practice?ui('ui_24afa9090d3ea336'):'Apasă pentru a opri · max. 0:30') : status === 'requesting' ? 'Permite accesul la microfon.' : busy ? ui('ui_1d45e3442a2cf3e6') : error ? (practice ? <span role="alert">{error}</span> : <button type="button" onClick={() => open('error')} className="cathedral-text-button">{ui('web_9188a8be38beb3d6')}</button>) : practice?ui('ui_f4d15472c9635400'):'Spune fraza, apoi oprește înregistrarea.'}</span></div>
        {!practice && audioUrl && status === 'error' && <button type="button" className="cathedral-voice-replay" onClick={playback}><CathedralIcon name="headphones" />{playing ? 'Pauză' : 'Vocea mea'}</button>}
      </div>}
    </div>
    {practice&&<footer className="practice-voice-navigation"><button type="button" onClick={onPrevious} disabled={!phraseIndex||busy||recording}>{ui('ui_43d3098298b6c977')}</button>{lastPhrase?<a className={!result?'is-disabled':''} aria-disabled={!result} href={result?'/jocuri?nivel='+level:undefined}>{ui('ui_80ca7cf48e5467a3')}</a>:<button type="button" onClick={onNext} disabled={!result||busy||recording}>{ui('ui_5fc4497d148a38a8')}</button>}</footer>}
    {panel && <CathedralDialog title={panel === 'result' ? ui('ui_9b660a3bc6bf3764') : panel === 'translation' ? 'Traducerea frazei' : panel === 'error' || panel === 'playback' ? 'Ajutor audio' : 'Exersează cu vocea ta'} onClose={() => setPanel(null)} footer={panel === 'result' && pages > 1 ? <CathedralPager page={page} pages={pages} onChange={setPage} /> : null}>
      {panel === 'translation' && <><blockquote lang="nb">{phrase.example}</blockquote><p>{phrase.translation}</p></>}
      {panel === 'about' && <><p>{ui('web_e29c3c1220294b72')}</p><div className="cathedral-about-score"><strong>{bestScore ? `${bestScore}%` : '—'}</strong><span>{ui('web_86f49c9bcd6f9ce8')}{level}<small>{attempts.length}{ui('web_0c21bedb1c982c8d')}</small></span></div><p>{ui('web_b494b49b0fe1ba2d')}</p><p>{ui('web_fad0abdecec76802')}</p>{audioUrl && <button type="button" onClick={playback}>{playing ? 'Pauză' : 'Ascultă ultima înregistrare'}</button>}</>}
      {(panel === 'error' || panel === 'playback') && <><p role="alert">{panel === 'error' ? error : playbackError}</p><p>{ui('web_d4b26104d99e9469')}</p>{audioUrl && <button type="button" onClick={playback}>{playing ? 'Pauză' : ui('ui_10aed56aa8237020')}</button>}</>}
      {panel === 'result' && result && <>
        <div className="cathedral-tabs" role="group" aria-label={ui('web_0d5abb1f87fe035d')}>{[['score','Scor'],['words',ui('web_3bd236551c6abf1b')],['transcript','Transcriere']].map(([value,title]) => <button type="button" key={value} aria-pressed={tab === value} onClick={() => { setTab(value); setPage(0); }}>{title}</button>)}</div>
        {tab === 'score' && <><h3>{result.feedback.title}</h3><p>{result.feedback.text}</p><div className="cathedral-metrics"><div><span>{ui('web_eb95f8e94ea601be')}</span><strong>{result.accuracy}%</strong></div><div><span>{ui('web_4040b3bc90229a75')}</span><strong>{result.completeness}%</strong></div><div><span>{ui('web_c59e4963e03958e8')}</span><strong>{result.rhythm}%</strong></div></div><p className="cathedral-note">{ui('web_70811ef008b6e3e2')}{result.score}{ui('web_c0059984c39b88e4')}</p></>}
        {tab === 'words' && <WordFeedback words={words.slice(page * wordsPerPage,(page + 1) * wordsPerPage)} />}
        {tab === 'transcript' && <><p>{ui('web_91982fe8d6a81b08')}</p><blockquote lang="nb">{transcript.slice(page * 24,(page + 1) * 24).join(' ')}</blockquote></>}
      </>}
    </CathedralDialog>}
  </section>;
}
