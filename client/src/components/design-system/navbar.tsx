'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Logo } from './logo'
import { Button } from './button'
import { Container } from './container'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface NavbarProps {
  banner?: React.ReactNode
  onGetStarted?: () => void
}

function Navbar({ banner, onGetStarted }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {banner && (
        <div className="relative overflow-hidden bg-gray-950 py-3">
          <div className={cn(
            'pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50',
            'animate-[shimmer_3s_ease-in-out_infinite]'
          )} />
          <Container className="text-center">
            {banner}
          </Container>
        </div>
      )}
      
      <Container className="flex items-center justify-between py-6">
        <Logo />
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-x-8">
          <nav className="flex items-center gap-x-8">
            <a href="#features" className="text-sm/6 font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm/6 font-medium text-gray-700 hover:text-gray-900 transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-sm/6 font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Pricing
            </a>
          </nav>
          
          <Button 
            color="dark/zinc" 
            onClick={onGetStarted}
            className="ml-4"
          >
            Get Started
          </Button>
        </div>
        
        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <motion.div
            animate={isMenuOpen ? { rotate: 45 } : { rotate: 0 }}
            className="w-6 h-6 flex flex-col items-center justify-center gap-1"
          >
            <motion.div
              animate={isMenuOpen ? { rotate: 90, y: 3 } : { rotate: 0, y: 0 }}
              className="w-4 h-0.5 bg-gray-700"
            />
            <motion.div
              animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-4 h-0.5 bg-gray-700"
            />
            <motion.div
              animate={isMenuOpen ? { rotate: -90, y: -3 } : { rotate: 0, y: 0 }}
              className="w-4 h-0.5 bg-gray-700"
            />
          </motion.div>
        </button>
      </Container>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-white border-t border-gray-200"
          >
            <Container className="py-6">
              <nav className="flex flex-col gap-y-4">
                <a 
                  href="#features" 
                  className="text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  className="text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How It Works
                </a>
                <a 
                  href="#pricing" 
                  className="text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </a>
                <Button 
                  color="dark/zinc" 
                  onClick={() => {
                    onGetStarted?.()
                    setIsMenuOpen(false)
                  }}
                  className="mt-4 w-full"
                >
                  Get Started
                </Button>
              </nav>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export { Navbar }