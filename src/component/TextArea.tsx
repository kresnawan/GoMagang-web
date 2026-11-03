import type { ComponentProps } from 'react'
import { cn } from './cn'

export type TextAreaProps = ComponentProps<'textarea'>

/** Versi multi-baris dari TextInput, gaya mengikuti guideline input */
export function TextArea({ className, rows = 4, ...props }: TextAreaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(
        'block w-full resize-y rounded-sm border border-brand-300 bg-white px-3 py-1.5 text-base text-brand-900 outline-none transition-colors',
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
