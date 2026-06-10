import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Experience.module.scss'

gsap.registerPlugin(ScrollTrigger)

export default function Experience() {
  const sectionRef = useRef(null)
  const bgRef = useRef(null)
  const contentRef = useRef(null)
  const headingRef = useRef(null)
  const descRef = useRef(null)
  const glowRef = useRef(null)
  const sweepRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        scale: 1.15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      })

      tl.fromTo(glowRef.current,
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2, ease: 'power3.out' }
      )

      tl.fromTo(headingRef.current,
        { y: 50, opacity: 0, filter: 'blur(8px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out' },
        '-=1'
      )

      tl.fromTo(descRef.current,
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out' },
        '-=0.5'
      )

      tl.fromTo(sweepRef.current,
        { left: '-30%', opacity: 0 },
        { left: '130%', opacity: 1, duration: 2.5, ease: 'power2.inOut' },
        '-=0.3'
      )

      gsap.to(glowRef.current, {
        scale: 1.12,
        opacity: 0.6,
        repeat: -1,
        yoyo: true,
        duration: 4,
        ease: 'sine.inOut',
        delay: 0.5,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="experience" ref={sectionRef} className={styles.section}>
      <div ref={bgRef} className={styles.bgLayer}>
        <div className={styles.bgGradient1} />
        <div className={styles.bgGradient2} />
        <div className={styles.bgGrid} />
      </div>

      <div ref={glowRef} className={styles.glow} />
      <div ref={sweepRef} className={styles.lightSweep} />

      <div ref={contentRef} className={styles.content}>
        <h2 ref={headingRef} className={styles.heading}>
          Built for every moment that defines you
        </h2>
        <p ref={descRef} className={styles.desc}>
          A presence, not just a product
        </p>
      </div>
    </section>
  )
}
