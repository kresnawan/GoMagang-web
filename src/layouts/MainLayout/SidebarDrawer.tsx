import { useEffect, useRef } from 'react'
import { Sidebar } from './Sidebar'
import type { MenuItem } from './menu'

export type SidebarDrawerProps = {
  items: MenuItem[]
  homePath: string
  open: boolean
  onClose: () => void
}

/** Sidebar versi mobile & tablet: <dialog> modal yang muncul dari kiri */
export function SidebarDrawer({ items, homePath, open, onClose }: SidebarDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  // Tutup otomatis jika layar dilebarkan ke ukuran desktop
  useEffect(() => {
    if (!open) return
    const desktop = window.matchMedia('(min-width: 64rem)')
    const handleChange = () => desktop.matches && onClose()
    desktop.addEventListener('change', handleChange)
    return () => desktop.removeEventListener('change', handleChange)
  }, [open, onClose])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // Klik di backdrop (di luar isi drawer) menutup drawer
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="m-0 h-dvh max-h-none w-72 max-w-[85vw] -translate-x-full border-0 p-0 shadow-xl transition-all transition-discrete duration-200 open:translate-x-0 starting:open:-translate-x-full backdrop:bg-brand-900/40 lg:hidden"
    >
      <Sidebar items={items} homePath={homePath} onNavigate={onClose} />
    </dialog>
  )
}
