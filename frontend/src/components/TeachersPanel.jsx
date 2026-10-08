import React, { useState, useEffect } from 'react'
import { recommendTeachers } from '../utils/api.js'
import TeacherCard from './TeacherCard.jsx'
import TeacherFilters from './TeacherFilters.jsx'
import TeacherMatchExplanation from './TeacherMatchExplanation.jsx'
import TeacherModal from './TeacherModal.jsx'
import styles from './TeachersPanel.module.css'

export default function TeachersPanel({ analysis }) {
  const { job_roles, gaps } = analysis || {}
  const topRoles = job_roles?.top_roles || []
  const initialRole = job_roles?.best_match?.role || (topRoles[0]?.role || 'Software Engineer')

  const [selectedRole, setSelectedRole] = useState(initialRole)
  const [preferences, setPreferences] = useState({
    mode: '',
    language: '',
    teaching_style: '',
  })
  const [selectedSkill, setSelectedSkill] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recommendationsData, setRecommendationsData] = useState(null)
  const [activeModal, setActiveModal] = useState({ open: false, teacher: null, rec: null, mode: 'profile' })

  // Extract skill gaps for current selected role
  const roleGaps = gaps?.gaps?.[selectedRole] || {}
  const missingRequired = roleGaps.missing_required || []
  const missingPreferred = roleGaps.missing_preferred || []
  const allRoleGaps = [...missingRequired, ...missingPreferred.filter(s => !missingRequired.includes(s))]

  useEffect(() => {
    let active = true

    async function loadMentors() {
      setLoading(true)
      setError(null)
      try {
        const res = await recommendTeachers(analysis, selectedRole, preferences, 8)
        if (!active) return
        setRecommendationsData(res)
      } catch (err) {
        if (!active) return
        setError(err.response?.data?.detail || err.message || 'Failed to fetch mentor recommendations.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadMentors()

    return () => {
      active = false
    }
  }, [analysis, selectedRole, preferences])

  // Filter recommendations client-side if a specific skill is chosen
  const filteredRecs = (recommendationsData?.recommendations || []).filter(rec => {
    if (!selectedSkill) return true
    return rec.matched_skills?.some(s => s.toLowerCase() === selectedSkill.toLowerCase())
  })

  function handleOpenModal(teacher, rec, mode = 'profile') {
    setActiveModal({ open: true, teacher, rec, mode })
  }

  function handleCloseModal() {
    setActiveModal({ open: false, teacher: null, rec: null, mode: 'profile' })
  }

  return (
    <div className={styles.container}>
      {/* Top Banner & Target Role Selection */}
      <div className={styles.topControlBanner}>
        <div className={styles.roleSelectionCol}>
          <label className={styles.roleSelectLabel}>Target Career Path</label>
          <div className={styles.roleSelectWrapper}>
            <select
              className={styles.roleSelect}
              value={selectedRole}
              onChange={e => {
                setSelectedRole(e.target.value)
                setSelectedSkill('')
              }}
            >
              {topRoles.map(r => (
                <option key={r.role} value={r.role}>
                  {r.role} ({Math.round(r.score)}% fit)
                </option>
              ))}
              {!topRoles.some(r => r.role === selectedRole) && (
                <option value={selectedRole}>{selectedRole}</option>
              )}
            </select>
          </div>
        </div>

        {/* Skill Gap Pill Display */}
        <div className={styles.gapsCol}>
          <div className={styles.gapsHeader}>
            <span>Missing Skills to Bridge ({allRoleGaps.length})</span>
          </div>
          <div className={styles.gapsPillsList}>
            {allRoleGaps.length > 0 ? (
              allRoleGaps.map(skill => (
                <button
                  key={skill}
                  type="button"
                  className={`${styles.gapPill} ${selectedSkill === skill ? styles.gapPillActive : ''}`}
                  onClick={() => setSelectedSkill(selectedSkill === skill ? '' : skill)}
                  title={`Click to filter mentors specializing in ${skill}`}
                >
                  <span className={styles.gapPillDot} />
                  {skill}
                </button>
              ))
            ) : (
              <span className={styles.noGapsNote}>No skill gaps identified for this role.</span>
            )}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <TeacherFilters
        preferences={preferences}
        onPreferenceChange={setPreferences}
        availableSkills={allRoleGaps}
        selectedSkill={selectedSkill}
        onSkillSelect={setSelectedSkill}
      />

      {/* Results Header */}
      <div className={styles.resultsHeader}>
        <div>
          <h2 className={styles.sectionHeading}>Top Recommended Mentors</h2>
          <p className={styles.sectionSub}>
            Ranked by gap coverage for <strong>{selectedRole}</strong> using hybrid semantic scoring
          </p>
        </div>
        {filteredRecs.length > 0 && (
          <span className={styles.resultCountBadge}>
            Showing {filteredRecs.length} mentor{filteredRecs.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className={styles.grid}>
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className={styles.skeletonCard}>
              <div className={styles.skeletonHeader} />
              <div className={styles.skeletonBio} />
              <div className={styles.skeletonMeta} />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className={styles.errorState}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{error}</p>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => setPreferences({ mode: '', language: '', teaching_style: '' })}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredRecs.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <h3>No mentors match your active filter criteria</h3>
          <p>Try resetting the skill or mode filter to view all qualified mentors for {selectedRole}.</p>
          <button
            type="button"
            className={styles.resetFilterBtn}
            onClick={() => {
              setPreferences({ mode: '', language: '', teaching_style: '' })
              setSelectedSkill('')
            }}
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Mentor Cards Grid */}
      {!loading && !error && filteredRecs.length > 0 && (
        <div className={styles.grid}>
          {filteredRecs.map(rec => (
            <TeacherCard
              key={rec.teacher.id}
              recommendation={rec}
              onOpenModal={handleOpenModal}
            />
          ))}
        </div>
      )}

      {/* Methodology Section */}
      <TeacherMatchExplanation method={recommendationsData?.method} />

      {/* Detail / Booking Modal */}
      {activeModal.open && (
        <TeacherModal
          teacher={activeModal.teacher}
          recommendation={activeModal.rec}
          mode={activeModal.mode}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
