import { useNavigate } from 'react-router-dom'
import styles from './AuthStyles.module.css'

export default function AuthNavButtons({ activePage, role = 'student' }) {
  const navigate = useNavigate()
  const isTeacher = role === 'teacher'

  return (
    <div className={styles.authNav}>
      <button
        type="button"
        className={`${styles.navBtn} ${activePage === 'signup' ? styles.navActive : styles.navGhost}`}
        onClick={() => navigate(isTeacher ? '/teacher-signup' : '/signup')}
      >
        SIGN UP
      </button>

      <button
        type="button"
        className={`${styles.navBtn} ${activePage === 'login' ? styles.navActive : styles.navGhost}`}
        onClick={() => navigate(isTeacher ? '/teacher-login' : '/login')}
      >
        LOGIN
      </button>
      <button type="button" className={`${styles.navBtn} ${styles.navGhost}`} onClick={() => navigate(isTeacher ? '/login' : '/teacher-login')}>
        {isTeacher ? 'STUDENT MODE' : 'TEACHER LOGIN'}
      </button>
    </div>
  )
}