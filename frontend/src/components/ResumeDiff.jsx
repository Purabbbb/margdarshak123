import React, { useState } from 'react'
import styles from './ResumeRoasterPanel.module.css'

export default function ResumeDiff({
  changes = [],
  revisedText = '',
  originalText = '',
  onSaveManualEdit,
  onAcceptAll,
  onReset,
}) {
  const [activeView, setActiveView] = useState('sections') // 'sections' | 'full_text'
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(revisedText)

  function handleCopy() {
    navigator.clipboard.writeText(isEditing ? editText : revisedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleSave() {
    if (onSaveManualEdit) {
      onSaveManualEdit(editText)
    }
    setIsEditing(false)
  }

  return (
    <div className={styles.diffContainer}>
      {/* Diff Controls Header */}
      <div className={styles.diffHeader}>
        <div>
          <h3 className={styles.diffTitle}>Resume Improvement Diff</h3>
          <p className={styles.diffSubtitle}>
            Review active phrasing transformations, metric placeholders, and buzzword removals.
          </p>
        </div>

        <div className={styles.diffActionsGroup}>
          <div className={styles.viewToggleGroup}>
            <button
              type="button"
              className={`${styles.viewToggleBtn} ${activeView === 'sections' ? styles.viewToggleActive : ''}`}
              onClick={() => setActiveView('sections')}
            >
              Section Comparisons
            </button>
            <button
              type="button"
              className={`${styles.viewToggleBtn} ${activeView === 'full_text' ? styles.viewToggleActive : ''}`}
              onClick={() => {
                setActiveView('full_text')
                setEditText(revisedText)
              }}
            >
              Full Revised Text
            </button>
          </div>

          <button
            type="button"
            className={styles.copyBtn}
            onClick={handleCopy}
          >
            {copied ? '✓ Copied to Clipboard!' : '📋 Copy Refined Text'}
          </button>
        </div>
      </div>

      {/* Sections View */}
      {activeView === 'sections' && (
        <div className={styles.sectionsDiffList}>
          {changes.length === 0 ? (
            <div className={styles.noChangesBox}>
              <p>No section changes applied yet. Click "Apply Improvement" on an issue above or click "Auto-Improve All Issues" below.</p>
            </div>
          ) : (
            changes.map((change, idx) => (
              <div key={idx} className={styles.sectionDiffCard}>
                <div className={styles.sectionDiffHeader}>
                  <span className={styles.diffSectionTag}>{change.section}</span>
                  <span className={styles.diffReasonText}>{change.reason}</span>
                </div>

                <div className={styles.diffColumns}>
                  {/* Before */}
                  <div className={styles.diffColBefore}>
                    <span className={styles.diffColLabel}>Before (Original)</span>
                    <pre className={styles.diffPreBefore}>{change.before}</pre>
                  </div>

                  {/* Arrow Indicator */}
                  <div className={styles.diffArrow}>➔</div>

                  {/* After */}
                  <div className={styles.diffColAfter}>
                    <span className={styles.diffColLabel}>After (Improved)</span>
                    <pre className={styles.diffPreAfter}>{change.after}</pre>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Full Text View / Manual Editor */}
      {activeView === 'full_text' && (
        <div className={styles.fullTextEditorCard}>
          <div className={styles.editorToolbar}>
            <span className={styles.editorStatus}>
              {isEditing ? '✏️ Manual Editing Mode' : '👁️ Previewing Revised Resume'}
            </span>
            <div>
              {isEditing ? (
                <button
                  type="button"
                  className={styles.saveEditBtn}
                  onClick={handleSave}
                >
                  Save Manual Edits
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.editToggleBtn}
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Edit Text Manually
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <textarea
              className={styles.resumeTextarea}
              rows={16}
              value={editText}
              onChange={e => setEditText(e.target.value)}
            />
          ) : (
            <pre className={styles.fullResumePreview}>{revisedText || originalText}</pre>
          )}
        </div>
      )}
    </div>
  )
}
