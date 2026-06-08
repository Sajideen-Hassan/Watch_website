import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import styles from './Navbar.module.scss'

const navLinks = ['About', 'Features', 'Buy']

export default function Navbar() {
  const navRef = useRef(null)
  const logoRef = useRef(null)
  const linksRef = useRef([])
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // Entry animation
    const tl = gsap.timeline({ delay: 0.5 })
    tl.fromTo(logoRef.current,
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }
    )
    tl.fromTo(linksRef.current,
      { opacity: 0, y: -15 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
      '-=0.6'
    )

    // Scroll listener
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (section) => {
    const id = section.toLowerCase()
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
          <li key={link} ref={el => linksRef.current[i] = el}>
            <button
              className={styles.navLink}
              onClick={() => scrollToSection(link)}
            >
              {link}
              <span className={styles.navUnderline} />
            </button>
          </li>
        ))}
      </ul>

      <button className={styles.ctaBtn}>
        Buy Now
      </button>
    </nav>
  )
}
