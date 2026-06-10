import { useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './BuySection.module.scss'

gsap.registerPlugin(ScrollTrigger)

export default function BuySection() {
  const sectionRef = useRef(null)
  const labelRef = useRef(null)
  const headline1Ref = useRef(null)
  const headline1InnerRef = useRef(null)
  const headline2Ref = useRef(null)
  const headline2InnerRef = useRef(null)
  const supportRef = useRef(null)
  const buttonsRef = useRef(null)

  const glowRef = useRef(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  const handleMouseMove = useCallback((e) => {
    const rect = sectionRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    }
  }, [])

  useEffect(() => {
    let trackMouse

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        },
      })

      tl.fromTo(labelRef.current,
        { y: 15, opacity: 0, filter: 'blur(4px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' }
      )

      tl.fromTo(headline1InnerRef.current,
        { y: '120%' },
        { y: '0%', duration: 0.7, ease: 'power4.out' },
        '-=0.3'
      )

      tl.fromTo(headline2InnerRef.current,
        { y: '120%' },
        { y: '0%', duration: 0.7, ease: 'power4.out' },
        '-=0.4'
      )

      tl.fromTo(supportRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
        '-=0.3'
      )

      tl.fromTo(buttonsRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
        '-=0.2'
      )

      gsap.to(glowRef.current, {
        scale: 1.15,
        opacity: 0.6,
        repeat: -1,
        yoyo: true,
        duration: 6,
        ease: 'sine.inOut',
      })

      trackMouse = () => {
        const glow = glowRef.current
        if (!glow) return
        const { x, y } = mouseRef.current
        gsap.to(glow, {
          x: (x - 0.5) * 40,
          y: (y - 0.5) * 30,
          duration: 1.5,
          ease: 'power2.out',
        })
      }

      sectionRef.current?.addEventListener('mousemove', handleMouseMove)
      gsap.ticker.add(trackMouse)

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const p = self.progress
          gsap.set(headline1Ref.current, {
            opacity: 1 - p * 0.4,
            y: -p * 15,
          })
          gsap.set(headline2Ref.current, {
            opacity: 1 - p * 0.5,
            y: -p * 10,
          })
          gsap.set(glowRef.current, {
            opacity: 0.5 - p * 0.3,
          })
        },
      })
    }, sectionRef)

    return () => {
      ctx.revert()
      sectionRef.current?.removeEventListener('mousemove', handleMouseMove)
      gsap.ticker.remove(trackMouse)
    }
  }, [handleMouseMove])

  const handleBuyHover = (e) => {
    const btn = e.currentTarget
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    gsap.to(btn, {
      '--mx': `${x}px`,
      '--my': `${y}px`,
      duration: 0.3,
    })
  }

  return (
    <section
      id="buy"
      ref={sectionRef}
      className={styles.section}
    >
      <div className={styles.noise} />

      <div className={styles.bgBase} />
      <div ref={glowRef} className={styles.bgGlow} />
      <div className={styles.bgAccent} />

      <div className={styles.showcase}>
        <span ref={labelRef} className={styles.label}>
          REISER COLLECTION
        </span>

        <h2 className={styles.headline}>
          <span ref={headline1Ref} className={styles.headlineMask}>
            <span ref={headline1InnerRef} className={styles.headlineInner}>
              Own Time.
            </span>
          </span>
          <span ref={headline2Ref} className={styles.headlineMask}>
            <span ref={headline2InnerRef} className={`${styles.headlineInner} ${styles.headlineAlt}`}>
              Not Just A Watch.
            </span>
          </span>
        </h2>

        <p ref={supportRef} className={styles.support}>
          Precision engineering designed for every defining moment.
        </p>

        <div ref={buttonsRef} className={styles.buttons}>
          <button
            type="button"
            className={styles.primaryBtn}
            onMouseMove={handleBuyHover}
          >
            <span className={styles.btnText}>Buy Now</span>
          </button>
          <button type="button" className={styles.secondaryBtn}>
            <span>Contact Us</span>
          </button>
        </div>

      </div>
    </section>
  )
}
