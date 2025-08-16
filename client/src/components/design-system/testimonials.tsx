'use client'

import { motion } from 'framer-motion'
import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Container } from './container'
import { Subheading } from './text'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Testimonial {
  author: {
    name: string
    title: string
    image: string
  }
  body: string
}

interface TestimonialsProps {
  className?: string
  testimonials: Testimonial[]
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial
  index: number
}) {
  return (
    <motion.div
      className="rounded-4xl bg-white p-8 shadow-lg ring-1 ring-black/5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        transition: { duration: 0.2 }
      }}
    >
      <blockquote>
        <p className="text-gray-950 text-lg/7 font-medium mb-6">
          "{testimonial.body}"
        </p>
        <figcaption className="flex items-center gap-x-4">
          <img
            className="h-10 w-10 rounded-full object-cover"
            src={testimonial.author.image}
            alt={testimonial.author.name}
          />
          <div>
            <div className="font-semibold text-gray-950">
              {testimonial.author.name}
            </div>
            <div className="text-gray-600 text-sm">
              {testimonial.author.title}
            </div>
          </div>
        </figcaption>
      </blockquote>
    </motion.div>
  )
}

function Testimonials({ className, testimonials }: TestimonialsProps) {
  return (
    <div className={cn(className, 'py-24 sm:py-32')}>
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Subheading>What loan officers are saying</Subheading>
          </motion.div>
        </div>
        <motion.div
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.author.name}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </motion.div>
      </Container>
    </div>
  )
}

export { Testimonials, type Testimonial }