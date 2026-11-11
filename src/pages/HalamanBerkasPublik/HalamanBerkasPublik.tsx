import { useCallback, type ReactNode } from 'react'
import { useLoaderData } from 'react-router'
import { Button } from '../../component'
import { simpanBlob, type BerkasPublik } from '../../services/berkas'
import type { loader } from './route'

// Waktu ditampilkan dalam WIB, apa pun zona waktu pengunjung
const waktuFormat = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'Asia/Jakarta',
})
const formatWaktu = (waktu: Date) => `${waktuFormat.format(waktu)} WIB`

function Kerangka({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-svh bg-brand-100 px-4 py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 rounded-sm border border-brand-300 bg-white px-5 py-8 sm:px-8">
        <p className="text-h6 font-bold text-brand-700">GoMagang</p>
        {children}
      </div>
    </main>
  )
}

function Pesan({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <section role="status" className="rounded-sm border border-amber-500 bg-amber-50 px-4 py-4 sm:px-5">
      <h1 className="mb-1 text-base font-bold text-amber-800">{judul}</h1>
      <p className="text-sm text-amber-900">{children}</p>
    </section>
  )
}

/** Pratinjau PDF lewat URL objek sementara, yang dilepas lagi saat iframe dilepas */
function Pratinjau({ berkas }: { berkas: BerkasPublik }) {
  const pasang = useCallback(
    (iframe: HTMLIFrameElement | null) => {
      if (!iframe) return
      const url = URL.createObjectURL(berkas.isi)
      iframe.src = url
      return () => URL.revokeObjectURL(url)
    },
    [berkas.isi],
  )

  return (
    <iframe
      ref={pasang}
      title={`Pratinjau ${berkas.nama}`}
      className="h-[75svh] w-full rounded-sm border border-brand-300 bg-brand-100"
    />
  )
}

/** Halaman publik (tanpa login) tujuan link berkas di file Excel hasil ekspor Panitia Magang */
export function HalamanBerkasPublik() {
  const hasil = useLoaderData<typeof loader>()

  if (hasil.status === 'kedaluwarsa') {
    return (
      <Kerangka>
        <Pesan judul="Link sudah kedaluwarsa">
          Link ini berlaku sampai {formatWaktu(hasil.berlakuSampai)}. Minta file ekspor terbaru ke Panitia Magang untuk membuka
          berkas ini.
        </Pesan>
      </Kerangka>
    )
  }
  if (hasil.status === 'tidak-ditemukan') {
    return (
      <Kerangka>
        <Pesan judul="Berkas tidak ditemukan">
          Link ini tidak valid, atau berkasnya sudah tidak tersedia. Pastikan link disalin utuh dari file ekspor, atau
          minta file ekspor terbaru ke Panitia Magang.
        </Pesan>
      </Kerangka>
    )
  }
  if (hasil.status === 'gagal') {
    return (
      <Kerangka>
        <Pesan judul="Berkas belum bisa dibuka">{hasil.pesan}</Pesan>
      </Kerangka>
    )
  }

  const { berkas, berlakuSampai } = hasil
  return (
    <Kerangka>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-h5 break-all text-brand-900">{berkas.nama}</h1>
          <p className="text-sm text-brand-500">
            Berkas pendaftaran magang
            {berlakuSampai && ` · Link berlaku sampai ${formatWaktu(berlakuSampai)}`}
          </p>
        </div>
        <Button type="button" className="px-5 py-2" onClick={() => simpanBlob(berkas.isi, berkas.nama)}>
          Unduh
        </Button>
      </header>
      <Pratinjau berkas={berkas} />
      <p className="text-sm text-brand-500">Pratinjau tidak muncul? Gunakan tombol Unduh untuk membuka berkasnya.</p>
    </Kerangka>
  )
}

export function BerkasPublikSkeleton() {
  return (
    <main className="min-h-svh bg-brand-100 px-4 py-10">
      <div
        className="mx-auto h-[85svh] w-full max-w-4xl animate-pulse rounded-sm border border-brand-300 bg-white"
        aria-busy
        aria-label="Membuka berkas"
      />
    </main>
  )
}
