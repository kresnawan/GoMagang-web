import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { DropDown, FormDialog, FormField, TextArea, TextInput } from '../../../component'
import { NAMA_POSISI_MAX } from '../../../services/lowongan'
import type { Periode } from '../../../services/periode'
import type { Perusahaan } from '../../../services/perusahaan'
import { labelPeriode } from '../periode'
import { INTENT, type action } from './route'

export type TambahPosisiDialogProps = {
  periode: Periode[]
  perusahaan: Perusahaan[]
  idPeriodeAwal: number | undefined
  onClose: () => void
  onSuccess: (idPeriode: number) => void
}

export function TambahPosisiDialog({ periode, perusahaan, idPeriodeAwal, onClose, onSuccess }: TambahPosisiDialogProps) {
  const fetcher = useFetcher<typeof action>()
  const isSaving = fetcher.state !== 'idle'
  const result = fetcher.state === 'idle' ? fetcher.data : undefined

  useEffect(() => {
    if (result?.ok) onSuccess(result.idPeriode)
  }, [result, onSuccess])

  return (
    <FormDialog
      open
      title="Tambah Posisi Magang"
      submitLabel={isSaving ? 'Menambahkan...' : 'Tambah'}
      cancelLabel="Batal"
      loading={isSaving}
      onCancel={onClose}
      onSubmit={(formData) => {
        formData.set('intent', INTENT.tambah)
        fetcher.submit(formData, { method: 'post' })
      }}
    >
      <FormField label="Nama Posisi" htmlFor="posisi">
        <TextInput
          id="posisi"
          name="posisi"
          required
          maxLength={NAMA_POSISI_MAX}
          placeholder="mis. Frontend Developer Intern"
        />
      </FormField>

      <FormField label="Nama Perusahaan" htmlFor="idPerusahaan">
        <DropDown id="idPerusahaan" name="idPerusahaan" required defaultValue="">
          <option value="" disabled>
            {perusahaan.length ? 'Pilih perusahaan' : 'Belum ada perusahaan mitra'}
          </option>
          {perusahaan.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama}
            </option>
          ))}
        </DropDown>
      </FormField>

      <FormField label="Kuota penerimaan" htmlFor="kuota">
        <TextInput id="kuota" name="kuota" type="number" required min={1} step={1} inputMode="numeric" />
      </FormField>

      <FormField label="Periode" htmlFor="idPeriode">
        <DropDown id="idPeriode" name="idPeriode" required defaultValue={idPeriodeAwal ?? ''}>
          <option value="" disabled>
            Pilih periode
          </option>
          {periode.map((item) => (
            <option key={item.id} value={item.id}>
              {labelPeriode(item)}
            </option>
          ))}
        </DropDown>
      </FormField>

      <FormField label="Deskripsi & Persyaratan" htmlFor="deskripsiPersyaratan">
        <TextArea id="deskripsiPersyaratan" name="deskripsiPersyaratan" required />
      </FormField>

      {result && !result.ok && (
        <p role="alert" className="text-red-600">
          {result.error}
        </p>
      )}
    </FormDialog>
  )
}
