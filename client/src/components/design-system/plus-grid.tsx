import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function PlusGrid({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        className,
        'pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_center,white_10%,transparent_70%)] lg:[mask-image:radial-gradient(circle_at_center,white_30%,transparent_70%)]',
      )}
      {...props}
    >
      <PlusGridRow>
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem offset />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem offset />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem offset />
        <PlusGridItem />
        <PlusGridItem />
      </PlusGridRow>
      <PlusGridRow>
        <PlusGridItem />
        <PlusGridItem offset />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem offset />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem offset />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem />
      </PlusGridRow>
      <PlusGridRow>
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem offset />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem offset />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem offset />
        <PlusGridItem />
        <PlusGridItem />
      </PlusGridRow>
      <PlusGridRow>
        <PlusGridItem />
        <PlusGridItem offset />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem offset />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem offset />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem />
      </PlusGridRow>
      <PlusGridRow>
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem offset />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem offset />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem offset />
        <PlusGridItem />
        <PlusGridItem />
      </PlusGridRow>
      <PlusGridRow>
        <PlusGridItem />
        <PlusGridItem offset />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem offset />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem offset />
        <PlusGridItem />
        <PlusGridItem />
        <PlusGridItem />
      </PlusGridRow>
    </div>
  )
}

function PlusGridRow({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        'grid grid-cols-[repeat(13,minmax(0,1fr))] items-center gap-x-8',
        className,
      )}
      {...props}
    />
  )
}

function PlusGridItem({
  className,
  offset = false,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { offset?: boolean }) {
  return (
    <div
      className={cn(
        'h-8 w-8',
        offset && 'translate-x-[50%]',
        className,
      )}
      {...props}
    >
      <PlusIcon />
    </div>
  )
}

export function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  )
}