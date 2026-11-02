import { MenuIcon } from './icons'
import { Logo } from './Logo'
import { ProfileMenu } from './ProfileMenu'

export type NavbarProps = {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="flex items-center gap-3 rounded-sm border border-brand-300 bg-white px-4 py-3">
      {/* Burger & logo hanya di mobile/tablet; di desktop sudah ada sidebar */}
      <button
        type="button"
        aria-label="Buka menu"
        onClick={onMenuClick}
        className="-ml-1 cursor-pointer rounded-md p-1 text-brand-700 outline-none hover:bg-brand-100 focus-visible:ring-2 focus-visible:ring-brand-300 lg:hidden"
      >
        <MenuIcon />
      </button>
      <Logo className="lg:hidden" />

      <div className="ml-auto">
        <ProfileMenu />
      </div>
    </header>
  )
}
