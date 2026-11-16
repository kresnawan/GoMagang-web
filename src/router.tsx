import { createBrowserRouter, Navigate } from 'react-router'
import App from './App'
import { MainLayout, PanitiaMagangLayout } from './layouts/MainLayout'
import { MemuatSesi } from './layouts/MainLayout/MemuatSesi'
import { dasborRoute } from './pages/HalamanDasbor'
import { dataDiriRoute } from './pages/HalamanDataDiri'
import { detailPendaftaranRoute } from './pages/HalamanDetailPendaftaran'
import { konversiMkRoute } from './pages/HalamanKonversiMK'
import { loginRoute } from './pages/HalamanLogin'
import { daftarLowonganRoute, formPendaftaranRoute, wajibDataDiriLengkap } from './pages/HalamanPendaftaran'
import { katalogRoute } from './pages/panitia-magang/HalamanKatalog'
import { konversiMkPanitiaMagangRoute } from './pages/panitia-magang/HalamanKonversiMK'
import { templatSpDpaPanitiaMagangRoute } from './pages/panitia-magang/HalamanTemplatSpDpa'
import { templatSpDpaRoute } from './pages/HalamanTemplatSpDpa'
import { pendaftarLayoutRoute, pendaftarRoute } from './pages/panitia-magang/HalamanPendaftar'
import { detailPendaftarRoute } from './pages/panitia-magang/HalamanPendaftar/detail'
import { periodeRoute } from './pages/panitia-magang/HalamanPeriode'
import { perusahaanRoute } from './pages/panitia-magang/HalamanPerusahaan'
import { verifikasiSuratRoute } from './pages/HalamanVerifikasiSurat'
import { berkasPublikRoute } from './pages/HalamanBerkasPublik'
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
      { path: 'templat-sp-dpa', ...templatSpDpaRoute },
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
  {
    path: '/panitia-magang',
    Component: PanitiaMagangLayout,
    middleware: [wajibPeran('panitia_magang')],
    loader: sesiLoader,
    HydrateFallback: MemuatSesi,
    children: [
      { index: true, element: <Navigate to="/panitia-magang/pendaftar" replace /> },
      { path: 'katalog', ...katalogRoute },
      { path: 'perusahaan', ...perusahaanRoute },
      { path: 'periode', ...periodeRoute },
      { path: 'konversi-mk', ...konversiMkPanitiaMagangRoute },
      { path: 'templat-sp-dpa', ...templatSpDpaPanitiaMagangRoute },
      {
        path: 'pendaftar',
        ...pendaftarLayoutRoute,
        children: [
          { index: true, ...pendaftarRoute },
          { path: ':idPendaftar', ...detailPendaftarRoute },
        ],
      },
    ],
  },
  { path: '/login', ...loginRoute, loader: loginLoader, HydrateFallback: MemuatSesi },
  { path: '/verifikasi-surat', ...verifikasiSuratRoute },
  { path: '/berkas/:token', ...berkasPublikRoute },
  { path: '/komponen', Component: App },
])
