import { isRouteErrorResponse, Link, useLoaderData, useRevalidator, useRouteError } from 'react-router'
import { DetailPendaftaran } from './DetailPendaftaran'
import { RiwayatStatus } from './RiwayatStatus'
import type { loader } from './route'

const DASBOR_PATH = '/dasbor'

function PageHeading() {
  return (
    <div className="mb-8">
      <Link to={DASBOR_PATH} className="mb-2 inline-block text-sm text-brand-500 hover:underline">
        ← Kembali ke Dasbor
      </Link>
      <h1 className="text-h5 text-brand-700">Detail Pendaftaran</h1>
    </div>
  )
}

export function HalamanDetailPendaftaran() {
  const pendaftaran = useLoaderData<typeof loader>()

  return (
    <>
      <PageHeading />
      <div className="grid items-start gap-6 md:grid-cols-[5fr_7fr]">
        <DetailPendaftaran pendaftaran={pendaftaran} />
        <RiwayatStatus pendaftaran={pendaftaran} />
      </div>
    </>
  )
}

export function DetailPendaftaranSkeleton() {
  return (
    <>
      <PageHeading />
      <div className="grid animate-pulse gap-6 md:grid-cols-[5fr_7fr]" aria-busy aria-label="Memuat detail pendaftaran">
        <div className="h-96 rounded-sm bg-brand-100" />
        <div className="h-96 rounded-sm bg-brand-100" />
      </div>
    </>
  )
}

export function DetailPendaftaranError() {
  const error = useRouteError()
  const revalidator = useRevalidator()
  const notFound = isRouteErrorResponse(error) && error.status === 404

  return (
    <>
      <PageHeading />
      <p className="mb-4">{notFound ? 'Pendaftaran tidak ditemukan.' : 'Gagal memuat detail pendaftaran.'}</p>
      {!notFound && (
        <button type="button" onClick={() => revalidator.revalidate()} className="cursor-pointer font-bold text-brand-500 underline">
          Coba lagi
        </button>
      )}
    </>
  )
}
