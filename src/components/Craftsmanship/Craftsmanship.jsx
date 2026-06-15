import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './Craftsmanship.module.scss'
import OptimizedImage from '../OptimizedImage'

const headingWords = ['Built', 'Through', 'Precision']

export default function Craftsmanship() {
  const sectionRef = useRef(null)
  const imageRevealRef = useRef(null)
  const imageInnerRef = useRef(null)
  const descRef = useRef(null)
  const accentRef = useRef(null)
  const bgRef = useRef(null)
  const wordRefs = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(imageRevealRef.current,
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power4.inOut',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } }
      )
      gsap.fromTo(imageInnerRef.current,
        { scale: 1.3, filter: 'blur(8px)' },
        { scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power4.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } }
      )
      wordRefs.current.forEach((word, i) => {
        if (!word) return
        gsap.fromTo(word, { y: 40, opacity: 0, rotateX: 15 },
          { y: 0, opacity: 1, rotateX: 0, duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }, delay: i * 0.08 }
        )
      })
      gsap.fromTo(descRef.current, { y: 20, opacity: 0, filter: 'blur(3px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' }, delay: 0.3 }
      )
      gsap.fromTo(accentRef.current, { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } }
      )
      gsap.to(bgRef.current, { scale: 1.08, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.5 } }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="craftsmanship" ref={sectionRef} className={styles.section}>
      <div ref={bgRef} className={styles.bgParallax}>
        <div className={styles.bgImage}>
          <div className={styles.bgOverlay} />
        </div>
      </div>
      <div className={styles.split}>
        <div className={styles.imageSide}>
          <div ref={imageRevealRef} className={styles.imageReveal}>
            <div ref={imageInnerRef} className={styles.imageInner}>
              <OptimizedImage path="feature-craftsmanship.jpg" alt="REISER watch movement" width={1024} height={1024} className={styles.image} />
            </div>
          </div>
        </div>
        <div className={styles.textSide}>
          <div ref={accentRef} className={styles.accent} />
          <h2 className={styles.heading}>
            {headingWords.map((word, i) => (
              <span key={word} ref={(el) => { wordRefs.current[i] = el }} className={styles.word}>{word} </span>
            ))}
          </h2>
          <p ref={descRef} className={styles.desc}>
            Every component is engineered for lasting performance. Hand-finished with Swiss tradition.
          </p>
        </div>
      </div>
    </section>
  )
}
