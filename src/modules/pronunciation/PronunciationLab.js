import React, { useEffect, useRef, useState } from 'react';
import { speakPronunciationModel } from '../../services/azurePronunciationSpeech';
import { assessPronunciation } from '../../services/pronunciationAssessment';
import { recordStudyActivity } from '../../services/learningActivity';
import './PronunciationLab.css';

const MAX_SECONDS = 30;

const readAttempts = (level) => {
  try {
    const value = JSON.parse(localStorage.getItem(`pronunciation_attempts_${level.toLowerCase()}`));
    return Array.isArray(value) ? value : [];
  } catch (_) {
    return [];
  }
};

const blobToBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(String(reader.result).split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

const writeAscii = (view, offset, value) => {
  for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
};

const encodePcmWav = (samples, sampleRate) => {
  const bytesPerSample = 2;
  const buffer = new ArrayBuffer(44 + (samples.length * bytesPerSample));
  const view = new DataView(buffer);
  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + (samples.length * bytesPerSample), true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, samples.length * bytesPerSample, true);

  let offset = 44;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += bytesPerSample;
  }
  return buffer;
};

const convertToAzureWav = async (blob) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!AudioContext || !OfflineContext) return blob;

  const context = new AudioContext();
  try {
    const sourceAudio = await context.decodeAudioData(await blob.arrayBuffer());
    const sampleRate = 16000;
    const frameCount = Math.max(1, Math.ceil(sourceAudio.duration * sampleRate));
    const offline = new OfflineContext(1, frameCount, sampleRate);
    const source = offline.createBufferSource();
    source.buffer = sourceAudio;
    source.connect(offline.destination);
    source.start(0);
    const rendered = await offline.startRendering();
    return new Blob([encodePcmWav(rendered.getChannelData(0), sampleRate)], { type: 'audio/wav' });
  } finally {
    if (context.state !== 'closed') await context.close();
  }
};

const evaluationEndpoints = () => {
  const endpoints = ['/api/pronunciation/evaluate'];
  if (typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) && !endpoints[0].startsWith('http')) {
    endpoints.push('http://localhost:5000/api/pronunciation/evaluate');
  }
  return endpoints;
};

const sendForEvaluation = async (blob, referenceText) => {
  const evaluationBlob = await convertToAzureWav(blob);
  const payload = {
    audioBase64: await blobToBase64(evaluationBlob),
    mimeType: evaluationBlob.type || blob.type || 'audio/webm',
    referenceText,
  };
  let lastError = null;

  for (const endpoint of evaluationEndpoints()) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : {};
      if (!response.ok) throw new Error(data.error || 'Evaluarea audio nu este disponibilă.');
      return data;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Evaluarea audio nu este disponibilă.');
};

const formatTime = (seconds) => `0:${String(seconds).padStart(2, '0')}`;

