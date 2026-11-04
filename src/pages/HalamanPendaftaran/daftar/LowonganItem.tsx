import { useLocation, useNavigate } from 'react-router'
import { Button } from '../../../component'
import type { Posisi } from '../../../services/lowongan'
import { LowonganImage } from '../LowonganInfo'
import type { PendaftaranNavState } from '../navigation'

export function LowonganItem({ posisi }: { posisi: Posisi }) {
  const navigate = useNavigate()
  const location = useLocation()
  const tersedia = posisi.sisaKuota > 0

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
          Kuota: <span className="font-bold text-brand-700">{Math.max(posisi.sisaKuota, 0)}</span>/{posisi.kuotaTotal}{' '}
          tersisa
        </p>
        <Button
          type="button"
          disabled={!tersedia}
          onClick={() =>
            navigate(String(posisi.id), { state: { listSearch: location.search } satisfies PendaftaranNavState })
          }
        >
          {tersedia ? 'Daftar' : 'Penuh'}
        </Button>
      </div>
    </li>
  )
}
