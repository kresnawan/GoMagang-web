import type { ComponentProps } from 'react'
import { buttonClass, type ButtonVariant } from './buttonClass'

export type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant
}

export function Button({ className, variant = 'fill', ...props }: ButtonProps) {
  return <button className={buttonClass(variant, className)} {...props} />
}
