import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Footer.module.scss'

gsap.registerPlugin(ScrollTrigger)

const quickLinks = ['Home', 'About', 'Features', 'Buy']
const socials = [
  { name: 'Instagram', href: '#' },
  { name: 'Twitter', href: '#' },
  { name: 'LinkedIn', href: '#' },
  { name: 'YouTube', href: '#' },
]

export default function Footer() {
  const footerRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(footerRef.current,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 90%',
        }
      }
    )
  }, [])

  return (
    <footer ref={footerRef} className={styles.footer}>
      <div className={styles.topLine} />

      <div className={styles.container}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoText}>REISER</span>
            <span className={styles.logoSub}>TIMEPIECES</span>
          </div>
          <p className={styles.brandDesc}>
            Swiss luxury watches crafted for those who demand
            perfection in every moment since 1967.
          </p>
          <div className={styles.socials}>
            {socials.map(s => (
              <a key={s.name} href={s.href} className={styles.socialLink} aria-label={s.name}>
                {s.name[0]}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Navigation</h4>
          <ul className={styles.linksList}>
            {quickLinks.map(l => (
              <li key={l}>
                <a href={`#${l.toLowerCase()}`} className={styles.link}>{l}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Boutiques</h4>
          <ul className={styles.linksList}>
            <li className={styles.contactItem}>Geneva Flagship</li>
            <li className={styles.contactItem}>London Boutique</li>
            <li className={styles.contactItem}>New York Atelier</li>
            <li className={styles.contactItem}>Dubai Gallery</li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className={styles.newsletter}>
          <h4 className={styles.colTitle}>Stay Updated</h4>
          <p className={styles.newsletterDesc}>
            Be the first to hear about new collections and exclusive events.
          </p>
          <div className={styles.inputRow}>
            <input
              type="email"
              placeholder="Your email address"
              className={styles.emailInput}
              aria-label="Email address"
            />
            <button className={styles.subscribeBtn}>→</button>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} REISER Timepieces. All rights reserved.
        </p>
        <div className={styles.bottomLinks}>
          <a href="#" className={styles.bottomLink}>Privacy Policy</a>
          <span className={styles.dot}>·</span>
          <a href="#" className={styles.bottomLink}>Terms of Service</a>
          <span className={styles.dot}>·</span>
          <a href="#" className={styles.bottomLink}>Cookie Policy</a>
        </div>
      </div>
    </footer>
  )
}
