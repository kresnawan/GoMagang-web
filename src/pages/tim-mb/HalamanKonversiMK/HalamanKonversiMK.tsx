import { useCallback, useEffect, useState } from 'react'
import { useFetcher, useLoaderData } from 'react-router'
import { Button, ConfirmDialog, FormDialog, FormField, TextInput } from '../../../component'
import { cn } from '../../../component/cn'
import { NAMA_MK_MAX, SKS_MAX, SKS_MIN, type MataKuliahKonversi } from '../../../services/konversiMk'
import { formatWaktu } from '../../HalamanDetailPendaftaran/format'
import { GagalMemuat, PageHeading, TambahButton } from '../components'
import { tableClass as t } from '../table'
import { INTENT, type action, type loader } from './route'

const JUDUL = 'Konversi Mata Kuliah'
const SUBJUDUL = 'Daftar mata kuliah yang dapat dipilih mahasiswa untuk dikonversi dari kegiatan magang.'

/** Pesan error dari action, dipakai semua dialog */
function PesanError({ result }: { result: { ok: false; error: string } | { ok: true } | undefined }) {
  if (!result || result.ok) return null
  return (
    <p role="alert" className="text-red-600">
      {result.error}
    </p>
  )
}

/** Dipasang hanya saat dibuka, sehingga form selalu mulai kosong */
function TambahMkDialog({ onClose }: { onClose: () => void }) {
  const fetcher = useFetcher<typeof action>()
  const isSaving = fetcher.state !== 'idle'
  const result = fetcher.state === 'idle' ? fetcher.data : undefined

  useEffect(() => {
    if (result?.ok) onClose()
  }, [result, onClose])

  return (
    <FormDialog
      open
      title="Tambah Mata Kuliah"
      submitLabel={isSaving ? 'Menambahkan...' : 'Tambah'}
      cancelLabel="Batal"
      loading={isSaving}
      onCancel={onClose}
      onSubmit={(formData) => {
        formData.set('intent', INTENT.tambah)
        fetcher.submit(formData, { method: 'post' })
      }}
    >
      <FormField label="MK Asal" htmlFor="mkAsal">
        <TextInput id="mkAsal" name="mkAsal" required maxLength={NAMA_MK_MAX} placeholder="mis. Pengembangan Antarmuka Web" />
      </FormField>
      <FormField label="MK Konversi" htmlFor="mkKonversi">
        <TextInput id="mkKonversi" name="mkKonversi" required maxLength={NAMA_MK_MAX} placeholder="mis. Pemrograman Web Lanjut" />
      </FormField>
      <FormField label="Bobot SKS" htmlFor="sks">
        <TextInput
          id="sks"
          name="sks"
          type="number"
          required
          min={SKS_MIN}
          max={SKS_MAX}
          step={1}
          inputMode="numeric"
          placeholder="mis. 3"
          className="max-w-32"
        />
      </FormField>
      <PesanError result={result} />
    </FormDialog>
  )
}

/** Konfirmasi menghapus (soft delete) MK. Dipasang hanya saat dibuka */
function HapusMkDialog({ mataKuliah, onClose }: { mataKuliah: MataKuliahKonversi; onClose: () => void }) {
  const fetcher = useFetcher<typeof action>()
  const isSaving = fetcher.state !== 'idle'
  const result = fetcher.state === 'idle' ? fetcher.data : undefined

  useEffect(() => {
    if (result?.ok) onClose()
  }, [result, onClose])

  return (
    <ConfirmDialog
      open
      title="Hapus mata kuliah?"
      confirmLabel={isSaving ? 'Menghapus...' : 'Ya, hapus'}
      cancelLabel="Batal"
      loading={isSaving}
      onCancel={onClose}
      onConfirm={() => fetcher.submit({ intent: INTENT.hapus, id: mataKuliah.id }, { method: 'post' })}
    >
      <p className="font-bold text-brand-900">{mataKuliah.mkKonversi}</p>
      <p className="mb-3 text-sm text-brand-500">
        MK asal: {mataKuliah.mkAsal} · {mataKuliah.sks} SKS
      </p>
      <p className="mb-2">Mata kuliah ini hilang dari katalog dan tidak bisa dipilih lagi oleh mahasiswa.</p>
      <p>
        Mata kuliah yang sudah dipilih mahasiswa tetap tersimpan. Datanya tetap bisa dilihat lewat{' '}
        <strong>Tampilkan mata kuliah yang dihapus</strong>, tapi belum bisa diaktifkan kembali.
      </p>
      <div className="mt-3">
        <PesanError result={result} />
      </div>
    </ConfirmDialog>
  )
}

