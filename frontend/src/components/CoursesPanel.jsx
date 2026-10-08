import { useState } from 'react'
import styles from './CoursesPanel.module.css'

export default function CoursesPanel({ courses, gaps }) {
  const [activeRole, setActiveRole] = useState(null)

  const byRole = courses?.by_role || {}
  const prioritySkills = courses?.priority_skills || []
  const roles = Object.keys(byRole)

  const displayRole = activeRole || roles[0]
  const roleData = byRole[displayRole] || {}
  const requiredCourses = roleData.required_courses || []
  const preferredCourses = roleData.preferred_courses || []

  return (
    <div className={styles.container + ' stagger'}>
      {prioritySkills.length > 0 && (
        <div className={styles.priorityBox}>
          <span className={styles.priorityTitle}>Top skills to learn first</span>
          <div className={styles.priorityTags}>
            {prioritySkills.map((skill, i) => (
              <span key={skill} className={styles.priorityTag}>
                <span className={styles.priorityNum}>{i + 1}</span>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Role tabs */}
      {roles.length > 1 && (
        <div className={styles.roleTabs}>
          {roles.map(role => (
            <button
              key={role}
              className={`${styles.roleTab} ${displayRole === role ? styles.roleTabActive : ''}`}
              onClick={() => setActiveRole(role)}
            >
              {role}
            </button>
          ))}
        </div>
      )}

      {/* Courses for selected role */}
      {requiredCourses.length === 0 && preferredCourses.length === 0 ? (
        <div className={styles.empty}>
          No skill gaps found for {displayRole}. You are well-qualified for this role.
        </div>
      ) : (
        <>
          {requiredCourses.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Required skill courses
                <span className={styles.sectionCount}>{requiredCourses.length} skills</span>
              </h3>
              <div className={styles.courseList}>
                {requiredCourses.map(item => (
                  <SkillCourseBlock key={item.skill} item={item} />
                ))}
              </div>
            </div>
          )}

          {preferredCourses.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Preferred skill courses
                <span className={styles.sectionCount}>{preferredCourses.length} skills</span>
              </h3>
              <div className={styles.courseList}>
                {preferredCourses.map(item => (
                  <SkillCourseBlock key={item.skill} item={item} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SkillCourseBlock({ item }) {
  return (
    <div className={styles.skillBlock}>
      <div className={styles.skillBlockHeader}>
        <span className={styles.skillName}>{item.skill}</span>
        <span className={`${styles.priorityBadge} ${item.priority === 'Required' ? styles.badgeRequired : styles.badgePreferred}`}>
          {item.priority}
        </span>
      </div>
      <div className={styles.courseCards}>
        {item.courses.map((course, i) => (
          <a
            key={i}
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.courseCard}
          >
            <div className={styles.courseTop}>
              <span className={styles.courseTitle}>{course.title}</span>
              {course.free && <span className={styles.freeTag}>Free</span>}
            </div>
            <span className={styles.coursePlatform}>{course.platform}</span>
            <span className={styles.courseArrow}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
