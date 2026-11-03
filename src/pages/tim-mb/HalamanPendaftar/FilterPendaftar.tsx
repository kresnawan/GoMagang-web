import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { Button, DropDown, FormField, TextInput } from '../../../component'
import { STATUS_PENDAFTARAN } from '../../../services/pendaftaran'
import { KOLOM_CARI } from '../../../services/pendaftar'
import type { PeriodePendaftaran } from '../../../services/posisiMagang'
import { labelPeriode } from '../periode'
import { PARAM, PARAM_FILTER } from './params'

const SEARCH_DELAY = 300

/** Kata kunci + "Cari berdasarkan" + periode + status. Langsung diterapkan; nilainya disimpan di URL */
export function FilterPendaftar({ periode }: { periode: PeriodePendaftaran[] }) {
  const [searchParams, setSearchParams] = useSearchParams()
  // Ganti key → form dipasang ulang dengan nilai default kosong (untuk tombol Reset)
  const [resetKey, setResetKey] = useState(0)
  const timerRef = useRef<number>(undefined)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  function apply(form: HTMLFormElement) {
    window.clearTimeout(timerRef.current)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        const values = new FormData(form)
        for (const key of PARAM_FILTER) {
          const value = String(values.get(key) ?? '').trim()
          if (value) next.set(key, value)
          else next.delete(key)
        }
        next.delete(PARAM.halaman) // filter baru → kembali ke halaman 1
        return next
      },
      { replace: true },
    )
  }

  function handleChange(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget
    const isTyping = (event.target as HTMLElement).tagName === 'INPUT'
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => apply(form), isTyping ? SEARCH_DELAY : 0)
  }

  function reset() {
    window.clearTimeout(timerRef.current)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const key of [...PARAM_FILTER, PARAM.halaman]) next.delete(key)
        return next
      },
      { replace: true },
    )
    setResetKey((key) => key + 1)
  }

  return (
    <form
      key={resetKey}
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
        name={PARAM.q}
        aria-label="Kata kunci"
        placeholder="Masukkan kata kunci..."
        defaultValue={searchParams.get(PARAM.q) ?? ''}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <FormField label="Cari berdasarkan" htmlFor="filter-cari">
          <DropDown id="filter-cari" name={PARAM.cariBerdasarkan} defaultValue={searchParams.get(PARAM.cariBerdasarkan) ?? 'nama'}>
            {KOLOM_CARI.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </DropDown>
        </FormField>
        <FormField label="Periode" htmlFor="filter-periode">
          <DropDown id="filter-periode" name={PARAM.periode} defaultValue={searchParams.get(PARAM.periode) ?? ''}>
            <option value="">Semua periode</option>
            {periode.map((item) => (
              <option key={item.id} value={item.id}>
                {labelPeriode(item)}
              </option>
            ))}
          </DropDown>
        </FormField>
        <FormField label="Status" htmlFor="filter-status">
          <DropDown id="filter-status" name={PARAM.status} defaultValue={searchParams.get(PARAM.status) ?? ''}>
            <option value="">Semua status</option>
            {STATUS_PENDAFTARAN.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </DropDown>
        </FormField>
        <Button type="button" variant="outlined" className="self-end px-5 py-1.5" onClick={reset}>
          Reset
        </Button>
      </div>
    </form>
  )
}
