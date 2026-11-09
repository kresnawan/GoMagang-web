import { useState, type ReactNode } from 'react'
import { Button } from '../../component'
import { unduhBerkas } from '../../services/berkas'
import { pesanError } from '../../services/http'
import type { BerkasPendaftaran, PendaftaranDetail } from '../../services/pendaftaran'
import { formatTanggal, formatUkuran } from './format'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="mb-1.5 font-bold text-brand-700">{label}</dt>
      <dd className="rounded-sm border border-brand-300 px-3 py-1.5 text-brand-900">{children}</dd>
    </div>
  )
}

/** Section kiri: data pendaftaran (read-only) */
export function DetailPendaftaran({ pendaftaran }: { pendaftaran: PendaftaranDetail }) {
  return (
    <section aria-label="Detail pendaftaran" className="rounded-sm border border-brand-300 p-5 sm:p-6">
      <dl className="flex flex-col gap-5">
        <Field label="Perusahaan">{pendaftaran.perusahaan}</Field>
        <Field label="Posisi">{pendaftaran.posisi}</Field>
        <Field label="Tanggal Diajukan">
          <time dateTime={pendaftaran.diajukanPada}>{formatTanggal(pendaftaran.diajukanPada)}</time>
        </Field>
        <Field label="Berkas yang Diunggah">
          <ul className="flex flex-col gap-3 py-1.5">
            {pendaftaran.berkas.map((berkas) => (
              <ItemBerkas key={berkas.id} berkas={berkas} />
            ))}
          </ul>
        </Field>
      </dl>
    </section>
  )
}

function ItemBerkas({ berkas }: { berkas: BerkasPendaftaran }) {
  const [mengunduh, setMengunduh] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUnduh() {
    setMengunduh(true)
    setError(null)
    try {
      await unduhBerkas(berkas)
    } catch (err) {
      setError(pesanError(err, 'Gagal mengunduh berkas. Coba lagi.'))
    } finally {
      setMengunduh(false)
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <div className="min-w-0 flex-1 basis-40">
        <p className="text-sm text-brand-500">{berkas.jenis}</p>
        <p className="break-all">
          {berkas.nama} <span className="text-sm text-brand-500">({formatUkuran(berkas.ukuran)})</span>
        </p>
      </div>
      <Button
        type="button"
        variant="outlined"
        className="px-3 py-1.5 text-sm"
        onClick={handleUnduh}
        disabled={mengunduh}
        aria-label={`Unduh ${berkas.jenis}`}
      >
        {mengunduh ? 'Mengunduh…' : 'Unduh'}
      </Button>
      {error && (
        <p role="alert" className="w-full text-sm text-red-600">
          {error}
        </p>
      )}
    </li>
  )
}
