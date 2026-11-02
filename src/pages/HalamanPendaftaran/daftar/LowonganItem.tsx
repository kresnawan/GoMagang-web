import { useLocation, useNavigate } from 'react-router'
import { Button } from '../../../component'
import { sisaKuota, type Lowongan } from '../../../services/lowongan'
import { LowonganImage, LowonganInfo } from '../LowonganInfo'
import type { PendaftaranNavState } from '../navigation'

export function LowonganItem({ lowongan }: { lowongan: Lowongan }) {
  const navigate = useNavigate()
  const location = useLocation()
  const sisa = sisaKuota(lowongan)

  return (
    <li className="flex flex-col gap-4 border-b border-brand-300 py-5 sm:flex-row sm:items-center sm:gap-6">
      <LowonganImage lowongan={lowongan} className="sm:w-44 lg:w-52" />
      <LowonganInfo lowongan={lowongan} className="flex-1" />

      <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end">
        <p className="text-sm text-brand-500">
          Kuota: <span className="font-bold text-brand-700">{sisa}</span>/{lowongan.kuota} tersisa
        </p>
        <Button
          type="button"
          disabled={sisa <= 0}
          onClick={() =>
            navigate(lowongan.id, { state: { listSearch: location.search } satisfies PendaftaranNavState })
          }
        >
          {sisa > 0 ? 'Daftar' : 'Penuh'}
        </Button>
      </div>
    </li>
  )
}
