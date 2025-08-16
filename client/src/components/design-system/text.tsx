import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function Heading({
  as: Component = 'h1',
  className,
  ...props
}: React.ComponentPropsWithoutRef<'h1'> & {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}) {
  return (
    <Component
      className={cn(
        'text-balance font-display text-4xl font-medium tracking-tight text-gray-950 data-[dark]:text-white sm:text-6xl',
        className,
      )}
      {...props}
    />
  )
}

function Subheading({
  as: Component = 'h2',
  className,
  ...props
}: React.ComponentPropsWithoutRef<'h2'> & {
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}) {
  return (
    <Component
      className={cn(
        'font-display text-2xl font-medium tracking-tight text-gray-950 data-[dark]:text-white sm:text-3xl',
        className,
      )}
      {...props}
    />
  )
}

function Lead({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'p'>) {
  return (
    <p
      className={cn(
        'text-xl/7 text-gray-600 data-[dark]:text-gray-400 sm:text-xl/8',
        className,
      )}
      {...props}
    />
  )
}

export { Heading, Subheading, Lead }