import { useCallback, useEffect, useState } from 'react'
import { useFetcher, useLoaderData } from 'react-router'
import { Button, ConfirmDialog, FormDialog, FormField, TextInput } from '../../../component'
import { cn } from '../../../component/cn'
import { NAMA_PERUSAHAAN_MAX, type Perusahaan } from '../../../services/perusahaan'
import { formatWaktu } from '../../HalamanDetailPendaftaran/format'
import { GagalMemuat, PageHeading, TambahButton } from '../components'
import { tableClass as t } from '../table'
import { INTENT, type action, type loader } from './route'

const JUDUL = 'Perusahaan Mitra'
const SUBJUDUL = 'Daftar perusahaan tempat mahasiswa dapat magang.'

function PesanError({ result }: { result: { ok: false; error: string } | { ok: true } | undefined }) {
  if (!result || result.ok) return null
  return (
    <p role="alert" className="text-red-600">
      {result.error}
    </p>
  )
}

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
      onSubmit={(formData) => {
        formData.set('intent', INTENT.tambah)
        fetcher.submit(formData, { method: 'post' })
      }}
    >
      <FormField label="Nama Perusahaan" htmlFor="namaPerusahaan">
        <TextInput id="namaPerusahaan" name="namaPerusahaan" required maxLength={NAMA_PERUSAHAAN_MAX} placeholder="mis. PT Nusantara Digital" />
      </FormField>
      <PesanError result={result} />
    </FormDialog>
  )
}

function UbahNamaDialog({ perusahaan, onClose }: { perusahaan: Perusahaan; onClose: () => void }) {
  const fetcher = useFetcher<typeof action>()
  const isSaving = fetcher.state !== 'idle'
  const result = fetcher.state === 'idle' ? fetcher.data : undefined

  useEffect(() => {
    if (result?.ok) onClose()
  }, [result, onClose])

  return (
    <FormDialog
      open
      title="Ubah Nama Perusahaan"
      submitLabel={isSaving ? 'Menyimpan...' : 'Simpan'}
      cancelLabel="Batal"
      loading={isSaving}
      onCancel={onClose}
      onSubmit={(formData) => {
        formData.set('intent', INTENT.ubahNama)
        formData.set('id', String(perusahaan.id))
        fetcher.submit(formData, { method: 'post' })
      }}
    >
      <p className="text-sm text-brand-700">
        Nama baru ikut tampil di semua posisi magang dan pendaftaran perusahaan ini.
      </p>
      <FormField label="Nama Perusahaan" htmlFor="namaPerusahaan">
        <TextInput id="namaPerusahaan" name="namaPerusahaan" required maxLength={NAMA_PERUSAHAAN_MAX} defaultValue={perusahaan.nama} autoFocus />
      </FormField>
      <PesanError result={result} />
    </FormDialog>
  )
}

function SembunyikanDialog({ perusahaan, onClose }: { perusahaan: Perusahaan; onClose: () => void }) {
  const fetcher = useFetcher<typeof action>()
  const isSaving = fetcher.state !== 'idle'
  const result = fetcher.state === 'idle' ? fetcher.data : undefined

  useEffect(() => {
    if (result?.ok) onClose()
  }, [result, onClose])

  return (
    <ConfirmDialog
      open
      title="Hapus perusahaan mitra?"
      confirmLabel={isSaving ? 'Memproses...' : 'Ya, hapus'}
      cancelLabel="Batal"
      loading={isSaving}
      onCancel={onClose}
      onConfirm={() => fetcher.submit({ intent: INTENT.sembunyikan, id: perusahaan.id }, { method: 'post' })}
    >
      <p className="mb-3 font-bold text-brand-900">{perusahaan.nama}</p>
      <p className="mb-2">
        Perusahaan ini disembunyikan dari daftar dan tidak bisa dipilih untuk posisi baru. Posisi magangnya ikut hilang dari
        katalog dan tidak bisa didaftar lagi.
      </p>
      <p>
        Pendaftaran yang sudah masuk tetap ada dan tetap bisa diproses. Datanya tetap bisa dilihat lewat{' '}
        <strong>Tampilkan perusahaan yang disembunyikan</strong>, tapi belum bisa diaktifkan kembali.
      </p>
      <div className="mt-3">
        <PesanError result={result} />
      </div>
    </ConfirmDialog>
  )
}

type Operasi = { intent: typeof INTENT.ubahNama | typeof INTENT.sembunyikan; perusahaan: Perusahaan }

