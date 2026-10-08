import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadPage from './UploadPage.jsx'
import DashboardPage from './DashboardPage.jsx'
import { supabase } from '../lib/supabaseClient.js'
import styles from '../components/AuthStyles.module.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!active) return
      if (!initialSession) {
        navigate('/login', { replace: true })
        return
      }
      setSession(initialSession)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!nextSession) {
        navigate('/login', { replace: true })
        return
      }
      setSession(nextSession)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [navigate])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  function handleAnalysisComplete(data, file = null) {
    if (data && data.analysis) {
      setAnalysis(data.analysis)
      setResumeFile(data.file || file)
    } else {
      setAnalysis(data)
      setResumeFile(file)
    }
    setActiveTab('profile')
  }

  function handleResetAnalysis() {
    setAnalysis(null)
    setResumeFile(null)
    setActiveTab('profile')
  }

  if (analysis) {
    return (
      <DashboardPage
        analysis={analysis}
        resumeFile={resumeFile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReset={handleResetAnalysis}
      />
    )
  }

  return (
    <div className={styles.dashboardShell}>
      <header className={styles.dashboardTopBar}>
        <div className={styles.dashboardBrand}>
          <img src="/margdarshak_logo.png" alt="MargDarshak" className={styles.dashboardLogo} />
          <div>
            <div className={styles.dashboardTitle}>MargDarshak</div>
            <div className={styles.dashboardSubtitle}>Resume Analysis Platform</div>
          </div>
        </div>

        <div className={styles.dashboardUserBlock}>
          <span className={styles.dashboardUserLabel}>Signed in as</span>
          <span className={styles.dashboardUserValue}>
            {session?.user?.user_metadata?.display_name || session?.user?.email || 'User'}
          </span>
        </div>

        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className={styles.dashboardWorkspace}>
        <UploadPage compact onAnalysisComplete={handleAnalysisComplete} />
      </div>
    </div>
  )
}
