import { useId, type ReactNode } from 'react'
import { Button } from './Button'
import { useModalDialog } from './useModalDialog'

export type ConfirmDialogProps = {
  open: boolean
  title: string
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  confirmDisabled?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Ya',
  cancelLabel = 'Batal',
  loading = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useModalDialog(open)
  const titleId = useId()

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        if (!loading) onCancel()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border border-brand-300 bg-white p-6 text-brand-900 shadow-xl backdrop:bg-brand-900/40"
    >
      <h2 id={titleId} className="mb-3 text-h6 text-brand-700">
        {title}
      </h2>
      <div className="mb-6">{children}</div>
      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="outlined" disabled={loading} onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="button" disabled={loading || confirmDisabled} onClick={onConfirm} autoFocus>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
