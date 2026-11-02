import { useCallback, useState } from 'react'
import { Outlet } from 'react-router'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { SidebarDrawer } from './SidebarDrawer'

/**
 * Desktop: grid 12 kolom — sidebar 2 kolom, navbar & konten 8 kolom, 2 kolom kanan kosong.
 * Mobile & tablet: sidebar disembunyikan, dibuka lewat burger di navbar.
 */
export function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return (
    <div className="min-h-svh bg-white lg:grid lg:grid-cols-12 lg:gap-x-4">
      <aside className="hidden border-r border-brand-300 lg:sticky lg:top-0 lg:col-span-2 lg:block lg:h-svh">
        <Sidebar />
      </aside>

      <div className="flex min-h-svh flex-col gap-4 p-4 lg:col-span-8 lg:px-0">
        <Navbar onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 rounded-sm border border-brand-300 bg-white p-5 sm:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>

      <SidebarDrawer open={drawerOpen} onClose={closeDrawer} />
    </div>
  )
}
