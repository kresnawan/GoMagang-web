import { useRevalidator } from 'react-router'

export function GagalMemuat({ pesan }: { pesan: string }) {
  const revalidator = useRevalidator()

  return (
    <>
      <p className="mb-4">{pesan}</p>
      <button type="button" onClick={() => revalidator.revalidate()} className="cursor-pointer font-bold text-brand-500 underline">
        Coba lagi
      </button>
    </>
  )
}
