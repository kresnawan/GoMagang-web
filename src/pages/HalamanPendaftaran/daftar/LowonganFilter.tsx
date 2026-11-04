import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'
import { TextInput } from '../../../component'

const SEARCH_DELAY = 300

/** Pencarian nama posisi. Nilainya disimpan di URL (?q=) lalu dibaca oleh loader */
export function LowonganFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const timerRef = useRef<number>(undefined)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  function apply(value: string) {
    window.clearTimeout(timerRef.current)
    const q = value.trim()
    setSearchParams(q ? { q } : {}, { replace: true })
  }

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        apply(new FormData(event.currentTarget).get('q')?.toString() ?? '')
      }}
    >
      <TextInput
        type="search"
        name="q"
        aria-label="Cari nama posisi"
        placeholder="Cari nama posisi..."
        defaultValue={searchParams.get('q') ?? ''}
        // Ditunda sebentar agar tidak memuat ulang di setiap huruf
        onChange={(event) => {
          const value = event.currentTarget.value
          window.clearTimeout(timerRef.current)
          timerRef.current = window.setTimeout(() => apply(value), SEARCH_DELAY)
        }}
      />
    </form>
  )
}
