import styles from './GapPanel.module.css'

const PRIORITY_COLORS = {
  High: styles.priorityHigh,
  Medium: styles.priorityMedium,
  Ready: styles.priorityReady
}

export default function GapPanel({ gaps, jobRoles }) {
  const gapsData = gaps?.gaps || {}
  const topRoles = jobRoles?.top_roles || []

  return (
    <div className={styles.container + ' stagger'}>
      <div className={styles.methodBanner}>
        <span className={styles.methodLabel}>Method</span>
        <span className={styles.methodText}>{gaps?.method}</span>
      </div>

      {topRoles.map(role => {
        const gap = gapsData[role.role]
        if (!gap) return null

        return (
          <div key={role.role} className={styles.roleCard}>
            <div className={styles.roleHeader}>
              <div className={styles.roleMeta}>
                <h3 className={styles.roleName}>{role.role}</h3>
                <div className={styles.readinessRow}>
                  <div className={styles.readinessBar}>
                    <div
                      className={styles.readinessFill}
                      style={{ width: `${gap.readiness_score}%` }}
                    />
                  </div>
                  <span className={styles.readinessNum}>{gap.readiness_score}% ready</span>
                </div>
              </div>
              <span className={`${styles.priorityBadge} ${PRIORITY_COLORS[gap.priority] || ''}`}>
                {gap.priority}
              </span>
            </div>

            {gap.missing_required.length === 0 && gap.missing_preferred.length === 0 ? (
              <div className={styles.fullyReady}>
                You have all the skills required for this role.
              </div>
            ) : (
              <div className={styles.gapContent}>
                {gap.missing_required.length > 0 && (
                  <div className={styles.gapBlock}>
                    <div className={styles.gapBlockHeader}>
                      <span className={styles.gapBlockTitle}>Missing Required Skills</span>
                      <span className={styles.gapBlockCount}>{gap.missing_required.length}</span>
                    </div>
                    <div className={styles.tagList}>
                      {gap.missing_required.map(skill => (
                        <span key={skill} className={`${styles.gapTag} ${styles.gapTagRequired}`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {gap.missing_preferred.length > 0 && (
                  <div className={styles.gapBlock}>
                    <div className={styles.gapBlockHeader}>
                      <span className={styles.gapBlockTitle}>Missing Preferred Skills</span>
                      <span className={styles.gapBlockCount}>{gap.missing_preferred.length}</span>
                    </div>
                    <div className={styles.tagList}>
                      {gap.missing_preferred.map(skill => (
                        <span key={skill} className={`${styles.gapTag} ${styles.gapTagPreferred}`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
