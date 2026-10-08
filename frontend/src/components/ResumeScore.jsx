import React from 'react'
import styles from './ResumeRoasterPanel.module.css'

export default function ResumeScore({ scores, previousScore = null }) {
  if (!scores) return null

  const {
    overall_score = 0,
    structure = 0,
    clarity = 0,
    impact = 0,
    ats_alignment = 0,
    skill_evidence = 0,
    role_relevance = 0,
    conciseness = 0,
  } = scores

  const delta = previousScore !== null ? overall_score - previousScore : null

  // Score color helper
  function getScoreColor(val) {
    if (val >= 80) return '#10b981'
    if (val >= 60) return '#f59e0b'
    return '#ff4a1c'
  }

  const dimensions = [
    { label: 'Impact & Metrics', val: impact, desc: 'Quantifiable achievements & strong verbs' },
    { label: 'Role Relevance', val: role_relevance, desc: 'Alignment with target role requirements' },
    { label: 'ATS Alignment', val: ats_alignment, desc: 'Keyword coverage & standard sectioning' },
    { label: 'Skill Evidence', val: skill_evidence, desc: 'Recognized technical tools in context' },
    { label: 'Structure & Flow', val: structure, desc: 'Header completeness & length suitability' },
    { label: 'Clarity & Action', val: clarity, desc: 'Active phrasing vs passive duties' },
    { label: 'Conciseness', val: conciseness, desc: 'Absence of clichés & filler buzzwords' },
  ]

  return (
    <div className={styles.scoreCard}>
      {/* Top Main Score Gauge */}
      <div className={styles.scoreMainRow}>
        <div className={styles.scoreGaugeBox}>
          <div
            className={styles.scoreCircle}
            style={{
              borderColor: getScoreColor(overall_score),
              boxShadow: `0 0 20px ${getScoreColor(overall_score)}33`,
            }}
          >
            <span className={styles.scoreVal}>{overall_score}</span>
            <span className={styles.scoreMax}>/ 100</span>
          </div>

          {delta !== null && (
            <div className={delta >= 0 ? styles.scoreDeltaPos : styles.scoreDeltaNeg}>
              {delta >= 0 ? `+${delta} pts improvement` : `${delta} pts`}
            </div>
          )}
        </div>

        <div className={styles.scoreMainInfo}>
          <span className={styles.scoreBadge}>MargDarshak Resume Quality Estimate</span>
          <h3 className={styles.scoreTitle}>
            {overall_score >= 80
              ? 'Strong Competitive Profile'
              : overall_score >= 60
              ? 'Solid Foundation with High-Impact Gaps'
              : 'Requires Significant Structural Polish'}
          </h3>
          <p className={styles.scoreDesc}>
            Transparent, multi-dimensional score evaluating ATS keyword density, quantifiable metrics, and active phrasing. Guidance estimate, not an ATS guarantee.
          </p>
        </div>
      </div>

      {/* Sub-Dimension Progress Bars */}
      <div className={styles.dimensionsGrid}>
        {dimensions.map(dim => (
          <div key={dim.label} className={styles.dimensionItem}>
            <div className={styles.dimensionHeader}>
              <span className={styles.dimensionLabel}>{dim.label}</span>
              <span
                className={styles.dimensionVal}
                style={{ color: getScoreColor(dim.val) }}
              >
                {dim.val}%
              </span>
            </div>
            <div className={styles.dimensionBarBg}>
              <div
                className={styles.dimensionBarFill}
                style={{
                  width: `${dim.val}%`,
                  background: getScoreColor(dim.val),
                }}
              />
            </div>
            <span className={styles.dimensionSub}>{dim.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
