import type { ReactNode } from 'react'
import { useFetcher, useLoaderData } from 'react-router'
import { Button, FileInput, FormField } from '../../component'
import { cn } from '../../component/cn'
import { MAX_FILE_SIZE } from '../../services/lowongan'
import type { SuratTerverifikasi } from '../../services/suratKeterangan'
import type { action, HasilVerifikasi, loader } from './route'

/** "6 November 2026" dari "2026-11-06" (tanpa nama hari) */
const tanggalFormat = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
const formatTanggal = (tanggal: string) => tanggalFormat.format(new Date(`${tanggal}T00:00`))

type Sumber = 'kode' | 'berkas'

function Kotak({ nada, judul, children }: { nada: 'asli' | 'palsu' | 'gagal'; judul: string; children?: ReactNode }) {
  return (
    <section
      role="status"
      className={cn(
        'rounded-sm border px-4 py-4 sm:px-5',
        nada === 'asli' && 'border-green-600 bg-green-50',
        nada === 'palsu' && 'border-red-600 bg-red-50',
        nada === 'gagal' && 'border-amber-500 bg-amber-50',
      )}
    >
      <h2
        className={cn(
          'mb-1 text-base font-bold',
          nada === 'asli' && 'text-green-800',
          nada === 'palsu' && 'text-red-700',
          nada === 'gagal' && 'text-amber-800',
        )}
      >
        {judul}
      </h2>
      {children}
    </section>
  )
}

function DataSurat({ surat }: { surat: SuratTerverifikasi }) {
  const baris: Array<[string, string]> = [
    ['Nomor surat', surat.nomorSurat],
    ['Tanggal surat', formatTanggal(surat.tanggalSurat)],
    ['Nama', surat.nama],
    ['NIM', surat.nim],
    ['Program studi', surat.programStudi],
    ['Posisi', surat.posisi],
    ['Perusahaan/instansi', surat.perusahaan],
    ['Alamat instansi', surat.alamatPerusahaan],
    ['Program', surat.program],
    ['Periode magang', `${formatTanggal(surat.tanggalMulai)} – ${formatTanggal(surat.tanggalSelesai)}`],
    ['Ditandatangani', `${surat.namaPejabat} (${surat.jabatanPejabat}), NIP. ${surat.nipPejabat}`],
  ]
  return (
    <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 rounded-sm border border-green-200 bg-white p-3 text-sm sm:grid-cols-[minmax(9rem,auto)_1fr]">
      {baris.map(([label, nilai]) => (
        <div key={label} className="contents">
          <dt className="text-brand-500">{label}</dt>
          <dd className="mb-1.5 min-w-0 wrap-break-word text-brand-900 sm:mb-0">{nilai}</dd>
        </div>
      ))}
    </dl>
  )
}

function Hasil({ hasil, sumber }: { hasil: HasilVerifikasi; sumber: Sumber }) {
  if (hasil.status === 'gagal') {
    return (
      <Kotak nada="gagal" judul="Belum bisa diperiksa">
        <p className="text-sm text-amber-900">{hasil.pesan}</p>
      </Kotak>
    )
  }

  if (hasil.status === 'tidak-dikenal') {
    return (
      <Kotak nada="palsu" judul="✗ Surat tidak dapat diverifikasi">
        <p className="text-sm text-red-800">
          {sumber === 'kode'
            ? 'Kode pada QR ini tidak cocok dengan surat mana pun yang diterbitkan portal GoMagang.'
            : 'Berkas ini tidak sama dengan surat mana pun yang diterbitkan portal GoMagang. Berkas yang diubah sedikit pun tidak akan cocok.'}{' '}
          Surat tersebut mungkin palsu atau telah diubah.
        </p>
      </Kotak>
    )
  }

  return (
    <Kotak nada="asli" judul="✓ Surat asli">
      <p className="text-sm text-green-900">
        {sumber === 'kode'
          ? 'Surat ini diterbitkan dan ditandatangani secara digital oleh portal GoMagang. Pastikan isi surat yang Anda pegang sama persis dengan data di bawah; jika berbeda, surat tersebut telah diubah.'
          : 'Berkas PDF ini sama persis dengan surat yang diterbitkan dan ditandatangani secara digital oleh portal GoMagang.'}
      </p>
      <DataSurat surat={hasil.surat} />
    </Kotak>
  )
}

function PeriksaBerkas() {
  const fetcher = useFetcher<typeof action>()
  const memeriksa = fetcher.state !== 'idle'
  const hasil = fetcher.state === 'idle' ? fetcher.data : undefined

  return (
    <section aria-labelledby="periksa-berkas" className="flex flex-col gap-4">
      <div>
        <h2 id="periksa-berkas" className="text-base font-bold text-brand-700">
          Periksa berkas PDF
        </h2>
        <p className="text-sm text-brand-500">Unggah berkas surat keterangan yang Anda terima untuk mencocokkannya.</p>
      </div>
      <fetcher.Form method="post" encType="multipart/form-data" className="flex flex-col gap-3">
        <FormField label="Berkas surat keterangan" htmlFor="berkas-surat">
          <FileInput
            id="berkas-surat"
            name="berkas"
            accept=".pdf,application/pdf"
            hint={`(.pdf, maks. ${MAX_FILE_SIZE / 1024 / 1024} MB)`}
            required
            disabled={memeriksa}
          />
        </FormField>
        <Button type="submit" className="self-start px-5 py-2" disabled={memeriksa}>
          {memeriksa ? 'Memeriksa…' : 'Periksa keaslian'}
        </Button>
      </fetcher.Form>
      {hasil && <Hasil hasil={hasil} sumber="berkas" />}
    </section>
  )
}

/** Halaman publik (tanpa login) tujuan QR pada surat keterangan magang */
export function HalamanVerifikasiSurat() {
  const { kode, hasil } = useLoaderData<typeof loader>()

  return (
    <main className="min-h-svh bg-brand-100 px-4 py-10">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-sm border border-brand-300 bg-white px-5 py-8 sm:px-8">
        <header>
          <p className="mb-4 text-h6 font-bold text-brand-700">GoMagang</p>
          <h1 className="mb-2 text-h5 text-brand-900">Verifikasi Surat Keterangan Magang</h1>
          <p className="text-sm text-brand-500">
            Surat keterangan kepesertaan magang yang asli diterbitkan portal GoMagang dan ditandatangani secara digital.
            Pindai kode QR pada surat, atau unggah berkas PDF-nya di bawah.
          </p>
        </header>

        {kode && hasil && <Hasil hasil={hasil} sumber="kode" />}

        <PeriksaBerkas />
      </div>
    </main>
  )
}

export function VerifikasiSuratSkeleton() {
  return (
    <main className="min-h-svh bg-brand-100 px-4 py-10">
      <div
        className="mx-auto h-96 w-full max-w-2xl animate-pulse rounded-sm border border-brand-300 bg-white"
        aria-busy
        aria-label="Memeriksa surat"
      />
    </main>
  )
}
