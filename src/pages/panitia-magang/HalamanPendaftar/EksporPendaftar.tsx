import { isAxiosError } from 'axios'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../component'
import { pesanError } from '../../../services/http'
import { eksporPendaftar, FORMAT_EKSPOR, MAX_EKSPOR, type FormatEkspor } from '../../../services/pendaftar'

function pesanGagal(err: unknown) {
  if (isAxiosError(err) && err.response?.status === 404) {
    return 'Ada pendaftar yang tidak ditemukan. Muat ulang halaman lalu coba lagi.'
  }
  return pesanError(err, 'Gagal mengekspor data. Coba lagi.')
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function EksporPendaftar({ idPendaftar }: { idPendaftar: number[] }) {
  const [open, setOpen] = useState(false)
  const [mengekspor, setMengekspor] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const alasan =
    idPendaftar.length === 0
      ? 'Pilih pendaftar terlebih dahulu.'
      : idPendaftar.length > MAX_EKSPOR
        ? `Maksimal ${MAX_EKSPOR.toLocaleString('id-ID')} pendaftar dalam satu ekspor.`
        : null

  useEffect(() => {
    if (!open || mengekspor) return
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
  }, [open, mengekspor])

  async function ekspor(format: FormatEkspor) {
    setMengekspor(true)
    setError(null)
    try {
      await eksporPendaftar(idPendaftar, format)
      setOpen(false)
    } catch (err) {
      setError(pesanGagal(err))
    } finally {
      setMengekspor(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="outlined"
        className="px-4 py-2 text-sm"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={alasan !== null}
        title={alasan ?? undefined}
        onClick={() => {
          setOpen((prev) => !prev)
          setError(null)
        }}
      >
        Ekspor sebagai
        <ChevronIcon />
      </Button>

      {open && alasan === null && (
        <div
          role="menu"
          aria-label="Format ekspor"
          className="absolute right-0 top-full z-10 mt-2 min-w-48 rounded-lg border border-brand-300 bg-white p-1 shadow-lg"
        >
          {FORMAT_EKSPOR.map(({ format, label }) => (
            <button
              key={format}
              type="button"
              role="menuitem"
              onClick={() => ekspor(format)}
              disabled={mengekspor}
              className="flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-left text-sm text-brand-700 outline-none hover:bg-brand-100 focus-visible:bg-brand-100 disabled:cursor-wait disabled:opacity-60"
            >
              {mengekspor ? 'Mengekspor…' : label}
            </button>
          ))}
          <p className="px-3 pb-1.5 pt-1 text-xs text-brand-500">{idPendaftar.length} pendaftar terpilih</p>
          {error && (
            <p role="alert" className="max-w-64 px-3 pb-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
