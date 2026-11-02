import type { ReactNode } from 'react'
import type { PendaftaranDetail } from '../../services/pendaftaran'
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
              <li key={berkas.jenis}>
                <p className="text-sm text-brand-500">{berkas.jenis}</p>
                <p className="break-all">
                  {berkas.nama} <span className="text-sm text-brand-500">({formatUkuran(berkas.ukuran)})</span>
                </p>
              </li>
            ))}
          </ul>
        </Field>
      </dl>
    </section>
  )
}
