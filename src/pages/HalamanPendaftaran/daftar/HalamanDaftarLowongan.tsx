import { useState } from 'react'
import { useLoaderData, useLocation, useNavigation, useRevalidator } from 'react-router'
import { cn } from '../../../component/cn'
import { alasanTidakBisaDaftar, batasPeriodeTercapai, MAX_PENDAFTARAN_PER_PERIODE } from '../../../services/pendaftaran'
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

function PeriodeBelumDibuka() {
  return (
    <div role="status" className="rounded-sm border border-dashed border-brand-300 px-4 py-12 text-center">
      <p className="text-h6 text-brand-700">Periode pendaftaran belum dibuka</p>
      <p className="mx-auto mt-2 max-w-md text-brand-500">
        Lowongan magang akan tampil di sini setelah periode pendaftaran dibuka. Silakan cek kembali nanti.
      </p>
    </div>
  )
}

export function HalamanDaftarLowongan() {
  const { filter, periodeBerjalan, posisi, riwayat } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const isFiltering = navigation.state === 'loading' && navigation.location.pathname === DAFTAR_LOWONGAN_PATH

  if (!periodeBerjalan) {
    return (
      <>
        <PageHeading />
        <PeriodeBelumDibuka />
      </>
    )
  }

  return (
    <>
      <PageHeading />
      <SuksesBanner />
      <LowonganFilter />
      {batasPeriodeTercapai(riwayat, periodeBerjalan.id) && (
        <p role="status" className="mt-4 rounded-sm border border-brand-300 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          Kamu sudah mendaftar {MAX_PENDAFTARAN_PER_PERIODE} kali di periode ini. Pendaftaran yang batal, tidak lolos,
          atau selesai tetap dihitung, jadi kamu baru bisa mendaftar lagi di periode berikutnya.
        </p>
      )}

      <ul className={cn('mt-6 border-t border-brand-300 transition-opacity', isFiltering && 'opacity-50')}>
        {posisi.map((item) => (
          <LowonganItem key={item.id} posisi={item} alasanNonaktif={alasanTidakBisaDaftar(riwayat, item)} />
        ))}
      </ul>
      {posisi.length === 0 && (
        <p className="py-10 text-center text-brand-500">
          {filter.q
            ? 'Tidak ada posisi yang cocok dengan pencarian.'
            : 'Belum ada lowongan magang pada periode pendaftaran saat ini.'}
        </p>
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
        {[1, 2, 3].map((i) => (
          <div key={i} className="mt-6 flex flex-col gap-4 sm:flex-row">
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
