import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import styles from './AuthStyles.module.css'

export default function SignupForm({ role = 'student' }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(event) {
    event.preventDefault()
    setStatus('')

    if (password !== confirmPassword) {
      setStatus('Passwords do not match')
      return
    }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: username,
      password,
      options: {
        data: {
          display_name: username,
          role,
        },
      },
    })

    if (error) {
      setStatus(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      navigate(role === 'teacher' ? '/teacher/dashboard' : '/dashboard')
      return
    }

    if (data.user && !data.session) {
      setStatus('Check your email to confirm signup')
    }

    setLoading(false)
  }

  return (
    <form className={styles.formArea} onSubmit={handleSignup}>
      <h1 className={styles.formTitle}>{role === 'teacher' ? 'TEACHER SIGN UP' : 'SIGN UP'}</h1>

      <div className={styles.fieldRow}>
        <span className={`${styles.fieldLabel} ${styles.darkLabel}`}>Username</span>
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
        <span className={`${styles.fieldLabel} ${styles.darkLabel}`}>Password</span>
        <input
          className={styles.input}
          type="password"
          placeholder="..............."
          value={password}
          onChange={event => setPassword(event.target.value)}
          required
        />
      </div>

      <div className={styles.fieldRow}>
        <span className={`${styles.fieldLabel} ${styles.darkLabel}`}>Confirm Pass</span>
        <input
          className={styles.input}
          type="password"
          placeholder="..............."
          value={confirmPassword}
          onChange={event => setConfirmPassword(event.target.value)}
          required
        />
      </div>

      <button type="submit" className={`${styles.submitBtn} ${styles.darkSubmit}`} disabled={loading}>
        {loading ? (
          <>
            <span className={`${styles.spinner} ${styles.darkSpinner}`} />
            Creating...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      {status && <p className={styles.statusText}>{status}</p>}
    </form>
  )
}