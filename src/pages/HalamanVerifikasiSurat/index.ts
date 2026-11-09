import type { RouteObject } from 'react-router'
import { HalamanVerifikasiSurat, VerifikasiSuratSkeleton } from './HalamanVerifikasiSurat'
import { action, loader } from './route'

/** Publik (tanpa guard): dibuka siapa pun yang memegang surat, lewat QR atau unggah PDF */
export const verifikasiSuratRoute = {
  Component: HalamanVerifikasiSurat,
  HydrateFallback: VerifikasiSuratSkeleton,
  loader,
  action,
} satisfies Omit<RouteObject, 'path' | 'index' | 'children'>
