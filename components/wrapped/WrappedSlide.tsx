'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface WrappedSlideProps {
  children: ReactNode
  title?: string
  subtitle?: string
  className?: string
}

export default function WrappedSlide({ children, title, subtitle, className = '' }: WrappedSlideProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen flex flex-col items-center justify-center p-8 ${className}`}
    >
      {title && (
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold mb-4 text-center bg-gradient-to-r from-tft-gold via-tft-lightBlue to-tft-purple bg-clip-text text-transparent"
        >
          {title}
        </motion.h2>
      )}

      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-xl text-gray-300 mb-12 text-center"
        >
          {subtitle}
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
