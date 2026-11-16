import type { RouteObject } from 'react-router'
import { HalamanVerifikasiSurat, VerifikasiSuratSkeleton } from './HalamanVerifikasiSurat'
import { action, loader } from './route'

export const verifikasiSuratRoute = {
  Component: HalamanVerifikasiSurat,
  HydrateFallback: VerifikasiSuratSkeleton,
  loader,
  action,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>
