import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import styles from './Navbar.module.scss'

const navLinks = [
  { label: 'Home', target: 'home' },
  { label: 'Intro', target: 'intro' },
  { label: 'About', target: 'about' },
  { label: 'Features', target: 'features' },
  { label: 'Experience', target: 'experience' },
  { label: 'Buy', target: 'buy' },
]

export default function Navbar() {
  const navRef = useRef(null)
  const logoRef = useRef(null)
  const linksRef = useRef([])
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('home')

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.5 })
    tl.fromTo(logoRef.current,
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }
    )
    tl.fromTo(linksRef.current,
      { opacity: 0, y: -15 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out' },
      '-=0.6'
    )

    const handleScroll = () => {
      setScrolled(window.scrollY > 60)

      const sections = navLinks.map(l => document.getElementById(l.target)).filter(Boolean)
      let current = 'home'
      for (const sec of sections) {
        if (sec.getBoundingClientRect().top <= 200) current = sec.id
      }
      setActive(current)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav ref={navRef} className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div ref={logoRef} className={styles.logo}>
        <span className={styles.logoText}>REISER</span>
        <span className={styles.logoSub}>TIMEPIECES</span>
      </div>

      <ul className={styles.navLinks}>
        {navLinks.map((link, i) => (
          <li key={link.target} ref={el => linksRef.current[i] = el}>
            <button
              className={`${styles.navLink} ${active === link.target ? styles.active : ''}`}
              onClick={() => scrollToSection(link.target)}
            >
              {link.label}
              <span className={styles.navUnderline} />
            </button>
          </li>
        ))}
      </ul>

      <button className={styles.ctaBtn} onClick={() => scrollToSection('buy')}>
        Buy Now
      </button>
    </nav>
  )
}