function TabelAktif({ mataKuliah, onHapus }: { mataKuliah: MataKuliahKonversi[]; onHapus: (mk: MataKuliahKonversi) => void }) {
  return (
    <div className={t.wrapper}>
      <table className={t.table}>
        <thead className={t.thead}>
          <tr>
            <th scope="col" className={cn(t.th, 'w-14')}>No</th>
            <th scope="col" className={t.th}>MK Asal</th>
            <th scope="col" className={t.th}>MK Konversi</th>
            <th scope="col" className={cn(t.th, 'w-16 text-center')}>SKS</th>
            <th scope="col" className={cn(t.th, 'w-0')}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {mataKuliah.map((item, index) => (
            <tr key={item.id}>
              <td className={t.td}>{index + 1}</td>
              <td className={t.td}>{item.mkAsal}</td>
              <td className={t.td}>{item.mkKonversi}</td>
              <td className={cn(t.td, 'text-center')}>{item.sks}</td>
              <td className={cn(t.td, 'whitespace-nowrap')}>
                <Button
                  type="button"
                  variant="outlined"
                  className="border-red-700 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                  onClick={() => onHapus(item)}
                >
                  Hapus
                </Button>
              </td>
            </tr>
          ))}
          {mataKuliah.length === 0 && (
            <tr>
              <td colSpan={5} className={t.empty}>Belum ada mata kuliah konversi.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

/** MK yang sudah dihapus, hanya tampil setelah teks pembukanya diklik */
function BagianDihapus({ mataKuliah }: { mataKuliah: MataKuliahKonversi[] }) {
  const [terbuka, setTerbuka] = useState(false)

  return (
    <section aria-label="Mata kuliah yang dihapus" className="mt-6">
      <button
        type="button"
        aria-expanded={terbuka}
        aria-controls="mk-dihapus"
        onClick={() => setTerbuka((nilai) => !nilai)}
        className="cursor-pointer text-sm font-bold text-brand-500 underline hover:text-brand-700"
      >
        {terbuka ? 'Sembunyikan daftar ini' : `Tampilkan mata kuliah yang dihapus (${mataKuliah.length})`}
      </button>

      {terbuka && (
        <div id="mk-dihapus" className={cn(t.wrapper, 'mt-3')}>
          <table className={t.table}>
            <thead className={t.thead}>
              <tr>
                <th scope="col" className={cn(t.th, 'w-14')}>No</th>
                <th scope="col" className={t.th}>MK Asal</th>
                <th scope="col" className={t.th}>MK Konversi</th>
                <th scope="col" className={cn(t.th, 'w-16 text-center')}>SKS</th>
                <th scope="col" className={t.th}>Dihapus Pada</th>
              </tr>
            </thead>
            <tbody>
              {mataKuliah.map((item, index) => (
                <tr key={item.id} className="text-brand-500">
                  <td className={t.td}>{index + 1}</td>
                  <td className={t.td}>{item.mkAsal}</td>
                  <td className={t.td}>{item.mkKonversi}</td>
                  <td className={cn(t.td, 'text-center')}>{item.sks}</td>
                  <td className={cn(t.td, 'whitespace-nowrap')}>{item.dihapusPada ? `${formatWaktu(item.dihapusPada)} WIB` : '-'}</td>
                </tr>
              ))}
              {mataKuliah.length === 0 && (
                <tr>
                  <td colSpan={5} className={t.empty}>Tidak ada mata kuliah yang dihapus.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export function HalamanKonversiMK() {
  const semua = useLoaderData<typeof loader>()
  const aktif = semua.filter((item) => item.dihapusPada === null)
  const dihapus = semua.filter((item) => item.dihapusPada !== null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [hapus, setHapus] = useState<MataKuliahKonversi | null>(null)
  const closeDialog = useCallback(() => setDialogOpen(false), [])
  const closeHapus = useCallback(() => setHapus(null), [])

  return (
    <>
      <PageHeading title={JUDUL} subtitle={SUBJUDUL} />

      <section aria-label="Daftar mata kuliah konversi" className="rounded-sm border border-brand-300 p-4 sm:p-6">
        <div className="mb-4 flex justify-end">
          <TambahButton onClick={() => setDialogOpen(true)} />
        </div>

        <TabelAktif mataKuliah={aktif} onHapus={setHapus} />
        <BagianDihapus mataKuliah={dihapus} />
      </section>

      {dialogOpen && <TambahMkDialog onClose={closeDialog} />}
      {hapus && <HapusMkDialog key={hapus.id} mataKuliah={hapus} onClose={closeHapus} />}
    </>
  )
}

export function KonversiMKSkeleton() {
  return (
    <>
      <PageHeading title={JUDUL} subtitle={SUBJUDUL} />
      <div className="h-80 animate-pulse rounded-sm bg-brand-100" aria-busy aria-label="Memuat mata kuliah" />
    </>
  )
}

export function KonversiMKError() {
  return (
    <>
      <PageHeading title={JUDUL} />
      <GagalMemuat pesan="Gagal memuat daftar mata kuliah konversi." />
    </>
  )
}
