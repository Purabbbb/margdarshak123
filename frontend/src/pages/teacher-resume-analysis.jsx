import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadPage from './UploadPage.jsx'
import styles from '../components/AuthStyles.module.css'

function getSkills(analysis) {
  const skills = analysis?.skills
  if (Array.isArray(skills)) return skills
  return skills?.matched_skills || skills?.found || []
}

export default function TeacherResumeAnalysis() {
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)

  function handleAnalysisComplete(data) {
    const nextAnalysis = data?.analysis || data
    const extracted = getSkills(nextAnalysis).slice(0, 5)
    localStorage.setItem('margdarshak_teacher_top_skills', JSON.stringify(extracted))
    setAnalysis(nextAnalysis)
  }

  if (analysis) {
    const skills = getSkills(analysis)
    const roles = analysis?.job_roles?.recommendations || analysis?.job_roles?.top_roles || []
    return (
      <div className={styles.dashboardShell}>
        <header className={styles.dashboardTopBar}>
          <div className={styles.dashboardBrand}>
            <div className={styles.logoWrap}>M</div>
            <div>
              <div className={styles.dashboardTitle}>Teacher Portal</div>
              <div className={styles.dashboardSubtitle}>Resume Analysis</div>
            </div>
          </div>
          <button type="button" className={styles.logoutBtn} onClick={() => navigate('/teacher/dashboard')}>
            Back to dashboard
          </button>
        </header>
        <main className={styles.teacherWorkspace}>
          <section className={styles.teacherHero}>
            <span className={styles.dashboardSubtitle}>Analysis complete</span>
            <h1>Your teaching expertise profile</h1>
            <p>Use these extracted skills and role suggestions to refine your teacher profile.</p>
          </section>
          <div className={styles.teacherGrid}>
            <section className={styles.teacherPanelCard}>
              <span className={styles.dashboardSubtitle}>Extracted skills</span>
              <h2>{skills.length ? `${skills.length} skills found` : 'Skills found'}</h2>
              {skills.length ? (
                <div className={styles.expertiseList}>
                  {skills.map(skill => <div key={skill}><strong>{skill}</strong><span>Detected</span></div>)}
                </div>
              ) : <p className={styles.teacherMuted}>No skills were detected. Try a clearer resume.</p>}
            </section>
            <section className={styles.teacherPanelCard}>
              <span className={styles.dashboardSubtitle}>Best-fit roles</span>
              <h2>Career direction</h2>
              {roles.length ? (
                <ul>{roles.slice(0, 5).map(role => <li key={role.role || role.name}>{role.role || role.name}</li>)}</ul>
              ) : <p className={styles.teacherMuted}>Role suggestions are available in the full analysis response.</p>}
              <button type="button" className={styles.submitBtn} onClick={() => setAnalysis(null)}>
                Analyze another resume
              </button>
            </section>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.dashboardShell}>
      <header className={styles.dashboardTopBar}>
        <div className={styles.dashboardBrand}>
          <div className={styles.logoWrap}>M</div>
          <div>
            <div className={styles.dashboardTitle}>Teacher Portal</div>
            <div className={styles.dashboardSubtitle}>Analyze your teaching expertise</div>
          </div>
        </div>
        <button type="button" className={styles.logoutBtn} onClick={() => navigate('/teacher/dashboard')}>
          Back to dashboard
        </button>
      </header>
      <UploadPage compact onAnalysisComplete={handleAnalysisComplete} />
    </div>
  )
}
