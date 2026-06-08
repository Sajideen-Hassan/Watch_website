import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './BuySection.module.scss'

gsap.registerPlugin(ScrollTrigger)

export default function BuySection() {
  const sectionRef = useRef(null)
  const glowRef = useRef(null)
  const headingRef = useRef(null)
  const textRef = useRef(null)
  const btnsRef = useRef(null)
  const buyBtnRef = useRef(null)
  const contactBtnRef = useRef(null)
  const priceRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Glow pulse
      gsap.to(glowRef.current, {
        scale: 1.3,
        opacity: 0.6,
        repeat: -1,
        yoyo: true,
        duration: 3,
        ease: 'sine.inOut'
      })

      // Entrance animations
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        }
      })

      tl.fromTo(priceRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      )
      tl.fromTo(headingRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
        '-=0.4'
      )
      tl.fromTo(textRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
        '-=0.5'
      )
      tl.fromTo(btnsRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
        '-=0.4'
      )
    }, sectionRef)

    // Magnetic button effect
    const magnetic = (btn) => {
      if (!btn) return
      const onMouseMove = (e) => {
        const rect = btn.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power2.out' })
      }
      const onMouseLeave = () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
      }
      btn.addEventListener('mousemove', onMouseMove)
      btn.addEventListener('mouseleave', onMouseLeave)
      return () => {
        btn.removeEventListener('mousemove', onMouseMove)
        btn.removeEventListener('mouseleave', onMouseLeave)
      }
    }

    const cleanBuy = magnetic(buyBtnRef.current)
    const cleanContact = magnetic(contactBtnRef.current)

    return () => {
      ctx.revert()
      cleanBuy?.()
      cleanContact?.()
    }
  }, [])

  return (
    <section id="buy" ref={sectionRef} className={styles.buy}>
      {/* Ambient glow */}
      <div ref={glowRef} className={styles.glow} />

      {/* Background lines */}
      <div className={styles.bgLines}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={styles.bgLine} style={{ '--i': i }} />
        ))}
      </div>

      <div className={styles.content}>
        {/* Price tag */}
        <div ref={priceRef} className={styles.priceTag}>
          <span className={styles.priceLine} />
          <span className={styles.priceFrom}>Starting from</span>
          <span className={styles.priceValue}>$12,800</span>
          <span className={styles.priceLine} />
        </div>

        <h2 ref={headingRef} className={styles.heading}>
          Experience<br />
          <em>Timeless Precision</em>
        </h2>

        <p ref={textRef} className={styles.text}>
          The REISER is produced in a limited edition of 500 pieces annually.
          Each timepiece is individually numbered and accompanied by a certificate
          of authenticity, a five-year movement guarantee, and lifetime servicing support.
        </p>

        {/* Feature pills */}
        <div className={styles.pills}>
          {['Limited Edition', '5-Year Warranty', 'Free Shipping', 'Certificate of Authenticity'].map(p => (
            <span key={p} className={styles.pill}>{p}</span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div ref={btnsRef} className={styles.buttons}>
          <button ref={buyBtnRef} className={styles.buyNow}>
            <span className={styles.btnSheen} />
            <span className={styles.btnText}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Buy Now
            </span>
          </button>

          <button ref={contactBtnRef} className={styles.contactBtn}>
            <span>Contact Us</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Trust indicators */}
        <div className={styles.trust}>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>◈</span>
            <span>Secure Payment</span>
          </div>
          <div className={styles.trustDivider} />
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>◈</span>
            <span>Swiss Certified</span>
          </div>
          <div className={styles.trustDivider} />
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>◈</span>
            <span>Global Delivery</span>
          </div>
        </div>
      </div>
    </section>
  )
}
