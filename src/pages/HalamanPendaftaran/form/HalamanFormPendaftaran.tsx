import { isRouteErrorResponse, Link, useLoaderData, useRevalidator, useRouteError } from 'react-router'
import { LowonganImage, LowonganInfo } from '../LowonganInfo'
import { DAFTAR_LOWONGAN_PATH } from '../navigation'
import { PendaftaranForm } from './PendaftaranForm'
import type { loader } from './route'

function PageHeading() {
  return <h1 className="mb-8 text-h5 text-brand-700">Formulir Pendaftaran</h1>
}

export function HalamanFormPendaftaran() {
  const lowongan = useLoaderData<typeof loader>()

  return (
    <>
      <PageHeading />
      {/* Ringkasan lowongan yang dipilih */}
      <section
        aria-label="Lowongan dipilih"
        className="mb-8 flex max-w-3xl flex-col gap-4 rounded-lg border border-brand-300 p-3 sm:flex-row sm:items-center sm:gap-6"
      >
        <LowonganImage lowongan={lowongan} className="sm:w-52" />
        <LowonganInfo lowongan={lowongan} />
      </section>
      <PendaftaranForm lowongan={lowongan} />
    </>
  )
}

export function FormPendaftaranSkeleton() {
  return (
    <>
      <PageHeading />
      <div className="max-w-3xl animate-pulse" aria-busy aria-label="Memuat lowongan">
        <div className="h-28 rounded-lg bg-brand-100" />
        <div className="mt-8 h-40 rounded-xl bg-brand-100" />
        <div className="mt-6 h-40 rounded-xl bg-brand-100" />
      </div>
    </>
  )
}

export function FormPendaftaranError() {
  const error = useRouteError()
  const revalidator = useRevalidator()
  const notFound = isRouteErrorResponse(error) && error.status === 404

  return (
    <>
      <PageHeading />
      <p className="mb-4">{notFound ? 'Lowongan tidak ditemukan.' : 'Gagal memuat data lowongan.'}</p>
      <div className="flex gap-4 font-bold text-brand-500 underline">
        {!notFound && (
          <button type="button" onClick={() => revalidator.revalidate()} className="cursor-pointer underline">
            Coba lagi
          </button>
        )}
        <Link to={DAFTAR_LOWONGAN_PATH}>Kembali ke daftar lowongan</Link>
      </div>
    </>
  )
}
