import {ui} from '../../languages/messages.js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { sendChatTurn, startChatSession } from '../../services/chat';
import DialogueFeedback from './DialogueFeedback';
import './ChatAssistant.css';

const MAX_MESSAGE_LENGTH = 1600;

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
    situation: data?.situation || '',
    learning: data?.learning || null,
    feedback: data?.feedback || '',
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

  const handleSend = async (command = null) => {
    const text = (command || input).trim();
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
      ? `Încă maximum ${session.remainingTurns} ${session.remainingTurns === 1 ? 'răspuns' : 'răspunsuri'}`
      : 'Conversație activă';

  return (
    <section className="chat-assistant" aria-labelledby="chat-assistant-title">
      <div className="chat-assistant__heading">
        <div className="chat-assistant__heading-row">
          <div>
            <span className="chat-assistant__eyebrow">{ui('web_f0dd0c9c812401fb')}</span>
            <h2 id="chat-assistant-title">{ui('web_bd20abc3166d7fa7')}</h2>
          </div>
          {session && !['starting', 'done'].includes(status) && (
            <button className="chat-assistant__restart" type="button" onClick={start} disabled={status === 'sending'}>{ui('web_d53337bd51955cdc')}</button>
          )}
        </div>
        <p>{session?.situation || `Conversează în norvegiană pe baza lecției „${lessonTitle || `Lecția ${lessonId}`}”.`}</p>
      </div>

      <div className="chat-assistant__window" aria-busy={loading}>
        {session && (
          <div className="chat-assistant__session-status" aria-live="polite">
            <span className={session.done ? 'is-done' : ''}>{remainingLabel}</span>
            {session.maxTurns !== null && <small>{session.turn}{ui('web_e8313fe7862e0e7d')}{session.maxTurns}</small>}
          </div>
        )}

        <div
          className="chat-assistant__messages"
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label={ui('web_e202ca22dc32c734')}
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
                    <strong>{ui('web_6d23cb27cda06b33')}</strong>
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
            {status === 'start-error' && <button type="button" onClick={start}>{ui('web_a09d291920163176')}</button>}
          </div>
        )}

        {status === 'ready' && <div className="chat-assistant__support">
          <button type="button" onClick={() => handleSend('ajutor')}>{ui('web_1a032ba64cea4329')}</button>
          <button type="button" onClick={() => handleSend('repetă')}>{ui('ui_2065f88ac40484c1')}</button>
          <button type="button" onClick={() => handleSend('stop')}>{ui('web_b66ad70277ef6a3d')}</button>
        </div>}
        {status === 'done' ? (
          <div className="chat-assistant__complete" role="status">
            <div>
              <strong>{ui('web_2e49e25c5e9fc724')}</strong>
              <p>{session?.feedback}</p>
              <DialogueFeedback key={session?.sessionToken} learning={session?.learning} level={level} lessonId={lessonId} />
            </div>
            <button type="button" onClick={start}>{ui('web_90577ee85cbb37c4')}</button>
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
                aria-label={ui('web_91e13d89c8d31b3c')}
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
              aria-label={ui('web_7d4f0ac617666aeb')}
            >
              <span aria-hidden="true">→</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
