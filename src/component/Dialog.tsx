import { useId, type ReactNode } from 'react'
import { Button } from './Button'
import { cn } from './cn'
import { useModalDialog } from './useModalDialog'

export type DialogProps = {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  closeLabel?: string
  className?: string
}

export function Dialog({ open, title, children, onClose, closeLabel = 'Tutup', className }: DialogProps) {
  const dialogRef = useModalDialog(open)
  const titleId = useId()

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      className={cn(
        'm-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg rounded-sm border border-brand-300 bg-white p-0 text-brand-900 shadow-xl backdrop:bg-brand-900/40',
        className,
      )}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <h2 id={titleId} className="border-b border-brand-300 px-6 py-4 text-h6 text-brand-700">
          {title}
        </h2>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        <div className="flex justify-end border-t border-brand-300 px-6 py-4">
          <Button type="button" variant="outlined" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
