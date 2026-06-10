import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Navbar.module.scss'

gsap.registerPlugin(ScrollTrigger)

const navLinks = [
  { label: 'Intro', target: 'intro' },
  { label: 'About', target: 'about' },
  { label: 'Features', target: 'features' },
  { label: 'Collection', target: 'collection' },
  { label: 'Craftsmanship', target: 'craftsmanship' },
  { label: 'Buy', target: 'buy' },
]

export default function Navbar() {
  const navRef = useRef(null)
  const overlayRef = useRef(null)
  const overlayLinksRef = useRef([])
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sd = Math.round(Math.max(window.innerHeight * 2, 1560))
      ScrollTrigger.create({
        trigger: '#home',
        start: 'top top',
        end: `+=${sd}`,
        onLeave: () => {
          gsap.to(navRef.current, {
            opacity: 1,
            y: 0,
            pointerEvents: 'auto',
            duration: 0.8,
            ease: 'power3.out',
          })
        },
        onEnterBack: () => {
          gsap.to(navRef.current, {
            opacity: 0,
            y: -40,
            pointerEvents: 'none',
            duration: 0.5,
            ease: 'power2.in',
          })
        },
      })
    })

    const handleScroll = () => {
      setScrolled(window.scrollY > 60)

      const sections = navLinks.flatMap(l => {
        const el = document.getElementById(l.target)
        return el ? [el] : []
      })
      const buyEl = document.getElementById('buy')
      if (buyEl) sections.push(buyEl)

      let current = ''
      for (const sec of sections) {
        if (sec.getBoundingClientRect().top <= 250) current = sec.id
      }
      setActive(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    const overlay = overlayRef.current
    const links = overlayLinksRef.current
    if (!mobileOpen || !overlay) return

    const tl = gsap.timeline()
    tl.fromTo(overlay,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power3.out' }
    )
    tl.fromTo(links,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out' },
      '-=0.3'
    )

    return () => {
      gsap.set(overlay, { opacity: 0 })
      for (const el of links) {
        if (el) gsap.set(el, { opacity: 0, y: 30 })
      }
    }
  }, [mobileOpen])

  const scrollToSection = (id) => {
    setMobileOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleLogoClick = () => {
    setMobileOpen(false)
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { duration: 1.5 })
    }
  }

  return (
    <>
      <nav ref={navRef} className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.navInner}>
          <button type="button" className={styles.logo} onClick={handleLogoClick}>
            REISER
          </button>

          <ul className={styles.navLinks}>
            {navLinks.map((link) => (
              <li key={link.target}>
                <button type="button"
                  className={`${styles.navLink} ${active === link.target ? styles.active : ''}`}
                  onClick={() => scrollToSection(link.target)}
                >
                  {link.label}
                  <span className={styles.navUnderline} />
                </button>
              </li>
            ))}
          </ul>

          <button type="button" className={styles.ctaBtn} onClick={() => scrollToSection('buy')}>
            Buy Now
          </button>

          <button type="button"
            className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div ref={overlayRef} className={`${styles.overlay} ${mobileOpen ? styles.overlayOpen : ''}`}>
        <button type="button"
          className={styles.overlayClose}
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <span />
          <span />
        </button>

        <ul className={styles.overlayLinks}>
          {navLinks.map((link, i) => (
            <li key={link.target}>
              <button type="button"
                ref={(el) => { overlayLinksRef.current[i] = el }}
                className={`${styles.overlayLink} ${active === link.target ? styles.overlayActive : ''}`}
                onClick={() => scrollToSection(link.target)}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
