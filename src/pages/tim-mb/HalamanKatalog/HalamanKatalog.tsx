import { useCallback, useState } from 'react'
import { useLoaderData, useNavigation, useSearchParams } from 'react-router'
import { DropDown, FormField } from '../../../component'
import { cn } from '../../../component/cn'
import type { Posisi } from '../../../services/lowongan'
import { GagalMemuat, PageHeading, TambahButton } from '../components'
import { labelPeriode } from '../periode'
import { PERIODE_PARAM, type loader } from './route'
import { TambahPosisiDialog } from './TambahPosisiDialog'

function PosisiCard({ posisi }: { posisi: Posisi }) {
  return (
    <li className="rounded-sm border border-brand-300 p-4 sm:px-5">
      <h3 className="text-h6 leading-snug text-brand-900">{posisi.posisi}</h3>
      <p className="mt-1 text-brand-700">{posisi.perusahaan}</p>
      <p className="text-sm text-brand-500">
        Kuota: <span className="font-bold text-brand-700">{posisi.kuota}</span> orang
      </p>
    </li>
  )
}

export function HalamanKatalog() {
  const { periode, perusahaan, terpilih, posisi } = useLoaderData<typeof loader>()
  const [, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const [dialogOpen, setDialogOpen] = useState(false)

  const pilihPeriode = useCallback(
    (id: number | string) => setSearchParams({ [PERIODE_PARAM]: String(id) }, { replace: true }),
    [setSearchParams],
  )
  const closeDialog = useCallback(() => setDialogOpen(false), [])
  // Setelah tersimpan: tutup dialog & tampilkan periode tempat posisi baru ditambahkan
  const handleSuccess = useCallback(
    (idPeriode: number) => {
      setDialogOpen(false)
      if (idPeriode !== terpilih?.id) pilihPeriode(idPeriode)
    },
    [terpilih?.id, pilihPeriode],
  )
  const isLoading = navigation.state === 'loading'

  return (
    <>
      <PageHeading title="Katalog Posisi Magang" subtitle="Kelola posisi magang yang dibuka di setiap periode." />

      <section aria-label="Daftar posisi magang" className="rounded-sm border border-brand-300 p-4 sm:p-6">
        <div className="mb-2 flex justify-end">
          {/* Posisi wajib punya periode; tanpa periode tombol dinonaktifkan */}
          <TambahButton onClick={() => setDialogOpen(true)} disabled={periode.length === 0} />
        </div>

        <FormField label="Periode" htmlFor="periode" className="max-w-md">
          <DropDown
            id="periode"
            value={terpilih?.id ?? ''}
            disabled={periode.length === 0}
            onChange={(event) => pilihPeriode(event.target.value)}
          >
            {periode.length === 0 && <option value="">Belum ada periode</option>}
            {periode.map((item) => (
              <option key={item.id} value={item.id}>
                {labelPeriode(item)}
              </option>
            ))}
          </DropDown>
        </FormField>

        <ul className={cn('mt-6 flex flex-col gap-4 transition-opacity', isLoading && 'opacity-50')}>
          {posisi.map((item) => (
            <PosisiCard key={item.id} posisi={item} />
          ))}
        </ul>
        {posisi.length === 0 && (
          <p className="rounded-sm border border-dashed border-brand-300 px-4 py-10 text-center text-brand-500">
            Belum ada posisi magang di periode ini.
          </p>
        )}
      </section>

      {dialogOpen && (
        <TambahPosisiDialog
          periode={periode}
          perusahaan={perusahaan}
          idPeriodeAwal={terpilih?.id}
          onClose={closeDialog}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}

export function KatalogSkeleton() {
  return (
    <>
      <PageHeading title="Katalog Posisi Magang" subtitle="Kelola posisi magang yang dibuka di setiap periode." />
      <div className="animate-pulse rounded-sm border border-brand-300 p-4 sm:p-6" aria-busy aria-label="Memuat katalog">
        <div className="mb-2 ml-auto h-11 w-32 rounded-sm bg-brand-100" />
        <div className="h-16 max-w-md rounded-sm bg-brand-100" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mt-4 h-24 rounded-sm bg-brand-100" />
        ))}
      </div>
    </>
  )
}

export function KatalogError() {
  return (
    <>
      <PageHeading title="Katalog Posisi Magang" />
      <GagalMemuat pesan="Gagal memuat katalog posisi magang." />
    </>
  )
}
