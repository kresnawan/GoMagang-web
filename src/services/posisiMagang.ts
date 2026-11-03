// MOCK: backend belum tersedia. Ganti isi fungsi-fungsi di bawah dengan fetch ke API
// asli; tipe & signature fungsi dibiarkan sama agar halaman tidak perlu diubah.
// Catatan: terpisah dari services/lowongan.ts (mock halaman mahasiswa) dan mengikuti ERD.

/** Tabel periode_pendaftaran */
export type PeriodePendaftaran = {
  id: string
  catatan: string | null
  /** ISO 8601 */
  waktuMulai: string
  /** ISO 8601 */
  waktuTutup: string
}

/** Tabel perusahaan_mitra */
export type PerusahaanMitra = {
  id: string
  nama: string
}

/** Tabel posisi_magang (sudah digabung dengan perusahaannya) */
export type PosisiMagang = {
  id: string
  posisi: string
  deskripsiPersyaratan: string
  kuotaTotal: number
  sisaKuota: number
  idPeriode: string
  perusahaan: PerusahaanMitra
}

export type PosisiMagangInput = {
  posisi: string
  deskripsiPersyaratan: string
  kuotaTotal: number
  idPeriode: string
  idPerusahaan: string
}

export class PosisiMagangError extends Error {}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const periodeStore: PeriodePendaftaran[] = [
  { id: 'pr-1', catatan: 'Periode Genap 2025/2026', waktuMulai: '2026-01-05T00:00:00+07:00', waktuTutup: '2026-02-15T23:59:00+07:00' },
  { id: 'pr-2', catatan: 'Periode Ganjil 2026/2027', waktuMulai: '2026-10-01T00:00:00+07:00', waktuTutup: '2026-11-30T23:59:00+07:00' },
]

const perusahaanStore: PerusahaanMitra[] = [
  { id: 'pt-1', nama: 'PT Nusantara Digital' },
  { id: 'pt-2', nama: 'PT Awan Biru Teknologi' },
  { id: 'pt-3', nama: 'CV Kreasi Rupa' },
  { id: 'pt-4', nama: 'PT Sinergi Sistem' },
  { id: 'pt-5', nama: 'PT Jaring Kencana' },
]

const posisiStore: PosisiMagang[] = [
  { id: 'ps-1', posisi: 'Frontend Developer Intern', deskripsiPersyaratan: 'Menguasai React dan TypeScript.', kuotaTotal: 5, sisaKuota: 3, idPeriode: 'pr-2', perusahaan: perusahaanStore[0] },
  { id: 'ps-2', posisi: 'Data Analyst Intern', deskripsiPersyaratan: 'Memahami SQL dan Python.', kuotaTotal: 3, sisaKuota: 2, idPeriode: 'pr-2', perusahaan: perusahaanStore[1] },
  { id: 'ps-3', posisi: 'UI/UX Designer Intern', deskripsiPersyaratan: 'Memiliki portofolio desain.', kuotaTotal: 2, sisaKuota: 0, idPeriode: 'pr-2', perusahaan: perusahaanStore[2] },
  { id: 'ps-4', posisi: 'Backend Developer Intern', deskripsiPersyaratan: 'Memahami REST API dan basis data.', kuotaTotal: 4, sisaKuota: 0, idPeriode: 'pr-1', perusahaan: perusahaanStore[3] },
]
let nextId = posisiStore.length + 1
let nextPeriodeId = periodeStore.length + 1
let nextPerusahaanId = perusahaanStore.length + 1

export async function getPeriodeList(): Promise<PeriodePendaftaran[]> {
  await delay(300)
  // Terbaru di atas. Bandingkan sebagai waktu, bukan string (offset zona waktu bisa berbeda)
  return periodeStore.map((item) => ({ ...item })).sort((a, b) => Date.parse(b.waktuMulai) - Date.parse(a.waktuMulai))
}

export async function getPerusahaanList(): Promise<PerusahaanMitra[]> {
  await delay(300)
  return perusahaanStore.map((item) => ({ ...item })).sort((a, b) => a.nama.localeCompare(b.nama))
}

export type PerusahaanRingkasan = PerusahaanMitra & { jumlahPosisi: number }

/** Daftar perusahaan beserta jumlah posisi magangnya (semua periode) */
export async function getPerusahaanRingkasan(): Promise<PerusahaanRingkasan[]> {
  const perusahaan = await getPerusahaanList()
  return perusahaan.map((item) => ({
    ...item,
    jumlahPosisi: posisiStore.filter((posisi) => posisi.perusahaan.id === item.id).length,
  }))
}

export async function tambahPerusahaan(nama: string): Promise<PerusahaanMitra> {
  await delay(500)
  if (perusahaanStore.some((item) => item.nama.toLowerCase() === nama.toLowerCase())) {
    throw new PosisiMagangError('Perusahaan dengan nama ini sudah ada.')
  }
  const perusahaan: PerusahaanMitra = { id: `pt-${nextPerusahaanId++}`, nama }
  perusahaanStore.push(perusahaan)
  return { ...perusahaan }
}

export type PeriodeInput = {
  catatan: string | null
  /** ISO 8601 */
  waktuMulai: string
  /** ISO 8601 */
  waktuTutup: string
}

export async function tambahPeriode(input: PeriodeInput): Promise<PeriodePendaftaran> {
  await delay(500)
  const mulai = Date.parse(input.waktuMulai)
  const tutup = Date.parse(input.waktuTutup)
  if (!(tutup > mulai)) throw new PosisiMagangError('Waktu tutup harus setelah waktu mulai.')

  const bentrok = periodeStore.find(
    (item) => mulai <= Date.parse(item.waktuTutup) && tutup >= Date.parse(item.waktuMulai),
  )
  if (bentrok) {
    throw new PosisiMagangError(`Rentang waktu beririsan dengan ${bentrok.catatan ?? 'periode lain'}.`)
  }

  const periode: PeriodePendaftaran = { id: `pr-${nextPeriodeId++}`, ...input }
  periodeStore.push(periode)
  return { ...periode }
}

export async function getPosisiByPeriode(idPeriode: string): Promise<PosisiMagang[]> {
  await delay(300)
  // Yang terakhir ditambahkan di atas
  return structuredClone(posisiStore.filter((item) => item.idPeriode === idPeriode).reverse())
}

export async function tambahPosisiMagang(input: PosisiMagangInput): Promise<PosisiMagang> {
  await delay(600)
  const perusahaan = perusahaanStore.find((item) => item.id === input.idPerusahaan)
  if (!perusahaan) throw new PosisiMagangError('Perusahaan tidak ditemukan.')
  if (!periodeStore.some((item) => item.id === input.idPeriode)) throw new PosisiMagangError('Periode tidak ditemukan.')

  const posisi: PosisiMagang = {
    id: `ps-${nextId++}`,
    posisi: input.posisi,
    deskripsiPersyaratan: input.deskripsiPersyaratan,
    kuotaTotal: input.kuotaTotal,
    sisaKuota: input.kuotaTotal,
    idPeriode: input.idPeriode,
    perusahaan: { ...perusahaan },
  }
  posisiStore.push(posisi)
  return structuredClone(posisi)
}
