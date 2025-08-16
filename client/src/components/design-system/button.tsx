import React from 'react'
import { Link } from 'wouter'
import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const styles = {
  base: [
    // Base
    'relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border text-base/6 font-semibold',
    // Sizing
    'px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2.5])-1px)] sm:px-[calc(theme(spacing.4)-1px)] sm:py-[calc(theme(spacing.3)-1px)] sm:text-sm/6',
    // Focus
    'focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-blue-500',
    // Disabled
    'data-[disabled]:opacity-50',
    // Icon
    '[&>[data-slot=icon]]:-mx-0.5 [&>[data-slot=icon]]:my-0.5 [&>[data-slot=icon]]:size-5 [&>[data-slot=icon]]:shrink-0 [&>[data-slot=icon]]:text-[--btn-icon] [&>[data-slot=icon]]:sm:my-1 [&>[data-slot=icon]]:sm:size-4 forced-colors:[--btn-icon:ButtonText] forced-colors:data-[hover]:[--btn-icon:ButtonText]',
  ],
  solid: [
    // Optical border, implemented as the button background to avoid edge-case rendering issues
    'border-transparent bg-[--btn-border]',
    // Dark mode: border is rendered on `after` so background is set to button background
    'dark:bg-[--btn-bg]',
    // Button background, implemented as foreground layer to stack on top of pseudo-border layer
    'before:absolute before:inset-0 before:-z-10 before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-[--btn-bg]',
    // Drop shadow, applied to the inset `before` layer so it blends with the border
    'before:shadow',
    // Background color is moved to control and shadow is applied to a `before` pseudo-element so background for `after` is set to button background
    'dark:before:hidden dark:border-white/5 dark:after:absolute dark:after:inset-0 dark:after:-z-10 dark:after:rounded-[calc(theme(borderRadius.lg)-1px)] dark:after:bg-[--btn-bg] dark:after:shadow',
    // Hide default focus styles
    'focus:outline-none',
    // Focus ring, applied to the inset `before` layer so it blends with the border
    'before:focus:outline-none before:focus:ring-2 before:focus:ring-[--btn-border] before:focus:ring-offset-2',
    // Disabled
    'before:disabled:shadow-none before:disabled:outline-none',
    // Dark mode: the focus ring is applied to the `after` layer
    'dark:focus:outline-none dark:after:focus:ring-2 dark:after:focus:ring-[--btn-border] dark:after:focus:ring-offset-2',
  ],
  outline: [
    // Base
    'border-gray-300 text-gray-950 data-[active]:bg-gray-50 data-[hover]:bg-gray-50',
    // Dark mode
    'dark:border-gray-600 dark:text-white dark:[--btn-bg:transparent] dark:data-[active]:bg-gray-800 dark:data-[hover]:bg-gray-800',
    // Icon
    '[--btn-icon:theme(colors.gray.500)] data-[active]:[--btn-icon:theme(colors.gray.700)] data-[hover]:[--btn-icon:theme(colors.gray.700)] dark:[--btn-icon:theme(colors.gray.400)] dark:data-[active]:[--btn-icon:theme(colors.gray.300)] dark:data-[hover]:[--btn-icon:theme(colors.gray.300)]',
  ],
  plain: [
    // Base
    'border-transparent text-gray-950 data-[active]:bg-gray-50 data-[hover]:bg-gray-50',
    // Dark mode
    'dark:text-white dark:data-[active]:bg-gray-800 dark:data-[hover]:bg-gray-800',
    // Icon
    '[--btn-icon:theme(colors.gray.500)] data-[active]:[--btn-icon:theme(colors.gray.700)] data-[hover]:[--btn-icon:theme(colors.gray.700)] dark:[--btn-icon:theme(colors.gray.400)] dark:data-[active]:[--btn-icon:theme(colors.gray.300)] dark:data-[hover]:[--btn-icon:theme(colors.gray.300)]',
  ],
  colors: {
    'dark/zinc': [
      'text-white [--btn-bg:theme(colors.zinc.900)] [--btn-border:theme(colors.zinc.950/90%)] [--btn-icon:theme(colors.zinc.400)]',
      'data-[active]:[--btn-border:theme(colors.zinc.950)] data-[hover]:[--btn-border:theme(colors.zinc.950)]',
      'dark:text-white dark:[--btn-bg:theme(colors.zinc.600)] dark:[--btn-border:theme(colors.zinc.700/90%)] dark:[--btn-icon:theme(colors.zinc.400)]',
      'dark:data-[active]:[--btn-border:theme(colors.zinc.700)] dark:data-[hover]:[--btn-border:theme(colors.zinc.700)]',
    ],
    light: [
      'text-gray-950 [--btn-bg:white] [--btn-border:theme(colors.gray.950/10%)] [--btn-icon:theme(colors.gray.500)] data-[active]:[--btn-border:theme(colors.gray.950/15%)] data-[hover]:[--btn-border:theme(colors.gray.950/15%)]',
      'dark:text-white dark:[--btn-hover-overlay:theme(colors.white/5%)] dark:[--btn-bg:theme(colors.gray.800)] dark:[--btn-border:theme(colors.gray.700/90%)] dark:[--btn-icon:theme(colors.gray.400)] dark:data-[active]:[--btn-border:theme(colors.gray.700)] dark:data-[hover]:[--btn-border:theme(colors.gray.700)]',
    ],
    'dark/white': [
      'text-white [--btn-bg:theme(colors.gray.900)] [--btn-border:theme(colors.gray.950/90%)] [--btn-icon:theme(colors.gray.400)]',
      'data-[active]:[--btn-border:theme(colors.gray.950)] data-[hover]:[--btn-border:theme(colors.gray.950)]',
    ],
  },
}

type ButtonProps = {
  variant?: 'solid' | 'outline' | 'plain'
  color?: keyof typeof styles.colors
  className?: string
} & (
  | (React.ComponentPropsWithoutRef<'button'> & { href?: undefined })
  | (React.ComponentPropsWithoutRef<typeof Link> & { href: string })
)

function Button({
  variant = 'solid',
  color = 'dark/zinc',
  className,
  ...props
}: ButtonProps) {
  let classes = cn(
    styles.base,
    variant === 'solid' && [
      styles.solid,
      styles.colors[color],
    ],
    variant === 'outline' && styles.outline,
    variant === 'plain' && styles.plain,
    className,
  )

  if ('href' in props && props.href) {
    const { href, ...linkProps } = props
    return <Link to={href} className={classes} {...linkProps} />
  }

  return <button {...props} className={classes} />
}

export { Button, type ButtonProps }