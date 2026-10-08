import React, { useState } from 'react'
import styles from './TeachersPanel.module.css'

export default function TeacherModal({ teacher, recommendation, mode, onClose }) {
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState('Tomorrow, 6:00 PM')
  const [notes, setNotes] = useState('')

  if (!teacher) return null

  const initials = teacher.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  function handleBookingSubmit(e) {
    e.preventDefault()
    setBookingConfirmed(true)
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalCloseBtn} onClick={onClose}>
          ✕
        </button>

        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalAvatar}>{initials}</div>
          <div>
            <div className={styles.modalTitleRow}>
              <h2 className={styles.modalTeacherName}>{teacher.name}</h2>
              {teacher.verified && (
                <span className={styles.verifiedPill}>✓ Verified Mentor</span>
              )}
            </div>
            <p className={styles.modalHeadline}>{teacher.headline}</p>
            <div className={styles.modalBadges}>
              <span className={styles.modalBadge}>★ {teacher.rating} rating</span>
              <span className={styles.modalBadge}>{teacher.sessions_completed} sessions</span>
              <span className={styles.modalBadge}>{teacher.hourly_rate || '$45/hr'}</span>
              <span className={styles.modalBadgeAccent}>{Math.round(recommendation?.overall_match || 90)}% Match</span>
            </div>
          </div>
        </div>

        {bookingConfirmed ? (
          <div className={styles.bookingSuccessState}>
            <div className={styles.successIcon}>✓</div>
            <h3>Session Request Sent!</h3>
            <p>
              In a full production deployment, {teacher.name} will receive your resume gaps summary and meeting request for <strong>{selectedSlot}</strong>.
            </p>
            <div className={styles.demoNoticeBox}>
              <span className={styles.demoNoticeTag}>DEMO MODE</span>
              <p>
                This mentor profile is part of the MargDarshak demonstration dataset. No actual charges or calendar bookings were made.
              </p>
            </div>
            <button className={styles.modalDoneBtn} onClick={onClose}>
              Close Window
            </button>
          </div>
        ) : (
          <div className={styles.modalBody}>
            <div className={styles.modalSection}>
              <h4>About Mentorship</h4>
              <p className={styles.modalBio}>{teacher.bio}</p>
            </div>

            <div className={styles.modalSection}>
              <h4>Curriculum & Skills Taught</h4>
              <div className={styles.modalSkillChips}>
                {teacher.skills?.map(s => (
                  <span
                    key={s}
                    className={
                      recommendation?.matched_skills?.includes(s)
                        ? styles.modalSkillChipHighlight
                        : styles.modalSkillChip
                    }
                  >
                    {recommendation?.matched_skills?.includes(s) ? '✓ ' : ''}{s}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.modalGrid2}>
              <div className={styles.modalInfoBox}>
                <span className={styles.modalInfoLbl}>Teaching Style</span>
                <span className={styles.modalInfoVal}>{teacher.teaching_style?.join(', ') || 'Hands-on'}</span>
              </div>
              <div className={styles.modalInfoBox}>
                <span className={styles.modalInfoLbl}>Languages</span>
                <span className={styles.modalInfoVal}>{teacher.languages?.join(', ') || 'English'}</span>
              </div>
              <div className={styles.modalInfoBox}>
                <span className={styles.modalInfoLbl}>Availability</span>
                <span className={styles.modalInfoVal}>{teacher.availability}</span>
              </div>
              <div className={styles.modalInfoBox}>
                <span className={styles.modalInfoLbl}>Session Format</span>
                <span className={styles.modalInfoVal}>1-on-1 Screen Share & Code Review</span>
              </div>
            </div>

            {/* Match Rationale */}
            {recommendation?.reason && (
              <div className={styles.modalReasonBox}>
                <strong>Why MargDarshak recommended this mentor:</strong>
                <p>{recommendation.reason}</p>
              </div>
            )}

            {/* Quick Demo Connect Form */}
            <form onSubmit={handleBookingSubmit} className={styles.bookingForm}>
              <h4>Request a 1-on-1 Introductory Session</h4>
              <div className={styles.formRow}>
                <label>Select Preferred Time</label>
                <select
                  value={selectedSlot}
                  onChange={e => setSelectedSlot(e.target.value)}
                  className={styles.modalInput}
                >
                  <option value="Tomorrow, 6:00 PM">Tomorrow, 6:00 PM (IST / UTC+5:30)</option>
                  <option value="Saturday, 11:00 AM">Saturday, 11:00 AM (IST / UTC+5:30)</option>
                  <option value="Sunday, 4:00 PM">Sunday, 4:00 PM (IST / UTC+5:30)</option>
                  <option value="Next Tuesday, 7:30 PM">Next Tuesday, 7:30 PM (IST / UTC+5:30)</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <label>Target Discussion / Question</label>
                <textarea
                  rows="2"
                  placeholder={`e.g., Focus on my ${recommendation?.matched_skills?.slice(0, 2).join(' and ') || 'skill gaps'} for the target role...`}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className={styles.modalTextarea}
                />
              </div>

              <div className={styles.modalFooterBtns}>
                <button type="button" className={styles.modalCancelBtn} onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className={styles.modalSubmitBtn}>
                  Request Session ({teacher.hourly_rate || '$45/hr'})
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
