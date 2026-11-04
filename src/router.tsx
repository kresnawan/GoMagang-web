import { createBrowserRouter, Navigate } from 'react-router'
import App from './App'
import { MainLayout, TimMbLayout } from './layouts/MainLayout'
import { MemuatSesi } from './layouts/MainLayout/MemuatSesi'
import { dasborRoute } from './pages/HalamanDasbor'
import { dataDiriRoute } from './pages/HalamanDataDiri'
import { detailPendaftaranRoute } from './pages/HalamanDetailPendaftaran'
import { konversiMkRoute } from './pages/HalamanKonversiMK'
import { loginRoute } from './pages/HalamanLogin'
import { daftarLowonganRoute, formPendaftaranRoute, wajibDataDiriLengkap } from './pages/HalamanPendaftaran'
import { katalogRoute } from './pages/tim-mb/HalamanKatalog'
import { pendaftarRoute } from './pages/tim-mb/HalamanPendaftar'
import { detailPendaftarRoute } from './pages/tim-mb/HalamanPendaftar/detail'
import { periodeRoute } from './pages/tim-mb/HalamanPeriode'
import { perusahaanRoute } from './pages/tim-mb/HalamanPerusahaan'
import { loginLoader, sesiLoader, wajibPeran } from './routeGuard'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: MainLayout,
    middleware: [wajibPeran('mahasiswa')],
    loader: sesiLoader,
    HydrateFallback: MemuatSesi,
    children: [
      { index: true, element: <Navigate to="/dasbor" replace /> },
      {
        path: 'dasbor',
        children: [
          { index: true, ...dasborRoute },
          { path: ':idPendaftaran', ...detailPendaftaranRoute },
        ],
      },
      { path: 'data-diri', ...dataDiriRoute },
      { path: 'konversi-mk', ...konversiMkRoute },
      {
        path: 'pendaftaran',
        middleware: [wajibDataDiriLengkap],
        children: [
          { index: true, ...daftarLowonganRoute },
          { path: ':lowonganId', ...formPendaftaranRoute },
        ],
      },
    ],
  },
  // Tim Magang Berdampak
  {
    path: '/tim-mb',
    Component: TimMbLayout,
    middleware: [wajibPeran('tim_mb')],
    loader: sesiLoader,
    HydrateFallback: MemuatSesi,
    children: [
      { index: true, element: <Navigate to="/tim-mb/pendaftar" replace /> },
      { path: 'katalog', ...katalogRoute },
      { path: 'perusahaan', ...perusahaanRoute },
      { path: 'periode', ...periodeRoute },
      {
        path: 'pendaftar',
        children: [
          { index: true, ...pendaftarRoute },
          { path: ':idPendaftar', ...detailPendaftarRoute },
        ],
      },
    ],
  },
  { path: '/login', ...loginRoute, loader: loginLoader, HydrateFallback: MemuatSesi },
  // Playground komponen UI (publik, tanpa guard)
  { path: '/komponen', Component: App },
])
