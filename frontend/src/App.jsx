import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import LoginPage from './pages/login.jsx'
import SignupPage from './pages/signup.jsx'
import Dashboard from './pages/dashboard.jsx'
import TeacherDashboard from './pages/teacher-dashboard.jsx'
import TeacherResumeAnalysis from './pages/teacher-resume-analysis.jsx'
import LandingPage from './pages/LandingPage.jsx'
import { supabase } from './lib/supabaseClient.js'

function useSessionState() {
  const [isChecking, setIsChecking] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setIsChecking(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsChecking(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  return { isChecking, session }
}

function ProtectedRoute({ children, role = 'student' }) {
  const { isChecking, session } = useSessionState()
  const demoTeacher = role === 'teacher' && localStorage.getItem('margdarshak_teacher_demo') === 'true'

  if (isChecking) {
    return <div className="auth-loader">Checking session...</div>
  }

  if (!session && !demoTeacher) {
    return <Navigate to="/login" replace />
  }

  const userRole = demoTeacher ? 'teacher' : (session.user?.user_metadata?.role || 'student')
  if (userRole !== role) {
    return <Navigate to={userRole === 'teacher' ? '/teacher/dashboard' : '/dashboard'} replace />
  }

  return children
}

function PublicAuthRoute({ children }) {
  const { isChecking, session } = useSessionState()

  if (isChecking) {
    return <div className="auth-loader">Checking session...</div>
  }

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function LandingRoute() {
  const navigate = useNavigate()

  return (
    <LandingPage
      onLogin={() => navigate('/login')}
      onSignup={() => navigate('/signup')}
      onTeacherLogin={() => navigate('/teacher-login')}
    />
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route
        path="/login"
        element={(
          <PublicAuthRoute>
            <LoginPage role="student" />
          </PublicAuthRoute>
        )}
      />
      <Route
        path="/signup"
        element={(
          <PublicAuthRoute>
            <SignupPage role="student" />
          </PublicAuthRoute>
        )}
      />
      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute role="student">
            <Dashboard />
          </ProtectedRoute>
        )}
      />
      <Route path="/teacher-login" element={<PublicAuthRoute><LoginPage role="teacher" /></PublicAuthRoute>} />
      <Route path="/teacher-signup" element={<PublicAuthRoute><SignupPage role="teacher" /></PublicAuthRoute>} />
      <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/analyze" element={<ProtectedRoute role="teacher"><TeacherResumeAnalysis /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
