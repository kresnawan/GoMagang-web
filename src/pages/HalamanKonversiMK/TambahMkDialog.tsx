import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { ConfirmDialog, RadioButton, TextInput } from '../../component'
import { cn } from '../../component/cn'
import type { MataKuliahKonversi } from '../../services/konversiMk'
import type { action } from './route'

export type TambahMkDialogProps = {
  open: boolean
  onClose: () => void
  idPendaftaran: string
  mataKuliah: MataKuliahKonversi[]
  /** id MK yang sudah ada di tabel; ditampilkan tapi tidak bisa dipilih */
  idSudahDipilih: ReadonlySet<string>
}

/** Dialog pilih 1 MK + pencarian. Isi dirender ulang setiap dialog dibuka agar pilihan & pencarian bersih */
export function TambahMkDialog({ open, onClose, idPendaftaran, mataKuliah, idSudahDipilih }: TambahMkDialogProps) {
  const fetcher = useFetcher<typeof action>()
  const [cari, setCari] = useState('')
  const [dipilih, setDipilih] = useState<string | null>(null)

  const isSaving = fetcher.state !== 'idle'
  const error = fetcher.state === 'idle' && fetcher.data && !fetcher.data.ok ? fetcher.data.error : null

  // Berhasil tersimpan: tutup dialog (tabel ikut terbarui lewat revalidasi loader)
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.ok) onClose()
  }, [fetcher.state, fetcher.data, onClose])

  const kataKunci = cari.trim().toLowerCase()
  const hasil = mataKuliah.filter(
    (mk) => mk.mkAsal.toLowerCase().includes(kataKunci) || mk.mkKonversi.toLowerCase().includes(kataKunci),
  )

  return (
    <ConfirmDialog
      open={open}
      title="Tambah Mata Kuliah"
      confirmLabel={isSaving ? 'Menambahkan...' : 'Tambah'}
      cancelLabel="Batal"
      loading={isSaving}
      confirmDisabled={dipilih === null}
      onCancel={onClose}
      onConfirm={() =>
        dipilih &&
        fetcher.submit({ intent: 'tambah', idPendaftaran, idMataKuliah: dipilih }, { method: 'post' })
      }
    >
      <TextInput
        type="search"
        aria-label="Cari mata kuliah"
        placeholder="Cari mata kuliah..."
        value={cari}
        onChange={(event) => setCari(event.target.value)}
        className="mb-3"
      />

      <fieldset>
        <legend className="sr-only">Mata kuliah tersedia</legend>
        <ul className="max-h-72 overflow-y-auto rounded-sm border border-brand-300">
          {hasil.map((mk) => {
            const sudah = idSudahDipilih.has(mk.id)
            return (
              <li key={mk.id} className="border-b border-brand-300 last:border-b-0">
                <label
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 transition-colors',
                    sudah ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-brand-50',
                    dipilih === mk.id && 'bg-brand-100',
                  )}
                >
                  <RadioButton
                    name="mataKuliah"
                    value={mk.id}
                    checked={dipilih === mk.id}
                    disabled={sudah}
                    onChange={() => setDipilih(mk.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-brand-900">{mk.mkKonversi}</span>
                    <span className="block text-sm text-brand-500">
                      MK asal: {mk.mkAsal}
                      {sudah && ' · Sudah ditambahkan'}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm text-brand-700">{mk.sks} SKS</span>
                </label>
              </li>
            )
          })}
          {hasil.length === 0 && <li className="px-3 py-6 text-center text-brand-500">Mata kuliah tidak ditemukan.</li>}
        </ul>
      </fieldset>

      {error && (
        <p role="alert" className="mt-3 text-red-600">
          {error}
        </p>
      )}
    </ConfirmDialog>
  )
}
