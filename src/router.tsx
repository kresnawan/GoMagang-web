import { createBrowserRouter, Navigate } from 'react-router'
import App from './App'
import { MainLayout } from './layouts/MainLayout'
import { dasborRoute } from './pages/HalamanDasbor'
import { dataDiriRoute } from './pages/HalamanDataDiri'
import { detailPendaftaranRoute } from './pages/HalamanDetailPendaftaran'
import { konversiMkRoute } from './pages/HalamanKonversiMK'
import { loginRoute } from './pages/HalamanLogin'
import { daftarLowonganRoute, formPendaftaranRoute } from './pages/HalamanPendaftaran'

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
  { path: '/login', ...loginRoute },
  // Playground komponen UI
  { path: '/komponen', Component: App },
])
