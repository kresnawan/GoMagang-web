import { Link } from 'react-router'
import { cn } from '../../component/cn'

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('text-h6 font-bold text-brand-700', className)}>
      GoMagang
    </Link>
  )
}
