import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Features.module.scss'

gsap.registerPlugin(ScrollTrigger)

const featuresData = [
  {
    id: 'precision',
    number: '01',
    title: 'Precision Movement',
    subtitle: 'Swiss Automatic',
    desc: 'At the heart of every REISER beats a hand-assembled automatic movement, certified by the Contrôle Officiel Suisse des Chronomètres. Accurate to ±2 seconds per day, it represents the pinnacle of horological achievement.',
    detail: 'The movement oscillates at 28,800 vibrations per hour with a 72-hour power reserve.',
    imageSide: 'left',
    accent: 'Chronometer Certified',
  },
  {
    id: 'craftsmanship',
    number: '02',
    title: 'Premium Craftsmanship',
    subtitle: 'Hand Finished',
    desc: 'Each case is machined from a single block of grade 5 titanium, then hand-finished by our master artisans in Geneva. The alternating brushed and polished surfaces create a dialogue between light and shadow.',
    detail: '600+ hours of meticulous handcraft per timepiece.',
    imageSide: 'right',
    accent: 'Geneva Atelier',
  },
  {
    id: 'water',
    number: '03',
    title: 'Water Resistance',
    subtitle: '300M Certified',
    desc: 'Engineered with a triple-sealed crown and a double-layer gasket system, the REISER withstands depths of 300 metres. From boardroom to deep dive, your timepiece remains impervious.',
    detail: 'ISO 6425 certified diving watch standard.',
    imageSide: 'left',
    accent: 'ISO 6425',
  },
  {
    id: 'design',
    number: '04',
    title: 'Luxury Design',
    subtitle: 'Timeless Aesthetic',
    desc: 'The REISER dial is a study in restraint — a dome of scratch-resistant sapphire crystal reveals a sunray-brushed finish that shifts with every angle of light. Baton indices in 18K gold mark the hours.',
    detail: 'Double anti-reflective sapphire crystal coating.',
    imageSide: 'right',
    accent: 'Sapphire Crystal',
  },
]

function FeatureItem({ feature, index }) {
  const rowRef = useRef(null)
  const imageRef = useRef(null)
  const contentRef = useRef(null)
  const numberRef = useRef(null)
  const accentRef = useRef(null)

  useEffect(() => {
    const isLeft = feature.imageSide === 'left'
    const ctx = gsap.context(() => {
      // Image entrance
      gsap.fromTo(imageRef.current,
        { x: isLeft ? -60 : 60, opacity: 0, scale: 1.05 },
        {
          x: 0, opacity: 1, scale: 1,
          duration: 1.2, ease: 'power3.out',
          scrollTrigger: {
            trigger: rowRef.current,
            start: 'top 75%',
          }
        }
      )

      // Content entrance
      gsap.fromTo(contentRef.current,
        { x: isLeft ? 60 : -60, opacity: 0 },
        {
          x: 0, opacity: 1,
          duration: 1, ease: 'power3.out',
          scrollTrigger: {
            trigger: rowRef.current,
            start: 'top 75%',
          },
          delay: 0.15
        }
      )

      // Number counter effect
      gsap.fromTo(numberRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 0.07, y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: rowRef.current,
            start: 'top 80%',
          }
        }
      )

      // Accent badge
      gsap.fromTo(accentRef.current,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1, opacity: 1,
          duration: 0.6, ease: 'power2.out',
          transformOrigin: 'left',
          scrollTrigger: {
            trigger: rowRef.current,
            start: 'top 75%',
          },
          delay: 0.4
        }
      )

      // Subtle parallax on image
      gsap.to(imageRef.current, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: rowRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      })
    }, rowRef)

    return () => ctx.revert()
  }, [feature])

  const isLeft = feature.imageSide === 'left'

  return (
    <div
      ref={rowRef}
      id={feature.id}
      className={`${styles.featureRow} ${isLeft ? styles.imageLeft : styles.imageRight}`}
    >
      {/* Large background number */}
      <span ref={numberRef} className={styles.bgNumber}>{feature.number}</span>

      {/* Image */}
      <div ref={imageRef} className={styles.featureImageWrap}>
        <div className={styles.featureImageInner}>
          <img
            src={`/images/feature-${feature.id}.jpg`}
            alt={feature.title}
            className={styles.featureImage}
            loading="lazy"
          />
          <div className={styles.imageSheen} />
        </div>
        <div className={styles.imageAccentLine} />
      </div>

      {/* Content */}
      <div ref={contentRef} className={styles.featureContent}>
        <div className={styles.featureNumber}>{feature.number}</div>

        <div ref={accentRef} className={styles.accentBadge}>
          <span className={styles.accentLine} />
          <span className={styles.accentText}>{feature.accent}</span>
        </div>

        <p className={styles.featureSubtitle}>{feature.subtitle}</p>
        <h3 className={styles.featureTitle}>{feature.title}</h3>

        <p className={styles.featureDesc}>{feature.desc}</p>

        <div className={styles.detailBox}>
          <span className={styles.detailIcon}>◈</span>
          <p className={styles.detailText}>{feature.detail}</p>
        </div>

        <button className={styles.learnMore}>
          <span className={styles.learnMoreLine} />
          <span>Learn More</span>
        </button>
      </div>
    </div>
  )
}

export default function Features() {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 85%',
        }
      }
    )
  }, [])

  return (
    <section id="features" ref={sectionRef} className={styles.features}>
      <div ref={headerRef} className={styles.sectionHeader}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowLine} />
          <span>The Details</span>
          <span className={styles.eyebrowLine} />
        </div>
        <h2 className={styles.sectionTitle}>
          Crafted with<br /><em>Obsession</em>
        </h2>
        <p className={styles.sectionDesc}>
          Every facet of the REISER has been considered, reconsidered,
          and perfected. These are not mere features — they are the
          characteristics of a watch that defines a legacy.
        </p>
      </div>

      <div className={styles.featuresList}>
        {featuresData.map((feature, i) => (
          <FeatureItem key={feature.id} feature={feature} index={i} />
        ))}
      </div>
    </section>
  )
}
