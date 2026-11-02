import { useState } from 'react'
import { useLoaderData, useLocation, useNavigation, useRevalidator } from 'react-router'
import { cn } from '../../../component/cn'
import { DAFTAR_LOWONGAN_PATH, type PendaftaranNavState } from '../navigation'
import { LowonganFilter } from './LowonganFilter'
import { LowonganItem } from './LowonganItem'
import type { loader } from './route'

function PageHeading() {
  return (
    <div className="mb-8">
      <h1 className="text-h5 text-brand-700">Pendaftaran</h1>
      <p className="text-brand-500">Pilih lowongan magang yang tersedia.</p>
    </div>
  )
}

/** Pesan sukses setelah kembali dari form pendaftaran */
function SuksesBanner() {
  const location = useLocation()
  const [dismissedKey, setDismissedKey] = useState<string>()
  const terkirim = (location.state as PendaftaranNavState | null)?.pendaftaranTerkirim
  if (!terkirim || dismissedKey === location.key) return null

  return (
    <div role="status" className="mb-6 flex items-start gap-3 rounded-lg border border-brand-300 bg-brand-100 px-4 py-3 text-brand-700">
      <p className="flex-1">
        Pendaftaran untuk <strong>{terkirim}</strong> berhasil dikirim.
      </p>
      <button
        type="button"
        aria-label="Tutup pesan"
        onClick={() => setDismissedKey(location.key)}
        className="cursor-pointer rounded px-1 text-xl leading-none hover:bg-brand-50"
      >
        ×
      </button>
    </div>
  )
}

export function HalamanDaftarLowongan() {
  const lowongan = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  // Redupkan list selama filter baru sedang dimuat
  const isFiltering = navigation.state === 'loading' && navigation.location.pathname === DAFTAR_LOWONGAN_PATH

  return (
    <>
      <PageHeading />
      <LowonganFilter />

      <ul className={cn('mt-6 border-t border-brand-300 transition-opacity', isFiltering && 'opacity-50')}>
        {lowongan.map((item) => (
          <LowonganItem key={item.id} lowongan={item} />
        ))}
      </ul>
      {lowongan.length === 0 && (
        <p className="py-10 text-center text-brand-500">Tidak ada lowongan yang cocok dengan pencarian.</p>
      )}
    </>
  )
}

export function DaftarLowonganSkeleton() {
  return (
    <>
      <PageHeading />
      <div className="animate-pulse" aria-busy aria-label="Memuat lowongan">
        <div className="h-10 rounded-sm bg-brand-100" />
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 rounded-sm bg-brand-100" />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="mt-6 flex flex-col gap-4 sm:flex-row">
            <div className="aspect-3/1 rounded-md bg-brand-100 sm:w-52" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-2/3 rounded bg-brand-100" />
              <div className="h-4 w-1/3 rounded bg-brand-100" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export function DaftarLowonganError() {
  const revalidator = useRevalidator()

  return (
    <>
      <PageHeading />
      <p className="mb-4">Gagal memuat daftar lowongan.</p>
      <button type="button" onClick={() => revalidator.revalidate()} className="cursor-pointer font-bold text-brand-500 underline">
        Coba lagi
      </button>
    </>
  )
}