const PronunciationLab = ({ phrase, phraseIndex, level, lessonId }) => {
  const [status, setStatus] = useState('ready');
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(() => readAttempts(level));
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const browserTranscriptRef = useRef('');
  const chunksRef = useRef([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);
  const audioUrlRef = useRef('');

  const bestScore = attempts.reduce((best, attempt) => Math.max(best, attempt.score || 0), 0);

  const stopTracks = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const clearTimers = () => {
    window.clearInterval(timerRef.current);
    window.clearTimeout(timeoutRef.current);
    timerRef.current = null;
    timeoutRef.current = null;
  };

  const rememberAttempt = (assessment, duration) => {
    const next = [{
      score: assessment.score,
      phrase: phrase.example,
      lessonId,
      date: new Date().toISOString(),
    }, ...readAttempts(level)].slice(0, 12);
    localStorage.setItem(`pronunciation_attempts_${level.toLowerCase()}`, JSON.stringify(next));
    recordStudyActivity({ type: 'pronunciation', level, lessonId, minutes: Math.max(1, Math.ceil(duration / 60)), score: assessment.score });
    setAttempts(next);
  };

  const evaluateRecording = async (blob, duration) => {
    setStatus('analyzing');
    setError('');
    try {
      const transcription = await sendForEvaluation(blob, phrase.example);
      const assessment = assessPronunciation({
        referenceText: phrase.example,
        transcript: transcription.text,
        words: transcription.words,
        duration,
        provider: transcription.provider,
        providerAssessment: transcription.assessment,
      });
      if (!assessment.transcript) throw new Error('Nu am putut identifica vocea. Încearcă mai aproape de microfon.');
      setResult(assessment);
      rememberAttempt(assessment, duration);
      setStatus('result');
    } catch (assessmentError) {
      const browserTranscript = browserTranscriptRef.current.trim();
      if (browserTranscript) {
        const assessment = assessPronunciation({
          referenceText: phrase.example,
          transcript: browserTranscript,
          duration,
          provider: 'browser',
        });
        setResult(assessment);
        rememberAttempt(assessment, duration);
        setStatus('result');
      } else {
        setError(assessmentError.message || 'Nu am putut evalua înregistrarea.');
        setStatus('error');
      }
    }
  };

  const stopRecording = () => {
    clearTimers();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) { /* Recunoașterea este opțională. */ }
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      setStatus('processing');
      recorderRef.current.stop();
    }
  };

  const startBrowserRecognition = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = 'nb-NO';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let transcript = '';
      for (let index = 0; index < event.results.length; index += 1) transcript += `${event.results[index][0].transcript} `;
      browserTranscriptRef.current = transcript.trim();
    };
    recognition.onerror = () => {};
    recognitionRef.current = recognition;
    try { recognition.start(); } catch (_) { recognitionRef.current = null; }
  };

  const startRecording = async () => {
    setError('');
    setResult(null);
    setElapsed(0);
    browserTranscriptRef.current = '';
    chunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      setError('Browserul nu permite înregistrarea audio. Folosește o versiune recentă de Chrome, Edge sau Firefox.');
      setStatus('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;
      const supportedType = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4']
        .find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = supportedType ? new MediaRecorder(stream, { mimeType: supportedType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onerror = () => {
        stopTracks();
        clearTimers();
        setError('Înregistrarea s-a oprit neașteptat. Încearcă din nou.');
        setStatus('error');
      };
      recorder.onstop = () => {
        const duration = Math.max(0.5, (Date.now() - startedAtRef.current) / 1000);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || supportedType || 'audio/webm' });
        stopTracks();
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        const nextUrl = URL.createObjectURL(blob);
        audioUrlRef.current = nextUrl;
        setAudioUrl(nextUrl);
        evaluateRecording(blob, duration);
      };

      startedAtRef.current = Date.now();
      recorder.start(250);
      startBrowserRecognition();
      setStatus('recording');
      timerRef.current = window.setInterval(() => setElapsed(Math.min(MAX_SECONDS, Math.floor((Date.now() - startedAtRef.current) / 1000))), 250);
      timeoutRef.current = window.setTimeout(stopRecording, MAX_SECONDS * 1000);
    } catch (recordingError) {
      stopTracks();
      const denied = recordingError && (recordingError.name === 'NotAllowedError' || recordingError.name === 'PermissionDeniedError');
      setError(denied ? 'Microfonul este blocat. Permite accesul la microfon din bara browserului și încearcă din nou.' : 'Nu am putut porni microfonul. Verifică dacă este conectat și disponibil.');
      setStatus('error');
    }
  };

  const resetAttempt = () => {
    setResult(null);
    setError('');
    setElapsed(0);
    setStatus('ready');
  };

  useEffect(() => {
    clearTimers();
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.onstop = null;
      recorderRef.current.stop();
    }
    stopTracks();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) { /* Schimbăm fraza. */ }
    }
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = '';
    setAudioUrl('');
    resetAttempt();
    setAttempts(readAttempts(level));
  }, [phrase.example, level]);

  useEffect(() => () => {
    clearTimers();
    stopTracks();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) { /* Componenta se închide. */ }
    }
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
  }, []);

  return (
    <section className="pronunciation-lab" aria-labelledby="pronunciation-lab-title">
      <div className="pronunciation-lab__heading">
        <div><span>Laborator interactiv</span><div className="pronunciation-lab__title-row"><h2 id="pronunciation-lab-title">Înregistrează și verifică pronunția</h2><em>Opțional</em></div><p>Ascultă modelul, repetă fraza și primește feedback imediat. Acest exercițiu nu influențează progresul nivelului.</p></div>
        <div className="pronunciation-lab__best"><small>Cel mai bun scor · {level}</small><strong>{bestScore || '—'}{bestScore ? '%' : ''}</strong><span>{attempts.length ? `${attempts.length} încercări salvate local` : 'Prima încercare te așteaptă'}</span></div>
      </div>

      <div className="pronunciation-lab__workspace">
        <div className="pronunciation-lab__prompt">
          <div className="pronunciation-lab__prompt-label"><span>{String(phraseIndex + 1).padStart(2, '0')}</span><div><small>Fraza selectată · Lecția {lessonId}</small><strong>{phrase.word}</strong></div></div>
          <blockquote lang="no">{phrase.example}</blockquote>
          <p><span>RO</span>{phrase.translation}</p>
          <div className="pronunciation-lab__model-actions">
            <button type="button" onClick={() => speakPronunciationModel(phrase.example)}><span aria-hidden="true">▶</span> Ascultă modelul</button>
            <button type="button" onClick={() => speakPronunciationModel(phrase.example, { slow: true })}><span aria-hidden="true">◷</span> Mai lent</button>
          </div>
          <div className="pronunciation-lab__tip"><span aria-hidden="true">◎</span><p><strong>Sfat:</strong> ascultă întâi ritmul frazei, nu doar fiecare sunet separat.</p></div>
        </div>

        <div className={`pronunciation-recorder pronunciation-recorder--${status}`}>
          <div className="pronunciation-recorder__status" aria-live="polite">
            <span>{status === 'recording' ? 'Înregistrare în curs' : status === 'analyzing' || status === 'processing' ? 'Analizăm pronunția' : status === 'result' ? 'Evaluare finalizată' : status === 'error' ? 'Este nevoie de atenție' : 'Microfon pregătit'}</span>
            <strong>{status === 'recording' ? formatTime(elapsed) : 'max. 0:30'}</strong>
          </div>
          <div className="pronunciation-recorder__visual" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((bar) => <i key={bar} style={{ '--bar': bar }} />)}
          </div>
          {status === 'recording' ? (
            <button className="pronunciation-recorder__button is-recording" type="button" onClick={stopRecording}><span aria-hidden="true">■</span><strong>Oprește înregistrarea</strong><small>Apasă când ai terminat fraza</small></button>
          ) : (
            <button className="pronunciation-recorder__button" type="button" onClick={startRecording} disabled={status === 'analyzing' || status === 'processing'}><span aria-hidden="true">●</span><strong>{status === 'analyzing' || status === 'processing' ? 'Se analizează…' : result ? 'Înregistrează din nou' : 'Începe înregistrarea'}</strong><small>Vei putea asculta vocea înainte de o nouă încercare</small></button>
          )}
          {audioUrl && status !== 'recording' && <audio className="pronunciation-recorder__playback" src={audioUrl} controls preload="metadata">Browserul tău nu poate reda înregistrarea.</audio>}
          {error && <div className="pronunciation-recorder__error" role="alert"><strong>Nu am putut finaliza evaluarea</strong><p>{error}</p><small>Poți continua fără nicio restricție folosind butoanele „Ascultă modelul” și „Mai lent”.</small><button type="button" onClick={resetAttempt}>Încearcă din nou</button></div>}
          <p className="pronunciation-recorder__privacy"><span aria-hidden="true">▣</span> Vocea-model și evaluarea folosesc Azure Speech; ElevenLabs și browserul rămân variante de rezervă. Aplicația nu salvează înregistrarea.</p>
        </div>
      </div>

      {result ? (
        <div className={`pronunciation-result pronunciation-result--${result.feedback.tone}`}>
          <div className="pronunciation-result__score" style={{ '--score': `${result.score * 3.6}deg` }}><div><strong>{result.score}</strong><span>din 100</span></div></div>
          <div className="pronunciation-result__content">
            <span className="pronunciation-result__eyebrow">Rezultatul încercării</span>
            <h3>{result.feedback.title}</h3>
            <p>{result.feedback.text}</p>
            <div className="pronunciation-result__metrics"><div><span>Claritate</span><strong>{result.accuracy}%</strong></div><div><span>Frază completă</span><strong>{result.completeness}%</strong></div><div><span>Fluență</span><strong>{result.rhythm}%</strong></div></div>
          </div>
          <div className="pronunciation-result__transcript">
            <div><span>Ce am recunoscut</span><small>{result.provider === 'azure-speech-pronunciation' ? 'Azure Speech · norvegiană nb-NO' : result.provider === 'elevenlabs-scribe-v2' ? 'ElevenLabs Scribe v2 · rezervă' : 'Evaluare din browser · rezervă'}</small></div>
            <blockquote lang="no">„{result.transcript}”</blockquote>
            <div className="pronunciation-result__words" aria-label="Evaluare pe cuvinte">
              {result.alignment.filter((item) => item.expected).map((item, index) => <span className={`is-${item.status}`} title={item.status === 'correct' ? 'Pronunțat clar' : item.status === 'close' ? `Aproape · recunoscut „${item.spoken}”` : item.status === 'missing' ? 'Cuvânt lipsă' : `Recunoscut „${item.spoken}”`} key={`${item.expected}-${index}`}>{item.expected}</span>)}
            </div>
            <div className="pronunciation-result__legend"><span><i className="correct" />clar</span><span><i className="close" />aproape</span><span><i className="different" />de repetat</span></div>
          </div>
        </div>
      ) : (
        <div className="pronunciation-lab__steps"><div><span>1</span><p><strong>Ascultă</strong> modelul normal sau lent.</p></div><div><span>2</span><p><strong>Înregistrează</strong> fraza într-un loc liniștit.</p></div><div><span>3</span><p><strong>Corectează</strong> cuvintele evidențiate.</p></div></div>
      )}
      <p className="pronunciation-lab__disclaimer"><strong>Exercițiu opțional:</strong> rezultatul nu blochează lecții, teste sau niveluri. Scorul estimează claritatea pe baza transcrierii automate și nu înlocuiește evaluarea fonetică realizată de un profesor.</p>
    </section>
  );
};

export default PronunciationLab;
