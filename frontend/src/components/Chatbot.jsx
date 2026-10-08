import { useState, useRef, useEffect } from 'react'
import { sendChatMessage } from '../utils/api.js'
import styles from './Chatbot.module.css'

const SUGGESTED_QUESTIONS = [
  'What is my best job match?',
  'Which skills am I missing?',
  'What courses should I start with?',
  'How can I improve my profile?',
  'What is the salary range for my role?',
  'Show my contact details',
]

export default function Chatbot({ analysis }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I have analyzed your resume. Ask me about your skills, job matches, skill gaps, or course recommendations.`,
      intent: null
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [open, messages])

  async function handleSend(text) {
    const message = text || input.trim()
    if (!message || loading) return

    const userMsg = { role: 'user', content: message }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Build history (exclude the first greeting message)
      const history = messages.slice(1).map(m => ({
        role: m.role,
        content: m.content
      }))

      const result = await sendChatMessage(message, analysis, history)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.response,
        intent: result.intent,
        method: result.method
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Could not reach the chatbot. Check that the backend is running.',
        intent: 'ERROR'
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Open chatbot"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {!open && <span className={styles.fabLabel}>Ask MargDarshak</span>}
      </button>

      {/* Chat panel */}
      {open && (
        <div className={styles.panel}>
          {/* Header */}
          <div className={styles.panelHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.headerDot} />
              <div>
                <span className={styles.headerTitle}>MargDarshak</span>
                <span className={styles.headerSub}>Career Guidance Assistant</span>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageBot}`}>
                <div className={styles.messageBubble}>
                  {msg.content}
                </div>
                {msg.intent && msg.role === 'assistant' && (
                  <span className={styles.intentTag}>Intent: {msg.intent}</span>
                )}
              </div>
            ))}

            {loading && (
              <div className={`${styles.message} ${styles.messageBot}`}>
                <div className={`${styles.messageBubble} ${styles.typingBubble}`}>
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </div>
              </div>
            )}

            {/* Suggestions (only shown at start) */}
            {messages.length === 1 && !loading && (
              <div className={styles.suggestions}>
                {SUGGESTED_QUESTIONS.map(q => (
                  <button key={q} className={styles.suggestion} onClick={() => handleSend(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className={styles.inputArea}>
            <input
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your resume..."
              disabled={loading}
            />
            <button
              className={styles.sendBtn}
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
