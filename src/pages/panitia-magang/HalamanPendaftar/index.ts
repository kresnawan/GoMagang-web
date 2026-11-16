import type { RouteObject } from 'react-router'
import { HalamanPendaftar, PendaftarError, PendaftarSkeleton } from './HalamanPendaftar'
import { action, loader, REFERENSI_ROUTE_ID, referensiLoader, shouldRevalidateReferensi } from './route'

export const pendaftarRoute = {
  Component: HalamanPendaftar,
  HydrateFallback: PendaftarSkeleton,
  ErrorBoundary: PendaftarError,
  loader,
  action,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>

export const pendaftarLayoutRoute = {
  id: REFERENSI_ROUTE_ID,
  loader: referensiLoader,
  shouldRevalidate: shouldRevalidateReferensi,
  HydrateFallback: PendaftarSkeleton,
  ErrorBoundary: PendaftarError,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>
