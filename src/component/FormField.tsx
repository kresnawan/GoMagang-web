import type { ReactNode } from 'react'
import { cn } from './cn'

export type FormFieldProps = {
  label: string
  htmlFor?: string
  group?: boolean
  className?: string
  children: ReactNode
}

const labelClass = 'mb-1.5 block font-bold text-brand-700'

export function FormField({ label, htmlFor, group, className, children }: FormFieldProps) {
  if (group) {
    return (
      <fieldset className={cn('min-w-0', className)}>
        <legend className={labelClass}>{label}</legend>
        {children}
      </fieldset>
    )
  }

  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
    </div>
  )
}
