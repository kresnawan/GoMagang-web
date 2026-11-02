import type { ComponentProps } from 'react'
import { cn } from './cn'

export type DropDownProps = ComponentProps<'select'>

export function DropDown({ className, ...props }: DropDownProps) {
  return (
    <select
      className={cn(
        'select-arrow w-full cursor-pointer appearance-none rounded-sm border border-brand-300 bg-white py-1.5 pl-3 pr-10 text-base text-brand-900 outline-none transition-colors',
        'focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-300/50',
        'disabled:cursor-not-allowed disabled:bg-brand-200 disabled:text-brand-300',
        'aria-invalid:border-red-500',
        className,
      )}
      {...props}
    />
  )
}
