import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { FormDialog, FormField, TextInput } from '../../../component'
import type { JadwalSeleksiSubstansi } from '../../../services/pendaftaran'
import {
  hariIniWib,
  LOKASI_JADWAL_MAX,
  validasiJadwalSeleksi,
  type PendaftarRingkas,
} from '../../../services/pendaftar'
import { INTENT, PENDAFTAR_ACTION, type action } from './route'

export type JadwalSeleksiDialogProps = {
  /** Satu (dari dialog Detail) atau banyak (aksi massal); semuanya berstatus Lolos Seleksi Administrasi */
  pendaftar: Array<Pick<PendaftarRingkas, 'id' | 'nama' | 'nim'>>
  /** Jadwal yang sudah ada, untuk mengisi form (hanya bila satu pendaftar) */
  jadwalAwal?: JadwalSeleksiSubstansi | null
  onClose: () => void
  /** Dipanggil setelah tersimpan, sebelum dialog ditutup */
  onSuccess?: () => void
}

/**
 * Form jadwal seleksi substansi untuk satu atau banyak pendaftar (PUT /api/v1/pendaftaran/jadwal-seleksi-substansi).
 * Dipasang hanya saat dibuka, sehingga form & pesan error selalu mulai dari awal
 */
export function JadwalSeleksiDialog({ pendaftar, jadwalAwal = null, onClose, onSuccess }: JadwalSeleksiDialogProps) {
  const fetcher = useFetcher<typeof action>()
  const [errorLokal, setErrorLokal] = useState<string | null>(null)
  const isSaving = fetcher.state !== 'idle'
  const result = fetcher.state === 'idle' ? fetcher.data : undefined
  const error = errorLokal ?? (result && !result.ok ? result.error : null)
  const massal = pendaftar.length > 1

  useEffect(() => {
    if (!result?.ok) return
    onSuccess?.()
    onClose()
  }, [result, onSuccess, onClose])

  function handleSubmit(formData: FormData) {
    const pesan = validasiJadwalSeleksi({
      idPendaftar: pendaftar.map((item) => item.id),
      tanggal: String(formData.get('tanggal') ?? ''),
      jam: String(formData.get('jam') ?? ''),
      lokasi: String(formData.get('lokasi') ?? ''),
    })
    setErrorLokal(pesan)
    if (pesan) return

    formData.set('intent', INTENT.jadwal)
    for (const item of pendaftar) formData.append('ids', String(item.id))
    fetcher.submit(formData, { method: 'post', action: PENDAFTAR_ACTION })
  }

  return (
    <FormDialog
      open
      title={jadwalAwal ? 'Ubah Jadwal Seleksi Substansi' : 'Tambahkan Jadwal Seleksi Substansi'}
      submitLabel={isSaving ? 'Menyimpan...' : 'Simpan'}
      loading={isSaving}
      onCancel={onClose}
      onSubmit={handleSubmit}
    >
      <div className="text-sm text-brand-700">
        {massal ? (
          <>
            <p className="mb-2">
              Jadwal yang sama berlaku untuk <strong>{pendaftar.length} pendaftar</strong>:
            </p>
            <ul className="max-h-32 overflow-y-auto rounded-sm border border-brand-300 px-3 py-2">
              {pendaftar.map((item) => (
                <li key={item.id}>
                  {item.nama} <span className="text-brand-500">· {item.nim}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>
            Untuk <strong>{pendaftar[0]?.nama}</strong> ({pendaftar[0]?.nim}).
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Tanggal" htmlFor="jadwal-tanggal">
          <TextInput
            id="jadwal-tanggal"
            name="tanggal"
            type="date"
            required
            min={hariIniWib()}
            defaultValue={jadwalAwal?.tanggal}
          />
        </FormField>
        <FormField label="Jam (WIB)" htmlFor="jadwal-jam">
          <TextInput id="jadwal-jam" name="jam" type="time" required defaultValue={jadwalAwal?.jam} />
        </FormField>
      </div>
      <FormField label="Lokasi" htmlFor="jadwal-lokasi">
        <TextInput
          id="jadwal-lokasi"
          name="lokasi"
          required
          maxLength={LOKASI_JADWAL_MAX}
          placeholder="mis. Gedung F, Ruang F2.3 atau Daring (Zoom)"
          defaultValue={jadwalAwal?.lokasi}
        />
      </FormField>

      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
    </FormDialog>
  )
}
