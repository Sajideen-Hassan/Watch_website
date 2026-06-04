'use client'

import { useEffect, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function GSAPProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [])

  return <>{children}</>
}
