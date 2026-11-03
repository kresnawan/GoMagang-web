import { useCallback, useState } from 'react'
import { Outlet } from 'react-router'
import { cn } from '../../component/cn'
import { MENU_ITEMS, TIM_MB_MENU_ITEMS, type MenuItem } from './menu'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { SidebarDrawer } from './SidebarDrawer'

type AppShellProps = {
  menu: MenuItem[]
  /** Tujuan link logo */
  homePath: string
  /** true: navbar & konten melebar sampai tepi kanan (tanpa 2 kolom kosong) */
  fullWidth?: boolean
}

/**
 * Desktop: grid 12 kolom — sidebar 2 kolom, navbar & konten 8 kolom (2 kolom kanan kosong),
 * atau 10 kolom jika fullWidth. Mobile & tablet: sidebar disembunyikan, dibuka lewat burger di navbar.
 */
function AppShell({ menu, homePath, fullWidth = false }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return (
    <div className="min-h-svh bg-white lg:grid lg:grid-cols-12 lg:gap-x-4">
      <aside className="hidden border-r border-brand-300 lg:sticky lg:top-0 lg:col-span-2 lg:block lg:h-svh">
        <Sidebar items={menu} homePath={homePath} />
      </aside>

      <div
        className={cn(
          'flex min-h-svh min-w-0 flex-col gap-4 p-4',
          fullWidth ? 'lg:col-span-10 lg:pl-0' : 'lg:col-span-8 lg:px-0',
        )}
      >
        <Navbar homePath={homePath} onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 rounded-sm border border-brand-300 bg-white p-5 sm:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>

      <SidebarDrawer items={menu} homePath={homePath} open={drawerOpen} onClose={closeDrawer} />
    </div>
  )
}

/** Layout mahasiswa */
export function MainLayout() {
  return <AppShell menu={MENU_ITEMS} homePath="/" />
}

/** Layout Tim Magang Berdampak: lebar penuh */
export function TimMbLayout() {
  return <AppShell menu={TIM_MB_MENU_ITEMS} homePath="/tim-mb" fullWidth />
}
