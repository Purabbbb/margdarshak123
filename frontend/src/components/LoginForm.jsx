import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import styles from './AuthStyles.module.css'

export default function LoginForm({ role = 'student' }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  function handleTeacherDemo() {
    localStorage.setItem('margdarshak_teacher_demo', 'true')
    navigate('/teacher/dashboard')
  }

  async function handleLogin(event) {
    event.preventDefault()
    setStatus('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    })

    if (error) {
      setStatus(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      const signedInRole = data.user?.user_metadata?.role || 'student'
      if (signedInRole !== role) {
        await supabase.auth.signOut()
        setStatus(`This account is registered as a ${signedInRole}. Use the ${signedInRole} login mode.`)
        setLoading(false)
        return
      }
      navigate(role === 'teacher' ? '/teacher/dashboard' : '/dashboard')
      return
    }

    setLoading(false)
  }

  async function handleResetPassword() {
    setStatus('')

    if (!username) {
      setStatus('Enter your email in Username first.')
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(username)
    if (error) {
      setStatus(error.message)
      return
    }

    setStatus('Password reset email sent.')
  }

  return (
    <form className={styles.formArea} onSubmit={handleLogin}>
      <h1 className={styles.formTitle}>{role === 'teacher' ? 'TEACHER LOGIN' : 'LOGIN'}</h1>

      <div className={styles.fieldRow}>
        <span className={`${styles.fieldLabel} ${styles.lightLabel}`}>Username</span>
        <input
          className={styles.input}
          type="email"
          placeholder="..............."
          value={username}
          onChange={event => setUsername(event.target.value)}
          required
        />
      </div>

      <div className={styles.fieldRow}>
        <span className={`${styles.fieldLabel} ${styles.lightLabel}`}>Password</span>
        <input
          className={styles.input}
          type="password"
          placeholder="..............."
          value={password}
          onChange={event => setPassword(event.target.value)}
          required
        />
      </div>

      <button type="button" className={styles.forgot} onClick={handleResetPassword}>
        <span className={styles.forgotSpark} aria-hidden="true" />
        <span className={styles.forgotText}>Forget Password ?</span>
      </button>

      <button type="submit" className={`${styles.submitBtn} ${styles.lightSubmit}`} disabled={loading}>
        {loading ? (
          <>
            <span className={styles.spinner} />
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </button>

      {role === 'teacher' && (
        <button type="button" className={styles.demoBtn} onClick={handleTeacherDemo}>
          Try Teacher Demo
        </button>
      )}

      {status && <p className={styles.statusText}>{status}</p>}
    </form>
  )
}