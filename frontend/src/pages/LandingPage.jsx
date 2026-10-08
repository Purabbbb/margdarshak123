import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './LandingPage.module.css'

gsap.registerPlugin(ScrollTrigger)

/* ───────── DATA ───────── */
const NAV_LINKS = [
  { id: 'home', label: 'HOME' },
  { id: 'problem', label: 'WHY' },
  { id: 'how-it-works', label: 'HOW IT WORKS' },
  { id: 'features', label: 'FEATURES' },
  { id: 'team', label: 'ABOUT' },
]

const MARQUEE_ITEMS = [
  'CAREER CLARITY', 'AI GUIDANCE', 'RESUME INTELLIGENCE',
  'SKILL DISCOVERY', 'CAREER MATCHING', 'SKILL GAPS',
  'LEARNING ROADMAP', 'CAREER CLARITY', 'AI GUIDANCE',
  'RESUME INTELLIGENCE', 'SKILL DISCOVERY', 'CAREER MATCHING',
]

const STEPS = [
  { num: '01', title: 'UPLOAD', desc: 'Upload your resume — PDF, any format. We read everything.' },
  { num: '02', title: 'ANALYZE', desc: 'Extract skills, education, experience using advanced NLP.' },
  { num: '03', title: 'MATCH', desc: 'Discover relevant career roles matched to your profile.' },
  { num: '04', title: 'IMPROVE', desc: 'Identify skill gaps and get a personalized learning roadmap.' },
]

const CAREER_ROLES = [
  { title: 'AI ENGINEER', match: '92%' },
  { title: 'DATA SCIENTIST', match: '87%' },
  { title: 'ML ENGINEER', match: '84%' },
  { title: 'DATA ANALYST', match: '79%' },
  { title: 'SOFTWARE ENGINEER', match: '76%' },
]

const CURRENT_SKILLS = ['Python', 'SQL', 'Machine Learning', 'Statistics']
const NEXT_SKILLS = ['Deep Learning', 'MLOps', 'Cloud', 'System Design']

const STATS = [
  { end: 500, suffix: '+', label: 'skills analyzed' },
  { end: 50, suffix: '+', label: 'career roles' },
  { end: 8, suffix: '', label: 'analysis stages', pad: true },
  { end: 24, suffix: '/7', label: 'AI assistant' },
]

const DASHBOARD_TABS = ['PROFILE', 'SKILLS', 'ROLES', 'GAPS', 'COURSES']

const CHAT_MESSAGES = [
  { type: 'bot', text: 'Based on your profile analysis, I can see strong alignment with AI Engineering roles. You have solid Python and ML foundations.' },
  { type: 'user', text: 'What skills should I focus on next?' },
  { type: 'bot', text: 'I\'d recommend focusing on <strong>Deep Learning</strong> and <strong>MLOps</strong> — these are your top priority gaps for AI Engineering. Start with a structured DL course, then practice deploying models.' },
]

const CHIP_RESPONSES = {
  'Show my skill gaps': 'Your top priority gaps for <strong>AI Engineer</strong> are <strong>Deep Learning</strong> (PyTorch), <strong>MLOps</strong> (CI/CD pipeline for models), and <strong>System Design</strong>. Closing these raises your match from 78% to 92%.',
  'Suggest courses': 'Top recommendations for your gaps: 1) <strong>Deep Learning Specialization</strong> (DeepLearning.AI), 2) <strong>Made With ML</strong> (MLOps end-to-end), and 3) <strong>AWS Machine Learning Specialty</strong>.',
  'Compare roles': 'Match comparison for your profile: <strong>AI Engineer (92%)</strong> aligns best with your ML math & Python; <strong>Data Scientist (87%)</strong> needs deeper A/B testing; <strong>Software Engineer (76%)</strong> requires distributed systems.',
  'Career roadmap': 'Recommended 3-step sprint: <strong>Weeks 1-4</strong>: Deep Learning foundations & PyTorch. <strong>Weeks 5-8</strong>: Containerization with Docker & FastAPI. <strong>Weeks 9-12</strong>: End-to-end portfolio deployment.',
}

