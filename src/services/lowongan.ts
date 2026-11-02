// MOCK: backend belum tersedia. Ganti isi fungsi-fungsi di bawah dengan fetch ke API
// asli; tipe & signature fungsi dibiarkan sama agar halaman tidak perlu diubah.

export const BIDANG = ['Software Engineering', 'Data', 'UI/UX Design', 'Jaringan'] as const
export const LOKASI = ['Jakarta', 'Bandung', 'Surabaya', 'Malang', 'Yogyakarta'] as const
export const SISTEM_KERJA = ['Onsite', 'Hybrid', 'Remote'] as const
export const URUTAN = [
  { value: 'sisa-kuota', label: 'Sisa kuota terbanyak' },
  { value: 'nama', label: 'Posisi (A–Z)' },
] as const

export type Bidang = (typeof BIDANG)[number]
export type Lokasi = (typeof LOKASI)[number]
export type SistemKerja = (typeof SISTEM_KERJA)[number]
export type Urutan = (typeof URUTAN)[number]['value']

export type Lowongan = {
  id: string
  posisi: string
  perusahaan: string
  gambar: string
  bidang: Bidang
  lokasi: Lokasi
  sistemKerja: SistemKerja
  kuota: number
  terisi: number
}

export type LowonganFilter = {
  q?: string
  bidang?: Bidang
  lokasi?: Lokasi
  sistemKerja?: SistemKerja
  /** Kosong = terbaru */
  urutkan?: Urutan
}

export const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB

/** Gambar placeholder berisi inisial perusahaan */
function mockGambar(inisial: string, warna: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 100'><rect width='300' height='100' fill='${warna}'/><text x='150' y='64' font-family='sans-serif' font-size='40' font-weight='700' fill='white' text-anchor='middle'>${inisial}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const store: Lowongan[] = [
  { id: 'lw-001', posisi: 'Frontend Developer Intern', perusahaan: 'PT Nusantara Digital', gambar: mockGambar('ND', '#202F66'), bidang: 'Software Engineering', lokasi: 'Jakarta', sistemKerja: 'Hybrid', kuota: 5, terisi: 2 },
  { id: 'lw-002', posisi: 'Data Analyst Intern', perusahaan: 'PT Awan Biru Teknologi', gambar: mockGambar('AB', '#4E5E99'), bidang: 'Data', lokasi: 'Bandung', sistemKerja: 'Onsite', kuota: 3, terisi: 1 },
  { id: 'lw-003', posisi: 'UI/UX Designer Intern', perusahaan: 'CV Kreasi Rupa', gambar: mockGambar('KR', '#919ECC'), bidang: 'UI/UX Design', lokasi: 'Yogyakarta', sistemKerja: 'Remote', kuota: 2, terisi: 2 },
  { id: 'lw-004', posisi: 'Backend Developer Intern', perusahaan: 'PT Sinergi Sistem', gambar: mockGambar('SS', '#060F33'), bidang: 'Software Engineering', lokasi: 'Surabaya', sistemKerja: 'Onsite', kuota: 4, terisi: 0 },
  { id: 'lw-005', posisi: 'Network Engineer Intern', perusahaan: 'PT Jaring Kencana', gambar: mockGambar('JK', '#2B3B78'), bidang: 'Jaringan', lokasi: 'Malang', sistemKerja: 'Onsite', kuota: 3, terisi: 1 },
  { id: 'lw-006', posisi: 'Machine Learning Intern', perusahaan: 'PT Awan Biru Teknologi', gambar: mockGambar('AB', '#4E5E99'), bidang: 'Data', lokasi: 'Jakarta', sistemKerja: 'Hybrid', kuota: 2, terisi: 0 },
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const sisaKuota = (lowongan: Lowongan) => lowongan.kuota - lowongan.terisi

export async function getLowonganList(filter: LowonganFilter = {}): Promise<Lowongan[]> {
  await delay(400)
  const q = filter.q?.toLowerCase()

  const result = store.filter(
    (item) =>
      (!q || item.posisi.toLowerCase().includes(q) || item.perusahaan.toLowerCase().includes(q)) &&
      (!filter.bidang || item.bidang === filter.bidang) &&
      (!filter.lokasi || item.lokasi === filter.lokasi) &&
      (!filter.sistemKerja || item.sistemKerja === filter.sistemKerja),
  )

  if (filter.urutkan === 'sisa-kuota') result.sort((a, b) => sisaKuota(b) - sisaKuota(a))
  if (filter.urutkan === 'nama') result.sort((a, b) => a.posisi.localeCompare(b.posisi))

  return result.map((item) => ({ ...item }))
}

export async function getLowongan(id: string): Promise<Lowongan | null> {
  await delay(400)
  const item = store.find((lowongan) => lowongan.id === id)
  return item ? { ...item } : null
}

/** MOCK helper: akses langsung ke data lowongan untuk service mock lain. Hapus saat backend siap */
export function mockFindLowongan(id: string) {
  return store.find((item) => item.id === id)
}
