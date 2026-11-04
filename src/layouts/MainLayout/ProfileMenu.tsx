import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { logout } from '../../services/auth'
import { pesanError } from '../../services/http'
import { LogoutIcon, UserIcon } from './icons'

/** Avatar profil (mockup) dengan dialog kecil berisi Logout */
export function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)

  // Tutup saat klik di luar menu atau tekan Escape
  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  async function handleLogout() {
    setLoggingOut(true)
    setError(null)
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      setError(pesanError(err, 'Logout gagal. Coba lagi.'))
      setLoggingOut(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Menu profil"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen((prev) => !prev)
          setError(null)
        }}
        className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-brand-100 text-brand-500 outline-none transition-colors hover:bg-brand-300/40 focus-visible:ring-2 focus-visible:ring-brand-300"
      >
        <UserIcon />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-2 min-w-40 rounded-lg border border-brand-300 bg-white p-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-brand-700 outline-none hover:bg-brand-100 focus-visible:bg-brand-100 disabled:cursor-wait disabled:opacity-60"
          >
            <LogoutIcon />
            {loggingOut ? 'Keluar…' : 'Logout'}
          </button>
          {error && (
            <p role="alert" className="max-w-56 px-3 pb-2 pt-1 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
