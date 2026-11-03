import type { RouteObject } from 'react-router'
import { HalamanPendaftar, PendaftarError, PendaftarSkeleton } from './HalamanPendaftar'
import { action, loader } from './route'

export const pendaftarRoute = {
  Component: HalamanPendaftar,
  HydrateFallback: PendaftarSkeleton,
  ErrorBoundary: PendaftarError,
  loader,
  action,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>
