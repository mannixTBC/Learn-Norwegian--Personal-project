import React, { useEffect, useRef, useState } from 'react';
import { sendChatMessage } from '../../services/chat';
import './ChatAssistant.css';

/**
 * ChatAssistant — partener de conversație în norvegiană bazat pe lecția curentă.
 *
 * @param {{ level: string, lessonId: number, lessonTitle?: string }} props
 *
 * Funcționare:
 * - La montare, asistentul salută în norvegiană (mesaj de start contextual).
 * - Utilizatorul scrie în input → mesajul și istoricul se trimit către /api/chat.
 * - Backend-ul construiește system prompt-ul cu vocabularul lecției + anterioare
 *   și apelează OpenAI. Răspunsul sosește ca bula asistentului.
 * - Istoricul e session-only (se resetează la schimbarea lecției).
 */
export default function ChatAssistant({ level, lessonId, lessonTitle }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Mesaj de start contextual când se schimbă lecția.
  useEffect(() => {
    const greeting = lessonId === 1
      ? 'Hei! Hva heter du? 👋'
      : `Hei! I dag øver vi „${lessonTitle || `leksjon ${lessonId}`}”. Hva vil du si?`;
    setMessages([{ role: 'assistant', content: greeting }]);
    setError('');
  }, [lessonId, lessonTitle]);

  // Scroll automat la ultimul mesaj.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setError('');
    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const { reply } = await sendChatMessage({
        messages: nextMessages,
        level,
        lessonId,
      });
      setMessages((current) => [...current, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message || 'Asistentul nu a putut răspunde.');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="chat-assistant" aria-labelledby="chat-assistant-title">
      <div className="chat-assistant__heading">
        <span className="chat-assistant__eyebrow">💬 Asistent conversație</span>
        <h2 id="chat-assistant-title">Exersează cu un partener virtual</h2>
        <p>Conversează în norvegiană folosind vocabularul din lecția {lessonId}. Răspunde scurt — dacă greșești, primești o corectare în română.</p>
      </div>

      <div className="chat-assistant__window">
        <div className="chat-assistant__messages" ref={scrollRef}>
          {messages.map((message, index) => (
            <div key={index} className={`chat-bubble chat-bubble--${message.role}`}>
              {message.content}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble chat-bubble--assistant chat-bubble--typing">
              <span /><span /><span />
            </div>
          )}
        </div>

        {error && <div className="chat-assistant__error" role="alert">{error}</div>}

        <div className="chat-assistant__input-row">
          <input
            ref={inputRef}
            type="text"
            className="chat-assistant__input"
            placeholder="Scrie în norvegiană…"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            aria-label="Mesaj către asistent"
          />
          <button
            type="button"
            className="chat-assistant__send"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="Trimite mesajul"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
