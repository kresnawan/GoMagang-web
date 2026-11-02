import { useEffect, useRef, useState, type ChangeEvent, type ComponentProps, type Ref } from 'react'
import { cn } from './cn'

export type FileInputProps = Omit<ComponentProps<'input'>, 'type'> & {
  /** Teks utama di kotak upload */
  label?: string
  /** Teks kecil di bawah label. Default: nilai `accept`, mis. "(.pdf)" */
  hint?: string
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value)
  else if (ref) ref.current = value
}

export function FileInput({
  className,
  label = 'Tambahkan File',
  hint,
  accept,
  disabled,
  onChange,
  ref,
  ...props
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [files, setFiles] = useState<File[]>([])

  // Sinkronkan state saat form di-reset
  useEffect(() => {
    const form = inputRef.current?.form
    if (!form) return
    const handleReset = () => setFiles([])
    form.addEventListener('reset', handleReset)
    return () => form.removeEventListener('reset', handleReset)
  }, [])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(event.target.files ?? []))
    onChange?.(event)
  }

  function removeFile(index: number) {
    const input = inputRef.current
    if (!input) return
    const transfer = new DataTransfer()
    files.forEach((file, i) => i !== index && transfer.items.add(file))
    input.files = transfer.files
    // Picu change event native agar onChange milik parent ikut terpanggil
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }

  function previewFile(file: File) {
    const url = URL.createObjectURL(file)
    window.open(url, '_blank', 'noopener')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  const hintText = hint ?? (accept ? `(${accept})` : undefined)

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-brand-300 bg-white px-4 py-8 text-center text-brand-300 transition-colors',
          'has-[input:hover]:bg-brand-100 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-brand-300/50',
          disabled && 'cursor-not-allowed bg-brand-200',
          files.length > 0 && 'hidden',
        )}
      >
        <FileIcon className="size-14" />
        <span className="font-bold">{label}</span>
        {hintText && <span className="text-xs">{hintText}</span>}
        <input
          ref={(node) => {
            inputRef.current = node
            assignRef(ref, node)
          }}
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={handleChange}
          className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
      </div>

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.lastModified}`}
              className="flex items-center gap-3 rounded-md border border-brand-300 bg-white px-4 py-3 text-brand-900"
            >
              <span className="min-w-0 flex-1 truncate" title={file.name}>
                {file.name}
              </span>
              <IconButton label={`Lihat ${file.name}`} onClick={() => previewFile(file)}>
                <SearchIcon />
              </IconButton>
              <IconButton
                label={`Hapus ${file.name}`}
                disabled={disabled}
                onClick={() => removeFile(index)}
              >
                <CloseIcon />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function IconButton({ label, ...props }: ComponentProps<'button'> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="cursor-pointer rounded p-1 text-brand-700 outline-none transition-colors hover:bg-brand-100 focus-visible:ring-2 focus-visible:ring-brand-300 disabled:cursor-not-allowed disabled:text-brand-300"
      {...props}
    />
  )
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M13 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M13 2v6h6" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="size-5" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5" aria-hidden>
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  )
}
