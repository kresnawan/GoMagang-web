import type { ComponentProps } from 'react'
import { cn } from './cn'

export type TextInputProps = ComponentProps<'input'>

export function TextInput({ className, type = 'text', ...props }: TextInputProps) {
  return (
    <input
      type={type}
      className={cn(
        'w-full rounded-sm border border-brand-300 bg-white px-3 py-1.5 text-base text-brand-900 outline-none transition-colors',
        'placeholder:text-brand-300',
        'focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-300/50',
        'disabled:cursor-not-allowed disabled:bg-brand-200 disabled:text-brand-300',
        'aria-invalid:border-red-500',
        className,
      )}
      {...props}
    />
  )
}
