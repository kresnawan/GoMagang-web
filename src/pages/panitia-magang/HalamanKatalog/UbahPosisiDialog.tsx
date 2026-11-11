import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { ConfirmDialog, FormDialog, FormField, TextArea, TextInput } from '../../../component'
import { NAMA_POSISI_MAX, type Posisi } from '../../../services/lowongan'
import { INTENT, type action } from './route'

function PesanError({ error }: { error: string | null }) {
  return error ? (
    <p role="alert" className="text-red-600">
      {error}
    </p>
  ) : null
}

/** Hasil action yang sudah selesai: tutup saat berhasil, kembalikan pesan error bila gagal */
function useHasil(fetcher: ReturnType<typeof useFetcher<typeof action>>, onClose: () => void) {
  const result = fetcher.state === 'idle' ? fetcher.data : undefined

  useEffect(() => {
    if (result?.ok) onClose()
  }, [result, onClose])

  return result && !result.ok ? result.error : null
}

/** Form ubah nama, kuota & deskripsi, diisi nilai saat ini. Dipasang hanya saat dibuka */
export function UbahPosisiDialog({ posisi, onClose }: { posisi: Posisi; onClose: () => void }) {
  const fetcher = useFetcher<typeof action>()
  const isSaving = fetcher.state !== 'idle'
  const error = useHasil(fetcher, onClose)

  return (
    <FormDialog
      open
      title="Ubah Posisi Magang"
      submitLabel={isSaving ? 'Menyimpan...' : 'Simpan'}
      cancelLabel="Batal"
      loading={isSaving}
      onCancel={onClose}
      onSubmit={(formData) => {
        formData.set('intent', INTENT.ubah)
        formData.set('id', String(posisi.id))
        fetcher.submit(formData, { method: 'post' })
      }}
    >
      <div className="text-sm text-brand-700">
        <p>
          Perusahaan: <strong>{posisi.perusahaan}</strong>
        </p>
        <p className="mt-1 text-brand-500">
          Perusahaan dan periode tidak bisa diubah. Jika salah, hapus posisi ini lalu tambahkan yang baru.
        </p>
      </div>

      <FormField label="Nama Posisi" htmlFor="posisi">
        <TextInput id="posisi" name="posisi" required maxLength={NAMA_POSISI_MAX} defaultValue={posisi.posisi} autoFocus />
      </FormField>

      <FormField label="Kuota penerimaan" htmlFor="kuota">
        <TextInput id="kuota" name="kuota" type="number" required min={1} step={1} inputMode="numeric" defaultValue={posisi.kuota} />
      </FormField>

      <FormField label="Deskripsi & Persyaratan" htmlFor="deskripsiPersyaratan">
        <TextArea id="deskripsiPersyaratan" name="deskripsiPersyaratan" required defaultValue={posisi.deskripsiPersyaratan} />
      </FormField>

      <PesanError error={error} />
    </FormDialog>
  )
}

/** Konfirmasi menyembunyikan posisi. Dipasang hanya saat dibuka */
export function SembunyikanPosisiDialog({ posisi, onClose }: { posisi: Posisi; onClose: () => void }) {
  const fetcher = useFetcher<typeof action>()
  const isSaving = fetcher.state !== 'idle'
  const error = useHasil(fetcher, onClose)

  return (
    <ConfirmDialog
      open
      title="Hapus posisi magang?"
      confirmLabel={isSaving ? 'Memproses...' : 'Ya, hapus'}
      cancelLabel="Batal"
      loading={isSaving}
      onCancel={onClose}
      onConfirm={() => fetcher.submit({ intent: INTENT.sembunyikan, id: posisi.id }, { method: 'post' })}
    >
      <p className="mb-3 font-bold text-brand-900">
        {posisi.posisi} <span className="font-normal text-brand-700">· {posisi.perusahaan}</span>
      </p>
      <p className="mb-2">Posisi ini disembunyikan dari daftar lowongan mahasiswa dan tidak bisa didaftar lagi.</p>
      <p>
        Pendaftaran yang sudah masuk tetap ada dan tetap bisa diproses. Datanya tetap bisa dilihat lewat{' '}
        <strong>Tampilkan posisi yang disembunyikan</strong>, tapi belum bisa diaktifkan kembali.
      </p>
      <div className="mt-3">
        <PesanError error={error} />
      </div>
    </ConfirmDialog>
  )
}
