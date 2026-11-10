import { NavLink } from 'react-router'
import { cn } from '../../component/cn'
import { Logo } from './Logo'
import type { MenuItem } from './menu'

export type SidebarProps = {
  items: MenuItem[]
  /** Tujuan link logo */
  homePath: string
  /** Dipanggil saat menu diklik, mis. untuk menutup drawer di mobile */
  onNavigate?: () => void
  className?: string
}

/** Isi menu kiri. Dipakai di sidebar desktop dan di drawer mobile/tablet */
export function Sidebar({ items, homePath, onNavigate, className }: SidebarProps) {
  return (
    <nav aria-label="Menu utama" className={cn('flex h-full flex-col bg-white', className)}>
      {/* Desktop: logo selebar sidebar (maks. 176px); drawer mobile tetap 40px */}
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
