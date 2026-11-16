import { Link } from 'react-router'
import logoHorizontal from '../../assets/gomagang-logo-horizontal.svg'
import { cn } from '../../component/cn'

type LogoProps = {
  to?: string
  className?: string
  imgClassName?: string
}

export function Logo({ to = '/', className, imgClassName }: LogoProps) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex shrink-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-300',
        className,
      )}
    >
      <img src={logoHorizontal} alt="GoMagang" className={cn('h-10 w-auto', imgClassName)} />
    </Link>
  )
}
