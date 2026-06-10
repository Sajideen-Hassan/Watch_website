import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './BrandIntro.module.scss'

gsap.registerPlugin(ScrollTrigger)

const watchDetails = [
  { id: 1, x: 5, y: 15, pos: '50% 25%', scale: 2.2, label: 'Crown Detail' },
  { id: 2, x: 80, y: 60, pos: '50% 65%', scale: 2.6, label: 'Dial Macro' },
  { id: 3, x: 85, y: 8, pos: '25% 45%', scale: 1.9, label: 'Strap Texture' },
  { id: 4, x: 8, y: 75, pos: '55% 35%', scale: 2.4, label: 'Movement Detail' },
]

export default function BrandIntro() {
  const sectionRef = useRef(null)
  const wordTexts = useRef([])
  const bgRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      wordTexts.current.forEach((el, i) => {
        if (!el) return
        gsap.fromTo(el,
          { y: '110%', rotateX: 25 },
          {
            y: '0%',
            rotateX: 0,
            duration: 0.8,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
            },
            delay: i * 0.12,
          }
        )
      })

      gsap.to(bgRef.current, {
        scale: 1.05,
        opacity: 0.7,
        repeat: -1,
        yoyo: true,
        duration: 6,
        ease: 'sine.inOut',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="intro" ref={sectionRef} className={styles.section}>
      <div ref={bgRef} className={styles.bgGlow} />
      <div className={styles.bgGradients} />

      {watchDetails.map((d) => (
        <div
          key={d.id}
          className={styles.detailWrap}
          style={{ top: `${d.y}%`, left: `${d.x}%` }}
        >
          <div className={styles.detailImage}>
            <img
              src="/images/watch-about.jpg"
              alt=""
              aria-hidden="true"
              loading="lazy"
              style={{
                objectPosition: d.pos,
                transform: `scale(${d.scale})`,
              }}
            />
          </div>
          <span className={styles.detailLabel}>{d.label}</span>
        </div>
      ))}

      <div className={styles.editorial}>
        <div className={`${styles.wordBlock} ${styles.wordBlockFirst}`}>
          <div className={styles.wordMask}>
            <span ref={(el) => { wordTexts.current[0] = el }} className={`${styles.word} ${styles.wordTime}`}>
              TIME
            </span>
          </div>
        </div>
        <div className={`${styles.wordBlock} ${styles.wordBlockRight}`}>
          <div className={styles.wordMask}>
            <span ref={(el) => { wordTexts.current[1] = el }} className={`${styles.word} ${styles.wordIsAn}`}>
              IS AN
            </span>
          </div>
        </div>
        <div className={`${styles.wordBlock} ${styles.wordBlockCenter}`}>
          <div className={styles.wordMask}>
            <span ref={(el) => { wordTexts.current[2] = el }} className={`${styles.word} ${styles.wordExpression}`}>
              EXPRESSION
            </span>
          </div>
        </div>
        <div className={`${styles.wordBlock} ${styles.wordBlockRightBottom}`}>
          <div className={styles.wordMask}>
            <span ref={(el) => { wordTexts.current[3] = el }} className={`${styles.word} ${styles.wordOfPrecision}`}>
              OF PRECISION
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
