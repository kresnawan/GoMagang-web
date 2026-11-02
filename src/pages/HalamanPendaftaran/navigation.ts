/** State `location` yang dibawa saat berpindah antara daftar lowongan & form pendaftaran */
export type PendaftaranNavState = {
  /** Query filter daftar lowongan, agar tombol Kembali mengembalikan filter yang sama */
  listSearch?: string
  /** Nama lowongan yang baru saja berhasil didaftar, untuk pesan sukses */
  pendaftaranTerkirim?: string
}

export const DAFTAR_LOWONGAN_PATH = '/pendaftaran'
