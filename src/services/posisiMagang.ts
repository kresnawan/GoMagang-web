// MOCK: periode untuk dropdown halaman Pendaftar, yang datanya juga masih mock.
// Halaman Periode & Katalog sudah memakai API asli (services/periode.ts), jadi periode baru
// belum muncul di dropdown mock ini. Perusahaan sudah di services/perusahaan.ts.

/** Tabel periode_pendaftaran */
export type PeriodePendaftaran = {
  id: string
  catatan: string | null
  /** ISO 8601 */
  waktuMulai: string
  /** ISO 8601 */
  waktuTutup: string
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const periodeStore: PeriodePendaftaran[] = [
  { id: 'pr-1', catatan: 'Periode Genap 2025/2026', waktuMulai: '2026-01-05T00:00:00+07:00', waktuTutup: '2026-02-15T23:59:00+07:00' },
  { id: 'pr-2', catatan: 'Periode Ganjil 2026/2027', waktuMulai: '2026-10-01T00:00:00+07:00', waktuTutup: '2026-11-30T23:59:00+07:00' },
]

export async function getPeriodeList(): Promise<PeriodePendaftaran[]> {
  await delay(300)
  // Terbaru di atas. Bandingkan sebagai waktu, bukan string (offset zona waktu bisa berbeda)
  return periodeStore.map((item) => ({ ...item })).sort((a, b) => Date.parse(b.waktuMulai) - Date.parse(a.waktuMulai))
}
