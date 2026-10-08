import React from 'react'
import styles from './ResumeRoasterPanel.module.css'

export default function ResumeVersionTimeline({
  versions = [],
  activeVersionIndex = 0,
  onSelectVersion,
  onRefineFurther,
  canRefine = true,
  loading = false,
}) {
  if (versions.length <= 1) return null

  return (
    <div className={styles.timelineCard}>
      <div className={styles.timelineHeader}>
        <div>
          <h4 className={styles.timelineTitle}>Iteration & Version History</h4>
          <p className={styles.timelineSubtitle}>
            Track your resume score progression across iterative refinement cycles.
          </p>
        </div>

        {canRefine && (
          <button
            type="button"
            className={styles.refineFurtherBtn}
            onClick={onRefineFurther}
            disabled={loading}
          >
            {loading ? 'Refining...' : '🚀 Refine Further (Round 2)'}
          </button>
        )}
      </div>

      <div className={styles.timelineNodesRow}>
        {versions.map((ver, idx) => {
          const isActive = idx === activeVersionIndex
          const isFirst = idx === 0
          const delta = !isFirst ? ver.score - versions[idx - 1].score : null

          return (
            <React.Fragment key={idx}>
              {/* Connector line */}
              {!isFirst && (
                <div className={styles.timelineLine}>
                  {delta !== null && (
                    <span className={styles.timelineDeltaTag}>
                      {delta >= 0 ? `+${delta}` : `${delta}`}
                    </span>
                  )}
                </div>
              )}

              {/* Version Node Button */}
              <button
                type="button"
                className={`${styles.timelineNode} ${isActive ? styles.timelineNodeActive : ''}`}
                onClick={() => onSelectVersion(idx)}
              >
                <div className={styles.nodeTopRow}>
                  <span className={styles.nodeVersionName}>{ver.name}</span>
                  <span className={styles.nodeScoreBadge}>{ver.score}/100</span>
                </div>
                <span className={styles.nodeDesc}>{ver.description}</span>
              </button>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
