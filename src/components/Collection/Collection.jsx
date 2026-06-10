import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Collection.module.scss'

gsap.registerPlugin(ScrollTrigger)

const variants = [
  {
    name: 'Silver Edition',
    subtitle: 'Silver dial · Steel bracelet',
    filter: 'none',
    tint: 'rgba(214, 210, 196, 0.3)',
  },
  {
    name: 'Black Edition',
    subtitle: 'Black dial · DLC coating',
    filter: 'brightness(0.5) contrast(1.3) saturate(0.8)',
    tint: 'rgba(60, 126, 255, 0.15)',
  },
  {
    name: 'Midnight Edition',
    subtitle: 'Blue accents · Numbered',
    filter: 'brightness(0.7) contrast(1.1) sepia(0.2) hue-rotate(210deg) saturate(1.2)',
    tint: 'rgba(142, 44, 44, 0.2)',
  },
]

export default function Collection() {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const productsWrap = useRef(null)
  const cardsRef = useRef([])
  const [activeIdx, setActiveIdx] = useState(1)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      })

      tl.fromTo(headingRef.current,
        { y: 40, opacity: 0, filter: 'blur(6px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' }
      )

      cardsRef.current.forEach((card, i) => {
        if (!card) return
        tl.fromTo(card,
          { y: 80, opacity: 0, scale: 0.9, rotateY: i === 0 ? -15 : i === 2 ? 15 : 0 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0,
            duration: 0.9,
            ease: 'power4.out',
          },
          `-=${i === 0 ? 0.4 : 0.5}`
        )
      })

      gsap.to(sectionRef.current, {
        backgroundPosition: '50% 100%',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="collection" ref={sectionRef} className={styles.section}>
      <h2 ref={headingRef} className={styles.heading}>The Collection</h2>

      <div ref={productsWrap} className={styles.carousel}>
        {variants.map((v, i) => (
          <div
            key={v.name}
            ref={(el) => { cardsRef.current[i] = el }}
            className={`${styles.card} ${i === activeIdx ? styles.cardActive : ''}`}
            onMouseEnter={() => setActiveIdx(i)}
          >
            <div className={styles.cardInner}>
              <div className={styles.imageWrap}>
                <img
                  src="/images/watch-about.jpg"
                  alt={v.name}
                  className={styles.cardImage}
                  style={{ filter: v.filter }}
                  draggable={false}
                />
                <div className={styles.cardTint} style={{ background: v.tint }} />
                <div className={styles.cardGlow} />
                <div className={styles.reflection} />
              </div>
              <div className={styles.cardInfo}>
                <strong className={styles.cardName}>{v.name}</strong>
                <span className={styles.cardSub}>{v.subtitle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.indicators}>
        {variants.map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i === activeIdx ? styles.dotActive : ''}`}
            onMouseEnter={() => setActiveIdx(i)}
          />
        ))}
      </div>
    </section>
  )
}
