import type { RouteObject } from 'react-router'
import { DasborError, DasborSkeleton, HalamanDasbor } from './HalamanDasbor'
import { loader } from './route'

export const dasborRoute = {
  Component: HalamanDasbor,
  HydrateFallback: DasborSkeleton,
  ErrorBoundary: DasborError,
  loader,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>
