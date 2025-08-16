'use client'

import { motion } from 'framer-motion'
import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function BentoCard({
  eyebrow,
  title,
  description,
  graphic,
  fade = [],
  className,
  ...props
}: {
  eyebrow: string
  title: string
  description: string
  graphic: React.ReactNode
  fade?: Array<'top' | 'bottom'>
  className?: string
} & React.ComponentPropsWithoutRef<typeof motion.div>) {
  return (
    <motion.div
      className={cn(
        className,
        'relative flex h-96 flex-col justify-end overflow-hidden rounded-3xl bg-white p-8 shadow-lg ring-1 ring-black/5',
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: 0.1 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      {...props}
    >
      <div className="absolute inset-0">{graphic}</div>
      {fade.includes('top') && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-transparent" />
      )}
      {fade.includes('bottom') && (
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
      )}
      <div className="relative">
        <p className="mb-2 text-sm/4 font-medium text-blue-600">{eyebrow}</p>
        <p className="mb-2 text-xl/7 font-medium tracking-tight text-gray-950">
          {title}
        </p>
        <p className="text-sm/5 text-gray-600">{description}</p>
      </div>
    </motion.div>
  )
}

export { BentoCard }