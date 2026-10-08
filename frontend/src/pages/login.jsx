import AuthNavButtons from '../components/AuthNavButtons.jsx'
import LoginForm from '../components/LoginForm.jsx'
import Logo from '../components/Logo.jsx'
import { Link } from 'react-router-dom'
import styles from '../components/AuthStyles.module.css'

export default function LoginPage({ role = 'student' }) {
  return (
    <div className={styles.authPage}>
      <section className={styles.authFrame}>
        <div className={styles.topRow}>
          <div className={styles.topLeft}>
            <Link to="/" className={styles.homeButton} aria-label="Back to home">
              Home
            </Link>
            <div className={styles.logoWrap}>
              <Logo />
            </div>
          </div>
          <AuthNavButtons activePage="login" role={role} />
        </div>

        <div className={`${styles.card} ${styles.lightCard}`}>
          <div className={styles.decorBar} />
          <LoginForm role={role} />
        </div>
      </section>
    </div>
  )
}