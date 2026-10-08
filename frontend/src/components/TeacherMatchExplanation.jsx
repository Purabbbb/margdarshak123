import React from 'react'
import styles from './TeachersPanel.module.css'

export default function TeacherMatchExplanation({ method }) {
  return (
    <div className={styles.methodologyCard}>
      <div className={styles.methodologyHeader}>
        <div className={styles.methodologyIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div>
          <h4 className={styles.methodologyTitle}>How MargDarshak Matches Mentors</h4>
          <p className={styles.methodologySubtitle}>
            Explainable 5-Factor Hybrid Ranking Formula
          </p>
        </div>
      </div>

      <div className={styles.weightsGrid}>
        <div className={styles.weightCard}>
          <div className={styles.weightPercent}>40%</div>
          <div className={styles.weightName}>Skill Gap Coverage</div>
          <div className={styles.weightDesc}>
            Prioritizes mentors whose curriculum directly covers your missing required & preferred skills.
          </div>
        </div>

        <div className={styles.weightCard}>
          <div className={styles.weightPercent}>30%</div>
          <div className={styles.weightName}>Semantic Similarity</div>
          <div className={styles.weightDesc}>
            Sentence embedding matching between student profile query and teacher headline, bio, & style.
          </div>
        </div>

        <div className={styles.weightCard}>
          <div className={styles.weightPercent}>15%</div>
          <div className={styles.weightName}>Target Role Relevance</div>
          <div className={styles.weightDesc}>
            Evaluates mentor industry domain alignment for your chosen target job role.
          </div>
        </div>

        <div className={styles.weightCard}>
          <div className={styles.weightPercent}>10%</div>
          <div className={styles.weightName}>Industry Experience</div>
          <div className={styles.weightDesc}>
            Years of hands-on software engineering, research, and live project mentorship experience.
          </div>
        </div>

        <div className={styles.weightCard}>
          <div className={styles.weightPercent}>5%</div>
          <div className={styles.weightName}>Student Rating</div>
          <div className={styles.weightDesc}>
            Aggregated verified learner satisfaction across historical 1-on-1 mentorship sessions.
          </div>
        </div>
      </div>

      <div className={styles.methodologyFootnote}>
        <span>ℹ️ Note: Recommendations are deterministic guidance based on resume gap analysis. Mentors in this demo are seeded profiles for prototype evaluation.</span>
      </div>
    </div>
  )
}
