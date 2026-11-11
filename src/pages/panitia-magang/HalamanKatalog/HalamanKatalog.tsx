import { useCallback, useState } from 'react'
import { useLoaderData, useNavigation, useSearchParams } from 'react-router'
import { Button, DropDown, FormField } from '../../../component'
import { cn } from '../../../component/cn'
import type { Posisi } from '../../../services/lowongan'
import { formatWaktu } from '../../HalamanDetailPendaftaran/format'
import { GagalMemuat, PageHeading, TambahButton } from '../components'
import { labelPeriode } from '../periode'
import { INTENT, PERIODE_PARAM, type loader } from './route'
import { TambahPosisiDialog } from './TambahPosisiDialog'
import { SembunyikanPosisiDialog, UbahPosisiDialog } from './UbahPosisiDialog'

type Operasi = { intent: typeof INTENT.ubah | typeof INTENT.sembunyikan; posisi: Posisi }

/** Kartu posisi. Tanpa `onPilih` (posisi yang disembunyikan) kartu tampil redup tanpa tombol aksi */
function PosisiCard({ posisi, onPilih }: { posisi: Posisi; onPilih?: (operasi: Operasi) => void }) {
  const disembunyikan = posisi.disembunyikanPada !== null

  return (
    <li
      className={cn(
        'flex flex-col gap-4 rounded-sm border border-brand-300 p-4 sm:flex-row sm:items-center sm:px-5',
        disembunyikan && 'bg-brand-50',
      )}
    >
      <div className={cn('min-w-0 flex-1', disembunyikan && 'text-brand-500')}>
        <h3 className={cn('text-h6 leading-snug', disembunyikan ? 'text-brand-500' : 'text-brand-900')}>{posisi.posisi}</h3>
        <p className={cn('mt-1', !disembunyikan && 'text-brand-700')}>{posisi.perusahaan}</p>
        {posisi.deskripsiPersyaratan && (
          <p className="mt-2 line-clamp-3 text-sm whitespace-pre-line text-brand-500" title={posisi.deskripsiPersyaratan}>
            {posisi.deskripsiPersyaratan}
          </p>
        )}
        {posisi.disembunyikanPada && (
          <p className="mt-1 text-sm">Disembunyikan pada {formatWaktu(posisi.disembunyikanPada)} WIB</p>
        )}
      </div>
      {/* Kuota di tengah, di antara teks dan tombol aksi */}
      <p className="shrink-0 text-sm text-brand-500 sm:w-28 sm:text-center">
        <span className="sm:block">Kuota</span>{' '}
        <span className={cn('font-bold sm:block sm:text-h6', disembunyikan ? 'text-brand-500' : 'text-brand-900')}>{posisi.kuota}</span>{' '}
        <span className="sm:block">orang</span>
      </p>
      {onPilih && (
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outlined" className="px-3 py-1.5 text-sm" onClick={() => onPilih({ intent: INTENT.ubah, posisi })}>
            Ubah
          </Button>
          <Button
            type="button"
            variant="outlined"
            className="border-red-700 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
            onClick={() => onPilih({ intent: INTENT.sembunyikan, posisi })}
          >
            Hapus
          </Button>
        </div>
      )}
    </li>
  )
}

/** Posisi yang disembunyikan di periode ini, hanya tampil setelah teks pembukanya diklik */
function BagianDisembunyikan({ posisi }: { posisi: Posisi[] }) {
  const [terbuka, setTerbuka] = useState(false)

  return (
    <section aria-label="Posisi yang disembunyikan" className="mt-6">
      <button
        type="button"
        aria-expanded={terbuka}
        aria-controls="posisi-disembunyikan"
        onClick={() => setTerbuka((nilai) => !nilai)}
        className="cursor-pointer text-sm font-bold text-brand-500 underline hover:text-brand-700"
      >
        {terbuka ? 'Sembunyikan daftar ini' : `Tampilkan posisi yang disembunyikan (${posisi.length})`}
      </button>

      {terbuka && (
        <div id="posisi-disembunyikan" className="mt-3">
          <ul className="flex flex-col gap-4">
            {posisi.map((item) => (
              <PosisiCard key={item.id} posisi={item} />
            ))}
          </ul>
          {posisi.length === 0 && (
            <p className="rounded-sm border border-dashed border-brand-300 px-4 py-6 text-center text-brand-500">
              Tidak ada posisi yang disembunyikan di periode ini.
            </p>
          )}
        </div>
      )}
    </section>
  )
}

export function HalamanKatalog() {
  const { periode, perusahaan, terpilih, posisi: semua } = useLoaderData<typeof loader>()
  const posisi = semua.filter((item) => item.disembunyikanPada === null)
  const disembunyikan = semua.filter((item) => item.disembunyikanPada !== null)
  const [operasi, setOperasi] = useState<Operasi | null>(null)
  const closeOperasi = useCallback(() => setOperasi(null), [])
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

      <section aria-label="Daftar posisi magang">
        {/* Dropdown periode di kiri, tombol Tambah di kanan; sejajar di bagian bawah */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <FormField label="Periode" htmlFor="periode" className="w-full max-w-md sm:w-auto sm:flex-1">
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
          {/* Posisi wajib punya periode; tanpa periode tombol dinonaktifkan */}
          <TambahButton onClick={() => setDialogOpen(true)} disabled={periode.length === 0} />
        </div>

        <ul className={cn('mt-6 flex flex-col gap-4 transition-opacity', isLoading && 'opacity-50')}>
          {posisi.map((item) => (
            <PosisiCard key={item.id} posisi={item} onPilih={setOperasi} />
          ))}
        </ul>
        {posisi.length === 0 && (
          <p className="rounded-sm border border-dashed border-brand-300 px-4 py-10 text-center text-brand-500">
            Belum ada posisi magang di periode ini.
          </p>
        )}
        {terpilih && <BagianDisembunyikan key={terpilih.id} posisi={disembunyikan} />}
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
      {operasi?.intent === INTENT.ubah && <UbahPosisiDialog key={operasi.posisi.id} posisi={operasi.posisi} onClose={closeOperasi} />}
      {operasi?.intent === INTENT.sembunyikan && (
        <SembunyikanPosisiDialog key={operasi.posisi.id} posisi={operasi.posisi} onClose={closeOperasi} />
      )}
    </>
  )
}

export function KatalogSkeleton() {
  return (
    <>
      <PageHeading title="Katalog Posisi Magang" subtitle="Kelola posisi magang yang dibuka di setiap periode." />
      <div className="animate-pulse" aria-busy aria-label="Memuat katalog">
        <div className="flex items-end justify-between gap-3">
          <div className="h-16 max-w-md flex-1 rounded-sm bg-brand-100" />
          <div className="h-11 w-32 rounded-sm bg-brand-100" />
        </div>
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
