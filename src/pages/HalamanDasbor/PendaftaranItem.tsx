import { Link } from 'react-router'
import type { Pendaftaran } from '../../services/pendaftaran'
import { PENDAFTARAN_PARAM } from '../HalamanKonversiMK/route'
import { formatRelatif, formatTanggal } from './format'
import { StatusBadge, TahapPendaftaran } from './StatusPendaftaran'

type LangkahBerikutnya = { teks: string; tautan?: { label: string; to: string } }

/** Apa yang perlu dilakukan / ditunggu mahasiswa pada status ini. Hanya untuk pendaftaran yang masih berjalan */
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

/**
 * Baris pendaftaran yang masih berjalan. Seluruh baris bisa diklik ke detail (judul diregangkan menutupi baris);
 * tautan langkah berikutnya ditaruh di atasnya agar tetap bisa diklik sendiri
 */
export function PendaftaranItem({ pendaftaran }: { pendaftaran: Pendaftaran }) {
  const langkah = langkahBerikutnya(pendaftaran)

  return (
    <li className="relative flex flex-col gap-4 px-1 py-5 transition-colors focus-within:bg-brand-100/50 hover:bg-brand-100/50 lg:flex-row lg:items-center lg:gap-8">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="text-h6 leading-snug text-brand-700">
            <Link to={pendaftaran.id} className="outline-none after:absolute after:inset-0">
              {pendaftaran.posisi}
            </Link>
          </h3>
          <StatusBadge status={pendaftaran.status} />
        </div>
        <p className="truncate text-brand-500" title={pendaftaran.perusahaan}>
          {pendaftaran.perusahaan}
        </p>
        {langkah && (
          <p className="mt-2 text-brand-900">
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

      <dl className="shrink-0 text-sm text-brand-500 lg:w-40 lg:text-right">
        <dt className="inline lg:block">Diajukan </dt>
        <dd className="inline font-bold text-brand-700 lg:block lg:text-base">
          <time dateTime={pendaftaran.diajukanPada}>{formatTanggal(pendaftaran.diajukanPada)}</time>
        </dd>
        <dt className="sr-only">Terakhir diperbarui</dt>
        <dd className="mt-0.5">
          diperbarui{' '}
          <time dateTime={pendaftaran.diubahPada} title={formatTanggal(pendaftaran.diubahPada)}>
            {formatRelatif(pendaftaran.diubahPada)}
          </time>
        </dd>
      </dl>
    </li>
  )
}

/** Baris ringkas untuk pendaftaran yang sudah berakhir (Selesai/Tidak Lolos/Batal) */
export function RiwayatItem({ pendaftaran }: { pendaftaran: Pendaftaran }) {
  return (
    <li>
      <Link
        to={pendaftaran.id}
        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1 py-3 outline-none hover:bg-brand-100/50 focus-visible:ring-2 focus-visible:ring-brand-300"
      >
        <span className="min-w-0">
          <span className="block font-bold text-brand-700">{pendaftaran.posisi}</span>
          <span className="block text-sm text-brand-500">
            {pendaftaran.perusahaan} · diajukan {formatTanggal(pendaftaran.diajukanPada)}
          </span>
        </span>
        <StatusBadge status={pendaftaran.status} />
      </Link>
    </li>
  )
}
