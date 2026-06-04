'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WATCH_COLORS, type WatchColorId } from '@/lib/constants'

export default function ColorVariants() {
  const [active, setActive] = useState<WatchColorId>('silver')

  const currentColor = WATCH_COLORS.find((c) => c.id === active)!

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black" aria-label="Color variants">
      <div className="flex h-full flex-col items-center justify-center px-6">
        <h2 className="font-display text-4xl font-light tracking-[0.1em] text-white md:text-6xl">
          Choose Your Edition
        </h2>

        <div className="relative mt-16 h-72 w-72 md:h-96 md:w-96">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, rotateY: -30, scale: 0.85 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: 30, scale: 0.85 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-full w-full"
            >
              <svg viewBox="0 0 400 500" className={`h-full w-full drop-shadow-[0_0_60px_rgba(212,175,55,0.15)]`}>
                <circle cx="200" cy="200" r="130" fill="none" stroke={currentColor.hex} strokeWidth="1.5" />
                <circle cx="200" cy="200" r="120" fill="none" stroke={currentColor.hex} strokeWidth="0.5" opacity="0.4" />
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
                      stroke={currentColor.hex}
                      strokeWidth={angle % 90 === 0 ? 2 : 1}
                      opacity={angle % 90 === 0 ? 0.9 : 0.4}
                    />
                  )
                })}
                <line x1="200" y1="200" x2="200" y2="100" stroke={currentColor.hex} strokeWidth="2" strokeLinecap="round" />
                <line x1="200" y1="200" x2="270" y2="200" stroke={currentColor.hex} strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="200" cy="200" r="4" fill={currentColor.hex} />
                <rect x="325" y="188" width="16" height="24" rx="3" fill={currentColor.hex} opacity="0.7" />
                <path d="M 155 320 L 155 460 Q 155 470 165 470 L 235 470 Q 245 470 245 460 L 245 320" fill="none" stroke={currentColor.hex} strokeWidth="2.5" opacity="0.8" />
                <rect x="170" y="380" width="60" height="16" rx="3" fill="none" stroke={currentColor.hex} strokeWidth="1.5" opacity="0.6" />
              </svg>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex gap-6">
          {WATCH_COLORS.map((color) => (
            <motion.button
              key={color.id}
              onClick={() => setActive(color.id)}
              className="group flex flex-col items-center gap-2"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Select ${color.label} edition`}
              aria-current={active === color.id ? 'true' : undefined}
            >
              <div
                className={`h-8 w-8 rounded-full border-2 transition-all duration-500 ${
                  active === color.id
                    ? 'border-accent scale-110'
                    : 'border-white/20 group-hover:border-white/40'
                }`}
                style={{ backgroundColor: color.hex }}
              />
              <span
                className={`text-xs uppercase tracking-[0.15em] transition-colors duration-300 ${
                  active === color.id ? 'text-accent' : 'text-white/40 group-hover:text-white/60'
                }`}
              >
                {color.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
