'use client'

import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@/hooks/useGSAP'
import { BATTERY_DAYS } from '@/lib/constants'

export default function PerformanceBattery() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<SVGCircleElement>(null)
  const numberRef = useRef<HTMLSpanElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const [count, setCount] = useState(0)

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

    tl.fromTo(
      descRef.current,
      { opacity: 0, y: 20 },
      { opacity: 0.6, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.3'
    )

    if (circleRef.current) {
      const circumference = 2 * Math.PI * 80
      tl.fromTo(
        circleRef.current,
        { strokeDasharray: `${circumference}`, strokeDashoffset: circumference },
        { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' },
        '-=0.4'
      )
    }

    const counterObj = { val: 0 }
    tl.to(counterObj, {
      val: BATTERY_DAYS,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => {
        setCount(Math.round(counterObj.val))
      },
    }, '-=1')

    tl.fromTo(
      numberRef.current,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' },
      '-=1.2'
    )
  })

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-black"
      aria-label="Performance and battery"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />

      <div className="relative flex h-full flex-col items-center justify-center px-6">
        <h2
          ref={titleRef}
          className="font-display text-4xl font-light tracking-[0.1em] text-white md:text-6xl"
        >
          Power That Lasts
        </h2>

        <div className="relative mt-16 flex items-center justify-center">
          <svg width="220" height="220" viewBox="0 0 220 220" className="transform -rotate-90">
            <circle
              cx="110"
              cy="110"
              r="80"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="3"
            />
            <circle
              ref={circleRef}
              cx="110"
              cy="110"
              r="80"
              fill="none"
              stroke="rgba(212,175,55,0.8)"
              strokeWidth="3"
              strokeLinecap="round"
              style={{
                strokeDasharray: `${2 * Math.PI * 80}`,
                strokeDashoffset: `${2 * Math.PI * 80}`,
              }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              ref={numberRef}
              className="font-display text-6xl text-white md:text-7xl"
            >
              {count}
            </span>
            <span className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">
              Days
            </span>
          </div>
        </div>

        <p
          ref={descRef}
          className="mt-8 max-w-md text-center text-sm leading-relaxed text-white/40"
        >
          Engineered for endurance. A single charge powers a full week of
          activity tracking, notifications, and premium watch functionality.
        </p>
      </div>
    </section>
  )
}
