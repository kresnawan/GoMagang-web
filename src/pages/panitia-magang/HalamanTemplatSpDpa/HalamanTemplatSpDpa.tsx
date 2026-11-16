import { useEffect, useRef, type FormEvent } from 'react'
import { useFetcher, useLoaderData } from 'react-router'
import { Button, FormField, TextInput } from '../../../component'
import { isTautanValid, TAUTAN_TEMPLAT_MAX } from '../../../services/templatSpDpa'
import { formatWaktu } from '../../HalamanDetailPendaftaran/format'
import { GagalMemuat, PageHeading } from '../components'
import type { action, loader } from './route'

const JUDUL = 'Templat SP DPA'
const SUBJUDUL = 'Tautan templat surat pernyataan DPA yang diunduh mahasiswa sebelum mendaftar magang.'

export function HalamanTemplatSpDpa() {
  const templat = useLoaderData<typeof loader>()
  const fetcher = useFetcher<typeof action>()
  const formRef = useRef<HTMLFormElement>(null)
  const isSaving = fetcher.state !== 'idle'
  const result = fetcher.state === 'idle' ? fetcher.data : undefined

  useEffect(() => {
    if (result?.ok) formRef.current?.reset()
  }, [result])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    fetcher.submit(new FormData(event.currentTarget), { method: 'post' })
  }

  return (
    <>
      <PageHeading title={JUDUL} subtitle={SUBJUDUL} />

      <section aria-labelledby="judul-tautan-berlaku" className="max-w-3xl">
        <h2 id="judul-tautan-berlaku" className="mb-1.5 text-base font-bold text-brand-700">
          Tautan yang berlaku
        </h2>
        {templat && isTautanValid(templat.tautan) ? (
          <div className="rounded-sm border border-brand-300 px-4 py-3">
            <a href={templat.tautan} target="_blank" rel="noopener noreferrer" className="break-all text-brand-500 underline hover:text-brand-700">
              {templat.tautan}
            </a>
            <p className="mt-1 text-sm text-brand-500">Terakhir diubah {formatWaktu(templat.diubahPada)} WIB</p>
          </div>
        ) : (
          <p className="rounded-sm border border-dashed border-brand-300 px-4 py-6 text-center text-brand-500">
            Belum ada tautan templat. Mahasiswa belum bisa mengunduh templat surat pernyataan DPA.
          </p>
        )}
      </section>

      <form ref={formRef} onSubmit={handleSubmit} className="mt-6 flex max-w-3xl flex-col gap-4">
        <FormField label={templat ? 'Ganti tautan' : 'Atur tautan'} htmlFor="tautan">
          <TextInput
            id="tautan"
            name="tautan"
            type="url"
            required
            maxLength={TAUTAN_TEMPLAT_MAX}
            placeholder="https://drive.google.com/..."
            disabled={isSaving}
          />
          <p className="mt-1.5 text-sm text-brand-500">
            Pastikan tautan bisa dibuka oleh mahasiswa, misalnya akses Google Drive diatur ke &ldquo;Siapa saja yang memiliki link&rdquo;.
          </p>
        </FormField>

        {result && !result.ok && (
          <p role="alert" className="text-red-600">
            {result.error}
          </p>
        )}
        {result?.ok && (
          <p role="status" className="text-green-700">
            Tautan templat tersimpan.
          </p>
        )}

        <div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </>
  )
}

export function TemplatSpDpaSkeleton() {
  return (
    <>
      <PageHeading title={JUDUL} subtitle={SUBJUDUL} />
      <div className="max-w-3xl animate-pulse" aria-busy aria-label="Memuat templat">
        <div className="h-20 rounded-sm bg-brand-100" />
        <div className="mt-8 h-16 rounded-sm bg-brand-100" />
      </div>
    </>
  )
}

export function TemplatSpDpaError() {
  return (
    <>
      <PageHeading title={JUDUL} />
      <GagalMemuat pesan="Gagal memuat tautan templat surat pernyataan DPA." />
    </>
  )
}
