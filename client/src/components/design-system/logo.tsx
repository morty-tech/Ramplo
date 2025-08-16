'use client'

import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { motion } from 'framer-motion'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function Logo({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        className,
        'flex items-center gap-x-3',
      )}
      {...props}
    >
      <motion.div 
        className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-white font-bold text-sm">R</span>
      </motion.div>
      <motion.span 
        className="font-display text-xl font-bold text-gray-900"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        RampLO
      </motion.span>
    </div>
  )
}

export { Logo }