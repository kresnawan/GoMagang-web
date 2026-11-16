import { NavLink } from 'react-router'
import { cn } from '../../component/cn'
import { Logo } from './Logo'
import type { MenuItem } from './menu'

export type SidebarProps = {
  items: MenuItem[]
  homePath: string
  onNavigate?: () => void
  className?: string
}

export function Sidebar({ items, homePath, onNavigate, className }: SidebarProps) {
  return (
    <nav aria-label="Menu utama" className={cn('flex h-full flex-col bg-white', className)}>
      <div className="flex h-20 items-center px-5 lg:h-28">
        <Logo to={homePath} className="lg:w-full" imgClassName="lg:h-auto lg:w-full lg:max-w-44" />
      </div>
      <ul className="">
        {items.map((item) => (
          <li key={item.to} className="">
            <NavLink
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'block px-5 py-3 text-brand-700 outline-none transition-colors m-2 rounded-sm hover:bg-brand-50 focus-visible:bg-brand-100',
                  isActive && 'bg-brand-100 font-bold',
                )
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
