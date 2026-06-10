import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './About.module.scss'

gsap.registerPlugin(ScrollTrigger)

const specs = [
  { value: '42MM', label: 'Case Diameter' },
  { value: 'AUTOMATIC', label: 'Movement' },
  { value: 'SAPPHIRE', label: 'Crystal Glass' },
  { value: '100M', label: 'Water Resistant' },
]

export default function About() {
  const sectionRef = useRef(null)
  const watchRef = useRef(null)
  const watchInnerRef = useRef(null)
  const descRef = useRef(null)
  const specRefs = useRef([])
  const bgGlowRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(watchInnerRef.current,
        { scale: 1.4, opacity: 0, filter: 'blur(12px)' },
        {
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          },
        }
      )

      gsap.to(watchRef.current, {
        y: -8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1,
      })

      gsap.fromTo(descRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      )

      specRefs.current.forEach((spec, i) => {
        if (!spec) return
        gsap.fromTo(spec,
          { y: 40, opacity: 0, filter: 'blur(4px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 65%',
            },
            delay: 0.2 + i * 0.1,
          }
        )
      })

      gsap.to(bgGlowRef.current, {
        scale: 1.1,
        opacity: 0.5,
        repeat: -1,
        yoyo: true,
        duration: 5,
        ease: 'sine.inOut',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={sectionRef} className={styles.section}>
      <div ref={bgGlowRef} className={styles.bgGlow} />

      <div className={styles.watchWrap} ref={watchRef}>
        <div ref={watchInnerRef} className={styles.watchInner}>
          <img src="/images/watch-about.jpg" alt="REISER watch" className={styles.watchImage} loading="lazy" />
        </div>
        <div className={styles.watchOverflow} />
      </div>

      <div className={styles.content}>
        <p ref={descRef} className={styles.desc}>
          Every REISER timepiece is assembled by hand in our Swiss atelier,
          combining traditional craftsmanship with modern precision engineering.
        </p>

        <div className={styles.divider} />

        <div className={styles.specs}>
          {specs.map((s, i) => (
            <div
              key={s.value}
              ref={(el) => { specRefs.current[i] = el }}
              className={styles.spec}
            >
              <strong className={styles.specLabel}>{s.label}</strong>
              <span className={styles.specValue}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
