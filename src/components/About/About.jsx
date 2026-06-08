import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './About.module.scss'

gsap.registerPlugin(ScrollTrigger)

const specs = [
  { value: '300', unit: 'M', label: 'Water Resistant' },
  { value: '72', unit: 'H', label: 'Power Reserve' },
  { value: '28', unit: 'K', label: 'Vibrations / Hour' },
  { value: '38', unit: 'MM', label: 'Case Diameter' },
]

const features = [
  {
    icon: '◈',
    title: 'Precision Movement',
    desc: 'Swiss-certified automatic movement with 28,800 vibrations per hour for unparalleled accuracy.'
  },
  {
    icon: '◇',
    title: 'Sapphire Crystal',
    desc: 'Scratch-resistant sapphire crystal with anti-reflective coating on both sides.'
  },
  {
    icon: '◉',
    title: 'Premium Materials',
    desc: 'Grade 5 titanium case paired with a hand-stitched alligator leather strap.'
  },
  {
    icon: '◌',
    title: 'Elegant Design',
    desc: 'Timeless silhouette refined over three generations of master watchmakers.'
  },
]

function Counter({ value, unit }) {
  const ref = useRef(null)

  useEffect(() => {
    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const target = parseInt(value)
        const obj = { val: 0 }
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            if (ref.current) {
              ref.current.textContent = Math.round(obj.val) + unit
            }
          }
        })
      }
    })
  }, [value, unit])

  return <span ref={ref}>0{unit}</span>
}

export default function About() {
  const sectionRef = useRef(null)
  const imageRef = useRef(null)
  const imageWrapRef = useRef(null)
  const headingRef = useRef(null)
  const linesRef = useRef([])
  const specsRef = useRef([])
  const featuresRef = useRef([])
  const decorRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image entrance with parallax
      gsap.fromTo(imageWrapRef.current,
        { x: -80, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          }
        }
      )

      // Parallax on image as you scroll
      gsap.to(imageRef.current, {
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      })

      // Decorative element float
      gsap.to(decorRef.current, {
        y: -20,
        repeat: -1,
        yoyo: true,
        duration: 4,
        ease: 'sine.inOut'
      })

      // Heading reveal
      gsap.fromTo(headingRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 85%',
          }
        }
      )

      // Text lines stagger
      linesRef.current.forEach((line, i) => {
        if (!line) return
        gsap.fromTo(line,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
            scrollTrigger: {
              trigger: line,
              start: 'top 90%',
            },
            delay: i * 0.1
          }
        )
      })

      // Specs stagger
      specsRef.current.forEach((spec, i) => {
        if (!spec) return
        gsap.fromTo(spec,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
            scrollTrigger: {
              trigger: spec,
              start: 'top 90%',
            },
            delay: i * 0.12
          }
        )
      })

      // Feature cards stagger
      featuresRef.current.forEach((card, i) => {
        if (!card) return
        gsap.fromTo(card,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
            },
            delay: i * 0.1
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={sectionRef} className={styles.about}>
      <div className={styles.container}>

        {/* Left – Image */}
        <div ref={imageWrapRef} className={styles.imageWrapper}>
          <div ref={imageRef} className={styles.imageInner}>
            <img
              src="/images/watch-about.jpg"
              alt="REISER watch detail"
              className={styles.watchImage}
              loading="lazy"
            />
            <div className={styles.imageFrame} />
          </div>

          {/* Floating decorative elements */}
          <div ref={decorRef} className={styles.decorCircle} />
          <div className={styles.decorDot} />
          <div className={styles.yearBadge}>
            <span className={styles.yearNum}>1967</span>
            <span className={styles.yearLabel}>Est.</span>
          </div>
        </div>

        {/* Right – Content */}
        <div className={styles.content}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            <span>The Craft</span>
          </div>

          <h2 ref={headingRef} className={styles.heading}>
            Engineered for<br />
            <em>Perfection</em>
          </h2>

          <p ref={el => linesRef.current[0] = el} className={styles.lead}>
            The REISER is not merely a timepiece. It is the culmination of
            decades of horological mastery — a marriage of Swiss precision
            engineering and timeless aesthetic philosophy.
          </p>

          <p ref={el => linesRef.current[1] = el} className={styles.body}>
            Crafted from grade 5 titanium and finished by hand in our Geneva
            atelier, every REISER represents over 600 hours of meticulous
            workmanship. The automatic movement beats at the heart of a watch
            designed to outlast generations.
          </p>

          {/* Specs grid */}
          <div className={styles.specs}>
            {specs.map((s, i) => (
              <div key={s.label} ref={el => specsRef.current[i] = el} className={styles.specItem}>
                <span className={styles.specValue}>
                  <Counter value={s.value} unit={s.unit} />
                </span>
                <span className={styles.specLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Feature mini-cards */}
          <div className={styles.featureGrid}>
            {features.map((f, i) => (
              <div key={f.title} ref={el => featuresRef.current[i] = el} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <div>
                  <h4 className={styles.featureTitle}>{f.title}</h4>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
