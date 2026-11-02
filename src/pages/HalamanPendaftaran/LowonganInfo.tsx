import { cn } from '../../component/cn'
import type { Lowongan } from '../../services/lowongan'

export function LowonganImage({ lowongan, className }: { lowongan: Lowongan; className?: string }) {
  return (
    <img
      src={lowongan.gambar}
      alt={lowongan.perusahaan}
      className={cn('aspect-3/1 w-full shrink-0 rounded-md bg-brand-100 object-cover', className)}
    />
  )
}

/** Nama posisi, perusahaan, dan info singkat lowongan */
export function LowonganInfo({ lowongan, className }: { lowongan: Lowongan; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <h2 className="text-h6 text-brand-700">{lowongan.posisi}</h2>
      <p className="text-brand-900">{lowongan.perusahaan}</p>
      <p className="mt-1 text-sm text-brand-500">
        {lowongan.bidang} · {lowongan.lokasi} · {lowongan.sistemKerja}
      </p>
    </div>
  )
}
