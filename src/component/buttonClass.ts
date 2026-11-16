import { cn } from './cn'

export type ButtonVariant = 'fill' | 'outlined'

const variants: Record<ButtonVariant, string> = {
  fill: 'border-brand-700 bg-brand-700 text-white hover:border-brand-500 hover:bg-brand-500',
  outlined: 'border-brand-700 bg-white text-brand-700 hover:bg-brand-100',
}

export function buttonClass(variant: ButtonVariant = 'fill', className?: string) {
  return cn(
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-sm border px-8 py-2.5 text-base font-bold outline-none transition-colors',
    'focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2',
    variants[variant],
    'disabled:cursor-not-allowed disabled:border-brand-100 disabled:bg-brand-100 disabled:text-brand-300',
    className,
  )
}
