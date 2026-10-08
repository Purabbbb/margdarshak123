import React, { useState } from 'react'
import styles from './ResumeRoasterPanel.module.css'

export default function RoastIssueCard({
  issue,
  onApplyFix,
  onDismiss,
  isApplied = false,
  isDismissed = false,
}) {
  const [showDetails, setShowDetails] = useState(false)
  const { id, section, severity, category, evidence, roast, why_it_matters, suggestion, rewrite_example } = issue

  if (isDismissed) return null

  function getSeverityClass(sev) {
    if (sev === 'high') return styles.severityHigh
    if (sev === 'medium') return styles.severityMed
    return styles.severityLow
  }

  return (
    <div className={`${styles.issueCard} ${isApplied ? styles.issueApplied : ''}`}>
      {/* Header with Section, Severity, and Category */}
      <div className={styles.issueHeader}>
        <div className={styles.issueHeaderLeft}>
          <span className={styles.issueSectionBadge}>{section}</span>
          <span className={`${styles.severityBadge} ${getSeverityClass(severity)}`}>
            {severity.toUpperCase()} PRIORITY
          </span>
          <span className={styles.categoryBadge}>{category.replace('_', ' ')}</span>
        </div>

        {isApplied ? (
          <span className={styles.appliedPill}>✓ Fix Applied</span>
        ) : (
          <button
            type="button"
            className={styles.dismissBtn}
            onClick={() => onDismiss(id)}
            title="Dismiss this issue"
          >
            ✕ Dismiss
          </button>
        )}
      </div>

      {/* Concrete Evidence Snippet */}
      {evidence && (
        <div className={styles.evidenceBox}>
          <span className={styles.evidenceLbl}>Found in resume:</span>
          <code className={styles.evidenceText}>"{evidence}"</code>
        </div>
      )}

      {/* Roast Critique */}
      <div className={styles.issueRoastBox}>
        <span className={styles.roastSmiley}>💬</span>
        <p className={styles.issueRoastText}>"{roast}"</p>
      </div>

      {/* Why it Matters */}
      <div className={styles.whyMattersBox}>
        <strong>Why this matters:</strong>
        <p>{why_it_matters}</p>
      </div>

      {/* Suggested Fix & Rewrite Example */}
      <div className={styles.suggestionSection}>
        <div className={styles.suggestionHeader}>
          <strong>Recommended Fix:</strong>
          <p>{suggestion}</p>
        </div>

        {rewrite_example && (
          <div className={styles.rewriteExampleBox}>
            <span className={styles.rewriteLabel}>Suggested Active Rewrite:</span>
            <div className={styles.rewriteCodeBlock}>
              <code>{rewrite_example}</code>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.issueFooterActions}>
        {!isApplied ? (
          <button
            type="button"
            className={styles.applyFixBtn}
            onClick={() => onApplyFix(issue)}
          >
            ⚡ Apply Improvement
          </button>
        ) : (
          <span className={styles.appliedSubText}>
            Updated in revision workspace below.
          </span>
        )}

        <button
          type="button"
          className={styles.toggleMoreBtn}
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Less guidance ▲' : 'More recruiter context ▼'}
        </button>
      </div>

      {showDetails && (
        <div className={styles.deepGuidanceBox}>
          <p>
            💡 <strong>Pro-Tip:</strong> Hiring managers and ATS screeners reward bullets structured with the <strong>XYZ Formula</strong>: Accomplished [X] as measured by [Y], by doing [Z].
          </p>
        </div>
      )}
    </div>
  )
}
