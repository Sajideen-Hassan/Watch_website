import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './About.module.scss'

gsap.registerPlugin(ScrollTrigger)

const points = [
  'Swiss-inspired precision engineering',
  'Scratch-resistant sapphire crystal',
  '300-meter water resistance',
  'Limited edition craftsmanship',
]

export default function About() {
  const sectionRef = useRef(null)
  const imageRef = useRef(null)
  const imageWrapRef = useRef(null)
  const headingRef = useRef(null)
  const lineRef = useRef(null)
  const pointsRef = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(imageWrapRef.current,
        { x: -60, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.4, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } }
      )

      gsap.to(imageRef.current, {
        y: -40, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
      })

      gsap.fromTo(lineRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' }, delay: 0.2 }
      )

      gsap.fromTo(headingRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: headingRef.current, start: 'top 80%' }, delay: 0.3 }
      )

      pointsRef.current.forEach((pt, i) => {
        if (!pt) return
        gsap.fromTo(pt,
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: pt, start: 'top 90%' }, delay: i * 0.12 }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <div ref={imageWrapRef} className={styles.imageWrap}>
          <div ref={imageRef} className={styles.imageInner}>
            <img src="/images/watch-about.jpg" alt="REISER watch" className={styles.image} loading="lazy" />
            <div className={styles.imageGlow} />
          </div>
        </div>

        <div className={styles.content}>
          <div ref={lineRef} className={styles.goldLine} />
          <h2 ref={headingRef} className={styles.heading}>
            Precision<br /><em>Reimagined</em>
          </h2>

          <ul className={styles.points}>
            {points.map((pt, i) => (
              <li key={pt} ref={el => pointsRef.current[i] = el} className={styles.point}>
                <span className={styles.pointBullet} />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
