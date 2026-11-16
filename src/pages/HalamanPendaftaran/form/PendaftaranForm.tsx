import { useEffect, useState, type FormEvent } from 'react'
import { useFetcher, useLocation, useNavigate } from 'react-router'
import { Button, ConfirmDialog, FileInput, FormField } from '../../../component'
import { MAX_FILE_SIZE, type Posisi } from '../../../services/lowongan'
import { MAX_BERKAS_TAMBAHAN } from '../../../services/pendaftaran'
import { isTautanValid, type TemplatSpDpa } from '../../../services/templatSpDpa'
import { DAFTAR_LOWONGAN_PATH, type PendaftaranNavState } from '../navigation'
import { BERKAS, BERKAS_TAMBAHAN, getBerkasTambahan, validatePendaftaranForm } from './form'
import type { action } from './route'

export type PendaftaranFormProps = {
  lowongan: Posisi
  templatSpDpa: TemplatSpDpa | null
}

export function PendaftaranForm({ lowongan, templatSpDpa }: PendaftaranFormProps) {
  const fetcher = useFetcher<typeof action>()
  const navigate = useNavigate()
  const location = useLocation()
  const [pending, setPending] = useState<FormData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const backTo = DAFTAR_LOWONGAN_PATH + ((location.state as PendaftaranNavState | null)?.listSearch ?? '')
  const isSending = fetcher.state !== 'idle'
  const actionError = fetcher.state === 'idle' && fetcher.data && !fetcher.data.ok ? fetcher.data.error : null

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data?.ok) return
    navigate(backTo, {
      replace: true,
      state: { pendaftaranTerkirim: `${lowongan.posisi} — ${lowongan.perusahaan}` } satisfies PendaftaranNavState,
    })
  }, [fetcher.state, fetcher.data, navigate, backTo, lowongan])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const validationError = validatePendaftaranForm(formData)
    setError(validationError)
    if (!validationError) {
      fetcher.reset()
      setPending(formData)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} onChange={() => setError(null)} className="flex max-w-3xl flex-col gap-6">
        {BERKAS.map((berkas) => (
          <FormField key={berkas.name} label={berkas.label} htmlFor={berkas.name}>
            <FileInput
              id={berkas.name}
              name={berkas.name}
              accept=".pdf,application/pdf"
              hint={`(.pdf, maks. ${MAX_FILE_SIZE / 1024 / 1024} MB)`}
              required
            />
            {berkas.name === 'suratDpa' && templatSpDpa && isTautanValid(templatSpDpa.tautan) && (
              <p className="mt-1.5 text-sm text-brand-700">
                Belum punya surat pernyataan?{' '}
                <a
                  href={templatSpDpa.tautan}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-brand-500 underline hover:text-brand-700"
                >
                  Unduh templat
                  <span className="sr-only"> (membuka tab baru)</span>
                </a>
              </p>
            )}
          </FormField>
        ))}

        <FormField label={`${BERKAS_TAMBAHAN.label} (opsional)`} htmlFor={BERKAS_TAMBAHAN.name}>
          <FileInput
            id={BERKAS_TAMBAHAN.name}
            name={BERKAS_TAMBAHAN.name}
            accept=".pdf,application/pdf"
            multiple
            label="Tambahkan File"
            hint={`(.pdf, maks. ${MAX_FILE_SIZE / 1024 / 1024} MB per file, maks. ${MAX_BERKAS_TAMBAHAN} file)`}
          />
        </FormField>

        {error && (
          <p role="alert" className="text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-6">
          <Button type="submit">Submit</Button>
          <Button type="button" variant="outlined" onClick={() => navigate(backTo)}>
            Kembali
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={pending !== null}
        title="Kirim pendaftaran?"
        confirmLabel={isSending ? 'Mengirim...' : 'Ya, kirim'}
        cancelLabel="Periksa lagi"
        loading={isSending}
        onCancel={() => setPending(null)}
        onConfirm={() => pending && fetcher.submit(pending, { method: 'post', encType: 'multipart/form-data' })}
      >
        <p className="mb-4">
          Pastikan data sudah benar. <strong>Pendaftaran yang sudah dikirim tidak dapat diubah.</strong>
        </p>
        <dl className="grid gap-x-4 gap-y-2 rounded-lg bg-brand-50 p-4 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="font-bold text-brand-700">Lowongan</dt>
          <dd className="min-w-0 break-words">
            {lowongan.posisi} — {lowongan.perusahaan}
          </dd>
          {BERKAS.map((berkas) => (
            <div key={berkas.name} className="contents">
              <dt className="font-bold text-brand-700">{berkas.label}</dt>
              <dd className="min-w-0 break-all">{(pending?.get(berkas.name) as File | null)?.name}</dd>
            </div>
          ))}
          <dt className="font-bold text-brand-700">{BERKAS_TAMBAHAN.label}</dt>
          <dd className="min-w-0 break-all">
            {pending && getBerkasTambahan(pending).length > 0 ? (
              <ul className="flex flex-col gap-1">
                {getBerkasTambahan(pending).map((file, index) => (
                  <li key={`${file.name}-${index}`}>{file.name}</li>
                ))}
              </ul>
            ) : (
              <span className="text-brand-500">Tidak ada</span>
            )}
          </dd>
        </dl>
        {actionError && (
          <p role="alert" className="mt-4 text-red-600">
            {actionError}
          </p>
        )}
      </ConfirmDialog>
    </>
  )
}
