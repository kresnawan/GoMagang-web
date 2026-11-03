import { useCallback, useState } from 'react'
import { useLoaderData, useNavigation, useSearchParams } from 'react-router'
import { Button, Checkbox } from '../../../component'
import { cn } from '../../../component/cn'
import type { Pendaftar, PendaftarRingkas } from '../../../services/pendaftar'
import { statusToneClass } from '../../HalamanDasbor/statusTone'
import { GagalMemuat, PageHeading } from '../components'
import { AksiPendaftar } from './AksiPendaftar'
import { DetailPendaftarDialog } from './detail/DetailPendaftarDialog'
import { FilterPendaftar } from './FilterPendaftar'
import { Pagination } from './Pagination'
import { kunciFilter } from './params'
import type { loader } from './route'

const JUDUL = 'Pendaftar'
const SUBJUDUL = 'Kelola pendaftaran mahasiswa ke posisi magang.'

type PendaftarItemProps = {
  pendaftar: Pendaftar
  checked: boolean
  onToggle: () => void
  onDetail: () => void
}

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
  const { periode, rows, halaman, items, total, semua } = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const navigation = useNavigation()

  // Pilihan disimpan per filter: jika filter berubah, pilihan otomatis kosong (tanpa effect)
  const kunci = kunciFilter(searchParams)
  const [pilihan, setPilihan] = useState<{ kunci: string; data: Map<string, PendaftarRingkas> }>(() => ({ kunci, data: new Map() }))
  const semuaById = new Map(semua.map((item) => [item.id, item]))
  // Pakai data terbaru dari loader: status bisa berubah (mis. lewat dialog Detail), dan data yang
  // tidak lagi cocok dengan filter dikeluarkan dari pilihan
  const terpilih = new Map<string, PendaftarRingkas>()
  if (pilihan.kunci === kunci) {
    for (const id of pilihan.data.keys()) {
      const terbaru = semuaById.get(id)
      if (terbaru) terpilih.set(id, terbaru)
    }
  }
  const daftarTerpilih = [...terpilih.values()]
  const [idDetail, setIdDetail] = useState<string | null>(null)

  const semuaTerpilih = semua.length > 0 && terpilih.size === semua.length
  const sebagian = terpilih.size > 0 && !semuaTerpilih

  function toggle(item: Pendaftar) {
    const data = new Map(terpilih)
    if (data.has(item.id)) data.delete(item.id)
    else data.set(item.id, semuaById.get(item.id) ?? item)
    setPilihan({ kunci, data })
  }

  function toggleSemua() {
    setPilihan({ kunci, data: semuaTerpilih ? new Map() : new Map(semua.map((item) => [item.id, item])) })
  }

  const kosongkanPilihan = useCallback(() => setPilihan({ kunci, data: new Map() }), [kunci])
  const tutupDetail = useCallback(() => setIdDetail(null), [])

  return (
    <>
      <PageHeading title={JUDUL} subtitle={SUBJUDUL} />
      <FilterPendaftar periode={periode} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-3 font-bold text-brand-700">
          <Checkbox checked={semuaTerpilih} indeterminate={sebagian} disabled={semua.length === 0} onChange={toggleSemua} className="ml-1" />
          Pilih semua
          {terpilih.size > 0 && <span className="font-normal text-brand-500">({terpilih.size} dipilih)</span>}
        </label>
        <AksiPendaftar terpilih={daftarTerpilih} onSelesai={kosongkanPilihan} />
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
