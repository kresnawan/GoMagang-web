import { Link, useLoaderData, useRevalidator } from 'react-router'
import { buttonClass } from '../../component'
import { isTautanValid } from '../../services/templatSpDpa'
import { formatWaktu } from '../HalamanDetailPendaftaran/format'
import type { loader } from './route'

function PageHeading() {
  return <h1 className="mb-8 text-h5 text-brand-700">Templat Surat Pernyataan DPA</h1>
}

export function HalamanTemplatSpDpa() {
  const templat = useLoaderData<typeof loader>()
  const tersedia = templat !== null && isTautanValid(templat.tautan)

  return (
    <>
      <PageHeading />

      <div className="max-w-3xl">
        <p className="mb-2">
          Surat Pernyataan DPA wajib diunggah saat mendaftar magang. Unduh templatnya, isi, lalu mintakan tanda tangan
          Dosen Pembimbing Akademik (DPA).
        </p>
        <p className="mb-6">
          Unggah hasilnya dalam format PDF di{' '}
          <Link to="/pendaftaran" className="font-bold text-brand-500 underline hover:text-brand-700">
            formulir pendaftaran
          </Link>
          .
        </p>

        {tersedia ? (
          <>
            <a href={templat.tautan} target="_blank" rel="noopener noreferrer" className={buttonClass('fill')}>
              Buka Templat
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden>
                <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
              </svg>
              <span className="sr-only">(membuka tab baru)</span>
            </a>
            <p className="mt-3 text-sm text-brand-500">Terakhir diperbarui {formatWaktu(templat.diubahPada)} WIB</p>
          </>
        ) : (
          <p role="status" className="rounded-sm border border-dashed border-brand-300 px-4 py-6 text-center text-brand-500">
            Templat belum tersedia. Silakan cek kembali nanti.
          </p>
        )}
      </div>
    </>
  )
}

export function TemplatSpDpaSkeleton() {
  return (
    <>
      <PageHeading />
      <div className="max-w-3xl animate-pulse" aria-busy aria-label="Memuat templat">
        <div className="h-5 rounded-sm bg-brand-100" />
        <div className="mt-2 h-5 w-2/3 rounded-sm bg-brand-100" />
        <div className="mt-6 h-11 w-44 rounded-sm bg-brand-100" />
      </div>
    </>
  )
}

export function TemplatSpDpaError() {
  const revalidator = useRevalidator()

  return (
    <>
      <PageHeading />
      <p className="mb-4">Gagal memuat templat surat pernyataan DPA.</p>
      <button type="button" onClick={() => revalidator.revalidate()} className="cursor-pointer font-bold text-brand-500 underline">
        Coba lagi
      </button>
    </>
  )
}
