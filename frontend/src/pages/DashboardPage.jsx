import styles from './DashboardPage.module.css'
import ProfilePanel from '../components/ProfilePanel.jsx'
import SkillsPanel from '../components/SkillsPanel.jsx'
import JobRolesPanel from '../components/JobRolesPanel.jsx'
import GapPanel from '../components/GapPanel.jsx'
import TeachersPanel from '../components/TeachersPanel.jsx'
import CoursesPanel from '../components/CoursesPanel.jsx'
import ResumeRoasterPanel from '../components/ResumeRoasterPanel.jsx'
import JobsPanel from '../components/JobsPanel.jsx'
import PipelinePanel from '../components/PipelinePanel.jsx'
import Chatbot from '../components/Chatbot.jsx'

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'skills', label: 'Skills' },
  { id: 'roles', label: 'Job Roles' },
  { id: 'gap', label: 'Skill Gaps' },
  { id: 'teachers', label: 'Teachers' },
  { id: 'courses', label: 'Courses' },
  { id: 'roaster', label: 'Resume Roaster' },
  { id: 'jobs', label: 'Live Jobs' },
  { id: 'pipeline', label: 'NLP Pipeline' },
]

const TAB_CONTEXT = {
  profile: ['PROFILE INTELLIGENCE', 'The signal your resume already carries.'],
  skills: ['SKILL DISCOVERY', 'The capabilities you can build your next move on.'],
  roles: ['CAREER DISCOVERY', 'Potential directions ranked by your current profile.'],
  gap: ['SKILL GAP ANALYSIS', 'The distance between where you are and where you want to go.'],
  teachers: ['EXPERT MENTORSHIP', "Learn from someone who knows what you're missing."],
  courses: ['LEARNING ROADMAP', 'Resources connected to the skills you need next.'],
  roaster: ['RESUME ROAST & IMPROVEMENT', 'Your resume asked for a review. It got a roast.'],
  jobs: ['OPPORTUNITY MATCHING', 'Roles and listings aligned with your direction.'],
  pipeline: ['TRANSPARENT ANALYSIS', 'Inspect how MargDarshak assembled your report.'],
}

export default function DashboardPage({ analysis, resumeFile, activeTab, setActiveTab, onReset }) {
  const { entities, skills, job_roles, gaps, courses, jobs } = analysis
  const bestRole = job_roles?.best_match?.role || 'N/A'
  const skillCount = skills?.skill_count || 0
  const matchScore = job_roles?.best_match?.score || 0

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src="/margdarshak_logo.png" alt="MargDarshak" className={styles.logoImg} />
        </div>

        <div className={styles.headerStats}>
          <div className={styles.statPill}>
            <span className={styles.statVal}>{skillCount}</span>
            <span className={styles.statLbl}>skills found</span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.statVal}>{matchScore}%</span>
            <span className={styles.statLbl}>best match</span>
          </div>
          <div className={styles.statPillAccent}>
            <span className={styles.statVal}>{bestRole}</span>
          </div>
        </div>

        <button className={styles.resetBtn} onClick={onReset}>
          Analyze another
        </button>
      </header>

      {/* Name banner */}
      {entities?.name && (
        <div className={styles.nameBanner}>
          <span>Analysis for</span>
          <strong>{entities.name}</strong>
          {entities.location && <span className={styles.location}>{entities.location}</span>}
        </div>
      )}

      {/* Tab navigation */}
      <nav className={styles.tabs}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'roaster' && (
              <span className={styles.tabBadge}>AI Roast</span>
            )}
            {tab.id === 'pipeline' && (
              <span className={styles.tabBadge}>Demo</span>
            )}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <main className={styles.content}>
        <div className={styles.contentIntro}>
          <span>{TAB_CONTEXT[activeTab]?.[0]}</span>
          <h1>{TAB_CONTEXT[activeTab]?.[1]}</h1>
        </div>
        {activeTab === 'profile' && <ProfilePanel analysis={analysis} />}
        {activeTab === 'skills' && <SkillsPanel skills={skills} />}
        {activeTab === 'roles' && <JobRolesPanel jobRoles={job_roles} />}
        {activeTab === 'gap' && <GapPanel gaps={gaps} jobRoles={job_roles} />}
        {activeTab === 'teachers' && <TeachersPanel analysis={analysis} />}
        {activeTab === 'courses' && <CoursesPanel courses={courses} gaps={gaps} />}
        {activeTab === 'roaster' && <ResumeRoasterPanel analysis={analysis} resumeFile={resumeFile} />}
        {activeTab === 'jobs' && <JobsPanel jobs={jobs} analysis={analysis} />}
        {activeTab === 'pipeline' && <PipelinePanel pipeline={analysis.pipeline} />}
      </main>

      {/* Floating Career Chatbot */}
      <Chatbot analysis={analysis} />
    </div>
  )
}

