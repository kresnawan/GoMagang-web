import { useState } from 'react'
import { useFetcher } from 'react-router'
import { Button, DropDown, FormField, RadioButton, TextInput } from '../../component'
import { JENIS_KELAMIN, PROGRAM_STUDI, type DataDiri, type DataDiriInput } from '../../services/dataDiri'
import { isSameDataDiri, parseDataDiriForm } from './form'
import type { action } from './route'

export type DataDiriFormProps = {
  /** Data awal dari backend */
  data: DataDiri
}

export function DataDiriForm({ data }: DataDiriFormProps) {
  const fetcher = useFetcher<typeof action>()
  // null = belum ada perubahan sejak halaman dimuat
  const [values, setValues] = useState<DataDiriInput | null>(null)

  // Dibandingkan dengan `data` terbaru, jadi setelah tersimpan (loader revalidate) tombol hilang sendiri
  const isSaving = fetcher.state !== 'idle'

  return (
    <fetcher.Form
      method="post"
      onChange={(event) => setValues(parseDataDiriForm(new FormData(event.currentTarget)))}
      className="grid max-w-3xl gap-x-6 gap-y-5 sm:grid-cols-2"
    >
      <FormField label="Nama Lengkap" htmlFor="namaLengkap" className="sm:col-span-2">
        <TextInput id="namaLengkap" name="namaLengkap" defaultValue={data.namaLengkap} required autoComplete="name" />
      </FormField>

      <FormField label="NIM" htmlFor="nim">
        <TextInput id="nim" name="nim" defaultValue={data.nim} required inputMode="numeric" />
      </FormField>

      <FormField label="Jenis Kelamin" group>
        <div className="flex min-h-9.5 flex-wrap items-center gap-x-8 gap-y-2">
          {JENIS_KELAMIN.map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-2">
              <RadioButton name="jenisKelamin" value={option} defaultChecked={data.jenisKelamin === option} required />
              {option}
            </label>
          ))}
        </div>
      </FormField>

      <FormField label="Email" htmlFor="email" className="sm:col-span-2">
        <TextInput id="email" type="email" defaultValue={data.email} disabled />
      </FormField>

      <FormField label="Program Studi" htmlFor="programStudi">
        <DropDown id="programStudi" name="programStudi" defaultValue={data.programStudi} required>
          {PROGRAM_STUDI.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </DropDown>
      </FormField>

      <FormField label="IPK" htmlFor="ipk">
        <TextInput id="ipk" name="ipk" type="number" defaultValue={data.ipk} required min={0} max={4} step={0.01} />
      </FormField>

      <FormField label="Nomor HP" htmlFor="nomorHp">
        <TextInput
          id="nomorHp"
          name="nomorHp"
          type="tel"
          defaultValue={data.nomorHp}
          required
          autoComplete="tel"
          pattern="\+?[0-9]{9,15}"
          title="9–15 digit angka, boleh diawali +"
        />
      </FormField>

      <div className="flex flex-wrap items-center gap-4 pt-4 sm:col-span-2" aria-live="polite">
        <Button type="submit" disabled={isSaving} className='text-base'>
          Terapkan
        </Button>
      </div>
    </fetcher.Form>
  )
}
