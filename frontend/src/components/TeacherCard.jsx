import React, { useState } from 'react'
import styles from './TeachersPanel.module.css'

export default function TeacherCard({ recommendation, onOpenModal }) {
  const [showExplanation, setShowExplanation] = useState(false)
  const { teacher, overall_match, skill_coverage, matched_skills, missing_teacher_coverage, semantic_similarity, role_relevance, experience_score, rating_score, reason, rank } = recommendation

  const initials = teacher.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className={styles.teacherCard}>
      {/* Top Header with Avatar, Name, Verification, and Match Badge */}
      <div className={styles.cardHeader}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>{initials}</div>
          {teacher.verified && (
            <span className={styles.verifiedBadge} title="Verified MargDarshak Mentor">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
          )}
        </div>

        <div className={styles.headerInfo}>
          <div className={styles.nameRow}>
            <h3 className={styles.teacherName}>{teacher.name}</h3>
            {rank && <span className={styles.rankBadge}>#{rank} Fit</span>}
          </div>
          <p className={styles.headline}>{teacher.headline}</p>
        </div>

        <div className={styles.matchPillWrapper}>
          <div className={styles.matchScorePill}>
            <span className={styles.matchPercent}>{Math.round(overall_match)}%</span>
            <span className={styles.matchLabel}>Match</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className={styles.bio}>{teacher.bio}</p>

      {/* Coverage Bar & Metrics */}
      <div className={styles.coverageSection}>
        <div className={styles.coverageHeader}>
          <span className={styles.coverageLabel}>Skill Gap Coverage</span>
          <span className={styles.coverageVal}>
            {matched_skills.length} covered ({Math.round(skill_coverage)}%)
          </span>
        </div>
        <div className={styles.coverageBarBg}>
          <div
            className={styles.coverageBarFill}
            style={{ width: `${Math.min(100, Math.max(10, skill_coverage))}%` }}
          />
        </div>
      </div>

      {/* Matched Skills Tags */}
      <div className={styles.skillsRow}>
        <span className={styles.skillsLabel}>Covers:</span>
        <div className={styles.skillTags}>
          {matched_skills.map(s => (
            <span key={s} className={styles.matchedSkillTag}>
              ✓ {s}
            </span>
          ))}
          {missing_teacher_coverage.slice(0, 2).map(s => (
            <span key={s} className={styles.unmatchedSkillTag}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Meta Stats: Experience, Rating, Sessions, Rate */}
      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaVal}>{teacher.experience_years}y</span>
          <span className={styles.metaSub}>Industry</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaVal}>{teacher.teaching_experience_years}y</span>
          <span className={styles.metaSub}>Teaching</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaVal}>★ {teacher.rating.toFixed(1)}</span>
          <span className={styles.metaSub}>{teacher.sessions_completed} sessions</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaVal}>{teacher.hourly_rate || '$45/hr'}</span>
          <span className={styles.metaSub}>Rate</span>
        </div>
      </div>

      {/* Styles & Languages */}
      <div className={styles.tagsRow}>
        {teacher.teaching_style?.slice(0, 2).map(st => (
          <span key={st} className={styles.styleTag}>
            {st}
          </span>
        ))}
        {teacher.languages?.slice(0, 2).map(lang => (
          <span key={lang} className={styles.langTag}>
            {lang}
          </span>
        ))}
        {teacher.mode?.map(m => (
          <span key={m} className={styles.modeTag}>
            {m}
          </span>
        ))}
      </div>

      {/* Reason Box / Explanation */}
      <div className={styles.reasonBox}>
        <div className={styles.reasonText}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>{reason}</span>
        </div>

        <button
          type="button"
          className={styles.expandExplanationBtn}
          onClick={() => setShowExplanation(!showExplanation)}
        >
          {showExplanation ? 'Hide match breakdown ▲' : 'View match breakdown ▼'}
        </button>

        {showExplanation && (
          <div className={styles.explanationBreakdown}>
            <div className={styles.breakdownRow}>
              <span>Skill Gap Coverage (40%)</span>
              <strong>{skill_coverage}%</strong>
            </div>
            <div className={styles.breakdownRow}>
              <span>Semantic Similarity (30%)</span>
              <strong>{semantic_similarity}%</strong>
            </div>
            <div className={styles.breakdownRow}>
              <span>Target Role Relevance (15%)</span>
              <strong>{role_relevance}%</strong>
            </div>
            <div className={styles.breakdownRow}>
              <span>Experience Score (10%)</span>
              <strong>{experience_score}%</strong>
            </div>
            <div className={styles.breakdownRow}>
              <span>Mentor Rating (5%)</span>
              <strong>{rating_score}%</strong>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={styles.cardActions}>
        <button
          type="button"
          className={styles.viewProfileBtn}
          onClick={() => onOpenModal(teacher, recommendation, 'profile')}
        >
          View Profile
        </button>
        <button
          type="button"
          className={styles.connectBtn}
          onClick={() => onOpenModal(teacher, recommendation, 'connect')}
        >
          Connect / Book
        </button>
      </div>
    </div>
  )
}
