export function PageHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-h5 text-brand-700">{title}</h1>
      {subtitle && <p className="text-brand-500">{subtitle}</p>}
    </div>
  )
}
