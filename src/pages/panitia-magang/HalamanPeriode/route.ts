import { data, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { pesanError } from '../../../services/http'
import { getPeriode, mulaiPeriode, tambahPeriode, tutupPeriode } from '../../../services/periode'
import { CATATAN_MAX, wibKeIso } from '../periode'

export async function loader({ request }: LoaderFunctionArgs) {
  return getPeriode(request.signal)
}

/** Jenis operasi yang dikirim lewat field `intent` */
export const INTENT = { tambah: 'tambah', mulai: 'mulai', tutup: 'tutup' } as const

const gagal = (error: string, status: number) => data({ ok: false as const, error }, { status })

async function tambah(formData: FormData, signal: AbortSignal) {
  const catatan = String(formData.get('catatan') ?? '').trim() || null
  const waktuMulai = wibKeIso(formData.get('waktuMulai'))
  const waktuTutup = wibKeIso(formData.get('waktuTutup'))

  if (!waktuMulai || !waktuTutup) return gagal('Waktu mulai dan waktu tutup wajib diisi.', 400)
  if (!(Date.parse(waktuTutup) > Date.parse(waktuMulai))) return gagal('Waktu tutup harus setelah waktu mulai.', 400)
  if (catatan && catatan.length > CATATAN_MAX) return gagal(`Catatan maksimal ${CATATAN_MAX} karakter.`, 400)

  try {
    await tambahPeriode({ catatan, waktuMulai, waktuTutup }, signal)
    return { ok: true as const }
  } catch (err) {
    return gagal(pesanError(err, 'Gagal menambah periode. Coba lagi.'), 500)
  }
}

/** Mulai / tutup periode saat ini juga */
async function ubahStatus(intent: 'mulai' | 'tutup', formData: FormData, signal: AbortSignal) {
  const id = Number(formData.get('id'))
  if (!Number.isSafeInteger(id) || id < 1) return gagal('Periode tidak valid.', 400)

  try {
    await (intent === INTENT.mulai ? mulaiPeriode(id, signal) : tutupPeriode(id, signal))
    return { ok: true as const }
  } catch (err) {
    const fallback = intent === INTENT.mulai ? 'Gagal memulai periode. Coba lagi.' : 'Gagal menutup periode. Coba lagi.'
    return gagal(pesanError(err, fallback), 500)
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  switch (formData.get('intent')) {
    case INTENT.tambah:
      return tambah(formData, request.signal)
    case INTENT.mulai:
      return ubahStatus(INTENT.mulai, formData, request.signal)
    case INTENT.tutup:
      return ubahStatus(INTENT.tutup, formData, request.signal)
    default:
      return gagal('Aksi tidak dikenal.', 400)
  }
}
