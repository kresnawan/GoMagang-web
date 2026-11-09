import { useLocation, useNavigate } from 'react-router'
import { Button } from '../../../component'
import type { Posisi } from '../../../services/lowongan'
import { LowonganImage } from '../LowonganInfo'
import type { PendaftaranNavState } from '../navigation'

type LowonganItemProps = {
  posisi: Posisi
  /** Alasan tombol Daftar nonaktif (sudah didaftar, atau batas pendaftaran berjalan tercapai); null bila aktif */
  alasanNonaktif: string | null
}

export function LowonganItem({ posisi, alasanNonaktif }: LowonganItemProps) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <li className="flex flex-col gap-4 border-b border-brand-300 py-5 sm:flex-row sm:items-center sm:gap-6">
      <LowonganImage lowongan={posisi} className="sm:w-44 lg:w-52" />

      <div className="min-w-0 flex-1">
        <h2 className="text-h6 text-brand-700">{posisi.posisi}</h2>
        <p className="text-brand-900">{posisi.perusahaan}</p>
        <p className="mt-1 line-clamp-2 text-sm text-brand-500" title={posisi.deskripsiPersyaratan}>
          {posisi.deskripsiPersyaratan}
        </p>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 sm:flex-col sm:items-end">
        <p className="text-sm text-brand-500">
          Kuota: <span className="font-bold text-brand-700">{posisi.kuota}</span> orang
        </p>
        <Button
          type="button"
          disabled={alasanNonaktif !== null}
          title={alasanNonaktif ?? undefined}
          onClick={() =>
            navigate(String(posisi.id), { state: { listSearch: location.search } satisfies PendaftaranNavState })
          }
        >
          Daftar
        </Button>
      </div>
    </li>
  )
}
