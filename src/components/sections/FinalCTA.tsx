'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@/hooks/useGSAP'
import Button from '@/components/ui/Button'
import { SITE_CONFIG } from '@/lib/constants'

export default function FinalCTA() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const watchRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const glowsRef = useRef<(HTMLDivElement | null)[]>([])

  useGSAP((ctx) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        pin: true,
        scrub: 2.5,
        start: 'top top',
        end: 'bottom top',
        anticipatePin: 1,
      },
    })

    tl.fromTo(
      watchRef.current,
      { rotation: -5, scale: 0.9, opacity: 0.5 },
      { rotation: 3, scale: 1, opacity: 1, duration: 1.5, ease: 'power2.out' }
    )

    tl.fromTo(
      textRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.8'
    )

    glowsRef.current.forEach((el) => {
      if (el) {
        tl.fromTo(
          el,
          { opacity: 0, scale: 0 },
          { opacity: 0.6, scale: 1, duration: 1.2, ease: 'power2.out' },
          '-=0.6'
        )
      }
    })

    tl.fromTo(
      buttonRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    )
  })

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-black"
      aria-label="Final call to action"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          ref={(el) => { glowsRef.current[i] = el }}
          className="absolute rounded-full bg-accent/5 blur-[120px] will-change-transform"
          style={{
            width: `${300 + i * 200}px`,
            height: `${300 + i * 200}px`,
            left: `${20 + i * 20}%`,
            top: `${30 + i * 10}%`,
          }}
          aria-hidden="true"
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />

      <div className="relative flex h-full flex-col items-center justify-center px-6">
        <div
          ref={watchRef}
          className="will-change-transform"
          aria-hidden="true"
        >
          <svg viewBox="0 0 400 500" className="h-56 w-56 text-white/90 md:h-72 md:w-72 drop-shadow-[0_0_80px_rgba(212,175,55,0.2)]">
            <circle cx="200" cy="200" r="130" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="200" cy="200" r="120" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
              const rad = (angle * Math.PI) / 180
              const inner = angle % 90 === 0 ? 170 : 180
              const outer = 185
              return (
                <line
                  key={angle}
                  x1={200 + inner * Math.cos(rad)}
                  y1={200 + inner * Math.sin(rad)}
                  x2={200 + outer * Math.cos(rad)}
                  y2={200 + outer * Math.sin(rad)}
                  stroke="currentColor"
                  strokeWidth={angle % 90 === 0 ? 2 : 1}
                  opacity={angle % 90 === 0 ? 0.9 : 0.4}
                />
              )
            })}
            <line x1="200" y1="200" x2="200" y2="100" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="200" y1="200" x2="270" y2="200" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="200" cy="200" r="4" fill="currentColor" />
            <rect x="325" y="188" width="16" height="24" rx="3" fill="currentColor" opacity="0.7" />
            <path d="M 155 320 L 155 460 Q 155 470 165 470 L 235 470 Q 245 470 245 460 L 245 320" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.8" />
            <rect x="170" y="380" width="60" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          </svg>
        </div>

        <h2
          ref={textRef}
          className="mt-12 font-display text-4xl font-light tracking-[0.05em] text-white md:text-6xl lg:text-7xl"
        >
          {SITE_CONFIG.cta}
        </h2>

        <div ref={buttonRef} className="mt-10">
          <Button variant="primary">Explore Collection</Button>
        </div>
      </div>
    </section>
  )
}
