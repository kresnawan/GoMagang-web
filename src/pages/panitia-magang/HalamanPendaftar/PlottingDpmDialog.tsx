import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { FormDialog, FormField, TextInput } from '../../../component'
import type { PlottingDpm } from '../../../services/pendaftaran'
import { DPM_TEKS_MAX, validasiPlottingDpm, type PendaftarRingkas } from '../../../services/pendaftar'
import { INTENT, PENDAFTAR_ACTION, type action } from './route'

export type PlottingDpmDialogProps = {
  /** Satu (dari dialog Detail) atau banyak (aksi massal); semuanya berstatus Aktif */
  pendaftar: Array<Pick<PendaftarRingkas, 'id' | 'nama' | 'nim'>>
  /** Plotting yang sudah ada, untuk mengisi form (hanya bila satu pendaftar) */
  plottingAwal?: PlottingDpm | null
  onClose: () => void
  /** Dipanggil setelah tersimpan, sebelum dialog ditutup */
  onSuccess?: () => void
}

/**
 * Form plotting DPM untuk satu atau banyak pendaftar (PUT /api/v1/pendaftaran/plot-dpm).
 * Dipasang hanya saat dibuka, sehingga form & pesan error selalu mulai dari awal
 */
export function PlottingDpmDialog({ pendaftar, plottingAwal = null, onClose, onSuccess }: PlottingDpmDialogProps) {
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
    const pesan = validasiPlottingDpm({
      idPendaftar: pendaftar.map((item) => item.id),
      namaDpm: String(formData.get('nama_dpm') ?? ''),
      kontakDpm: String(formData.get('kontak_dpm') ?? ''),
    })
    setErrorLokal(pesan)
    if (pesan) return

    formData.set('intent', INTENT.plotting)
    for (const item of pendaftar) formData.append('ids', String(item.id))
    fetcher.submit(formData, { method: 'post', action: PENDAFTAR_ACTION })
  }

  return (
    <FormDialog
      open
      title={plottingAwal ? 'Ubah Plotting DPM' : 'Tambahkan Plotting DPM'}
      submitLabel={isSaving ? 'Menyimpan...' : 'Simpan'}
      loading={isSaving}
      onCancel={onClose}
      onSubmit={handleSubmit}
    >
      <div className="text-sm text-brand-700">
        {massal ? (
          <>
            <p className="mb-2">
              DPM yang sama berlaku untuk <strong>{pendaftar.length} pendaftar</strong>:
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

      <FormField label="Nama Dosen Pembimbing Magang" htmlFor="dpm-nama">
        <TextInput
          id="dpm-nama"
          name="nama_dpm"
          required
          maxLength={DPM_TEKS_MAX}
          defaultValue={plottingAwal?.nama}
        />
      </FormField>
      <FormField label="Kontak DPM" htmlFor="dpm-kontak">
        <TextInput
          id="dpm-kontak"
          name="kontak_dpm"
          required
          maxLength={DPM_TEKS_MAX}
          placeholder="Email atau nomor HP"
          defaultValue={plottingAwal?.kontak}
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
