import styles from '../pages/LandingPage.module.css'

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640'%3E%3Crect width='640' height='640' fill='%231E1E1E'/%3E%3Ccircle cx='320' cy='240' r='108' fill='%23C0C0C0'/%3E%3Cpath d='M160 540c34-104 109-156 160-156s126 52 160 156' fill='%23C0C0C0'/%3E%3C/svg%3E"

export default function CreatorCard({ name, image, role = 'Creator' }) {
  return (
    <article className={styles.creatorCard}>
      <img
        className={styles.creatorImage}
        src={image || FALLBACK_IMAGE}
        alt={name}
        onError={event => {
          event.currentTarget.src = FALLBACK_IMAGE
        }}
      />
      <h3 className={styles.creatorName}>{name}</h3>
      <p className={styles.creatorRole}>{role}</p>
    </article>
  )
}