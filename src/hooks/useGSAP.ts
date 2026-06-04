'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function useGSAP(
  callback: (context: gsap.Context, scope: Element) => void,
  deps: React.DependencyList = []
) {
  const scopeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scopeRef.current) return

    const ctx = gsap.context(() => {
      callback(ctx, scopeRef.current!)
    }, scopeRef.current)

    return () => {
      ctx.revert()
    }
  }, deps)

  return scopeRef
}
