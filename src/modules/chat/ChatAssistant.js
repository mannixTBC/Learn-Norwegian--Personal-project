import React, { useCallback, useEffect, useRef, useState } from 'react';
import { sendChatTurn, startChatSession } from '../../services/chat';
import './ChatAssistant.css';

const MAX_MESSAGE_LENGTH = 350;

const getNumber = (value, fallback = null) => (
  value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
    ? Number(value)
    : fallback
);

const normalizeSession = (data, previousToken = null) => {
  const maxTurns = getNumber(data?.maxTurns);
  const turn = getNumber(data?.turn, 0);
  const remainingTurns = getNumber(
    data?.remainingTurns,
    maxTurns === null ? null : Math.max(0, maxTurns - turn),
  );

  return {
    sessionToken: typeof data?.sessionToken === 'string' && data.sessionToken
      ? data.sessionToken
      : previousToken,
    reply: typeof data?.reply === 'string' ? data.reply.trim() : '',
    question: typeof data?.question === 'string' && data.question.trim()
      ? data.question.trim()
      : null,
    correction: typeof data?.correction === 'string' && data.correction.trim()
      ? data.correction.trim()
      : null,
    done: data?.done === true,
    turn,
    maxTurns,
    remainingTurns,
    quotaRemaining: getNumber(data?.quotaRemaining),
  };
};

