import { useCallback, useState } from 'react'
import { Outlet } from 'react-router'
import { cn } from '../../component/cn'
import { MENU_ITEMS, PANITIA_MAGANG_MENU_ITEMS, type MenuItem } from './menu'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { SidebarDrawer } from './SidebarDrawer'

type AppShellProps = {
  menu: MenuItem[]
  homePath: string
  fullWidth?: boolean
}

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
        <main className="flex-1 bg-white py-2 sm:rounded-sm sm:border sm:border-brand-300 sm:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>

      <SidebarDrawer items={menu} homePath={homePath} open={drawerOpen} onClose={closeDrawer} />
    </div>
  )
}

export function MainLayout() {
  return <AppShell menu={MENU_ITEMS} homePath="/" />
}

export function PanitiaMagangLayout() {
  return <AppShell menu={PANITIA_MAGANG_MENU_ITEMS} homePath="/panitia-magang" fullWidth />
}
