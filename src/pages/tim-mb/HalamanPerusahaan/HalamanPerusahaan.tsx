import { useCallback, useEffect, useState } from 'react'
import { useFetcher, useLoaderData } from 'react-router'
import { FormDialog, FormField, TextInput } from '../../../component'
import { cn } from '../../../component/cn'
import { GagalMemuat, PageHeading, TambahButton } from '../components'
import { tableClass as t } from '../table'
import type { action, loader } from './route'

const JUDUL = 'Perusahaan Mitra'

/** Dipasang hanya saat dibuka, sehingga form selalu mulai kosong */
function TambahPerusahaanDialog({ onClose }: { onClose: () => void }) {
  const fetcher = useFetcher<typeof action>()
  const isSaving = fetcher.state !== 'idle'
  const result = fetcher.state === 'idle' ? fetcher.data : undefined

  useEffect(() => {
    if (result?.ok) onClose()
  }, [result, onClose])

  return (
    <FormDialog
      open
      title="Tambah Perusahaan Mitra"
      submitLabel={isSaving ? 'Menambahkan...' : 'Tambah'}
      cancelLabel="Batal"
      loading={isSaving}
      onCancel={onClose}
      onSubmit={(formData) => fetcher.submit(formData, { method: 'post' })}
    >
      <FormField label="Nama Perusahaan" htmlFor="namaPerusahaan">
        <TextInput id="namaPerusahaan" name="namaPerusahaan" required maxLength={255} placeholder="mis. PT Nusantara Digital" />
      </FormField>
      {result && !result.ok && (
        <p role="alert" className="text-red-600">
          {result.error}
        </p>
      )}
    </FormDialog>
  )
}

export function HalamanPerusahaan() {
  const perusahaan = useLoaderData<typeof loader>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const closeDialog = useCallback(() => setDialogOpen(false), [])

  return (
    <>
      <PageHeading title={JUDUL} subtitle="Daftar perusahaan tempat mahasiswa dapat magang." />

      <section aria-label="Daftar perusahaan mitra" className="rounded-sm border border-brand-300 p-4 sm:p-6">
        <div className="mb-4 flex justify-end">
          <TambahButton onClick={() => setDialogOpen(true)} />
        </div>

        <div className={t.wrapper}>
          <table className={t.table}>
            <thead className={t.thead}>
              <tr>
                <th scope="col" className={cn(t.th, 'w-14')}>No</th>
                <th scope="col" className={t.th}>Nama Perusahaan</th>
                <th scope="col" className={cn(t.th, 'w-36 whitespace-nowrap text-center')}>Jumlah Posisi</th>
              </tr>
            </thead>
            <tbody>
              {perusahaan.map((item, index) => (
                <tr key={item.id}>
                  <td className={t.td}>{index + 1}</td>
                  <td className={t.td}>{item.nama}</td>
                  <td className={cn(t.td, 'text-center')}>{item.jumlahPosisi}</td>
                </tr>
              ))}
              {perusahaan.length === 0 && (
                <tr>
                  <td colSpan={3} className={t.empty}>Belum ada perusahaan mitra.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {dialogOpen && <TambahPerusahaanDialog onClose={closeDialog} />}
    </>
  )
}

export function PerusahaanSkeleton() {
  return (
    <>
      <PageHeading title={JUDUL} subtitle="Daftar perusahaan tempat mahasiswa dapat magang." />
      <div className="h-80 animate-pulse rounded-sm bg-brand-100" aria-busy aria-label="Memuat perusahaan" />
    </>
  )
}

export function PerusahaanError() {
  return (
    <>
      <PageHeading title={JUDUL} />
      <GagalMemuat pesan="Gagal memuat daftar perusahaan mitra." />
    </>
  )
}
