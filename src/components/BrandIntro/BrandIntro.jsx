import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './BrandIntro.module.scss'

gsap.registerPlugin(ScrollTrigger)

export default function BrandIntro() {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const descRef = useRef(null)
  const lineRef = useRef(null)
  const glowRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(glowRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2.5, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } }
      )

      gsap.to(glowRef.current, {
        scale: 1.15, opacity: 0.7,
        repeat: -1, yoyo: true, duration: 4, ease: 'sine.inOut',
      })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      })

      tl.fromTo(lineRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 1.2, ease: 'power3.out' }
      )
      tl.fromTo(headingRef.current,
        { y: 50, opacity: 0, filter: 'blur(6px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out' },
        '-=0.6'
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
    <section id="intro" ref={sectionRef} className={styles.section}>
      <div ref={glowRef} className={styles.glow} />
      <div className={styles.bgGradient} />

      <div className={styles.content}>
        <div ref={lineRef} className={styles.goldLine} />
        <h2 ref={headingRef} className={styles.heading}>
          Time, reimagined
        </h2>
        <p ref={descRef} className={styles.desc}>
          Where Swiss precision meets contemporary elegance.
        </p>
      </div>
    </section>
  )
}
