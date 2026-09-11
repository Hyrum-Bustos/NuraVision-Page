import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AlertTriangle, Check, Info, X } from 'lucide-react'

type Tone = 'success' | 'error' | 'info'

interface Toast {
  id: number
  title: string
  description?: string
  tone: Tone
}

interface ToastContextValue {
  toast: (toast: { title: string; description?: string; tone?: Tone }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DURATION_MS = 3600

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback<ToastContextValue['toast']>(
    ({ title, description, tone = 'success' }) => {
      const id = nextId.current++
      setToasts((prev) => [...prev, { id, title, description, tone }])
      window.setTimeout(() => dismiss(id), DURATION_MS)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-slide-in-up pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-ink px-4 py-3 text-white shadow-lg"
          >
            <span className="mt-0.5 shrink-0">
              {t.tone === 'success' && <Check className="h-4 w-4 text-olive-400" />}
              {t.tone === 'error' && <AlertTriangle className="h-4 w-4 text-[#e8a08c]" />}
              {t.tone === 'info' && <Info className="h-4 w-4 text-white/70" />}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs text-white/70">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Cerrar aviso"
              className="rounded-full p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}
