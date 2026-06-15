import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './Features.module.scss'
import OptimizedImage from '../OptimizedImage'

const features = [
  {
    num: '01', title: 'Precision Movement',
    desc: 'Automatic winding with 72-hour power reserve, assembled by hand.',
    path: 'feature-precision.jpg', pos: '50% 30%',
  },
  {
    num: '02', title: 'Swiss Design',
    desc: 'Grade 5 titanium case with scratch-resistant sapphire crystal.',
    path: 'feature-design.jpg', pos: '50% 40%',
  },
  {
    num: '03', title: 'Artisan Crafted',
    desc: 'Hand-finished movement with Côtes de Genève decoration.',
    path: 'feature-craftsmanship.jpg', pos: '50% 50%',
  },
  {
    num: '04', title: 'Water Resistance',
    desc: 'Certified to 300 meters with triple-sealed crown system.',
    path: 'feature-water.jpg', pos: '50% 60%',
  },
]

export default function Features() {
  const sectionRef = useRef(null)
  const panels = useRef([])
  const nums = useRef([])
  const titles = useRef([])
  const descs = useRef([])
  const imageWraps = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      panels.current.forEach((panel, i) => {
        if (!panel) return
        const tl = gsap.timeline({
          scrollTrigger: { trigger: panel, start: 'top 80%', end: 'top 20%', toggleActions: 'play none none reverse' },
        })
        tl.fromTo(nums.current[i], { y: 60, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' })
        tl.fromTo(imageWraps.current[i], { x: i % 2 === 0 ? -80 : 80, opacity: 0, scale: 1.1 }, { x: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'power4.out' }, '-=0.3')
        tl.fromTo(titles.current[i], { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: 'power3.out' }, '-=0.5')
        tl.fromTo(descs.current[i], { y: 20, opacity: 0, filter: 'blur(4px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' }, '-=0.3')
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="features" ref={sectionRef} className={styles.section}>
      {features.map((f, i) => (
        <div key={f.num} ref={(el) => { panels.current[i] = el }} className={`${styles.panel} ${i % 2 !== 0 ? styles.panelReverse : ''}`}>
          <div ref={(el) => { imageWraps.current[i] = el }} className={styles.imageSide}>
            <OptimizedImage path={f.path} alt="" aria-hidden="true" width={1024} height={1024} className={styles.panelImage} style={{ objectPosition: f.pos }} />
            <div className={styles.imageOverlay} />
          </div>
          <div className={styles.textSide}>
            <span ref={(el) => { nums.current[i] = el }} className={styles.num}>{f.num}</span>
            <h3 ref={(el) => { titles.current[i] = el }} className={styles.title}>{f.title}</h3>
            <p ref={(el) => { descs.current[i] = el }} className={styles.desc}>{f.desc}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
