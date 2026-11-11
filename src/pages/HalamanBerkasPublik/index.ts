import type { RouteObject } from 'react-router'
import { BerkasPublikSkeleton, HalamanBerkasPublik } from './HalamanBerkasPublik'
import { loader } from './route'

/** Publik (tanpa guard): dibuka perusahaan mitra/kaprodi dari link di file Excel hasil ekspor Panitia Magang */
export const berkasPublikRoute = {
  Component: HalamanBerkasPublik,
  HydrateFallback: BerkasPublikSkeleton,
  loader,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>
