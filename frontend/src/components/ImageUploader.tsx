import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import {
  approximateDataUrlSize,
  fileToStorableDataUrl,
  formatBytes,
  ImageError,
} from '../lib/image'
import { Field } from './form'

export function ImageUploader({
  label,
  value,
  onChange,
  hint,
  aspectClass = 'aspect-[4/3]',
  placeholderLabel = 'Sin imagen',
}: {
  label: string
  value?: string
  onChange: (value: string | undefined) => void
  hint?: string
  aspectClass?: string
  placeholderLabel?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    setBusy(true)
    try {
      onChange(await fileToStorableDataUrl(file))
    } catch (err) {
      setError(err instanceof ImageError ? err.message : 'No pudimos procesar la imagen.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Field label={label} hint={hint} error={error ?? undefined}>
      <div className="space-y-3">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            void handleFile(e.dataTransfer.files?.[0])
          }}
          className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
            dragging ? 'border-olive-400 bg-olive-50/50' : 'border-line bg-ivory'
          } ${aspectClass}`}
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-full w-full flex-col items-center justify-center gap-2 text-center"
            >
              <ImagePlus className="h-6 w-6 text-muted" />
              <span className="text-sm text-ink">{placeholderLabel}</span>
              <span className="text-xs text-muted-light">
                Arrastra una foto o haz clic para subirla
              </span>
            </button>
          )}

          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-paper/70">
              <Loader2 className="h-5 w-5 animate-spin text-ink" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-line bg-paper px-4 py-2 text-xs font-medium text-ink transition-colors hover:bg-ivory"
          >
            {value ? 'Cambiar foto' : 'Subir foto'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-medium text-danger transition-colors hover:bg-danger-soft"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Quitar
            </button>
          )}
          {value && (
            <span className="text-xs text-muted-light">
              {formatBytes(approximateDataUrlSize(value))}
            </span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>
    </Field>
  )
}
