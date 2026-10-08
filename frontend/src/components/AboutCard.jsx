import styles from '../pages/LandingPage.module.css'

export default function AboutCard({ step, title, description }) {
  return (
    <article className={styles.aboutCard}>
      <span className={styles.aboutStep}>{step}</span>
      <h3 className={styles.aboutCardTitle}>{title}</h3>
      <p className={styles.aboutCardText}>{description}</p>
    </article>
  )
}