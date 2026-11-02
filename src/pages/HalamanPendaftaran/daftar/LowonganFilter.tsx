import { useEffect, useRef, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { DropDown, TextInput } from '../../../component'
import { BIDANG, LOKASI, SISTEM_KERJA, URUTAN } from '../../../services/lowongan'

const SEARCH_DELAY = 300

/** Pencarian & filter. Nilainya disimpan di URL (?q=&bidang=...) lalu dibaca oleh loader */
export function LowonganFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const timerRef = useRef<number>(undefined)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  function apply(form: HTMLFormElement) {
    window.clearTimeout(timerRef.current)
    const params = new URLSearchParams()
    for (const [key, value] of new FormData(form)) {
      if (typeof value === 'string' && value.trim()) params.set(key, value.trim())
    }
    setSearchParams(params, { replace: true })
  }

  function handleChange(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget
    // Ketikan di kolom pencarian ditunda sebentar agar tidak memuat ulang di setiap huruf
    const isTyping = (event.target as HTMLElement).tagName === 'INPUT'
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => apply(form), isTyping ? SEARCH_DELAY : 0)
  }

  return (
    <form
      role="search"
      onChange={handleChange}
      onSubmit={(event) => {
        event.preventDefault()
        apply(event.currentTarget)
      }}
      className="flex flex-col gap-3"
    >
      <TextInput
        type="search"
        name="q"
        aria-label="Cari posisi atau perusahaan"
        placeholder="Cari posisi atau perusahaan..."
        defaultValue={searchParams.get('q') ?? ''}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <DropDown name="bidang" aria-label="Bidang" defaultValue={searchParams.get('bidang') ?? ''}>
          <option value="">Semua bidang</option>
          {BIDANG.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </DropDown>
        <DropDown name="lokasi" aria-label="Lokasi" defaultValue={searchParams.get('lokasi') ?? ''}>
          <option value="">Semua lokasi</option>
          {LOKASI.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </DropDown>
        <DropDown name="sistemKerja" aria-label="Sistem kerja" defaultValue={searchParams.get('sistemKerja') ?? ''}>
          <option value="">Semua sistem</option>
          {SISTEM_KERJA.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </DropDown>
        <DropDown name="urutkan" aria-label="Urutkan" defaultValue={searchParams.get('urutkan') ?? ''}>
          <option value="">Terbaru</option>
          {URUTAN.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </DropDown>
      </div>
    </form>
  )
}
