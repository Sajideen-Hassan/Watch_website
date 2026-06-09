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

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(glowRef.current, {
        scale: 1.2, opacity: 0.4,
        repeat: -1, yoyo: true, duration: 3.5, ease: 'sine.inOut',
      })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' }
      })

      tl.fromTo(headingRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
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

    const magnetic = (btn) => {
      if (!btn) return
      const onMove = (e) => {
        const rect = btn.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power2.out' })
      }
      const onLeave = () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
      }
      btn.addEventListener('mousemove', onMove)
      btn.addEventListener('mouseleave', onLeave)
      return () => {
        btn.removeEventListener('mousemove', onMove)
        btn.removeEventListener('mouseleave', onLeave)
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
    <section id="buy" ref={sectionRef} className={styles.section}>
      <div ref={glowRef} className={styles.glow} />
      <div className={styles.bgGradient} />

      <div className={styles.content}>
        <h2 ref={headingRef} className={styles.heading}>
          Own the <em>Experience</em>
        </h2>

        <p ref={textRef} className={styles.text}>
          Limited edition of 500 pieces. Reserve yours.
        </p>

        <div ref={btnsRef} className={styles.buttons}>
          <button ref={buyBtnRef} className={styles.buyBtn}>
            <span className={styles.btnSheen} />
            <span className={styles.btnInner}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              Buy Now
            </span>
          </button>

          <button ref={contactBtnRef} className={styles.contactBtn}>
            <span>Request Access</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
