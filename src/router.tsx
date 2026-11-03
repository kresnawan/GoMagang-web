import { createBrowserRouter, Navigate } from 'react-router'
import App from './App'
import { MainLayout, TimMbLayout } from './layouts/MainLayout'
import { dasborRoute } from './pages/HalamanDasbor'
import { dataDiriRoute } from './pages/HalamanDataDiri'
import { detailPendaftaranRoute } from './pages/HalamanDetailPendaftaran'
import { konversiMkRoute } from './pages/HalamanKonversiMK'
import { loginRoute } from './pages/HalamanLogin'
import { daftarLowonganRoute, formPendaftaranRoute } from './pages/HalamanPendaftaran'
import { katalogRoute } from './pages/tim-mb/HalamanKatalog'
import { pendaftarRoute } from './pages/tim-mb/HalamanPendaftar'
import { detailPendaftarRoute } from './pages/tim-mb/HalamanPendaftar/detail'
import { periodeRoute } from './pages/tim-mb/HalamanPeriode'
import { perusahaanRoute } from './pages/tim-mb/HalamanPerusahaan'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: MainLayout,
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
    children: [
      { index: true, element: <Navigate to="/tim-mb/katalog" replace /> },
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
  { path: '/login', ...loginRoute },
  // Playground komponen UI
  { path: '/komponen', Component: App },
])
