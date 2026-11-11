import { useCallback, useEffect, useRef, useState } from 'react'
import { useLoaderData, useNavigation, useRouteLoaderData, useSearchParams } from 'react-router'
import { Button, Checkbox } from '../../../component'
import { cn } from '../../../component/cn'
import { getSemuaPendaftar, type Pendaftar, type PendaftarRingkas } from '../../../services/pendaftar'
import { statusToneClass } from '../../HalamanDasbor/statusTone'
import { GagalMemuat, PageHeading } from '../components'
import { AksiPendaftar } from './AksiPendaftar'
import { DetailPendaftarDialog } from './detail/DetailPendaftarDialog'
import { FilterPendaftar } from './FilterPendaftar'
import { Pagination } from './Pagination'
import { kunciFilter, parsePendaftarParams } from './params'
import { REFERENSI_ROUTE_ID, type loader, type referensiLoader } from './route'

const JUDUL = 'Pendaftar'
const SUBJUDUL = 'Kelola pendaftaran mahasiswa ke posisi magang.'

type PendaftarItemProps = {
  pendaftar: Pendaftar
  checked: boolean
  onToggle: () => void
  onDetail: () => void
}

/** Data yang disimpan untuk pendaftar terpilih */
const ringkas = ({ id, status, nama, nim, adaJadwalSeleksi, adaPlottingDpm }: PendaftarRingkas): PendaftarRingkas => ({
  id,
  status,
  nama,
  nim,
  adaJadwalSeleksi,
  adaPlottingDpm,
})

function PendaftarItem({ pendaftar, checked, onToggle, onDetail }: PendaftarItemProps) {
  const tone = statusToneClass(pendaftar.status)

  return (
    <li className={cn('flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-brand-300 py-4', checked && 'bg-brand-50')}>
      <Checkbox checked={checked} onChange={onToggle} aria-label={`Pilih ${pendaftar.nama}`} className="ml-1" />
      <div className="min-w-0 flex-1 basis-48">
        <p className="font-bold text-brand-900">{pendaftar.nama}</p>
        <p className="text-sm text-brand-500">
          {pendaftar.nim} · {pendaftar.posisi} — {pendaftar.perusahaan}
        </p>
      </div>
      {/* Di mobile status & Detail turun ke baris berikutnya, sejajar dengan teks */}
      <div className="flex w-full items-center justify-between gap-4 pl-9 sm:w-auto sm:pl-0">
        <span className={cn('inline-flex items-center gap-2 text-sm font-bold sm:w-56', tone.text)}>
          <span className={cn('size-2.5 shrink-0 rounded-full', tone.dot)} aria-hidden />
          {pendaftar.status}
        </span>
        <Button type="button" variant="outlined" className="px-4 py-1.5 text-sm" onClick={onDetail}>
          Detail
        </Button>
      </div>
    </li>
  )
}

