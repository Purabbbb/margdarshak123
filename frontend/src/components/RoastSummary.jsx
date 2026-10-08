import React from 'react'
import styles from './ResumeRoasterPanel.module.css'

export default function RoastSummary({
  headlineRoast,
  summary,
  tone,
  onToneChange,
  targetRole,
  onRoleChange,
  topRoles = [],
  onRoastAgain,
  loading,
}) {
  return (
    <div className={styles.roastSummaryCard}>
      {/* Header with Roast Tone & Role Controls */}
      <div className={styles.summaryTopBar}>
        <div className={styles.summaryRoleBlock}>
          <label className={styles.summaryControlLabel}>Target Role</label>
          <select
            className={styles.summaryRoleSelect}
            value={targetRole}
            onChange={e => onRoleChange(e.target.value)}
            disabled={loading}
          >
            {topRoles.map(r => (
              <option key={r.role} value={r.role}>
                {r.role}
              </option>
            ))}
            {!topRoles.some(r => r.role === targetRole) && (
              <option value={targetRole}>{targetRole}</option>
            )}
          </select>
        </div>

        <div className={styles.toneBlock}>
          <label className={styles.summaryControlLabel}>Roast Humor Level</label>
          <div className={styles.tonePillGroup}>
            {[
              { id: 'friendly', label: 'Gentle & Encouraging' },
              { id: 'balanced', label: 'Balanced Wit' },
              { id: 'savage', label: 'Unfiltered Savage' },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                className={`${styles.toneBtn} ${tone === t.id ? styles.toneBtnActive : ''}`}
                onClick={() => onToneChange(t.id)}
                disabled={loading}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={styles.roastAgainBtn}
          onClick={onRoastAgain}
          disabled={loading}
        >
          {loading ? 'Roasting...' : '🔄 Re-Roast Resume'}
        </button>
      </div>

      {/* Main Roast Quote Banner */}
      <div className={styles.headlineRoastBanner}>
        <div className={styles.roastFlameIcon}>🔥</div>
        <div className={styles.roastQuoteContent}>
          <blockquote className={styles.headlineQuote}>
            "{headlineRoast}"
          </blockquote>
          <p className={styles.summaryParagraph}>{summary}</p>
        </div>
      </div>
    </div>
  )
}
