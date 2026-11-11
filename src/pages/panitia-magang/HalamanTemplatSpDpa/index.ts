import type { RouteObject } from 'react-router'
import { HalamanTemplatSpDpa, TemplatSpDpaError, TemplatSpDpaSkeleton } from './HalamanTemplatSpDpa'
import { action, loader } from './route'

export const templatSpDpaPanitiaMagangRoute = {
  Component: HalamanTemplatSpDpa,
  HydrateFallback: TemplatSpDpaSkeleton,
  ErrorBoundary: TemplatSpDpaError,
  loader,
  action,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>
