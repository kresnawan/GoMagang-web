import { useSearchParams } from 'react-router'
import { Button, buttonClass } from '../../component'
import logoIkon from '../../assets/gomagang-logo-icon_only.svg'
import { ALLOWED_EMAIL_DOMAIN, GOOGLE_LOGIN_URL, loginErrorMessage } from '../../services/auth'

/** Logo "G" Google; ditaruh di kotak putih agar warnanya tetap sesuai pedoman merek Google */
function GoogleIcon() {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-white" aria-hidden>
      <svg viewBox="0 0 48 48" className="size-4">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
    </span>
  )
}

export function HalamanLogin() {
  const [searchParams] = useSearchParams()
  const error = loginErrorMessage(searchParams.get('error'))

  return (
    <main className="flex min-h-svh items-center justify-center bg-brand-100 px-4 py-10">
      <div className="w-full max-w-sm rounded-sm border border-brand-300 bg-white px-5 py-8 text-center sm:px-8">
        <img src={logoIkon} alt="GoMagang" className="mx-auto mb-6 h-16 w-auto" />
        <h1 className="mb-8 text-h5 text-brand-900">Login</h1>

        {error && (
          <p role="alert" className="mb-5 rounded-sm border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {GOOGLE_LOGIN_URL ? (
          // Navigasi penuh ke halaman pilih akun Google (bukan route React)
          <a href={GOOGLE_LOGIN_URL} className={buttonClass('fill', 'w-full gap-3 px-4')}>
            <GoogleIcon />
            Login menggunakan Akun UB
          </a>
        ) : (
          <>
            <Button type="button" disabled className="w-full gap-3 px-4">
              <GoogleIcon />
              Login menggunakan Akun UB
            </Button>
            <p role="alert" className="mt-3 text-sm text-red-700">
              Login belum dikonfigurasi (VITE_GOOGLE_CLIENT_ID kosong).
            </p>
          </>
        )}

        <p className="mt-4 text-sm text-brand-500">Gunakan email @{ALLOWED_EMAIL_DOMAIN}</p>
      </div>
    </main>
  )
}
