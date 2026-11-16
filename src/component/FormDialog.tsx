import { useId, type FormEvent, type ReactNode } from 'react'
import { Button } from './Button'
import { useModalDialog } from './useModalDialog'

export type FormDialogProps = {
  open: boolean
  title: string
  children: ReactNode
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
  onSubmit: (formData: FormData) => void
  onCancel: () => void
}

export function FormDialog({
  open,
  title,
  children,
  submitLabel = 'Simpan',
  cancelLabel = 'Batal',
  loading = false,
  onSubmit,
  onCancel,
}: FormDialogProps) {
  const dialogRef = useModalDialog(open)
  const titleId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(new FormData(event.currentTarget))
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        if (!loading) onCancel()
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg rounded-sm border border-brand-300 bg-white p-6 text-brand-900 shadow-xl backdrop:bg-brand-900/40"
    >
      <form onSubmit={handleSubmit}>
        <h2 id={titleId} className="mb-5 text-h6 text-brand-700">
          {title}
        </h2>
        <fieldset disabled={loading} className="mb-6 flex flex-col gap-4">
          {children}
        </fieldset>
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outlined" disabled={loading} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="submit" disabled={loading}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </dialog>
  )
}
