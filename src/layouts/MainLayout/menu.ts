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
]

export const TIM_MB_MENU_ITEMS: MenuItem[] = [
  { label: 'Pendaftar', to: '/tim-mb/pendaftar' },
  { label: 'Katalog Posisi', to: '/tim-mb/katalog' },
  { label: 'Perusahaan Mitra', to: '/tim-mb/perusahaan' },
  { label: 'Periode', to: '/tim-mb/periode' },
]
