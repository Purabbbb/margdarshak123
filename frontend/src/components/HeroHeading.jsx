import styles from '../pages/LandingPage.module.css'

export default function HeroHeading() {
  return (
    <h1 className={styles.heroText}>
      <span className={`${styles.heroLine} ${styles.heroLineMuted}`}>
        REVOLUTIONIZING JOB HUNT WITH,
      </span>
      <span className={`${styles.heroLine} ${styles.heroLineAccent}`}>
        MARGDARSHAK
      </span>
    </h1>
  )
}