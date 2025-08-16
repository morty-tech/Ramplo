'use client'

import { motion } from 'framer-motion'
import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Container } from './container'
import { Logo } from './logo'
import { Button } from './button'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface FooterProps {
  className?: string
  onGetStarted?: () => void
}

function Footer({ className, onGetStarted }: FooterProps) {
  return (
    <footer className={cn(className, 'bg-gray-950')}>
      <Container>
        {/* CTA Section */}
        <div className="py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-4xl font-medium tracking-tight text-white sm:text-5xl">
              Ready to launch your mortgage career?
            </h2>
            <p className="mt-6 text-xl/8 text-gray-300">
              Join loan officers who are already using RampLO to build successful careers
            </p>
            <div className="mt-10 flex justify-center">
              <Button 
                color="light" 
                onClick={onGetStarted}
                className="px-8 py-4 text-lg"
              >
                Start Free Today
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Footer Links */}
        <div className="flex flex-col items-center border-t border-gray-800 py-12 sm:flex-row sm:justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Logo className="text-white" />
          </motion.div>
          
          <motion.p 
            className="mt-6 text-sm text-gray-400 sm:mt-0"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            AI-powered 90-day training for mortgage loan officers
          </motion.p>
        </div>
      </Container>
    </footer>
  )
}

export { Footer }