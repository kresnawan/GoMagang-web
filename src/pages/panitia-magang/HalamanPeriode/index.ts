import type { RouteObject } from 'react-router'
import { HalamanPeriode, PeriodeError, PeriodeSkeleton } from './HalamanPeriode'
import { action, loader } from './route'

export const periodeRoute = {
  Component: HalamanPeriode,
  HydrateFallback: PeriodeSkeleton,
  ErrorBoundary: PeriodeError,
  loader,
  action,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>
