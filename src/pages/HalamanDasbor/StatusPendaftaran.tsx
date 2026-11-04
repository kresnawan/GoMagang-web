import { cn } from '../../component/cn'
import type { StatusPendaftaran as Status } from '../../services/pendaftaran'
import { statusToneClass } from './statusTone'

/** Baris status di bagian bawah kartu pendaftaran */
export function StatusPendaftaran({ status, className }: { status: Status; className?: string }) {
  const tone = statusToneClass(status)

  return (
    <div className={cn('flex items-center gap-3 px-4 py-3 text-brand-900', className)}>
      <span className={cn('size-3.5 shrink-0 rounded-full', tone.dot)} aria-hidden />
      <span>
        <span className="sr-only">Status: </span>
        {status}
      </span>
    </div>
  )
}
