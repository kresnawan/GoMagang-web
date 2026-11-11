import { useState } from 'react'
import { Link, useLoaderData } from 'react-router'
import { buttonClass, GagalMemuat, PageHeading } from '../../component'
import {
  isPendaftaranBerjalan,
  jumlahDiPeriode,
  MAX_PENDAFTARAN_PER_PERIODE,
  ringkasRiwayat,
  type Pendaftaran,
} from '../../services/pendaftaran'
import type { Periode } from '../../services/periode'
import { PendaftaranItem, RiwayatItem } from './PendaftaranItem'
import type { loader } from './route'

const JUDUL = 'Dasbor'
const SUBJUDUL = 'Pantau perkembangan pendaftaran magangmu.'

const sectionHeading = 'mb-3 text-base font-bold text-brand-700'

export function HalamanDasbor() {
  const { pendaftaran, periodeBerjalan } = useLoaderData<typeof loader>()
  const berjalan = pendaftaran.filter(isPendaftaranBerjalan)
  const riwayat = pendaftaran.filter((item) => !isPendaftaranBerjalan(item))

  return (
    <>
      <PageHeading title={JUDUL} subtitle={SUBJUDUL} />
      {pendaftaran.length === 0 ? (
        <MulaiMendaftar />
      ) : (
        <div className="flex flex-col gap-10">
          <section aria-labelledby="dasbor-berjalan">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="dasbor-berjalan" className="text-base font-bold text-brand-700">
                  Sedang berjalan
                </h2>
                <JatahPendaftaran pendaftaran={pendaftaran} periode={periodeBerjalan} />
              </div>
              {bisaMendaftar(pendaftaran, periodeBerjalan) && (
                <Link to="/pendaftaran" className={buttonClass('fill', 'px-5')}>
                  Cari Lowongan
                </Link>
              )}
            </div>

            {berjalan.length > 0 ? (
              <ul className="divide-y divide-brand-300 border-y border-brand-300">
                {berjalan.map((item) => (
                  <PendaftaranItem key={item.id} pendaftaran={item} />
                ))}
              </ul>
            ) : (
              <p className="text-brand-500">Tidak ada pendaftaran yang sedang berjalan.</p>
            )}
          </section>

          {riwayat.length > 0 && <Riwayat pendaftaran={riwayat} />}
        </div>
      )}
    </>
  )
}

/** Jumlah pendaftaran di periode yang berlangsung; semua status dihitung, termasuk yang batal/tidak lolos */
const jumlahDiPeriodeBerjalan = (pendaftaran: Pendaftaran[], periode: Periode) =>
  jumlahDiPeriode(ringkasRiwayat(pendaftaran), periode.id)

/** Tombol Cari Lowongan hanya bila periode berlangsung dan jatahnya masih ada (atau periodenya gagal dimuat) */
function bisaMendaftar(pendaftaran: Pendaftaran[], periode: Periode | null | undefined) {
  if (periode === undefined) return true
  return periode !== null && jumlahDiPeriodeBerjalan(pendaftaran, periode) < MAX_PENDAFTARAN_PER_PERIODE
}

function JatahPendaftaran({ pendaftaran, periode }: { pendaftaran: Pendaftaran[]; periode: Periode | null | undefined }) {
  if (periode === undefined) return null
  if (periode === null) {
    return <p className="text-sm text-brand-500">Belum ada periode pendaftaran yang dibuka.</p>
  }

  const jumlah = jumlahDiPeriodeBerjalan(pendaftaran, periode)
  return (
    <p className="text-sm text-brand-500">
      {jumlah} dari {MAX_PENDAFTARAN_PER_PERIODE} kesempatan mendaftar di periode ini sudah terpakai
      {jumlah >= MAX_PENDAFTARAN_PER_PERIODE
        ? '. Kamu bisa mendaftar lagi di periode berikutnya.'
        : '. Pendaftaran yang batal atau tidak lolos tetap dihitung.'}
    </p>
  )
}

/** Pendaftaran yang sudah berakhir; dilipat secara default agar tidak mengalihkan dari yang berjalan */
function Riwayat({ pendaftaran }: { pendaftaran: Pendaftaran[] }) {
  const [terbuka, setTerbuka] = useState(false)

  return (
    <section aria-labelledby="dasbor-riwayat">
      <h2 id="dasbor-riwayat" className={sectionHeading}>
        <button
          type="button"
          aria-expanded={terbuka}
          aria-controls="dasbor-riwayat-daftar"
          onClick={() => setTerbuka((nilai) => !nilai)}
          className="flex cursor-pointer items-center gap-2 rounded-sm outline-none hover:text-brand-500 focus-visible:ring-2 focus-visible:ring-brand-300"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`size-4 transition-transform ${terbuka ? 'rotate-90' : ''}`}
            aria-hidden
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
          Riwayat ({pendaftaran.length})
        </button>
      </h2>
      {terbuka && (
        <ul id="dasbor-riwayat-daftar" className="divide-y divide-brand-300 border-y border-brand-300">
          {pendaftaran.map((item) => (
            <RiwayatItem key={item.id} pendaftaran={item} />
          ))}
        </ul>
      )}
    </section>
  )
}

const LANGKAH_AWAL = [
  { judul: 'Lengkapi data diri', teks: 'Data diri wajib lengkap sebelum mendaftar.', to: '/data-diri', label: 'Isi data diri' },
  {
    judul: 'Siapkan surat pernyataan DPA',
    teks: 'Unduh templatnya, lalu minta tanda tangan DPA.',
    to: '/templat-sp-dpa',
    label: 'Lihat templat',
  },
  { judul: 'Pilih lowongan', teks: 'Daftar ke posisi magang yang kamu minati.', to: '/pendaftaran', label: 'Cari lowongan' },
]

/** Empty state: belum ada pendaftaran sama sekali */
function MulaiMendaftar() {
  return (
    <section aria-labelledby="dasbor-mulai">
      <h2 id="dasbor-mulai" className={sectionHeading}>
        Kamu belum mendaftar magang. Mulai dari sini:
      </h2>
      <ol className="grid gap-4 md:grid-cols-3">
        {LANGKAH_AWAL.map((langkah, index) => (
          <li key={langkah.to} className="flex gap-3 rounded-lg border border-brand-300 p-4">
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white"
              aria-hidden
            >
              {index + 1}
            </span>
            <div>
              <p className="font-bold text-brand-700">{langkah.judul}</p>
              <p className="mb-2 text-sm text-brand-500">{langkah.teks}</p>
              <Link to={langkah.to} className="text-sm font-bold text-brand-500 underline hover:text-brand-700">
                {langkah.label}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function DasborSkeleton() {
  return (
    <>
      <PageHeading title={JUDUL} subtitle={SUBJUDUL} />
      <div className="animate-pulse" aria-busy aria-label="Memuat pendaftaran">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="h-5 w-36 rounded-sm bg-brand-100" />
            <div className="h-4 w-48 rounded-sm bg-brand-100" />
          </div>
          <div className="h-11 w-40 rounded-sm bg-brand-100" />
        </div>
        <div className="divide-y divide-brand-300 border-y border-brand-300">
          {[1, 2].map((i) => (
            <div key={i} className="py-5">
              <div className="h-20 rounded-sm bg-brand-100" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function DasborError() {
  return (
    <>
      <PageHeading title={JUDUL} subtitle={SUBJUDUL} />
      <GagalMemuat pesan="Gagal memuat data pendaftaran." />
    </>
  )
}
