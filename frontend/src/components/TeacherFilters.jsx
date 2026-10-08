import React from 'react'
import styles from './TeachersPanel.module.css'

export default function TeacherFilters({
  preferences,
  onPreferenceChange,
  availableSkills = [],
  selectedSkill,
  onSkillSelect
}) {
  return (
    <div className={styles.filterSection}>
      <div className={styles.filterHeader}>
        <div className={styles.filterTitleRow}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          <span className={styles.filterSectionTitle}>Refine Mentors</span>
        </div>
        {(preferences.mode || preferences.language || preferences.teaching_style || selectedSkill) && (
          <button
            type="button"
            className={styles.clearFilterBtn}
            onClick={() => {
              onPreferenceChange({ mode: '', language: '', teaching_style: '' })
              onSkillSelect('')
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      <div className={styles.filtersGrid}>
        {/* Mode Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Learning Mode</label>
          <select
            className={styles.filterSelect}
            value={preferences.mode || ''}
            onChange={e => onPreferenceChange({ ...preferences, mode: e.target.value })}
          >
            <option value="">All Modes</option>
            <option value="online">Online Only</option>
            <option value="hybrid">Hybrid</option>
            <option value="offline">In-Person / Offline</option>
          </select>
        </div>

        {/* Language Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Language</label>
          <select
            className={styles.filterSelect}
            value={preferences.language || ''}
            onChange={e => onPreferenceChange({ ...preferences, language: e.target.value })}
          >
            <option value="">All Languages</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Tamil">Tamil</option>
            <option value="Telugu">Telugu</option>
            <option value="Marathi">Marathi</option>
            <option value="Bengali">Bengali</option>
            <option value="Malayalam">Malayalam</option>
          </select>
        </div>

        {/* Teaching Style Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Mentorship Style</label>
          <select
            className={styles.filterSelect}
            value={preferences.teaching_style || ''}
            onChange={e => onPreferenceChange({ ...preferences, teaching_style: e.target.value })}
          >
            <option value="">All Styles</option>
            <option value="project-based">Project-based</option>
            <option value="hands-on">Hands-on Lab</option>
            <option value="interview-prep">Interview Prep</option>
            <option value="architecture-focused">Architecture & Systems</option>
            <option value="beginner-friendly">Beginner-friendly</option>
            <option value="case-study-driven">Case Study</option>
          </select>
        </div>

        {/* Skill Focus Pill selector */}
        {availableSkills.length > 0 && (
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Priority Skill Focus</label>
            <select
              className={styles.filterSelect}
              value={selectedSkill || ''}
              onChange={e => onSkillSelect(e.target.value)}
            >
              <option value="">All Missing Skills</option>
              {availableSkills.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
