import type { ComponentProps } from 'react'
import { cn } from './cn'

export type RadioButtonProps = Omit<ComponentProps<'input'>, 'type'>

export function RadioButton({ className, ...props }: RadioButtonProps) {
  return (
    <input
      type="radio"
      className={cn(
        'size-6 shrink-0 cursor-pointer appearance-none rounded-full border-2 border-brand-500 bg-white outline-none transition-colors',
        // Titik dalam: isi brand dengan cincin putih di antaranya
        'checked:bg-brand-500 checked:shadow-[inset_0_0_0_3px_white]',
        'focus-visible:ring-2 focus-visible:ring-brand-300/50 focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:border-brand-300 disabled:bg-brand-100 disabled:checked:bg-brand-300',
        className,
      )}
      {...props}
    />
  )
}
