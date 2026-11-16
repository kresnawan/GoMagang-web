import { Button, type ButtonProps } from '../../component'
import { cn } from '../../component/cn'

export { GagalMemuat, PageHeading } from '../../component'

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
