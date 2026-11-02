import { useEffect, useState, type FormEvent } from 'react'
import { useFetcher, useLocation, useNavigate } from 'react-router'
import { Button, ConfirmDialog, FileInput, FormField } from '../../../component'
import { MAX_FILE_SIZE, sisaKuota, type Lowongan } from '../../../services/lowongan'
import { DAFTAR_LOWONGAN_PATH, type PendaftaranNavState } from '../navigation'
import { BERKAS, validatePendaftaranForm } from './form'
import type { action } from './route'

export type PendaftaranFormProps = {
  lowongan: Lowongan
}

export function PendaftaranForm({ lowongan }: PendaftaranFormProps) {
  const fetcher = useFetcher<typeof action>()
  const navigate = useNavigate()
  const location = useLocation()
  // Data yang sudah lolos validasi dan menunggu konfirmasi di dialog
  const [pending, setPending] = useState<FormData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const backTo = DAFTAR_LOWONGAN_PATH + ((location.state as PendaftaranNavState | null)?.listSearch ?? '')
  const isSending = fetcher.state !== 'idle'
  const actionError = fetcher.state === 'idle' && fetcher.data && !fetcher.data.ok ? fetcher.data.error : null
  const isFull = sisaKuota(lowongan) <= 0

  // Berhasil: kembali ke daftar lowongan dengan pesan sukses.
  // replace agar tombol back browser tidak kembali ke form yang sudah terkirim.
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
    // const validationError = validatePendaftaranForm(formData)
    // setError(validationError)
    // if (!validationError) {
    //   fetcher.reset()
    //   setPending(formData)
    // }

    // formData.forEach((v, k, p) => {
    //   console.log(v);
    //   console.log(k);
    //   console.log(p);
    //   console.log();
    // });

    alert("Berhasil")
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
              disabled={isFull}
            />
          </FormField>
        ))}

        {isFull && <p className="text-red-600">Kuota lowongan ini sudah penuh.</p>}
        {error && (
          <p role="alert" className="text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-6">
          <Button type="submit" disabled={isFull}>
            Submit
          </Button>
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
