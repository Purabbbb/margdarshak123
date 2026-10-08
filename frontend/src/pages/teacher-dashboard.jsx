import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { recommendStudentsForTeacher } from '../utils/api.js'
import { supabase } from '../lib/supabaseClient.js'
import styles from '../components/AuthStyles.module.css'

const DEMO_TEACHER = {
  id: 'teacher_harshita',
  name: 'Harshita',
  email: 'teacher.demo@margdarshak.local',
  headline: 'Frontend Engineering & React Mentor',
  skills: [
    ['React', 'Strong'],
    ['JavaScript', 'Strong'],
    ['TypeScript', 'Strong'],
    ['Python', 'Strong'],
    ['Machine Learning', 'Intermediate'],
  ],
  projects: ['React dashboard platform', 'React portfolio builder', 'ML skills tracker'],
}

function getStoredTopSkills() {
  try {
    const stored = JSON.parse(localStorage.getItem('margdarshak_teacher_top_skills') || '[]')
    return Array.isArray(stored) && stored.length ? stored.slice(0, 5) : DEMO_TEACHER.skills.map(([skill]) => skill)
  } catch {
    return DEMO_TEACHER.skills.map(([skill]) => skill)
  }
}

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [students, setStudents] = useState([])
  const [error, setError] = useState('')
  const [topSkills, setTopSkills] = useState(getStoredTopSkills)

  useEffect(() => {
    const selectedSkills = getStoredTopSkills()
    setTopSkills(selectedSkills)
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    recommendStudentsForTeacher(DEMO_TEACHER.id, selectedSkills)
      .then(data => setStudents(data.recommendations || []))
      .catch(err => setError(err.response?.data?.detail || 'Could not load student matches.'))
  }, [])

  async function handleLogout() {
    localStorage.removeItem('margdarshak_teacher_demo')
    await supabase.auth.signOut()
    navigate('/teacher-login', { replace: true })
  }

  const isDemo = localStorage.getItem('margdarshak_teacher_demo') === 'true'

  return (
    <div className={styles.dashboardShell}>
      <header className={styles.dashboardTopBar}>
        <div className={styles.dashboardBrand}>
          <div className={styles.logoWrap}>M</div>
          <div>
            <div className={styles.dashboardTitle}>Teacher Portal</div>
            <div className={styles.dashboardSubtitle}>MargDarshak Mentor Workspace</div>
          </div>
        </div>
        <div className={styles.dashboardUserBlock}>
          <span className={styles.dashboardUserLabel}>{isDemo ? 'Demo teacher' : 'Signed in as teacher'}</span>
          <span className={styles.dashboardUserValue}>{isDemo ? DEMO_TEACHER.email : (session?.user?.email || 'Teacher')}</span>
        </div>
        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </header>

      <main className={styles.teacherWorkspace}>
        <section className={styles.teacherHero}>
          <span className={styles.dashboardSubtitle}>Teacher expertise dashboard</span>
          <h1>Welcome, {DEMO_TEACHER.name}</h1>
          <p>{DEMO_TEACHER.headline}</p>
          <button type="button" className={styles.submitBtn} onClick={() => navigate('/teacher/analyze')}>
            Analyze my resume
          </button>
        </section>

        <section className={styles.teacherStats}>
          <div><strong>{DEMO_TEACHER.skills.length}</strong><span>Expertise areas</span></div>
          <div><strong>{DEMO_TEACHER.projects.length}</strong><span>Projects</span></div>
          <div><strong>{students.length}</strong><span>Students matched</span></div>
          <div><strong>3 yrs</strong><span>Teaching experience</span></div>
        </section>

        <div className={styles.teacherGrid}>
          <section className={styles.teacherPanelCard}>
            <span className={styles.dashboardSubtitle}>Top 5 expertise</span>
            <h2>Your technical expertise</h2>
            <div className={styles.expertiseList}>
              {topSkills.map((skill, index) => (
                <div key={skill}><strong>{index + 1}. {skill}</strong><span>Matching expertise</span></div>
              ))}
            </div>
            <h2>Projects</h2>
            <ul>{DEMO_TEACHER.projects.map(project => <li key={project}>{project}</li>)}</ul>
          </section>

          <section className={styles.teacherPanelCard}>
            <span className={styles.dashboardSubtitle}>Reverse matching</span>
            <h2>Recommended students</h2>
            <p className={styles.teacherMuted}>Students whose requirements overlap with your expertise.</p>
            {error && <p className={styles.statusText}>{error}</p>}
            {students.length === 0 && !error && <p className={styles.teacherMuted}>No matching students yet.</p>}
            <div className={styles.studentMatchList}>
              {students.map(match => (
                <article key={match.student.id} className={styles.studentMatch}>
                  <div className={styles.studentMatchHeader}>
                    <div><strong>{match.student.name}</strong><span>Needs help with: {match.matched_skills.join(', ')}</span></div>
                    <b>{Math.round(match.match_score)}%</b>
                  </div>
                  <p>{match.student.profile}</p>
                  <div className={styles.evidenceList}>{match.evidence.map(item => <span key={item}>✓ {item}</span>)}</div>
                  <div className={styles.teacherActions}>
                    <button type="button" className={styles.submitBtn}>View profile</button>
                    <button type="button" className={styles.logoutBtn}>Connect</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
