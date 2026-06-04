'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { useGSAP } from '@/hooks/useGSAP'

const CARDS = [
  { label: 'Heart Rate', value: 'BPM', detail: 'Real-time optical sensing', icon: '♥' },
  { label: 'Sleep Score', value: '92', unit: '%', detail: 'Deep sleep tracking', icon: '☽' },
  { label: 'GPS Tracking', value: 'Dual-band', detail: 'GLONASS + Galileo', icon: '◉' },
  { label: 'Daily Activity', value: '18K', unit: 'steps', detail: 'Goal: 10K', icon: '⚡' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

export default function SmartFeatures() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useGSAP((ctx) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        pin: true,
        scrub: 1.5,
        start: 'top top',
        end: 'bottom top',
        anticipatePin: 1,
      },
    })

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    )
  })

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden"
      aria-label="Smart features"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/20 to-black" />

      <div className="relative flex h-full flex-col items-center justify-center px-6">
        <h2
          ref={titleRef}
          className="font-display text-4xl font-light tracking-[0.1em] text-white md:text-6xl"
        >
          Intelligently Designed
        </h2>

        <motion.div
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {CARDS.map((card) => (
            <motion.div
              key={card.label}
              variants={cardVariants}
              className="glass group cursor-default rounded-sm p-8 transition-all duration-500 hover:glass-hover"
              whileHover={{ y: -4 }}
            >
              <span className="text-2xl text-accent/80" aria-hidden="true">
                {card.icon}
              </span>
              <p className="font-display text-3xl text-white mt-4">
                {card.value}
                {card.unit && (
                  <span className="text-sm text-white/30 ml-1">{card.unit}</span>
                )}
              </p>
              <p className="text-xs uppercase tracking-[0.15em] text-white/50 mt-2">
                {card.label}
              </p>
              <p className="text-sm text-white/30 mt-2 leading-relaxed">
                {card.detail}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
