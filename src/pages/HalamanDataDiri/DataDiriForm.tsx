import { useState } from 'react'
import { useFetcher } from 'react-router'
import { Button, DropDown, FormField, RadioButton, TextInput } from '../../component'
import { JENIS_KELAMIN, PROGRAM_STUDI, type DataDiri } from '../../services/dataDiri'
import {
  parseDataDiriForm,
  perubahanDataDiri,
  SEMESTER_MAX,
  SEMESTER_MIN,
  type DataDiriFormValues,
} from './form'
import type { action } from './route'

export type DataDiriFormProps = {
  data: DataDiri
}

export function DataDiriForm({ data }: DataDiriFormProps) {
  const fetcher = useFetcher<typeof action>()
  const [values, setValues] = useState<DataDiriFormValues | null>(null)

  const adaPerubahan = values !== null && Object.keys(perubahanDataDiri(data, values)).length > 0
  const isSaving = fetcher.state !== 'idle'
  const pesan = !isSaving && fetcher.data && (fetcher.data.ok ? !adaPerubahan && fetcher.data.message : fetcher.data.error)

  const wajib = (key: keyof DataDiriFormValues) => data[key] !== null

  return (
    <fetcher.Form
      method="post"
      onChange={(event) => setValues(parseDataDiriForm(new FormData(event.currentTarget)))}
      className="grid max-w-3xl gap-x-6 gap-y-5 sm:grid-cols-2"
    >
      <FormField label="Nama Lengkap" htmlFor="namaLengkap" className="sm:col-span-2">
        <TextInput
          id="namaLengkap"
          name="namaLengkap"
          defaultValue={data.namaLengkap ?? ''}
          required={wajib('namaLengkap')}
                    maxLength={255}
          autoComplete="name"
        />
      </FormField>

      <FormField label="NIM" htmlFor="nim">
        <TextInput
          id="nim"
          name="nim"
          defaultValue={data.nim ?? ''}
          required={wajib('nim')}
          inputMode="numeric"
          pattern="[0-9]{1,15}"
          title="1–15 digit angka"
        />
      </FormField>

      <FormField label="Jenis Kelamin" group>
        <div className="flex min-h-9.5 flex-wrap items-center gap-x-8 gap-y-2">
          {JENIS_KELAMIN.map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-2">
              <RadioButton
                name="jenisKelamin"
                value={option}
                defaultChecked={data.jenisKelamin === option}
                required={wajib('jenisKelamin')}
              />
              {option}
            </label>
          ))}
        </div>
      </FormField>

      <FormField label="Email" htmlFor="email" className="sm:col-span-2">
        <TextInput id="email" type="email" defaultValue={data.email} disabled />
      </FormField>

      <FormField label="Program Studi" htmlFor="programStudi">
        <DropDown
          id="programStudi"
          name="programStudi"
          defaultValue={data.programStudi ?? ''}
          required={wajib('programStudi')}
        >
          <option value="" disabled>
            Pilih program studi
          </option>
          {PROGRAM_STUDI.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </DropDown>
      </FormField>

      <FormField label="IPK" htmlFor="ipk">
        <TextInput
          id="ipk"
          name="ipk"
          type="number"
          defaultValue={data.ipk ?? ''}
          required={wajib('ipk')}
          min={0}
          max={4}
          step={0.01}
        />
      </FormField>

      <FormField label="Nomor HP" htmlFor="nomorHp">
        <TextInput
          id="nomorHp"
          name="nomorHp"
          type="tel"
          defaultValue={data.nomorHp ?? ''}
          required={wajib('nomorHp')}
          autoComplete="tel"
          pattern="\+?[0-9]{9,15}"
          title="9–15 digit angka, boleh diawali +"
        />
      </FormField>

      <FormField label="Semester" htmlFor="semester">
        <TextInput
          id="semester"
          name="semester"
          type="number"
          defaultValue={data.semester ?? ''}
          required={wajib('semester')}
          min={SEMESTER_MIN}
          max={SEMESTER_MAX}
          step={1}
          inputMode="numeric"
        />
      </FormField>

      <div className="flex flex-wrap items-center gap-4 pt-4 sm:col-span-2" aria-live="polite">
        <Button type="submit" disabled={!adaPerubahan || isSaving} className="text-base">
          Terapkan
        </Button>
        {pesan && (
          <p role={fetcher.data?.ok ? 'status' : 'alert'} className={fetcher.data?.ok ? 'text-brand-700' : 'text-red-600'}>
            {pesan}
          </p>
        )}
      </div>
    </fetcher.Form>
  )
}
