import type { RouteObject } from 'react-router'
import { BerkasPublikSkeleton, HalamanBerkasPublik } from './HalamanBerkasPublik'
import { loader } from './route'

export const berkasPublikRoute = {
  Component: HalamanBerkasPublik,
  HydrateFallback: BerkasPublikSkeleton,
  loader,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>