function TabelAktif({ perusahaan, onPilih }: { perusahaan: Perusahaan[]; onPilih: (operasi: Operasi) => void }) {
  return (
    <div className={t.wrapper}>
      <table className={t.table}>
        <thead className={t.thead}>
          <tr>
            <th scope="col" className={cn(t.th, 'w-14')}>No</th>
            <th scope="col" className={t.th}>Nama Perusahaan</th>
            <th scope="col" className={cn(t.th, 'w-0')}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {perusahaan.map((item, index) => (
            <tr key={item.id}>
              <td className={t.td}>{index + 1}</td>
              <td className={t.td}>{item.nama}</td>
              <td className={cn(t.td, 'whitespace-nowrap')}>
                <div className="flex gap-2">
                  <Button type="button" variant="outlined" className="px-3 py-1.5 text-sm" onClick={() => onPilih({ intent: INTENT.ubahNama, perusahaan: item })}>
                    Ubah nama
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    className="border-red-700 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                    onClick={() => onPilih({ intent: INTENT.sembunyikan, perusahaan: item })}
                  >
                    Hapus
                  </Button>
                </div>
              </td>
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
  )
}

function BagianDisembunyikan({ perusahaan }: { perusahaan: Perusahaan[] }) {
  const [terbuka, setTerbuka] = useState(false)

  return (
    <section aria-label="Perusahaan yang disembunyikan" className="mt-6">
      <button
        type="button"
        aria-expanded={terbuka}
        aria-controls="perusahaan-disembunyikan"
        onClick={() => setTerbuka((nilai) => !nilai)}
        className="cursor-pointer text-sm font-bold text-brand-500 underline hover:text-brand-700"
      >
        {terbuka ? 'Sembunyikan daftar ini' : `Tampilkan perusahaan yang disembunyikan (${perusahaan.length})`}
      </button>

      {terbuka && (
        <div id="perusahaan-disembunyikan" className={cn(t.wrapper, 'mt-3')}>
          <table className={t.table}>
            <thead className={t.thead}>
              <tr>
                <th scope="col" className={cn(t.th, 'w-14')}>No</th>
                <th scope="col" className={t.th}>Nama Perusahaan</th>
                <th scope="col" className={t.th}>Disembunyikan Pada</th>
              </tr>
            </thead>
            <tbody>
              {perusahaan.map((item, index) => (
                <tr key={item.id} className="text-brand-500">
                  <td className={t.td}>{index + 1}</td>
                  <td className={t.td}>{item.nama}</td>
                  <td className={cn(t.td, 'whitespace-nowrap')}>{item.disembunyikanPada ? `${formatWaktu(item.disembunyikanPada)} WIB` : '-'}</td>
                </tr>
              ))}
              {perusahaan.length === 0 && (
                <tr>
                  <td colSpan={3} className={t.empty}>Tidak ada perusahaan yang disembunyikan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export function HalamanPerusahaan() {
  const semua = useLoaderData<typeof loader>()
  const aktif = semua.filter((item) => item.disembunyikanPada === null)
  const disembunyikan = semua.filter((item) => item.disembunyikanPada !== null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [operasi, setOperasi] = useState<Operasi | null>(null)
  const closeDialog = useCallback(() => setDialogOpen(false), [])
  const closeOperasi = useCallback(() => setOperasi(null), [])

  return (
    <>
      <PageHeading title={JUDUL} subtitle={SUBJUDUL} />

      <section aria-label="Daftar perusahaan mitra" className="rounded-sm border border-brand-300 p-4 sm:p-6">
        <div className="mb-4 flex justify-end">
          <TambahButton onClick={() => setDialogOpen(true)} />
        </div>

        <TabelAktif perusahaan={aktif} onPilih={setOperasi} />
        <BagianDisembunyikan perusahaan={disembunyikan} />
      </section>

      {dialogOpen && <TambahPerusahaanDialog onClose={closeDialog} />}
      {operasi?.intent === INTENT.ubahNama && <UbahNamaDialog key={operasi.perusahaan.id} perusahaan={operasi.perusahaan} onClose={closeOperasi} />}
      {operasi?.intent === INTENT.sembunyikan && <SembunyikanDialog key={operasi.perusahaan.id} perusahaan={operasi.perusahaan} onClose={closeOperasi} />}
    </>
  )
}

export function PerusahaanSkeleton() {
  return (
    <>
      <PageHeading title={JUDUL} subtitle={SUBJUDUL} />
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
