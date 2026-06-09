import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Features.module.scss'

gsap.registerPlugin(ScrollTrigger)

const cards = [
  {
    icon: (
      <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
        <circle cx="16" cy="16" r="14" />
        <circle cx="16" cy="16" r="8" strokeOpacity="0.3" />
        <circle cx="16" cy="16" r="3" />
        <line x1="16" y1="2" x2="16" y2="7" />
        <line x1="16" y1="25" x2="16" y2="30" />
        <line x1="2" y1="16" x2="7" y2="16" />
        <line x1="25" y1="16" x2="30" y2="16" />
      </svg>
    ),
    title: 'Precision Movement',
    desc: 'Automatic winding with 72-hour power reserve.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
        <polygon points="16 3 19.77 8.78 26 9.68 21.5 14.2 22.54 20.48 16 17.13 9.46 20.48 10.5 14.2 6 9.68 12.23 8.78 16 3" />
        <circle cx="16" cy="12" r="1.5" fill="currentColor" fillOpacity="0.3" />
      </svg>
    ),
    title: 'Premium Materials',
    desc: 'Grade 5 titanium with sapphire crystal display.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
        <path d="M16 30S7 25.5 7 18.5V9l9-3.5L25 9v9.5c0 7-9 11.5-9 11.5z" />
        <line x1="16" y1="14" x2="16" y2="21" />
        <line x1="12.5" y1="17.5" x2="19.5" y2="17.5" />
      </svg>
    ),
    title: 'Water Resistance',
    desc: '300-meter certified with triple-sealed crown.',
  },
  {
    icon: (
      <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
        <rect x="4" y="14" width="24" height="14" rx="2" />
        <path d="M9 14V9a7 7 0 0114 0v5" />
        <circle cx="16" cy="21" r="1.5" fill="currentColor" fillOpacity="0.3" />
        <line x1="16" y1="22.5" x2="16" y2="25" />
      </svg>
    ),
    title: 'Limited Edition',
    desc: 'Only 500 numbered pieces produced annually.',
  },
]

export default function Features() {
  const sectionRef = useRef(null)
  const cardsRef = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return
        gsap.fromTo(card,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 85%' }, delay: i * 0.1 }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="features" ref={sectionRef} className={styles.section}>
      <div className={styles.bgGlow} />
      <div className={styles.grid}>
        {cards.map((card, i) => (
          <div key={card.title} ref={el => cardsRef.current[i] = el} className={styles.card}>
            <div className={styles.cardGlow} />
            <div className={styles.cardIcon}>{card.icon}</div>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardDesc}>{card.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
