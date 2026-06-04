'use client'

import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@/hooks/useGSAP'
import { LIFESTYLE_SCENES } from '@/lib/constants'

export default function Lifestyle() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const watchRef = useRef<HTMLDivElement>(null)
  const scenesRef = useRef<(HTMLDivElement | null)[]>([])
  const labelRef = useRef<HTMLParagraphElement>(null)
  const [currentScene, setCurrentScene] = useState(0)

  useGSAP((ctx) => {
    const scenes = LIFESTYLE_SCENES

    scenes.forEach((scene, i) => {
      const el = scenesRef.current[i]
      if (!el) return

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: `top+=${(i / scenes.length) * 100}%`,
        end: `top+=${((i + 1) / scenes.length) * 100}%`,
        onEnter: () => setCurrentScene(i),
        onEnterBack: () => setCurrentScene(i),
        onLeave: i < scenes.length - 1 ? () => setCurrentScene(i + 1) : undefined,
        onLeaveBack: i > 0 ? () => setCurrentScene(i - 1) : undefined,
      })
    })
  })

  return (
    <section
      ref={sectionRef}
      className="relative h-[300vh] w-full overflow-hidden"
      aria-label="Lifestyle scenes"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {LIFESTYLE_SCENES.map((scene, i) => (
          <div
            key={scene.id}
            ref={(el) => { scenesRef.current[i] = el }}
            className={`absolute inset-0 bg-gradient-to-br ${scene.gradient} transition-opacity duration-1000 ${
              i === currentScene ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={i !== currentScene}
          />
        ))}

        <div className="absolute inset-0 bg-black/30" />

        <div className="relative flex h-full flex-col items-center justify-center px-6">
          <div
            ref={watchRef}
            className="h-64 w-64 will-change-transform md:h-80 md:w-80"
            aria-label="Watch silhouette"
          >
            <svg viewBox="0 0 400 500" className="h-full w-full text-white drop-shadow-[0_0_60px_rgba(212,175,55,0.2)]">
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

          <p
            ref={labelRef}
            className="absolute bottom-16 text-xs uppercase tracking-[0.3em] text-white/60 transition-all duration-700"
          >
            {LIFESTYLE_SCENES[currentScene]?.label}
          </p>

          <div className="absolute bottom-8 flex gap-2">
            {LIFESTYLE_SCENES.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === currentScene ? 'w-8 bg-accent' : 'w-1 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
