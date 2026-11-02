import { useCallback, useState } from 'react'
import { Link, useLoaderData, useRevalidator, useSearchParams } from 'react-router'
import { Button, DropDown, FormField } from '../../component'
import { PENDAFTARAN_PARAM, type loader } from './route'
import { TabelMk } from './TabelMk'
import { TambahMkDialog } from './TambahMkDialog'

function PageHeading() {
  return <h1 className="mb-8 text-h5 text-brand-700">Konversi Mata Kuliah</h1>
}

export function HalamanKonversiMK() {
  const { aktif, terpilih, mataKuliah, penyetaraan } = useLoaderData<typeof loader>()
  const [, setSearchParams] = useSearchParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const closeDialog = useCallback(() => setDialogOpen(false), [])

  return (
    <>
      <PageHeading />

      <FormField label="Pendaftaran" htmlFor="pendaftaran" className="max-w-xl">
        <DropDown
          id="pendaftaran"
          value={terpilih?.id ?? ''}
          disabled={aktif.length === 0}
          onChange={(event) => setSearchParams({ [PENDAFTARAN_PARAM]: event.target.value }, { replace: true })}
        >
          <option value="" disabled>
            {aktif.length === 0 ? 'Belum ada pendaftaran aktif' : 'Pilih pendaftaran aktif'}
          </option>
          {aktif.map((item) => (
            <option key={item.id} value={item.id}>
              {item.posisi} — {item.perusahaan}
            </option>
          ))}
        </DropDown>
      </FormField>

      {aktif.length === 0 && (
        <p className="mt-3 text-sm text-brand-500">
          Konversi mata kuliah tersedia setelah pendaftaran berstatus Aktif.{' '}
          <Link to="/dasbor" className="font-bold underline">
            Lihat Dasbor
          </Link>
        </p>
      )}

      {terpilih && (
        <section aria-labelledby="judul-mk" className="mt-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="judul-mk" className="text-h6 text-brand-700">
              Mata Kuliah Dipilih
            </h2>
            <Button type="button" onClick={() => setDialogOpen(true)}>
              Tambah
            </Button>
          </div>

          <TabelMk penyetaraan={penyetaraan} />

          {/* Dipasang hanya saat dibuka agar pencarian & pilihan selalu mulai dari kosong */}
          {dialogOpen && (
            <TambahMkDialog
              open
              onClose={closeDialog}
              idPendaftaran={terpilih.id}
              mataKuliah={mataKuliah}
              idSudahDipilih={new Set(penyetaraan.map((item) => item.mataKuliah.id))}
            />
          )}
        </section>
      )}
    </>
  )
}

export function KonversiMKSkeleton() {
  return (
    <>
      <PageHeading />
      <div className="max-w-xl animate-pulse" aria-busy aria-label="Memuat data">
        <div className="mb-1.5 h-5 w-28 rounded-sm bg-brand-100" />
        <div className="h-10 rounded-sm bg-brand-100" />
      </div>
    </>
  )
}

export function KonversiMKError() {
  const revalidator = useRevalidator()

  return (
    <>
      <PageHeading />
      <p className="mb-4">Gagal memuat data konversi mata kuliah.</p>
      <button type="button" onClick={() => revalidator.revalidate()} className="cursor-pointer font-bold text-brand-500 underline">
        Coba lagi
      </button>
    </>
  )
}
