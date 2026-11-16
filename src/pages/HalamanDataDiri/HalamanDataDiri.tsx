import { useLoaderData, useRevalidator, useRouteError } from 'react-router'
import { DataDiriForm } from './DataDiriForm'
import type { loader } from './route'

function PageHeading() {
  return <h1 className="mb-8 text-h5 text-brand-700">Data Diri</h1>
}

export function HalamanDataDiri() {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      <PageHeading />
      <DataDiriForm data={data} />
    </>
  )
}

export function DataDiriSkeleton() {
  const field = <div className="h-16 rounded-md bg-brand-100" />

  return (
    <>
      <PageHeading />
      <div className="grid max-w-3xl animate-pulse gap-x-6 gap-y-5 sm:grid-cols-2" aria-busy aria-label="Memuat data diri">
        <div className="h-16 rounded-md bg-brand-100 sm:col-span-2" />
        {field}
        {field}
        <div className="h-16 rounded-md bg-brand-100 sm:col-span-2" />
        {field}
        {field}
        {field}
      </div>
    </>
  )
}

export function DataDiriError() {
  const error = useRouteError()
  const revalidator = useRevalidator()
  console.error(error)

  return (
    <>
      <PageHeading />
      <p className="mb-4">Gagal memuat data diri.</p>
      <button
        type="button"
        onClick={() => revalidator.revalidate()}
        className="cursor-pointer font-bold text-brand-500 underline"
      >
        Coba lagi
      </button>
    </>
  )
}
