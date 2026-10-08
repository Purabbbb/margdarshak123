import { useState } from 'react'
import styles from '../pages/LandingPage.module.css'

const LINKS = [
  { id: 'home', label: 'HOME' },
  { id: 'process', label: 'HOW IT WORKS' },
  { id: 'features', label: 'FEATURES' },
  { id: 'about-us', label: 'ABOUT' },
]

export default function Navbar({ activePage, onSignup, onLogin }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className={`${styles.navbar} ${menuOpen ? styles.navbarOpen : ''}`}>
      <div className={styles.brandBlock}>
        <div className={styles.logoCircle} aria-hidden="true">
          <img src="/margdarshak_logo.png" alt="Margdarshak" className={styles.navbarLogoImg} />
        </div>
      </div>

      <button type="button" className={styles.menuButton} onClick={() => setMenuOpen(open => !open)} aria-expanded={menuOpen} aria-label="Toggle navigation menu">
        {menuOpen ? 'CLOSE' : 'MENU'}
      </button>
      <nav className={styles.navLinks} aria-label="Landing page navigation">
        {LINKS.map(link => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className={`${styles.navLink} ${activePage === link.label ? styles.navLinkActive : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className={styles.navActions}>
        <button type="button" className={styles.ghostBtn} onClick={onLogin}>
          LOGIN
        </button>
        <button type="button" className={styles.fillBtn} onClick={onSignup}>
          GET STARTED
        </button>
      </div>
    </header>
  )
}