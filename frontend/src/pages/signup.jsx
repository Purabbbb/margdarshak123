import AuthNavButtons from '../components/AuthNavButtons.jsx'
import SignupForm from '../components/SignupForm.jsx'
import Logo from '../components/Logo.jsx'
import { Link } from 'react-router-dom'
import styles from '../components/AuthStyles.module.css'

export default function SignupPage({ role = 'student' }) {
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
          <AuthNavButtons activePage="signup" role={role} />
        </div>

        <div className={`${styles.card} ${styles.darkCard}`}>
          <div className={styles.decorBar} />
          <SignupForm role={role} />
        </div>
      </section>
    </div>
  )
}