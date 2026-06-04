'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@/hooks/useGSAP'
import { SITE_CONFIG } from '@/lib/constants'

export default function HeroReveal() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const beamRef = useRef<HTMLDivElement>(null)
  const watchRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

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
      beamRef.current,
      { scaleX: 0, opacity: 0, transformOrigin: 'center center' },
      { scaleX: 1, opacity: 1, duration: 0.6, ease: 'power3.out' }
    )
      .fromTo(
        watchRef.current,
        { opacity: 0, y: 60, rotation: -8, scale: 0.85 },
        { opacity: 1, y: 0, rotation: 3, scale: 1, duration: 1, ease: 'power4.out' },
        '-=0.3'
      )
      .fromTo(
        headlineRef.current?.children ? Array.from(headlineRef.current.children) : [],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 0.6, y: 0, duration: 0.8, ease: 'power2.out' },
        '-=0.4'
      )
  })

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-black"
      aria-label="Hero section"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          ref={beamRef}
          className="h-[2px] w-[80vw] max-w-[800px] bg-gradient-to-r from-transparent via-accent/60 to-transparent will-change-transform"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
        <div
          ref={watchRef}
          className="mb-12 h-64 w-64 will-change-transform"
          aria-hidden="true"
        >
          <svg viewBox="0 0 400 500" className="h-full w-full text-white/90 drop-shadow-[0_0_40px_rgba(212,175,55,0.15)]">
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

        <h1
          ref={headlineRef}
          className="font-display text-5xl font-light tracking-[0.15em] text-white md:text-7xl lg:text-8xl"
        >
          {SITE_CONFIG.tagline.split(' ').map((word, i) => (
            <span key={i} className="inline-block mr-[0.15em]">
              {word}
              {i < SITE_CONFIG.tagline.split(' ').length - 1 ? '\u00A0' : ''}
            </span>
          ))}
        </h1>

        <p
          ref={subtitleRef}
          className="mt-6 text-sm uppercase tracking-[0.3em] text-white/40"
        >
          Luxury timepiece
        </p>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="h-12 w-px bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </section>
  )
}
