import styles from './ProfilePanel.module.css'

function InfoRow({ label, value, mono }) {
  if (!value) return null
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={`${styles.infoValue} ${mono ? styles.mono : ''}`}>{value}</span>
    </div>
  )
}

function MethodTag({ method }) {
  return <span className={styles.methodTag}>{method}</span>
}

export default function ProfilePanel({ analysis }) {
  const { entities, skills, job_roles } = analysis
  const topRole = job_roles?.best_match
  const topRoles = job_roles?.top_roles || []

  const contactFields = [
    { label: 'Name', key: 'name', method: entities?._methods?.name },
    { label: 'Email', key: 'email', method: entities?._methods?.email },
    { label: 'Phone', key: 'phone', method: entities?._methods?.phone },
    { label: 'Location', key: 'location', method: entities?._methods?.location },
    { label: 'LinkedIn', key: 'linkedin', method: entities?._methods?.linkedin },
    { label: 'GitHub', key: 'github', method: entities?._methods?.github },
  ]

  return (
    <div className={styles.container + ' stagger'}>
      {/* Contact card */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Contact Information</h2>
        <p className={styles.cardSub}>Extracted using Regex patterns and spaCy Named Entity Recognition</p>

        <div className={styles.infoGrid}>
          {contactFields.map(field => (
            entities?.[field.key] ? (
              <div key={field.key} className={styles.infoItem}>
                <div className={styles.infoItemTop}>
                  <span className={styles.infoLabel}>{field.label}</span>
                  <MethodTag method={field.method} />
                </div>
                <span className={styles.infoValue}>{entities[field.key]}</span>
              </div>
            ) : null
          ))}
        </div>

        {!entities?.name && !entities?.email && (
          <p className={styles.noData}>No contact details were found. Try a cleaner PDF format.</p>
        )}
      </div>

      {/* Summary stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{skills?.skill_count || 0}</span>
          <span className={styles.statName}>Skills Detected</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{topRole?.score || 0}%</span>
          <span className={styles.statName}>Best Role Match</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{topRoles.length}</span>
          <span className={styles.statName}>Roles Analyzed</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardAccent}`}>
          <span className={styles.statNumLight}>{topRole?.role || '—'}</span>
          <span className={styles.statNameLight}>Top Match</span>
        </div>
      </div>

      {/* Top role cards */}
      {topRoles.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Top Job Role Matches</h2>
          <div className={styles.roleList}>
            {topRoles.map((role, i) => (
              <div key={role.role} className={`${styles.roleRow} ${i === 0 ? styles.roleRowBest : ''}`}>
                <div className={styles.roleLeft}>
                  <span className={styles.roleRank}>#{i + 1}</span>
                  <div>
                    <div className={styles.roleName}>{role.role}</div>
                    <div className={styles.roleDesc}>{role.description}</div>
                  </div>
                </div>
                <div className={styles.roleRight}>
                  <div className={styles.scoreBar}>
                    <div className={styles.scoreBarFill} style={{ width: `${role.score}%` }} />
                  </div>
                  <span className={styles.scoreLabel}>{role.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
