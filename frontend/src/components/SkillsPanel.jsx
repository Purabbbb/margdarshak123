import { useState } from 'react'
import styles from './SkillsPanel.module.css'

const CATEGORY_LABELS = {
  programming_languages: 'Programming Languages',
  web_frontend: 'Frontend',
  web_backend: 'Backend',
  databases: 'Databases',
  data_science_ml: 'ML / AI',
  data_tools: 'Data Tools',
  cloud_devops: 'Cloud & DevOps',
  cybersecurity: 'Cybersecurity',
  mobile: 'Mobile',
  data_analysis: 'Data Analysis',
  project_management: 'Project Management',
  design: 'Design',
  business_finance: 'Business & Finance',
  soft_skills: 'Soft Skills',
  other_tools: 'Tools & Other'
}

export default function SkillsPanel({ skills }) {
  const [filter, setFilter] = useState('all')

  const byCategory = skills?.by_category || {}
  const allSkills = skills?.matched_skills || []
  const matchDetails = skills?.match_details || {}

  const categories = Object.keys(byCategory)
  const exactCount = Object.values(matchDetails).length

  const filteredCategories = filter === 'all'
    ? categories
    : categories.filter(c => c === filter)

  return (
    <div className={styles.container + ' stagger'}>
      {/* Header stats */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <span className={styles.statNum}>{allSkills.length}</span>
          <span className={styles.statLbl}>Total Skills</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statNum}>{exactCount}</span>
          <span className={styles.statLbl}>Matched Skills</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statNum}>{categories.length}</span>
          <span className={styles.statLbl}>Categories</span>
        </div>
      </div>

      {/* Method explanation */}
      <div className={styles.methodNote}>
        <span className={styles.badge}>Exact</span> Each skill is matched by exact string search with word boundaries against 500+ skills across 15 categories.
      </div>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className={styles.filterRow}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${filter === cat ? styles.filterActive : ''}`}
              onClick={() => setFilter(cat)}
            >
              {CATEGORY_LABELS[cat] || cat} ({byCategory[cat].length})
            </button>
          ))}
        </div>
      )}

      {/* Skill categories */}
      {filteredCategories.length === 0 ? (
        <div className={styles.empty}>
          No skills were detected. Ensure your resume clearly lists technologies and tools.
        </div>
      ) : (
        filteredCategories.map(category => (
          <div key={category} className={styles.categoryCard}>
            <div className={styles.categoryHeader}>
              <h3 className={styles.categoryName}>
                {CATEGORY_LABELS[category] || category}
              </h3>
              <span className={styles.categoryCount}>{byCategory[category].length} skills</span>
            </div>
            <div className={styles.skillList}>
              {byCategory[category].map(skill => {
                const detail = matchDetails[skill]
                return (
                  <div key={skill} className={styles.skillTag}>
                    {skill}
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
