import type { RouteObject } from 'react-router'
import {
  DaftarLowonganError,
  DaftarLowonganSkeleton,
  HalamanDaftarLowongan,
} from './daftar/HalamanDaftarLowongan'
import { loader as daftarLoader } from './daftar/route'
import {
  FormPendaftaranError,
  FormPendaftaranSkeleton,
  HalamanFormPendaftaran,
} from './form/HalamanFormPendaftaran'
import { action as formAction, loader as formLoader } from './form/route'

type PageRoute = Omit<RouteObject, 'path' | 'index' | 'children'>

/** /pendaftaran — daftar lowongan */
export const daftarLowonganRoute = {
  Component: HalamanDaftarLowongan,
  HydrateFallback: DaftarLowonganSkeleton,
  ErrorBoundary: DaftarLowonganError,
  loader: daftarLoader,
} satisfies PageRoute

/** /pendaftaran/:lowonganId — form pendaftaran untuk lowongan terpilih */
export const formPendaftaranRoute = {
  Component: HalamanFormPendaftaran,
  HydrateFallback: FormPendaftaranSkeleton,
  ErrorBoundary: FormPendaftaranError,
  loader: formLoader,
  action: formAction,
} satisfies PageRoute
