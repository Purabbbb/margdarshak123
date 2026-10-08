import styles from '../pages/LandingPage.module.css'

const FALLBACK_AVATAR =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' rx='64' fill='%231E1E1E'/%3E%3Ccircle cx='64' cy='54' r='22' fill='%23C0C0C0'/%3E%3Cpath d='M28 108c7-21 24-31 36-31s29 10 36 31' fill='%23C0C0C0'/%3E%3C/svg%3E"

export default function JoinBubble({ leftAvatarSrc = FALLBACK_AVATAR, rightAvatarSrc = FALLBACK_AVATAR }) {
  return (
    <div className={styles.joinBubble}>
      <span className={styles.joinText}>JOIN THE MARGDARSHAK REVOLUTION</span>
      <div className={styles.avatarStack} aria-hidden="true">
        <img className={styles.avatar} src={leftAvatarSrc} alt="" />
        <img className={`${styles.avatar} ${styles.avatarSecond}`} src={rightAvatarSrc} alt="" />
      </div>
      <div className={styles.scrollIcon} aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 4h7a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V7" />
          <path d="M7 4v7a2 2 0 0 0 2 2h8" />
          <path d="M11 11V7" />
          <path d="M9 9h4" />
        </svg>
      </div>
    </div>
  )
}