export default function ChatAssistant({ level, lessonId, pathId = 'general', lessonTitle }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('starting');
  const [error, setError] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const requestRef = useRef(null);
  const requestSequence = useRef(0);
  const messageSequence = useRef(0);
  const refocusAfterReply = useRef(false);
  const sendingRef = useRef(false);

  const nextMessageId = () => {
    messageSequence.current += 1;
    return messageSequence.current;
  };

  const assistantMessage = (result) => ({
    id: nextMessageId(),
    role: 'assistant',
    reply: result.reply,
    question: result.question,
    correction: result.correction,
  });

  const start = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;
    requestRef.current = controller;

    setMessages([]);
    setInput('');
    setSession(null);
    setError('');
    setStatus('starting');
    refocusAfterReply.current = false;
    sendingRef.current = false;

    try {
      const data = await startChatSession({ level, lessonId, pathId }, controller.signal);
      if (controller.signal.aborted || requestSequence.current !== requestId) return;

      const nextSession = normalizeSession(data);
      if (!nextSession.sessionToken || (!nextSession.reply && !nextSession.question)) {
        throw new Error('Conversația nu a putut fi pornită. Încearcă din nou.');
      }

      setSession(nextSession);
      setMessages([assistantMessage(nextSession)]);
      setStatus(nextSession.done ? 'done' : 'ready');
    } catch (err) {
      if (controller.signal.aborted || requestSequence.current !== requestId) return;
      setError(err.message || 'Conversația nu a putut fi pornită.');
      setStatus('start-error');
    }
  }, [level, lessonId, pathId]);

  useEffect(() => {
    start();
    return () => {
      requestSequence.current += 1;
      requestRef.current?.abort();
    };
  }, [start]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  useEffect(() => {
    if (status === 'ready' && refocusAfterReply.current) {
      refocusAfterReply.current = false;
      inputRef.current?.focus();
    }
  }, [status]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || status !== 'ready' || !session?.sessionToken || sendingRef.current) return;
    sendingRef.current = true;

    requestRef.current?.abort();
    const controller = new AbortController();
    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;
    requestRef.current = controller;
    const userMessage = { id: nextMessageId(), role: 'user', content: text };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setError('');
    setStatus('sending');
    refocusAfterReply.current = true;

    try {
      const data = await sendChatTurn({
        sessionToken: session.sessionToken,
        message: text,
      }, controller.signal);
      if (controller.signal.aborted || requestSequence.current !== requestId) return;

      const nextSession = normalizeSession(data, session.sessionToken);
      if (!nextSession.reply && !nextSession.question && !nextSession.correction) {
        throw new Error('Asistentul nu a trimis un răspuns. Încearcă din nou.');
      }

      setSession(nextSession);
      setMessages((current) => [...current, assistantMessage(nextSession)]);
      setStatus(nextSession.done ? 'done' : 'ready');
    } catch (err) {
      if (controller.signal.aborted || requestSequence.current !== requestId) return;
      setMessages((current) => current.filter((message) => message.id !== userMessage.id));
      setInput(text);
      setError(err.message || 'Asistentul nu a putut răspunde.');
      setStatus('ready');
    } finally {
      if (requestSequence.current === requestId) sendingRef.current = false;
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const loading = status === 'starting' || status === 'sending';
  const remainingLabel = session?.done
    ? 'Rundă încheiată'
    : session?.remainingTurns !== null && session?.remainingTurns !== undefined
      ? `${session.remainingTurns} ${session.remainingTurns === 1 ? 'replică rămasă' : 'replici rămase'}`
      : 'Conversație activă';

  return (
    <section className="chat-assistant" aria-labelledby="chat-assistant-title">
      <div className="chat-assistant__heading">
        <div className="chat-assistant__heading-row">
          <div>
            <span className="chat-assistant__eyebrow">💬 Asistent conversație</span>
            <h2 id="chat-assistant-title">Exersează cu un partener virtual</h2>
          </div>
          {session && !['starting', 'done'].includes(status) && (
            <button className="chat-assistant__restart" type="button" onClick={start} disabled={status === 'sending'}>
              Reîncepe runda
            </button>
          )}
        </div>
        <p>Conversează în norvegiană pe baza lecției „{lessonTitle || `Lecția ${lessonId}`}”. Primești explicații în română doar când te ajută să continui.</p>
      </div>

      <div className="chat-assistant__window" aria-busy={loading}>
        {session && (
          <div className="chat-assistant__session-status" aria-live="polite">
            <span className={session.done ? 'is-done' : ''}>{remainingLabel}</span>
            {session.maxTurns !== null && <small>Replica {session.turn} din {session.maxTurns}</small>}
          </div>
        )}

        <div
          className="chat-assistant__messages"
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Conversația în norvegiană"
        >
          {messages.map((message) => (
            message.role === 'user' ? (
              <div key={message.id} className="chat-bubble chat-bubble--user" lang="nb">
                {message.content}
              </div>
            ) : (
              <div className="chat-assistant__exchange" key={message.id}>
                <div className="chat-bubble chat-bubble--assistant" lang="nb">
                  {message.reply && <p>{message.reply}</p>}
                  {message.question && <p className="chat-bubble__question">{message.question}</p>}
                </div>
                {message.correction && (
                  <aside className="chat-assistant__correction" lang="ro">
                    <strong>Corectare scurtă</strong>
                    <p>{message.correction}</p>
                  </aside>
                )}
              </div>
            )
          ))}

          {loading && (
            <div className="chat-bubble chat-bubble--assistant chat-bubble--typing" role="status">
              <span className="chat-assistant__sr-only">
                {status === 'starting' ? 'Pregătim conversația' : 'Partenerul pregătește răspunsul'}
              </span>
              <i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" />
            </div>
          )}
        </div>

        {error && (
          <div className="chat-assistant__error" role="alert">
            <span>{error}</span>
            {status === 'start-error' && <button type="button" onClick={start}>Încearcă din nou</button>}
          </div>
        )}

        {status === 'done' ? (
          <div className="chat-assistant__complete" role="status">
            <div>
              <strong>Ai încheiat această rundă.</strong>
              <p>Poți continua cu o conversație nouă, păstrând aceeași lecție.</p>
            </div>
            <button type="button" onClick={start}>Continuă cu o rundă nouă</button>
          </div>
        ) : (
          <form className="chat-assistant__input-row" onSubmit={(event) => { event.preventDefault(); handleSend(); }}>
            <div className="chat-assistant__composer">
              <textarea
                ref={inputRef}
                className="chat-assistant__input"
                placeholder={status === 'starting' ? 'Pregătim conversația…' : 'Scrie în norvegiană…'}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={status !== 'ready'}
                maxLength={MAX_MESSAGE_LENGTH}
                rows={2}
                aria-label="Mesaj către asistent"
                aria-describedby="chat-assistant-character-count"
              />
              <small id="chat-assistant-character-count" className="chat-assistant__character-count">
                {input.length}/{MAX_MESSAGE_LENGTH}
              </small>
            </div>
            <button
              type="submit"
              className="chat-assistant__send"
              disabled={status !== 'ready' || !input.trim()}
              aria-label="Trimite mesajul"
            >
              <span aria-hidden="true">→</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
