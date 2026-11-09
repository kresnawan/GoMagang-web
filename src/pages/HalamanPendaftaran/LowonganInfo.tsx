import { cn } from '../../component/cn'
import type { Posisi } from '../../services/lowongan'

type GambarLowongan = { gambar: string; perusahaan: string }

export function LowonganImage({ lowongan, className }: { lowongan: GambarLowongan; className?: string }) {
  return (
    <img
      src={lowongan.gambar}
      alt={lowongan.perusahaan}
      className={cn('aspect-3/1 w-full shrink-0 rounded-md bg-brand-100 object-cover', className)}
    />
  )
}

/** Nama posisi & perusahaan lowongan (halaman form pendaftaran) */
export function LowonganInfo({ lowongan, className }: { lowongan: Pick<Posisi, 'posisi' | 'perusahaan'>; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <h2 className="text-h6 text-brand-700">{lowongan.posisi}</h2>
      <p className="text-brand-900">{lowongan.perusahaan}</p>
    </div>
  )
}
