import { useRevalidator } from 'react-router'
import { Button, type ButtonProps } from '../../component'
import { cn } from '../../component/cn'

export function PageHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-h5 text-brand-700">{title}</h1>
      {subtitle && <p className="text-brand-500">{subtitle}</p>}
    </div>
  )
}

/** Tombol "+ Tambah" di kanan atas kotak konten */
export function TambahButton({ className, children = 'Tambah', ...props }: ButtonProps) {
  return (
    <Button type="button" className={cn('px-5', className)} {...props}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="size-5" aria-hidden>
        <path d="M12 5v14M5 12h14" />
      </svg>
      {children}
    </Button>
  )
}

/** Pesan gagal memuat + tombol coba lagi, untuk ErrorBoundary halaman */
export function GagalMemuat({ pesan }: { pesan: string }) {
  const revalidator = useRevalidator()

  return (
    <>
      <p className="mb-4">{pesan}</p>
      <button type="button" onClick={() => revalidator.revalidate()} className="cursor-pointer font-bold text-brand-500 underline">
        Coba lagi
      </button>
    </>
  )
}
