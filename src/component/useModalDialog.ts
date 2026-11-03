import { useEffect, useRef } from 'react'

/** Sinkronkan prop `open` dengan <dialog> native (showModal/close). Kembalikan ref untuk <dialog> */
export function useModalDialog(open: boolean) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  return dialogRef
}