export function HalamanPendaftar() {
  const { rows, halaman, items, total } = useLoaderData<typeof loader>()
  // Dari route induk; selalu ada karena route induk selesai dimuat sebelum halaman ini dirender
  const { periode, perusahaan, posisi } = useRouteLoaderData<typeof referensiLoader>(REFERENSI_ROUTE_ID)!
  const [searchParams] = useSearchParams()
  const navigation = useNavigation()

  // Pilihan disimpan per filter (jika filter berubah, pilihan otomatis kosong tanpa effect) dan tetap ada
  // saat pindah halaman, sehingga bisa dikumpulkan lintas halaman
  const kunci = kunciFilter(searchParams)
  const [pilihan, setPilihan] = useState<{ kunci: string; data: Map<number, PendaftarRingkas> }>(() => ({ kunci, data: new Map() }))
  // Baris di halaman ini memakai data terbaru dari loader (status/jadwal bisa berubah, mis. lewat dialog Detail);
  // pilihan dari halaman lain memakai data saat dipilih
  const itemById = new Map(items.map((item) => [item.id, item]))
  const terpilih = new Map<number, PendaftarRingkas>()
  if (pilihan.kunci === kunci) {
    for (const [id, item] of pilihan.data) terpilih.set(id, ringkas(itemById.get(id) ?? item))
  }
  const [idDetail, setIdDetail] = useState<number | null>(null)

  const terpilihDiHalaman = items.filter((item) => terpilih.has(item.id)).length
  const semuaTerpilih = total > 0 && terpilih.size >= total && terpilihDiHalaman === items.length
  const sebagian = terpilih.size > 0 && !semuaTerpilih

  // "Pilih semua" mengambil semua baris yang cocok dengan filter dari backend (bukan hanya halaman ini)
  const [memilihSemua, setMemilihSemua] = useState(false)
  const [errorPilihSemua, setErrorPilihSemua] = useState<string | null>(null)
  const permintaanSemua = useRef<AbortController | null>(null)
  // Batalkan permintaan yang masih berjalan bila filter berganti atau halaman ditinggalkan
  useEffect(() => () => permintaanSemua.current?.abort(), [kunci])

  function toggle(item: Pendaftar) {
    const data = new Map(terpilih)
    if (data.has(item.id)) data.delete(item.id)
    else data.set(item.id, ringkas(item))
    setPilihan({ kunci, data })
  }

  /** Pilih semua pendaftar yang cocok dengan filter, di semua halaman; bila semuanya sudah terpilih, kosongkan */
  async function togglePilihSemua() {
    setErrorPilihSemua(null)
    if (semuaTerpilih) {
      setPilihan({ kunci, data: new Map() })
      return
    }

    permintaanSemua.current?.abort()
    const controller = new AbortController()
    permintaanSemua.current = controller
    setMemilihSemua(true)
    const { p: _p, r: _r, ...filter } = parsePendaftarParams(searchParams)
    try {
      const semua = await getSemuaPendaftar(filter, total, controller.signal)
      // Disimpan dengan kunci filter saat diminta: bila filter sudah berganti, pilihan ini otomatis diabaikan
      setPilihan({ kunci, data: new Map(semua.map((item) => [item.id, ringkas(item)])) })
    } catch {
      if (!controller.signal.aborted) setErrorPilihSemua('Gagal memilih semua pendaftar. Coba lagi.')
    } finally {
      if (permintaanSemua.current === controller) {
        permintaanSemua.current = null
        setMemilihSemua(false)
      }
    }
  }

  const tutupDetail = useCallback(() => setIdDetail(null), [])
  // Setelah aksi massal tersimpan, pilihan dikosongkan (kunci tidak penting karena datanya kosong)
  const kosongkanPilihan = useCallback(() => setPilihan({ kunci: '', data: new Map() }), [])

  return (
    <>
      <PageHeading title={JUDUL} subtitle={SUBJUDUL} />
      <FilterPendaftar periode={periode} perusahaan={perusahaan} posisi={posisi} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <label className="flex cursor-pointer items-center gap-3 font-bold text-brand-700">
            <Checkbox
              checked={semuaTerpilih}
              indeterminate={sebagian}
              disabled={total === 0 || memilihSemua}
              onChange={togglePilihSemua}
              className="ml-1"
            />
            {memilihSemua ? 'Memilih semua…' : `Pilih semua (${total})`}
          </label>
          {terpilih.size > 0 && (
            <span className="text-sm text-brand-500">
              {terpilih.size} dipilih
              {terpilih.size > terpilihDiHalaman && ` (${terpilih.size - terpilihDiHalaman} di halaman lain)`} ·{' '}
              <button type="button" className="font-bold text-brand-700 underline hover:text-brand-900" onClick={kosongkanPilihan}>
                Batalkan pilihan
              </button>
            </span>
          )}
          {errorPilihSemua && (
            <span role="alert" className="text-sm text-red-600">
              {errorPilihSemua}
            </span>
          )}
        </div>
        <AksiPendaftar terpilih={[...terpilih.values()]} onSelesai={kosongkanPilihan} />
      </div>

      <ul className={cn('mt-3 border-t border-brand-300 transition-opacity', navigation.state === 'loading' && 'opacity-50')}>
        {items.map((item) => (
          <PendaftarItem key={item.id} pendaftar={item} checked={terpilih.has(item.id)} onToggle={() => toggle(item)} onDetail={() => setIdDetail(item.id)} />
        ))}
      </ul>
      {items.length === 0 && <p className="py-10 text-center text-brand-500">Tidak ada pendaftar yang cocok.</p>}

      <Pagination total={total} rows={rows} halaman={halaman} />

      {idDetail && <DetailPendaftarDialog idPendaftar={idDetail} periode={periode} onClose={tutupDetail} />}
    </>
  )
}

export function PendaftarSkeleton() {
  return (
    <>
      <PageHeading title={JUDUL} subtitle={SUBJUDUL} />
      <div className="animate-pulse" aria-busy aria-label="Memuat pendaftar">
        <div className="h-10 rounded-sm bg-brand-100" />
        <div className="mt-3 h-16 rounded-sm bg-brand-100" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="mt-4 h-14 rounded-sm bg-brand-100" />
        ))}
      </div>
    </>
  )
}

export function PendaftarError() {
  return (
    <>
      <PageHeading title={JUDUL} />
      <GagalMemuat pesan="Gagal memuat daftar pendaftar." />
    </>
  )
}
