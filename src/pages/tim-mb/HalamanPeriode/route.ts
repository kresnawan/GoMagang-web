import { data, type ActionFunctionArgs } from 'react-router'
import { getPeriodeList, PosisiMagangError, tambahPeriode } from '../../../services/posisiMagang'

export async function loader() {
  return getPeriodeList()
}

/** Nilai <input type="datetime-local"> ("2026-10-01T08:00", waktu lokal) → ISO 8601, atau null jika tidak valid */
function keIso(value: FormDataEntryValue | null) {
  const waktu = new Date(String(value ?? ''))
  return Number.isNaN(waktu.getTime()) ? null : waktu.toISOString()
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const catatan = String(formData.get('catatan') ?? '').trim() || null
  const waktuMulai = keIso(formData.get('waktuMulai'))
  const waktuTutup = keIso(formData.get('waktuTutup'))

  if (!waktuMulai || !waktuTutup) {
    return data({ ok: false as const, error: 'Waktu mulai dan waktu tutup wajib diisi.' }, { status: 400 })
  }

  try {
    await tambahPeriode({ catatan, waktuMulai, waktuTutup })
    return { ok: true as const }
  } catch (err) {
    const message = err instanceof PosisiMagangError ? err.message : 'Gagal menambah periode. Coba lagi.'
    return data({ ok: false as const, error: message }, { status: 500 })
  }
}
