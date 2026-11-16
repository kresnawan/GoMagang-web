import { Link } from 'react-router'
import { cn } from '../../component/cn'
import type { Pendaftaran } from '../../services/pendaftaran'
import { PENDAFTARAN_PARAM } from '../HalamanKonversiMK/route'
import { formatJam, formatRelatif, formatTanggal, formatTanggalJam } from './format'
import { StatusBadge, TahapPendaftaran } from './StatusPendaftaran'

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-5 shrink-0 text-brand-500 transition-transform group-hover:translate-x-1 group-hover:text-brand-700 ${className ?? ''}`}
      aria-hidden
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

const barisClass =
  'group relative flex cursor-pointer items-center gap-3 px-3 transition-colors hover:bg-brand-100/60 active:bg-brand-100 has-[a:focus-visible]:bg-brand-100/60 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-brand-300 has-[a:focus-visible]:ring-inset sm:gap-4 sm:px-4'

type LangkahBerikutnya = { teks: string; tautan?: { label: string; to: string } }

function langkahBerikutnya(pendaftaran: Pendaftaran): LangkahBerikutnya | null {
  switch (pendaftaran.status) {
    case 'Menunggu Verifikasi':
      return { teks: 'Berkasmu sedang diperiksa panitia.' }
    case 'Lolos Seleksi Administrasi':
      return { teks: 'Selanjutnya seleksi substansi. Jadwalnya ada di detail pendaftaran.' }
    case 'Diterima':
      return { teks: 'Kamu diterima! Konfirmasi penerimaan di detail pendaftaran.' }
    case 'Aktif':
      return {
        teks: 'Magang sedang berjalan.',
        tautan: { label: 'Isi konversi mata kuliah', to: `/konversi-mk?${PENDAFTARAN_PARAM}=${pendaftaran.id}` },
      }
    default:
      return null
  }
}

export function PendaftaranItem({ pendaftaran }: { pendaftaran: Pendaftaran }) {
  const langkah = langkahBerikutnya(pendaftaran)

  return (
    <li className={cn(barisClass, 'items-start py-5')}>
      <div className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="text-h6 leading-snug text-brand-700">
              <Link
                to={pendaftaran.id}
                className="underline-offset-4 outline-none group-hover:underline after:absolute after:inset-0"
              >
                {pendaftaran.posisi}
              </Link>
            </h3>
            <StatusBadge status={pendaftaran.status} className="hidden sm:inline-flex" />
          </div>
          <p className="truncate text-brand-500" title={pendaftaran.perusahaan}>
            {pendaftaran.perusahaan}
          </p>
          <StatusBadge status={pendaftaran.status} className="mt-2 sm:hidden" />
          {langkah && (
            <p className="mt-2 hidden text-brand-900 sm:block">
              {langkah.teks}{' '}
              {langkah.tautan && (
                <Link
                  to={langkah.tautan.to}
                  className="relative z-10 rounded-sm font-bold whitespace-nowrap text-brand-500 underline outline-none hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-300"
                >
                  {langkah.tautan.label} →
                </Link>
              )}
            </p>
          )}
        </div>

        <div className="w-full shrink-0 lg:w-80">
          <TahapPendaftaran status={pendaftaran.status} />
        </div>

        <dl className="shrink-0 text-sm text-brand-500 lg:w-48 lg:text-right">
          <dt className="inline lg:block">Diajukan </dt>
          <dd className="inline font-bold text-brand-700 lg:block lg:text-base">
            <time dateTime={pendaftaran.diajukanPada}>
              {formatTanggal(pendaftaran.diajukanPada)},{' '}
              <span className="whitespace-nowrap">{formatJam(pendaftaran.diajukanPada)}</span>
            </time>
          </dd>
          <dt className="sr-only">Terakhir diperbarui</dt>
          <dd className="mt-0.5">
            diperbarui{' '}
            <time dateTime={pendaftaran.diubahPada} title={formatTanggalJam(pendaftaran.diubahPada)}>
              <span className="sm:hidden">{formatTanggalJam(pendaftaran.diubahPada)}</span>
              <span className="hidden sm:inline">{formatRelatif(pendaftaran.diubahPada)}</span>
            </time>
          </dd>
        </dl>
      </div>
      <Chevron className="mt-1" />
    </li>
  )
}

export function RiwayatItem({ pendaftaran }: { pendaftaran: Pendaftaran }) {
  return (
    <li className={`${barisClass} py-3`}>
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <Link
            to={pendaftaran.id}
            className="block font-bold text-brand-700 underline-offset-4 outline-none group-hover:underline after:absolute after:inset-0"
          >
            {pendaftaran.posisi}
          </Link>
          <p className="text-sm text-brand-500">
            {pendaftaran.perusahaan} · diajukan {formatTanggal(pendaftaran.diajukanPada)}
          </p>
        </div>
        <StatusBadge status={pendaftaran.status} />
      </div>
      <Chevron />
    </li>
  )
}
