import { isRouteErrorResponse, Link, useLoaderData, useRevalidator, useRouteError } from 'react-router'
import { LowonganImage, LowonganInfo } from '../LowonganInfo'
import { DAFTAR_LOWONGAN_PATH } from '../navigation'
import { PendaftaranForm } from './PendaftaranForm'
import type { loader } from './route'

function PageHeading() {
  return <h1 className="mb-8 text-h5 text-brand-700">Formulir Pendaftaran</h1>
}

/** Dibuka langsung lewat URL padahal tidak bisa mendaftar di sini (tombol Daftar di daftar lowongan nonaktif) */
function TidakBisaDaftar({ alasan }: { alasan: string }) {
  return (
    <div role="status" className="max-w-3xl rounded-sm border border-brand-300 bg-brand-50 px-4 py-4 text-brand-700">
      <p className="font-bold">{alasan}</p>
      <p className="mt-1 text-sm">
        Pantau statusnya di{' '}
        <Link to="/dasbor" className="font-bold underline">
          Dasbor
        </Link>
        , atau{' '}
        <Link to={DAFTAR_LOWONGAN_PATH} className="font-bold underline">
          pilih lowongan lain
        </Link>
        .
      </p>
    </div>
  )
}

export function HalamanFormPendaftaran() {
  const { lowongan, alasanTidakBisaDaftar, templatSpDpa } = useLoaderData<typeof loader>()

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
      {alasanTidakBisaDaftar ? (
        <TidakBisaDaftar alasan={alasanTidakBisaDaftar} />
      ) : (
        <PendaftaranForm lowongan={lowongan} templatSpDpa={templatSpDpa} />
      )}
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
