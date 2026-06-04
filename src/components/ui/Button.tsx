'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'outline'
  className?: string
  onClick?: () => void
}

export default function Button({ children, variant = 'primary', className = '', onClick }: ButtonProps) {
  const base = 'inline-flex items-center justify-center px-8 py-4 text-sm font-medium uppercase tracking-[0.2em] transition-colors duration-500'

  const styles = {
    primary: 'bg-accent text-black hover:bg-accent-dim',
    outline: 'border border-white/20 text-white hover:bg-white/5',
  }

  return (
    <motion.button
      className={`${base} ${styles[variant]} ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(212,175,55,0.2)' }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  )
}