const CHAT_CHIPS = ['Show my skill gaps', 'Suggest courses', 'Compare roles', 'Career roadmap']

const SOLUTION_PILLS = ['Resume parsing', 'Skill extraction', 'Role matching', 'Skill gaps']

/* ───────── ANIMATION VARIANTS ───────── */
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.9, delay, ease: [0.25, 0.46, 0.45, 0.94] }
  })
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
}

const fadeChild = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (delay = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 1.0, delay, ease: [0.25, 0.46, 0.45, 0.94] }
  })
}

/* ───────── SECTION REVEAL WRAPPER ───────── */
function RevealSection({ children, className, id, threshold = 0.15 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: threshold })

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
    >
      {children}
    </motion.section>
  )
}

/* ───────── COUNT-UP HOOK ───────── */
function useCountUp(end, duration = 2000, startOnView = false) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  useEffect(() => {
    if (!isInView) return
    let startTime = null
    let rafId = null

    function animate(timestamp) {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(Math.floor(eased * end))
      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      }
    }

    rafId = requestAnimationFrame(animate)
    return () => rafId && cancelAnimationFrame(rafId)
  }, [isInView, end, duration])

  return { count, ref }
}

/* ───────── NAVBAR ───────── */
function Navbar({ onLogin, onSignup, onTeacherLogin }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      className={`${styles.navbar} ${scrolled ? styles.navScrolled : ''} ${menuOpen ? styles.navOpen : ''}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className={styles.navInner}>
        <a href="#home" className={styles.navBrand}>
          <div className={styles.navLogoWrap}>
            <img src="/margdarshak_logo.png" alt="" className={styles.navLogoImg} />
          </div>
          <span className={styles.navBrandText}>MARGDARSHAK</span>
        </a>

        <nav className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
          {NAV_LINKS.map(link => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={styles.navLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.navActions}>
          <button type="button" className={styles.navBtnGhost} onClick={onTeacherLogin}>
            TEACHER LOGIN
          </button>
          <button type="button" className={styles.navBtnGhost} onClick={onLogin}>
            LOGIN
          </button>
          <button type="button" className={styles.navBtnFill} onClick={onSignup}>
            GET STARTED
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <button
          type="button"
          className={styles.navMenuBtn}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? 'CLOSE' : 'MENU'}
        </button>
      </div>
    </motion.header>
  )
}

/* ───────── MARQUEE ───────── */
function Marquee() {
  return (
    <div className={styles.marqueeWrap}>
      <div className={styles.marqueeTrack}>
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className={styles.marqueeItem}>
            {item}
            <span className={styles.marqueeDot}>●</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ───────── STAT BLOCK WITH COUNT-UP ───────── */
function StatBlock({ end, suffix, label, pad }) {
  const { count, ref } = useCountUp(end, 2200)
  const display = pad ? String(count).padStart(2, '0') : count

  return (
    <motion.div ref={ref} className={styles.statBlock} variants={fadeChild}>
      <span className={styles.statVal}>{display}{suffix}</span>
      <span className={styles.statLabel}>{label}</span>
    </motion.div>
  )
}

/* ───────── TABBED DASHBOARD ───────── */
function TabbedDashboard() {
  const [activeTab, setActiveTab] = useState(1) // Skills by default

  const tabContent = {
    0: ( // Profile
      <div className={styles.tabPanel} key="profile">
        <div className={styles.profileGrid}>
          <div className={styles.profileField}>
            <small>NAME</small>
            <span>John Doe</span>
          </div>
          <div className={styles.profileField}>
            <small>EDUCATION</small>
            <span>B.Tech CSE</span>
          </div>
          <div className={styles.profileField}>
            <small>EXPERIENCE</small>
            <span>2 Years</span>
          </div>
          <div className={styles.profileField}>
            <small>DOMAIN</small>
            <span>AI / ML</span>
          </div>
        </div>
        <div className={styles.mockupTags}>
          <span>PYTHON</span><span>TENSORFLOW</span><span>SQL</span><span>REACT</span>
        </div>
      </div>
    ),
    1: ( // Skills
      <div className={styles.tabPanel} key="skills">
        <div className={styles.skillBarsWrap}>
          {[
            { name: 'Python', pct: 92 },
            { name: 'Machine Learning', pct: 85 },
            { name: 'SQL', pct: 78 },
            { name: 'React', pct: 65 },
            { name: 'Statistics', pct: 72 },
          ].map((s, i) => (
            <div key={i} className={styles.skillBarItem}>
              <div className={styles.skillBarLabel}>
                <span>{s.name}</span>
                <span>{s.pct}%</span>
              </div>
              <div className={styles.skillBarTrack}>
                <div
                  className={`${styles.skillBarFill} ${i % 2 === 0 ? '' : styles.skillBarFillAccent}`}
                  style={{ width: `${s.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    2: ( // Roles
      <div className={styles.tabPanel} key="roles">
        <div className={styles.rolesTabList}>
          {CAREER_ROLES.map((role, i) => (
            <div key={i} className={styles.roleTabItem}>
              <span>{role.title}</span>
              <span className={styles.roleTabMatch}>{role.match}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    3: ( // Gaps
      <div className={styles.tabPanel} key="gaps">
        <div className={styles.mockupHeader} style={{ marginBottom: 0 }}>
          <span>PRIORITY SKILL GAPS</span>
          <b>06 IDENTIFIED</b>
        </div>
        <div className={styles.gapsTabGrid}>
          {['Deep Learning', 'MLOps', 'Cloud (AWS)', 'System Design', 'Docker', 'CI/CD'].map((gap, i) => (
            <div key={i} className={styles.gapTabItem}>{gap}</div>
          ))}
        </div>
      </div>
    ),
    4: ( // Courses
      <div className={styles.tabPanel} key="courses">
        <div className={styles.coursesTabList}>
          {[
            { title: 'Deep Learning Specialization', meta: 'Coursera • 4 months' },
            { title: 'MLOps Fundamentals', meta: 'Google Cloud • 6 weeks' },
            { title: 'AWS Cloud Practitioner', meta: 'AWS • 3 months' },
            { title: 'System Design Interview', meta: 'Self-paced • 8 weeks' },
          ].map((course, i) => (
            <div key={i} className={styles.courseTabItem}>
              <span className={styles.courseTabTitle}>{course.title}</span>
              <span className={styles.courseTabMeta}>{course.meta}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  }

  return (
    <motion.div className={styles.resumeMockup} variants={scaleIn}>
      <div className={styles.mockupShell}>
        <div className={styles.mockupNav}>
          {DASHBOARD_TABS.map((tab, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.mockupNavBtn} ${activeTab === i ? styles.mockupNavActive : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className={styles.mockupBody}>
          <AnimatePresence mode="wait">
            {activeTab === 0 || activeTab === 3 || activeTab === 4 ? (
              tabContent[activeTab]
            ) : activeTab === 1 ? (
              tabContent[1]
            ) : activeTab === 2 ? (
              tabContent[2]
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

/* ───────── TYPING INDICATOR ───────── */
function TypingIndicator() {
  return (
    <div className={styles.chatMsgBot}>
      <div className={styles.typingDots}>
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
      </div>
    </div>
  )
}

/* ───────── CHAT MOCKUP WITH INTERACTIVE QUERYING & TYPING ANIMATION ───────── */
function ChatMockup() {
  const [messages, setMessages] = useState([CHAT_MESSAGES[0]])
  const [showTyping, setShowTyping] = useState(false)
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  // Auto-play initial dialogue when section enters viewport
  useEffect(() => {
    if (!isInView) return

    const t1 = setTimeout(() => {
      setMessages(prev => (prev.length === 1 ? [...prev, CHAT_MESSAGES[1]] : prev))
      setShowTyping(true)
      const t2 = setTimeout(() => {
        setShowTyping(false)
        setMessages(prev => (prev.length === 2 ? [...prev, CHAT_MESSAGES[2]] : prev))
      }, 1400)
      return () => clearTimeout(t2)
    }, 1000)

    return () => clearTimeout(t1)
  }, [isInView])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight
    }
  }, [messages, showTyping])

  const handleSendMessage = (textToSend) => {
    const text = textToSend.trim()
    if (!text || showTyping) return

    setMessages(prev => [...prev, { type: 'user', text }])
    setInputText('')
    setShowTyping(true)

    setTimeout(() => {
      setShowTyping(false)
      const reply = CHIP_RESPONSES[text] ||
        `Great question! Based on your resume, focusing on your strongest foundations while systematically closing the top 6 skill gaps will give you the quickest transition to an <strong>AI Engineer</strong> role.`
      setMessages(prev => [...prev, { type: 'bot', text: reply }])
    }, 900)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSendMessage(inputText)
  }

  return (
    <motion.div className={styles.chatMockup} variants={scaleIn} ref={ref}>
      <div className={styles.chatWindow}>
        <div className={styles.chatHeader}>
          <span className={styles.chatHeaderDot} />
          MARGDARSHAK AI
        </div>
        <div className={styles.chatMessages} ref={messagesEndRef}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={msg.type === 'bot' ? styles.chatMsgBot : styles.chatMsgUser}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <p dangerouslySetInnerHTML={{ __html: msg.text }} />
            </motion.div>
          ))}
          {showTyping && <TypingIndicator />}
        </div>
        <div className={styles.chatChips}>
          {CHAT_CHIPS.map((chip, i) => (
            <button
              key={i}
              type="button"
              className={styles.chatChip}
              onClick={() => handleSendMessage(chip)}
              disabled={showTyping}
            >
              {chip}
            </button>
          ))}
        </div>
        <form className={styles.chatInput} onSubmit={handleSubmit}>
          <input
            type="text"
            className={styles.chatInputField}
            placeholder="Ask about your career analysis..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={showTyping}
          />
          <button
            type="submit"
            className={styles.chatSendBtn}
            disabled={!inputText.trim() || showTyping}
            aria-label="Send query"
          >
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
              <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </motion.div>
  )
}

/* ───────── MAIN COMPONENT ───────── */
export default function LandingPage({ onLogin, onSignup, onTeacherLogin }) {
  const heroRef = useRef(null)
  const bigTextRef = useRef(null)
  const containerRef = useRef(null)
  const [hoveredRole, setHoveredRole] = useState(null)

  // GSAP scroll-driven animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Big text parallax
      if (bigTextRef.current) {
        gsap.to(bigTextRef.current, {
          xPercent: -15,
          ease: 'none',
          scrollTrigger: {
            trigger: bigTextRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        })
      }

      // Section reveals with GSAP for performance
      gsap.utils.toArray(`.${styles.gsapReveal}`).forEach((el) => {
        gsap.fromTo(el,
          { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              once: true,
            },
          }
        )
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const { scrollYProgress } = useScroll()
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95])

  return (
    <main className={styles.page} ref={containerRef}>
      <Navbar onLogin={onLogin} onSignup={onSignup} onTeacherLogin={onTeacherLogin} />

      {/* ═══════════════════ 1. HERO ═══════════════════ */}
      <section id="home" className={styles.hero} ref={heroRef}>
        <motion.div
          className={styles.heroContent}
          style={{ scale: heroScale }}
        >
          <motion.div
            className={styles.heroLabel}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <span className={styles.labelDot} />
            AI-POWERED CAREER INTELLIGENCE
          </motion.div>

          <motion.h1
            className={styles.heroHeading}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.span className={styles.heroLine} variants={fadeChild}>
              YOUR
            </motion.span>
            <motion.span className={`${styles.heroLine} ${styles.heroLineAccent}`} variants={fadeChild}>
              CAREER.
            </motion.span>
            <motion.span className={styles.heroLine} variants={fadeChild}>
              YOUR
            </motion.span>
            <motion.span className={`${styles.heroLine} ${styles.heroLineAccent}`} variants={fadeChild}>
              DIRECTION.
            </motion.span>
          </motion.h1>

          <motion.p
            className={styles.heroSub}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            Turn your resume into a personalized roadmap for your career.
            Discover skills, matched roles, gaps, and your next steps.
          </motion.p>

          <motion.div
            className={styles.heroActions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.5 }}
          >
            <button type="button" className={styles.ctaPrimary} onClick={onSignup}>
              <span>START YOUR JOURNEY</span>
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <a href="#how-it-works" className={styles.ctaSecondary}>
              <span>SEE HOW IT WORKS</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1V13M7 13L1 7M7 13L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </motion.div>
        </motion.div>

        {/* Hero floating Career Signal card */}
        <motion.div
          className={styles.heroVisual}
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div
            className={styles.heroCard}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className={styles.heroCardTop}>
              <span>CAREER SIGNAL / 01</span>
              <span className={styles.heroCardLive}>● LIVE</span>
            </div>
            <div className={styles.heroCardRole}>
              Software<br /><em>Engineer</em>
            </div>
            <div className={styles.heroCardScore}>
              <strong>78</strong><span>% match</span>
            </div>
            <div className={styles.heroCardBar}>
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: '78%' }}
                transition={{ duration: 1.8, delay: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </div>
            <div className={styles.heroCardMeta}>
              <div><span>Skills</span><b>24</b></div>
              <div><span>Gaps</span><b className={styles.heroCardAccent}>06</b></div>
            </div>
            <div className={styles.heroCardTags}>
              <span>PYTHON</span><span>SQL</span><span>REACT</span><span>ML</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════ 2. MARQUEE ═══════════════════ */}
      <Marquee />

      {/* ═══════════════════ 3. STATS WITH COUNT-UP ═══════════════════ */}
      <RevealSection className={styles.statsSection} threshold={0.3}>
        <div className={styles.statsInner}>
          {STATS.map((stat, i) => (
            <StatBlock key={i} {...stat} />
          ))}
        </div>
      </RevealSection>

      {/* ═══════════════════ 4. PROBLEM ═══════════════════ */}
      <RevealSection id="problem" className={styles.sectionDark} threshold={0.15}>
        <div className={styles.sectionInner}>
          <motion.div className={styles.sectionLabel} variants={fadeChild}>THE PROBLEM</motion.div>
          <motion.h2 className={styles.sectionHuge} variants={fadeChild}>
            CAREER<br />
            <em>CONFUSION</em><br />
            IS EXPENSIVE.
          </motion.h2>
          <motion.div className={styles.problemGrid} variants={staggerContainer}>
            {['skills', 'degrees', 'certificates'].map((item, i) => (
              <motion.div key={i} className={styles.problemItem} variants={fadeChild}>
                <span className={styles.problemNum}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.problemText}>{item}</span>
              </motion.div>
            ))}
          </motion.div>
          <motion.div className={styles.problemConclusion} variants={fadeChild}>
            <span>but still don't know</span>
            <h3>WHAT NEXT?</h3>
          </motion.div>
        </div>
      </RevealSection>

      {/* ═══════════════════ 5. SOLUTION (full-bleed orange) ═══════════════════ */}
      <RevealSection className={styles.sectionAccent} threshold={0.15}>
        <div className={styles.sectionInner}>
          <motion.div className={styles.sectionLabel} variants={fadeChild}>THE SOLUTION</motion.div>
          <motion.h2 className={styles.sectionHuge} variants={fadeChild} style={{ color: '#0A0A0A' }}>
            MEET<br />
            <em style={{ color: '#0A0A0A' }}>MARGDARSHAK.</em>
          </motion.h2>
          <motion.p className={styles.solutionText} variants={fadeChild}>
            Margdarshak analyzes your profile and transforms it into actionable career intelligence.
            No more guessing — just clear, evidence-based direction.
          </motion.p>
          <motion.div className={styles.solutionFeatures} variants={staggerContainer}>
            {SOLUTION_PILLS.map((f, i) => (
              <motion.span key={i} className={styles.solutionTag} variants={fadeChild}>{f}</motion.span>
            ))}
          </motion.div>
        </div>
      </RevealSection>

      {/* ═══════════════════ 6. BIG SCROLLING WORDMARK ═══════════════════ */}
      <div className={styles.bigTextSection}>
        <div className={styles.bigTextTrack} ref={bigTextRef}>
          <span>MARGDARSHAK</span>
          <span className={styles.bigTextOutline}>MARGDARSHAK</span>
          <span>MARGDARSHAK</span>
        </div>
      </div>

      {/* ═══════════════════ 7. HOW IT WORKS ═══════════════════ */}
      <RevealSection id="how-it-works" className={styles.sectionDark} threshold={0.1}>
        <div className={styles.sectionInner}>
          <motion.div className={styles.sectionLabel} variants={fadeChild}>HOW IT WORKS</motion.div>
          <motion.h2 className={styles.sectionHeading} variants={fadeChild}>
            FROM RESUME<br /><em>TO DIRECTION.</em>
          </motion.h2>
          <motion.p className={styles.sectionSub} variants={fadeChild}>
            A transparent path from the experience you already have to the decisions you can make next.
          </motion.p>
          <motion.div className={styles.stepsList} variants={staggerContainer}>
            {STEPS.map((step, i) => (
              <motion.article key={i} className={styles.stepRow} variants={fadeChild}>
                <span className={styles.stepNum}>{step.num}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
                <span className={styles.stepArrow}>
                  <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
                    <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </RevealSection>

      {/* ═══════════════════ 8. RESUME INTELLIGENCE (Tabbed Dashboard) ═══════════════════ */}
      <RevealSection id="features" className={styles.sectionAlt} threshold={0.1}>
        <div className={styles.sectionInner}>
          <motion.div className={styles.sectionLabel} variants={fadeChild}>RESUME INTELLIGENCE</motion.div>
          <motion.h2 className={styles.sectionHuge} variants={fadeChild}>
            YOUR RESUME<br /><em>HAS A STORY.</em>
          </motion.h2>
          <TabbedDashboard />
        </div>
      </RevealSection>

      {/* ═══════════════════ 9. CAREER MATCHING ═══════════════════ */}
      <RevealSection className={styles.sectionDark} threshold={0.1}>
        <div className={styles.sectionInner}>
          <motion.div className={styles.sectionLabel} variants={fadeChild}>CAREER MATCHING</motion.div>
          <motion.h2 className={styles.sectionHuge} variants={fadeChild}>
            WHERE<br />COULD YOU<br /><em>GO NEXT?</em>
          </motion.h2>
          <motion.div className={styles.rolesList} variants={staggerContainer}>
            {CAREER_ROLES.map((role, i) => (
              <motion.article
                key={i}
                className={styles.roleRow}
                variants={fadeChild}
                onMouseEnter={() => setHoveredRole(i)}
                onMouseLeave={() => setHoveredRole(null)}
              >
                <span className={styles.roleNum}>{String(i + 1).padStart(2, '0')}</span>
                <h3 className={styles.roleTitle}>{role.title}</h3>
                <span className={styles.roleMatch}>{role.match}</span>
                <motion.span
                  className={styles.roleArrow}
                  animate={{ x: hoveredRole === i ? 8 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg width="24" height="24" viewBox="0 0 14 14" fill="none">
                    <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.span>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </RevealSection>

      {/* ═══════════════════ 10. SKILL GAP ANALYSIS ═══════════════════ */}
      <RevealSection className={styles.sectionAlt} threshold={0.1}>
        <div className={styles.sectionInner}>
          <motion.div className={styles.sectionLabel} variants={fadeChild}>SKILL GAP ANALYSIS</motion.div>
          <motion.h2 className={styles.sectionHuge} variants={fadeChild}>
            KNOW<br />WHAT'S<br /><em>MISSING.</em>
          </motion.h2>
          <motion.div className={styles.gapGrid} variants={staggerContainer}>
            <motion.div className={styles.gapColumn} variants={fadeChild}>
              <div className={styles.gapHeader}>
                <span className={styles.gapDot} style={{ background: '#FFFFFF' }} />
                CURRENT SKILLS
              </div>
              {CURRENT_SKILLS.map((skill, i) => (
                <motion.div
                  key={i}
                  className={styles.gapSkill}
                  variants={fadeChild}
                >
                  <span className={styles.gapSkillNum}>{String(i + 1).padStart(2, '0')}</span>
                  {skill}
                </motion.div>
              ))}
            </motion.div>
            <motion.div className={`${styles.gapColumn} ${styles.gapColumnNext}`} variants={fadeChild}>
              <div className={styles.gapHeader}>
                <span className={styles.gapDot} style={{ background: 'var(--accent)' }} />
                NEXT SKILLS
              </div>
              {NEXT_SKILLS.map((skill, i) => (
                <motion.div
                  key={i}
                  className={`${styles.gapSkill} ${styles.gapSkillNeeded}`}
                  variants={fadeChild}
                >
                  <span className={styles.gapSkillNum}>{String(i + 1).padStart(2, '0')}</span>
                  {skill}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </RevealSection>

      {/* ═══════════════════ 11. AI ASSISTANT ═══════════════════ */}
      <RevealSection className={styles.sectionDark} threshold={0.1}>
        <div className={styles.sectionInner}>
          <motion.div className={styles.sectionLabel} variants={fadeChild}>AI CAREER ASSISTANT</motion.div>
          <motion.h2 className={styles.sectionHuge} variants={fadeChild}>
            ASK.<br />EXPLORE.<br /><em>MOVE FORWARD.</em>
          </motion.h2>
          <ChatMockup />
        </div>
      </RevealSection>

      {/* ═══════════════════ 12. THE PEOPLE ═══════════════════ */}
      <RevealSection id="team" className={styles.sectionAlt} threshold={0.1}>
        <div className={styles.sectionInner}>
          <motion.div className={styles.sectionLabel} variants={fadeChild}>THE PEOPLE</motion.div>
          <motion.h2 className={styles.sectionHuge} variants={fadeChild}>
            BEHIND<br /><em>MARGDARSHAK.</em>
          </motion.h2>
          <motion.div className={styles.teamGrid} variants={staggerContainer}>
            <motion.article className={styles.teamCard} variants={fadeChild}>
              <div className={styles.teamCardNum}>01</div>
              <div className={styles.teamCardContent}>
                <h3>Parv Gupta</h3>
                <p>AIML + Research</p>
                <span className={styles.teamRole}>CO-CREATOR</span>
              </div>
            </motion.article>
            <motion.article className={styles.teamCard} variants={fadeChild}>
              <div className={styles.teamCardNum}>02</div>
              <div className={styles.teamCardContent}>
                <h3>Harshita Singh</h3>
                <p>AIML + App</p>
                <span className={styles.teamRole}>CO-CREATOR</span>
              </div>
            </motion.article>
          </motion.div>
        </div>
      </RevealSection>

      {/* ═══════════════════ 13. SECOND MARQUEE ═══════════════════ */}
      <Marquee />

      {/* ═══════════════════ 14. FINAL CTA ═══════════════════ */}
      <RevealSection className={styles.ctaSection} threshold={0.15}>
        <div className={styles.ctaInner}>
          <motion.h2 className={styles.ctaHeading} variants={fadeChild}>
            YOUR NEXT<br />
            <em>MOVE</em><br />
            STARTS HERE.
          </motion.h2>
          <motion.p className={styles.ctaSub} variants={fadeChild}>
            Upload one resume. Get a clearer view of your next direction.
          </motion.p>
          <motion.div variants={fadeChild}>
            <button type="button" className={styles.ctaPrimary} onClick={onSignup}>
              <span>GET STARTED</span>
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M1 13L13 1M13 1H3M13 1V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </motion.div>
        </div>
      </RevealSection>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <h3>MARGDARSHAK</h3>
            <span>AI Career Intelligence / 2026</span>
          </div>
          <div className={styles.footerLinks}>
            <a href="#home">Home</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#team">About</a>
          </div>
          <div className={styles.footerRight}>
            <span>Built for better next steps.</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
