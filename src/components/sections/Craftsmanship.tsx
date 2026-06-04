'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@/hooks/useGSAP'

const CALLOUTS = [
  { id: 'titanium', label: 'Titanium Frame', desc: 'Grade 5 titanium, sandblasted finish', x: '10%', y: '20%' },
  { id: 'sapphire', label: 'Sapphire Crystal', desc: 'Box-domed sapphire with AR coating', x: '75%', y: '15%' },
  { id: 'strap', label: 'Leather Strap', desc: 'Italian full-grain leather, hand-stitched', x: '5%', y: '75%' },
  { id: 'crown', label: 'Precision Crown', desc: 'Screw-down crown, 18k gold inlay', x: '78%', y: '70%' },
]

export default function Craftsmanship() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const watchRef = useRef<HTMLDivElement>(null)
  const calloutRefs = useRef<(HTMLDivElement | null)[]>([])

  useGSAP((ctx) => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px)', () => {
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

      tl.to(watchRef.current, {
        scale: 2.8,
        duration: 1.5,
        ease: 'power2.out',
      })

      calloutRefs.current.forEach((el) => {
        if (el) {
          tl.fromTo(
            el,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
            '-=0.3'
          )
        }
      })
    })

    mm.add('(max-width: 767px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1.5,
          start: 'top top',
          end: '+=150%',
          anticipatePin: 1,
        },
      })

      tl.to(watchRef.current, {
        scale: 1.8,
        duration: 1.5,
        ease: 'power2.out',
      })

      calloutRefs.current.forEach((el) => {
        if (el) {
          tl.fromTo(
            el,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
            '-=0.2'
          )
        }
      })
    })

    return () => mm.revert()
  })

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-black"
      aria-label="Craftsmanship details"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />

      <div className="relative flex h-full flex-col items-center justify-center px-6">
        <div
          ref={watchRef}
          className="will-change-transform"
          aria-hidden="true"
        >
          <svg viewBox="0 0 400 500" className="h-48 w-48 text-white/90 md:h-56 md:w-56">
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

        <h2 className="sr-only">Craftsmanship</h2>

        {CALLOUTS.map((callout, i) => (
          <div
            key={callout.id}
            ref={(el) => { calloutRefs.current[i] = el }}
            className="absolute opacity-0 will-change-transform"
            style={{ left: callout.x, top: callout.y }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1.5 h-px w-8 bg-accent/60" />
              <div>
                <p className="font-display text-sm tracking-wider text-white md:text-base">
                  {callout.label}
                </p>
                <p className="mt-0.5 text-xs text-white/40 max-w-[180px] leading-relaxed">
                  {callout.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
