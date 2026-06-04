'use client'

import { useRef, useCallback } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@/hooks/useGSAP'
import { FEATURES } from '@/lib/constants'

const COMPONENTS = [
  { id: 'crystal', label: 'Sapphire Crystal', y: -120, z: 80 },
  { id: 'dial', label: 'Dial & Hands', y: -40, z: 40 },
  { id: 'movement', label: 'Automatic Movement', y: 0, z: 0 },
  { id: 'caseback', label: 'Case Back', y: 40, z: -40 },
  { id: 'strap', label: 'Strap', y: 80, z: -80 },
]

export default function Engineering() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const componentsRef = useRef<(HTMLDivElement | null)[]>([])
  const featuresRef = useRef<(HTMLDivElement | null)[]>([])
  const titleRef = useRef<HTMLHeadingElement>(null)

  const setCompRef = useCallback((i: number) => (el: HTMLDivElement | null) => {
    componentsRef.current[i] = el
  }, [])

  const setFeatRef = useCallback((i: number) => (el: HTMLDivElement | null) => {
    featuresRef.current[i] = el
  }, [])

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
      gridRef.current,
      { opacity: 0 },
      { opacity: 0.15, duration: 0.8, ease: 'power2.out' }
    )

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    )

    componentsRef.current.forEach((el) => {
      if (el) {
        tl.fromTo(
          el,
          { opacity: 0, y: 20, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' },
          '-=0.2'
        )
      }
    })

    featuresRef.current.forEach((el) => {
      if (el) {
        tl.fromTo(
          el,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
          '-=0.15'
        )
      }
    })
  })

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-black"
      aria-label="Engineering specifications"
    >
      <div
        ref={gridRef}
        className="absolute inset-0 opacity-0 will-change-opacity"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      <div className="relative flex h-full flex-col items-center justify-center px-6">
        <h2
          ref={titleRef}
          className="font-display text-4xl font-light tracking-[0.1em] text-white md:text-6xl"
        >
          Engineered to Perfection
        </h2>

        <div className="relative mt-16 h-[300px] w-[300px] md:h-[400px] md:w-[400px]"
          aria-label="Exploded view of watch components"
        >
          {COMPONENTS.map((comp, i) => (
            <div
              key={comp.id}
              ref={setCompRef(i)}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 will-change-transform"
              style={{ transform: `translate(-50%, calc(-50% + ${comp.y}px)) translateZ(${comp.z}px)` }}
            >
              <div className="glass px-6 py-3 text-center rounded-sm">
                <p className="text-xs uppercase tracking-[0.15em] text-white/60">{comp.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-10">
          {FEATURES.map((feat, i) => (
            <div
              key={feat.label}
              ref={setFeatRef(i)}
              className="text-center opacity-0 will-change-transform"
            >
              <p className="font-display text-2xl text-accent md:text-3xl">
                {feat.value}
                <span className="text-sm text-white/40 ml-1">{feat.unit}</span>
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/40">
                {feat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
