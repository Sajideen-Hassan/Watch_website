import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Experience.module.scss'

gsap.registerPlugin(ScrollTrigger)

export default function Experience() {
  const sectionRef = useRef(null)
  const glowRef = useRef(null)
  const headingRef = useRef(null)
  const descRef = useRef(null)
  const bgRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(glowRef.current, {
        scale: 1.2, opacity: 0.5,
        repeat: -1, yoyo: true, duration: 4, ease: 'sine.inOut',
      })

      gsap.to(bgRef.current, {
        y: -60, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
      })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      })

      tl.fromTo(headingRef.current,
        { y: 50, opacity: 0, filter: 'blur(6px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power3.out' }
      )
      tl.fromTo(descRef.current,
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out' },
        '-=0.5'
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="experience" ref={sectionRef} className={styles.section}>
      <div ref={bgRef} className={styles.bgParallax}>
        <div className={styles.bgGrid} />
      </div>

      <div ref={glowRef} className={styles.glow} />

      <div className={styles.content}>
        <h2 ref={headingRef} className={styles.heading}>
          Built for every moment<br />that defines you
        </h2>
        <p ref={descRef} className={styles.desc}>
          A presence, not just a product.
        </p>
      </div>
    </section>
  )
}
