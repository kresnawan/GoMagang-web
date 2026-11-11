export type MenuItem = {
  label: string
  to: string
}

// Tambahkan menu baru di sini; Sidebar desktop & drawer mobile ikut terupdate
export const MENU_ITEMS: MenuItem[] = [
  { label: 'Dasbor', to: '/dasbor' },
  { label: 'Data Diri', to: '/data-diri' },
  { label: 'Pendaftaran', to: '/pendaftaran' },
  { label: 'Konversi MK', to: '/konversi-mk' },
  { label: 'Templat SP DPA', to: '/templat-sp-dpa' },
]

export const PANITIA_MAGANG_MENU_ITEMS: MenuItem[] = [
  { label: 'Pendaftar', to: '/panitia-magang/pendaftar' },
  { label: 'Katalog Posisi', to: '/panitia-magang/katalog' },
  { label: 'Perusahaan Mitra', to: '/panitia-magang/perusahaan' },
  { label: 'Periode', to: '/panitia-magang/periode' },
  { label: 'Konversi MK', to: '/panitia-magang/konversi-mk' },
  { label: 'Templat SP DPA', to: '/panitia-magang/templat-sp-dpa' },
]
