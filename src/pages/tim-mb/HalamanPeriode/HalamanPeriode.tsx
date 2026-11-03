import { useCallback, useEffect, useState } from 'react'
import { useFetcher, useLoaderData } from 'react-router'
import { FormDialog, FormField, TextInput } from '../../../component'
import { cn } from '../../../component/cn'
import { GagalMemuat, PageHeading, TambahButton } from '../components'
import { formatWaktuPeriode, statusPeriode, type StatusPeriode } from '../periode'
import { tableClass as t } from '../table'
import type { action, loader } from './route'

const JUDUL = 'Periode Pendaftaran'
const SUBJUDUL = 'Rentang waktu mahasiswa dapat mendaftar magang.'

const STATUS_CLASS: Record<StatusPeriode, string> = {
  'Akan datang': 'bg-amber-50 text-amber-800',
  Berjalan: 'bg-green-50 text-green-800',
  Selesai: 'bg-brand-100 text-brand-700',
}

/** Dipasang hanya saat dibuka, sehingga form selalu mulai kosong */
function TambahPeriodeDialog({ onClose }: { onClose: () => void }) {
  const fetcher = useFetcher<typeof action>()
  // Waktu tutup tidak boleh sebelum waktu mulai (dicek juga di action & service)
  const [waktuMulai, setWaktuMulai] = useState('')
  const isSaving = fetcher.state !== 'idle'
  const result = fetcher.state === 'idle' ? fetcher.data : undefined

  useEffect(() => {
    if (result?.ok) onClose()
  }, [result, onClose])

  return (
    <FormDialog
      open
      title="Tambah Periode Pendaftaran"
      submitLabel={isSaving ? 'Menambahkan...' : 'Tambah'}
      cancelLabel="Batal"
      loading={isSaving}
      onCancel={onClose}
      onSubmit={(formData) => fetcher.submit(formData, { method: 'post' })}
    >
      <FormField label="Catatan (opsional)" htmlFor="catatan">
        <TextInput id="catatan" name="catatan" maxLength={255} placeholder="mis. Periode Genap 2026/2027" />
      </FormField>
      <FormField label="Waktu Mulai" htmlFor="waktuMulai">
        <TextInput
          id="waktuMulai"
          name="waktuMulai"
          type="datetime-local"
          required
          value={waktuMulai}
          onChange={(event) => setWaktuMulai(event.target.value)}
        />
      </FormField>
      <FormField label="Waktu Tutup" htmlFor="waktuTutup">
        <TextInput id="waktuTutup" name="waktuTutup" type="datetime-local" required min={waktuMulai || undefined} />
      </FormField>
      {result && !result.ok && (
        <p role="alert" className="text-red-600">
          {result.error}
        </p>
      )}
    </FormDialog>
  )
}

export function HalamanPeriode() {
  const periode = useLoaderData<typeof loader>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const closeDialog = useCallback(() => setDialogOpen(false), [])

  return (
    <>
      <PageHeading title={JUDUL} subtitle={SUBJUDUL} />

      <section aria-label="Daftar periode pendaftaran" className="rounded-sm border border-brand-300 p-4 sm:p-6">
        <div className="mb-4 flex justify-end">
          <TambahButton onClick={() => setDialogOpen(true)} />
        </div>

        {/* Di mobile kolom waktu disembunyikan; rentang waktu tampil di bawah catatan */}
        <div className={t.wrapper}>
          <table className={t.table}>
            <thead className={t.thead}>
              <tr>
                <th scope="col" className={t.th}>Catatan</th>
                <th scope="col" className={cn(t.th, 'hidden md:table-cell')}>Waktu Mulai</th>
                <th scope="col" className={cn(t.th, 'hidden md:table-cell')}>Waktu Tutup</th>
                <th scope="col" className={cn(t.th, 'w-32')}>Status</th>
              </tr>
            </thead>
            <tbody>
              {periode.map((item) => {
                const status = statusPeriode(item)
                return (
                  <tr key={item.id}>
                    <td className={t.td}>
                      {item.catatan ?? <span className="text-brand-500">Tanpa catatan</span>}
                      <span className="block text-sm text-brand-500 md:hidden">
                        {formatWaktuPeriode(item.waktuMulai)} – {formatWaktuPeriode(item.waktuTutup)}
                      </span>
                    </td>
                    <td className={cn(t.td, 'hidden whitespace-nowrap md:table-cell')}>
                      <time dateTime={item.waktuMulai}>{formatWaktuPeriode(item.waktuMulai)}</time>
                    </td>
                    <td className={cn(t.td, 'hidden whitespace-nowrap md:table-cell')}>
                      <time dateTime={item.waktuTutup}>{formatWaktuPeriode(item.waktuTutup)}</time>
                    </td>
                    <td className={t.td}>
                      <span className={cn('inline-block whitespace-nowrap rounded-sm px-2 py-0.5 text-sm font-bold', STATUS_CLASS[status])}>
                        {status}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {periode.length === 0 && (
                <tr>
                  <td colSpan={4} className={t.empty}>Belum ada periode pendaftaran.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {dialogOpen && <TambahPeriodeDialog onClose={closeDialog} />}
    </>
  )
}

export function PeriodeSkeleton() {
  return (
    <>
      <PageHeading title={JUDUL} subtitle={SUBJUDUL} />
      <div className="h-80 animate-pulse rounded-sm bg-brand-100" aria-busy aria-label="Memuat periode" />
    </>
  )
}

export function PeriodeError() {
  return (
    <>
      <PageHeading title={JUDUL} />
      <GagalMemuat pesan="Gagal memuat daftar periode pendaftaran." />
    </>
  )
}
