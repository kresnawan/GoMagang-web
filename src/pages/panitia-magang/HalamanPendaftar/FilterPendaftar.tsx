import { useEffect, useRef, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { DropDown, FormField, TextInput } from '../../../component'
import type { Posisi } from '../../../services/lowongan'
import { idStatus, STATUS_PENDAFTARAN } from '../../../services/pendaftaran'
import type { Periode } from '../../../services/periode'
import type { Perusahaan } from '../../../services/perusahaan'
import { labelPeriode } from '../periode'
import { PARAM, PARAM_FILTER } from './params'

const SEARCH_DELAY = 600

type FilterPendaftarProps = {
  periode: Periode[]
  perusahaan: Perusahaan[]
  posisi: Posisi[]
}

const posisiCocok = (item: Posisi, idPeriode: string | null, idPerusahaan: string | null) =>
  (!idPeriode || String(item.idPeriode) === idPeriode) && (!idPerusahaan || String(item.idPerusahaan) === idPerusahaan)

export function FilterPendaftar({ periode, perusahaan, posisi }: FilterPendaftarProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const timerRef = useRef<number>(undefined)

  const idPeriode = searchParams.get(PARAM.periode)
  const idPerusahaan = searchParams.get(PARAM.perusahaan)
  const grupPosisi = periode
    .map((item) => ({
      periode: item,
      posisi: posisi.filter((p) => p.idPeriode === item.id && posisiCocok(p, idPeriode, idPerusahaan)),
    }))
    .filter((grup) => grup.posisi.length > 0)

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
        const idPosisi = next.get(PARAM.posisi)
        const item = posisi.find((p) => String(p.id) === idPosisi)
        if (idPosisi && !(item && posisiCocok(item, next.get(PARAM.periode), next.get(PARAM.perusahaan)))) {
          next.delete(PARAM.posisi)
        }
        next.delete(PARAM.p)
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
        name={PARAM.s}
        aria-label="Cari berdasarkan nama"
        placeholder="Cari berdasarkan nama..."
        defaultValue={searchParams.get(PARAM.s) ?? ''}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
              <option key={status} value={idStatus(status)}>
                {status}
              </option>
            ))}
          </DropDown>
        </FormField>
        <FormField label="Perusahaan" htmlFor="filter-perusahaan">
          <DropDown id="filter-perusahaan" name={PARAM.perusahaan} defaultValue={searchParams.get(PARAM.perusahaan) ?? ''}>
            <option value="">Semua perusahaan</option>
            {perusahaan.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama}
              </option>
            ))}
          </DropDown>
        </FormField>
        <FormField label="Posisi magang" htmlFor="filter-posisi">
          <DropDown id="filter-posisi" name={PARAM.posisi} defaultValue={searchParams.get(PARAM.posisi) ?? ''}>
            <option value="">Semua posisi</option>
            {grupPosisi.map((grup) => (
              <optgroup key={grup.periode.id} label={labelPeriode(grup.periode)}>
                {grup.posisi.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.posisi} ({item.perusahaan}){item.disembunyikanPada ? ' (disembunyikan)' : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </DropDown>
        </FormField>
      </div>
    </form>
  )
}
