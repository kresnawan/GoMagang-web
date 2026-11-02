import { Link, useLoaderData, useRevalidator } from 'react-router'
import { PendaftaranCard } from './PendaftaranCard'
import type { loader } from './route'

function PageHeading() {
  return <h1 className="mb-8 text-h5 text-brand-700">Dasbor</h1>
}

export function HalamanDasbor() {
  const pendaftaran = useLoaderData<typeof loader>()

  return (
    <>
      <PageHeading />
      {pendaftaran.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {pendaftaran.map((item) => (
            <PendaftaranCard key={item.id} pendaftaran={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-brand-300 px-4 py-10 text-center">
          <p className="mb-2 text-brand-500">Kamu belum mendaftar ke lowongan mana pun.</p>
          <Link to="/pendaftaran" className="font-bold text-brand-500 underline">
            Lihat lowongan tersedia
          </Link>
        </div>
      )}
    </>
  )
}

export function DasborSkeleton() {
  return (
    <>
      <PageHeading />
      <div className="grid animate-pulse gap-5 md:grid-cols-2" aria-busy aria-label="Memuat pendaftaran">
        {[1, 2].map((i) => (
          <div key={i} className="h-52 rounded-lg bg-brand-100" />
        ))}
      </div>
    </>
  )
}

export function DasborError() {
  const revalidator = useRevalidator()

  return (
    <>
      <PageHeading />
      <p className="mb-4">Gagal memuat data pendaftaran.</p>
      <button type="button" onClick={() => revalidator.revalidate()} className="cursor-pointer font-bold text-brand-500 underline">
        Coba lagi
      </button>
    </>
  )
}
