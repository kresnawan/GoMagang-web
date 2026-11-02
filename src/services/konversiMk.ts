// MOCK: backend belum tersedia. Ganti isi fungsi-fungsi di bawah dengan fetch ke API
// asli; tipe & signature fungsi dibiarkan sama agar halaman tidak perlu diubah.

import { getPendaftaran } from './pendaftaran'

/** Tabel mata_kuliah_konversi */
export type MataKuliahKonversi = {
  id: string
  mkAsal: string
  mkKonversi: string
  sks: number
}

/** Tabel penyetaraan_mk (sudah digabung dengan mata kuliahnya) */
export type PenyetaraanMk = {
  id: string
  idPendaftaran: string
  mataKuliah: MataKuliahKonversi
  /** ISO 8601 */
  dibuatPada: string
}

export class KonversiMkError extends Error {}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const mataKuliahStore: MataKuliahKonversi[] = [
  { id: 'mk-01', mkAsal: 'Pengembangan Antarmuka Web', mkKonversi: 'Pemrograman Web Lanjut', sks: 3 },
  { id: 'mk-02', mkAsal: 'Rekayasa Kebutuhan Proyek', mkKonversi: 'Analisis dan Desain Sistem', sks: 3 },
  { id: 'mk-03', mkAsal: 'Manajemen Proyek TI', mkKonversi: 'Manajemen Proyek Perangkat Lunak', sks: 3 },
  { id: 'mk-04', mkAsal: 'Pengujian Perangkat Lunak Industri', mkKonversi: 'Pengujian Perangkat Lunak', sks: 2 },
  { id: 'mk-05', mkAsal: 'Pengolahan Data Operasional', mkKonversi: 'Basis Data Lanjut', sks: 3 },
  { id: 'mk-06', mkAsal: 'Komunikasi Profesional', mkKonversi: 'Etika Profesi', sks: 2 },
  { id: 'mk-07', mkAsal: 'Administrasi Jaringan', mkKonversi: 'Jaringan Komputer Lanjut', sks: 3 },
  { id: 'mk-08', mkAsal: 'Analitik Data Bisnis', mkKonversi: 'Data Mining', sks: 3 },
]

const penyetaraanStore: PenyetaraanMk[] = []
let nextId = 1

export async function getMataKuliahKonversi(): Promise<MataKuliahKonversi[]> {
  await delay(300)
  return mataKuliahStore.map((mk) => ({ ...mk }))
}

export async function getPenyetaraanMk(idPendaftaran: string): Promise<PenyetaraanMk[]> {
  await delay(300)
  return structuredClone(penyetaraanStore.filter((item) => item.idPendaftaran === idPendaftaran))
}

export async function tambahPenyetaraanMk(idPendaftaran: string, idMataKuliah: string): Promise<void> {
  await delay(500)
  const pendaftaran = await getPendaftaran(idPendaftaran)
  if (pendaftaran?.status !== 'Aktif') throw new KonversiMkError('Konversi MK hanya untuk pendaftaran berstatus Aktif.')

  const mataKuliah = mataKuliahStore.find((mk) => mk.id === idMataKuliah)
  if (!mataKuliah) throw new KonversiMkError('Mata kuliah tidak ditemukan.')
  if (penyetaraanStore.some((item) => item.idPendaftaran === idPendaftaran && item.mataKuliah.id === idMataKuliah)) {
    throw new KonversiMkError('Mata kuliah ini sudah ditambahkan.')
  }

  penyetaraanStore.push({
    id: `py-${nextId++}`,
    idPendaftaran,
    mataKuliah: { ...mataKuliah },
    dibuatPada: new Date().toISOString(),
  })
}

export async function hapusPenyetaraanMk(idPenyetaraan: string): Promise<void> {
  await delay(500)
  const index = penyetaraanStore.findIndex((item) => item.id === idPenyetaraan)
  if (index === -1) throw new KonversiMkError('Data tidak ditemukan.')
  penyetaraanStore.splice(index, 1)
}
