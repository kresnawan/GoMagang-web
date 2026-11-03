import { useEffect, useRef, type ComponentProps, type Ref } from 'react'
import { cn } from './cn'

export type CheckboxProps = Omit<ComponentProps<'input'>, 'type'> & {
  /** Keadaan "sebagian terpilih" (strip), mis. untuk checkbox Pilih semua */
  indeterminate?: boolean
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value)
  else if (ref) ref.current = value
}

/** Checkbox native dengan gaya mengikuti RadioButton di guideline */
export function Checkbox({ className, indeterminate = false, ref, ...props }: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  // `indeterminate` hanya bisa diatur lewat properti DOM, bukan atribut HTML
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <input
      ref={(node) => {
        inputRef.current = node
        assignRef(ref, node)
      }}
      type="checkbox"
      className={cn(
        'checkbox-mark size-5 shrink-0 cursor-pointer appearance-none rounded-sm border-2 border-brand-500 bg-white outline-none transition-colors',
        'checked:bg-brand-500 indeterminate:bg-brand-500',
        'focus-visible:ring-2 focus-visible:ring-brand-300/50 focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:border-brand-300 disabled:bg-brand-100 disabled:checked:bg-brand-300',
        className,
      )}
      {...props}
    />
  )
}
