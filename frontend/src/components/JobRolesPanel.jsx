import styles from './JobRolesPanel.module.css'

export default function JobRolesPanel({ jobRoles }) {
  const topRoles = jobRoles?.top_roles || []
  const method = jobRoles?.method || ''

  return (
    <div className={styles.container + ' stagger'}>
      <div className={styles.methodBanner}>
        <span className={styles.methodLabel}>Classification Method</span>
        <span className={styles.methodText}>{method}</span>
      </div>

      {topRoles.map((role, i) => (
        <div key={role.role} className={`${styles.roleCard} ${i === 0 ? styles.roleCardBest : ''}`}>
          <div className={styles.roleHeader}>
            <div className={styles.roleLeft}>
              <span className={styles.rank}>#{i + 1}</span>
              <div>
                <h3 className={styles.roleName}>{role.role}</h3>
                <p className={styles.roleDesc}>{role.description}</p>
                {role.onet_code && (
                  <span className={styles.onetTag}>O*NET {role.onet_code}</span>
                )}
              </div>
            </div>
            <div className={styles.scoreBox}>
              <span className={styles.scoreNum}>{role.score}%</span>
              <span className={styles.scoreLbl}>match</span>
            </div>
          </div>

          {/* Score bar */}
          <div className={styles.barContainer}>
            <div className={styles.bar}>
              <div className={styles.barFill} style={{ width: `${role.score}%` }} />
            </div>
          </div>

          <div className={styles.roleDetails}>


            {role.matched_required.length > 0 && (
              <div className={styles.matchedBlock}>
                <span className={styles.matchedLabel}>Matching required skills:</span>
                <div className={styles.tagList}>
                  {role.matched_required.map(s => (
                    <span key={s} className={`${styles.tag} ${styles.tagGreen}`}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {role.matched_preferred.length > 0 && (
              <div className={styles.matchedBlock}>
                <span className={styles.matchedLabel}>Matching preferred skills:</span>
                <div className={styles.tagList}>
                  {role.matched_preferred.slice(0, 6).map(s => (
                    <span key={s} className={`${styles.tag} ${styles.tagGray}`}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.coverage}>
              <span>{role.matched_required.length} of {role.total_required} required skills matched</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
