'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface UnderlineLinkProps {
  children: ReactNode
  href?: string
  className?: string
  onClick?: () => void
}

export default function UnderlineLink({ children, href, className = '', onClick }: UnderlineLinkProps) {
  return (
    <motion.a
      href={href}
      onClick={onClick}
      className={`group relative inline-block text-sm uppercase tracking-[0.15em] text-white/60 hover:text-white transition-colors duration-300 ${className}`}
      whileHover={{ x: 4 }}
    >
      {children}
      <span className="absolute bottom-0 left-0 h-px w-full bg-white/20 transition-all duration-500 group-hover:w-full group-hover:bg-white" />
    </motion.a>
  )
}
