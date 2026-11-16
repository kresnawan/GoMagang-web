import { cn } from '../../component/cn'
import type { StatusPendaftaran } from '../../services/pendaftaran'
import { statusToneClass } from './statusTone'

export function StatusBadge({ status, className }: { status: StatusPendaftaran; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-bold whitespace-nowrap ring-1 ring-inset',
        statusToneClass(status).badge,
        className,
      )}
    >
      <span className="sr-only">Status: </span>
      {status}
    </span>
  )
}

const TAHAP: { status: StatusPendaftaran; label: string }[] = [
  { status: 'Menunggu Verifikasi', label: 'Verifikasi' },
  { status: 'Lolos Seleksi Administrasi', label: 'Administrasi' },
  { status: 'Diterima', label: 'Diterima' },
  { status: 'Aktif', label: 'Aktif' },
  { status: 'Selesai', label: 'Selesai' },
]

export function TahapPendaftaran({ status }: { status: StatusPendaftaran }) {
  const sekarang = TAHAP.findIndex((tahap) => tahap.status === status)
  if (sekarang === -1) return null

  return (
    <div>
      <p className="sr-only">
        Tahap {sekarang + 1} dari {TAHAP.length}
      </p>
      <ol className="grid grid-cols-5 gap-1" aria-hidden>
        {TAHAP.map((tahap, index) => (
          <li key={tahap.status} className="min-w-0">
            <span
              className={cn(
                'block h-1.5 rounded-full',
                index < sekarang ? 'bg-brand-500' : index === sekarang ? 'bg-brand-700' : 'bg-brand-100',
              )}
            />
            <span
              className={cn(
                'mt-1.5 block truncate text-xs',
                index === sekarang ? 'font-bold text-brand-700' : index < sekarang ? 'text-brand-500' : 'text-brand-300',
              )}
            >
              {tahap.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
